// okta-client.js
// Reusable Okta SPA client with:
// - Authorization Code + PKCE
// - Auto-login on page load (if not authenticated)
// - Return-to requested page (safe, validated)
// - Tokens stored in localStorage
// - Basic nonce validation from id_token
//
// IMPORTANT: Replace OKTA_CONFIG values with your own Okta tenant/client settings.

const OKTA_CONFIG = {
  oktaDomain: "https://dev-123456.okta.com", // ← REPLACE: e.g. https://dev-123456.okta.com
  clientId: "0oab12345XYZ",                  // ← REPLACE: your Okta Client ID
  redirectUri: window.location.origin + "/callback", // must be registered in Okta
  scopes: "openid profile email",            // adjust scopes as needed
  issuerPath: "/oauth2/default"              // often /oauth2/default, change if you use a custom authorization server
};

export default class OktaClient {
  constructor(config = {}) {
    // Merge optional runtime config
    this.config = Object.assign({}, OKTA_CONFIG, config);

    // Normalize domain + compute endpoints
    this.oktaDomain = this.config.oktaDomain.replace(/\/$/, "");
    this.issuer = `${this.oktaDomain}${this.config.issuerPath}`;
    this.clientId = this.config.clientId;
    this.redirectUri = this.config.redirectUri;
    this.scopes = (this.config.scopes || "openid profile email").trim();

    this.endpoints = {
      authorize: `${this.issuer}/v1/authorize`,
      token: `${this.issuer}/v1/token`,
      userinfo: `${this.issuer}/v1/userinfo`,
      logout: `${this.issuer}/v1/logout`
    };

    // Storage (localStorage keeps across tabs)
    this.storage = window.localStorage;

    // Storage keys
    this.keys = {
      pkceVerifier: "okta_pkce_verifier",
      state: "okta_oauth_state",
      nonce: "okta_oauth_nonce",
      tokens: "okta_tokens",        // JSON: { access_token, id_token, refresh_token, expires_at, scope, token_type }
      returnTo: "okta_return_to"
    };

    // Auto-check on load (non-blocking)
    window.addEventListener("load", () => {
      // If current path is the registered redirectUri path, don't auto-redirect again.
      const cbUrl = new URL(this.redirectUri, window.location.origin);
      const isCallbackPage = (window.location.pathname === cbUrl.pathname);
      if (!isCallbackPage) {
        // Kick off auto login if needed
        this.autoLoginCheck().catch(err => {
          // console.debug("Okta auto login check:", err);
        });
      }
    });
  }

  // --------------------------
  // Public API
  // --------------------------

  // Ensure user is authenticated, otherwise start login flow.
  async autoLoginCheck() {
    if (this.isAuthenticated()) return true;

    // Save current requested page (relative path + query + hash)
    const requested = window.location.pathname + window.location.search + window.location.hash;
    const safeRequested = this._sanitizeReturnPath(requested) ? requested : "/";

    this.storage.setItem(this.keys.returnTo, safeRequested);

    // Start sign-in
    await this.signIn();
    return false; // will redirect
  }

  // Start the PKCE login redirect
  async signIn() {
    // Generate PKCE verifier & challenge and state/nonce
    const verifier = this._randomString(64);
    const state = this._randomString(16);
    const nonce = this._randomString(16);

    // Persist verifier/state/nonce
    this.storage.setItem(this.keys.pkceVerifier, verifier);
    this.storage.setItem(this.keys.state, state);
    this.storage.setItem(this.keys.nonce, nonce);

    const challenge = await this._pkceChallenge(verifier);

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: "code",
      scope: this.scopes,
      redirect_uri: this.redirectUri,
      state,
      nonce,
      code_challenge: challenge,
      code_challenge_method: "S256"
    });

    const url = `${this.endpoints.authorize}?${params.toString()}`;
    window.location.href = url; // perform redirect
  }

  // Handle the redirect callback: exchange code -> tokens, validate, then redirect back
  async handleRedirect() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      const desc = url.searchParams.get("error_description");
      throw new Error(`OAuth error: ${error} ${desc || ""}`);
    }

    if (!code) {
      throw new Error("Authorization code not found in callback URL.");
    }

    const storedState = this.storage.getItem(this.keys.state);
    if (!state || state !== storedState) {
      throw new Error("Invalid or missing state parameter.");
    }

    const verifier = this.storage.getItem(this.keys.pkceVerifier);
    if (!verifier) {
      throw new Error("PKCE code verifier missing from storage.");
    }

    // Exchange the code for tokens
    const tokenResult = await this._exchangeCodeForToken(code, verifier);

    // Basic id_token nonce check (if id_token present)
    try {
      if (tokenResult.id_token) {
        const jwt = this._decodeJwt(tokenResult.id_token);
        const storedNonce = this.storage.getItem(this.keys.nonce);
        if (!storedNonce || jwt.nonce !== storedNonce) {
          throw new Error("Nonce mismatch in id_token.");
        }
        // Extra checks you might want to add:
        // - issuer (jwt.iss === this.issuer)
        // - audience (jwt.aud === this.clientId)
        // - exp (handled below with expiry)
      }
    } catch (e) {
      // clear sensitive stored items
      this._clearTransientAuthStorage();
      throw e;
    }

    // Persist tokens
    this._saveTokenResult(tokenResult);

    // Resolve return-to page, validate, and redirect
    const saved = this.storage.getItem(this.keys.returnTo) || "/";
    this._clearTransientAuthStorage();

    const returnTo = this._sanitizeReturnPath(saved) ? saved : "/";

    // Clean callback URL (remove query params) and redirect to returnTo
    try {
      window.history.replaceState({}, document.title, this.redirectUri);
    } catch (e) {
      // ignore
    }
    window.location.href = returnTo;
  }

  // Returns tokens object or null
  getTokens() {
    const raw = this.storage.getItem(this.keys.tokens);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  // Check if currently authenticated (access token exists + not expired)
  isAuthenticated() {
    const t = this.getTokens();
    if (!t || !t.access_token || !t.expires_at) return false;
    const now = Math.floor(Date.now() / 1000);
    return now < t.expires_at - 5; // 5 sec leeway
  }

  // Get valid access token; attempt refresh if expired and refresh_token available
  async getAccessToken() {
    const tokens = this.getTokens();
    if (!tokens) return null;
    const now = Math.floor(Date.now() / 1000);

    if (tokens.expires_at && now < tokens.expires_at - 5) {
      return tokens.access_token;
    }

    // Try refresh if refresh_token exists
    if (tokens.refresh_token) {
      const refreshed = await this._refreshToken(tokens.refresh_token);
      if (refreshed && refreshed.access_token) {
        this._saveTokenResult(refreshed);
        return refreshed.access_token;
      } else {
        // refresh failed; clear tokens
        this.storage.removeItem(this.keys.tokens);
        return null;
      }
    }

    return null; // expired and no refresh
  }

  // Fetch userinfo from Okta userinfo endpoint
  async getUser() {
    const token = await this.getAccessToken();
    if (!token) return null;
    const res = await fetch(this.endpoints.userinfo, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`userinfo failed: ${res.status}`);
    return res.json();
  }

  // Generic fetch wrapper that adds Bearer token
  async fetchWithAuth(input, init = {}) {
    const token = await this.getAccessToken();
    if (!token) throw new Error("Not authenticated");
    const headers = Object.assign({}, init.headers || {}, {
      Authorization: `Bearer ${token}`
    });
    return fetch(input, Object.assign({}, init, { headers }));
  }

  // Logout locally then redirect to Okta logout endpoint
  logout(postLogoutRedirectUri = window.location.origin) {
    const tokens = this.getTokens();
    this.storage.removeItem(this.keys.tokens);

    const params = new URLSearchParams({ post_logout_redirect_uri: postLogoutRedirectUri });
    if (tokens && tokens.id_token) {
      params.set("id_token_hint", tokens.id_token);
    }
    const url = `${this.endpoints.logout}?${params.toString()}`;
    window.location.href = url;
  }

  // --------------------------
  // Internal helpers
  // --------------------------

  // Exchange authorization code for tokens (PKCE)
  async _exchangeCodeForToken(code, verifier) {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: this.clientId,
      code,
      redirect_uri: this.redirectUri,
      code_verifier: verifier
    });

    const res = await fetch(this.endpoints.token, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Token exchange failed: ${res.status} ${txt}`);
    }
    return res.json();
  }

  // Refresh tokens using refresh_token (if Okta returns one)
  async _refreshToken(refresh_token) {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: this.clientId,
      refresh_token
    });

    const res = await fetch(this.endpoints.token, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    });

    if (!res.ok) {
      // refresh failed
      return null;
    }
    return res.json();
  }

  // Save token result to storage with expiry (expires_at in unix seconds)
  _saveTokenResult(tokenResult) {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = tokenResult.expires_in ? Number(tokenResult.expires_in) : 3600;
    const expiresAt = now + expiresIn;

    const store = {
      access_token: tokenResult.access_token,
      id_token: tokenResult.id_token,
      refresh_token: tokenResult.refresh_token,
      token_type: tokenResult.token_type || "Bearer",
      scope: tokenResult.scope,
      expires_in: expiresIn,
      expires_at: expiresAt
    };

    this.storage.setItem(this.keys.tokens, JSON.stringify(store));
  }

  // If tokenResponse is the refresh response, map into same shape and persist
  _saveTokenResultIfRefresh(tokenResult) {
    // tokenResult returned from refresh typically contains access_token, expires_in, scope
    this._saveTokenResult(tokenResult);
  }

  // Clear PKCE/state/nonce/returnTo transient storage
  _clearTransientAuthStorage() {
    this.storage.removeItem(this.keys.pkceVerifier);
    this.storage.removeItem(this.keys.state);
    this.storage.removeItem(this.keys.nonce);
    this.storage.removeItem(this.keys.returnTo);
  }

  // PKCE helpers
  async _pkceChallenge(verifier) {
    const enc = new TextEncoder();
    const data = enc.encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return this._base64UrlEncode(new Uint8Array(digest));
  }

  _base64UrlEncode(bytes) {
    // bytes: Uint8Array
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  _randomString(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return this._base64UrlEncode(array).slice(0, length);
  }

  // Decode JWT (no verification) — used only for nonce check and quick introspection
  _decodeJwt(token) {
    const parts = token.split(".");
    if (parts.length < 2) throw new Error("Invalid JWT");
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(payload)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  }

  // Validate a saved return path — allow only same-origin relative paths like "/a/b?x=1#y"
  _sanitizeReturnPath(p) {
    try {
      if (!p || typeof p !== "string") return false;
      // Must start with single '/'
      if (!p.startsWith("/")) return false;
      if (p.startsWith("//")) return false; // avoid protocol-relative or host injections
      // Optional: limit length
      if (p.length > 4096) return false;
      // (We could add more checks to whitelist known routes)
      return true;
    } catch (e) {
      return false;
    }
  }
}
