import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface TokenResponse {
  token: string;
  expiresAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  constructor(private api: ApiService) {}

  generateToken(payload: any): Observable<TokenResponse> {
    return this.api.post<TokenResponse>('/token/generate', payload);
  }

  getTokens(): Observable<TokenResponse[]> {
    return this.api.get<TokenResponse[]>('/token/list');
  }
}
