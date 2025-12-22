# 🚀 Running Angular UI Locally with Azure Backend

## ✅ Configuration Complete!

Your Angular app is now configured to run locally while connecting to Azure backend services.

### 📋 What Was Changed:

1. **Environment Configuration** (`src/environments/environment.ts`)
   - `apiBase`: Now points to Azure → `http://agent-ops-public.westus2.azurecontainer.io:8009`
   - `aiSearchApiBase`: Now points to Azure → `http://ai-search-api.azurecontainer.io:8010`

2. **Proxy Configuration** (`src/proxy.conf.json`)
   - Created proxy to handle CORS issues
   - Routes `/api/*` requests to Azure primary API
   - Routes `/ai-search/*` requests to Azure AI Search API

---

## 🎯 How to Run

### Option 1: Direct Connection (No Proxy)
```powershell
cd "c:\Users\soundarya.shanmugam\Downloads\Context-Agent-Angular (1)\src"
ng serve
```

Then open: `http://localhost:4200`

### Option 2: With Proxy (Recommended for CORS)
```powershell
cd "c:\Users\soundarya.shanmugam\Downloads\Context-Agent-Angular (1)\src"
ng serve --proxy-config proxy.conf.json
```

Then open: `http://localhost:4200`

---

## 🔍 Testing the Connection

### 1. Start the Angular App
```powershell
cd "c:\Users\soundarya.shanmugam\Downloads\Context-Agent-Angular (1)\src"
ng serve
```

### 2. Open Browser
Navigate to: `http://localhost:4200`

### 3. Open Developer Tools
Press `F12` to open DevTools

### 4. Check Network Tab
- Go to **Network** tab
- Navigate to different modules in your app
- Watch for API calls to Azure endpoints
- Look for successful responses (green status codes)

### 5. Check Console Tab
- Go to **Console** tab
- Look for any errors
- Verify API calls are being made

---

## 🧪 Test Each Module

### ✅ Context Management
1. Navigate to: `http://localhost:4200/admin/context`
2. Should see "Search Context" tab
3. Click "Create Context" tab
4. Verify form loads
5. Check Network tab for calls to Azure

### ✅ Agent Management
1. Navigate to: `http://localhost:4200/agent-sol`
2. Should load agent list
3. Check Network tab for: `GET http://agent-ops-public.westus2.azurecontainer.io:8009/agent/all`

### ✅ Memory Management
1. Navigate to: `http://localhost:4200/memory`
2. Should load memory search
3. Check Network tab for: `GET http://agent-ops-public.westus2.azurecontainer.io:8009/memory`

### ✅ Session Management
1. Navigate to: `http://localhost:4200/session`
2. Set date range and click "Search Sessions"
3. Check Network tab for: `POST http://agent-ops-public.westus2.azurecontainer.io:8009/sessions/search`

### ✅ Audit Logs
1. Navigate to: `http://localhost:4200/audit`
2. Select filter and search
3. Check Network tab for audit API calls

---

## ⚠️ Potential Issues & Solutions

### Issue 1: CORS Error
**Symptom:** Console shows "CORS policy" error

**Solution 1:** Use the proxy configuration
```powershell
ng serve --proxy-config proxy.conf.json
```

**Solution 2:** Ask backend team to enable CORS for `http://localhost:4200`
```python
# Backend should have:
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:4200/'],
  credentials: true
}))
```

### Issue 2: 404 Not Found
**Symptom:** Network tab shows 404 errors

**Solution:** 
- Verify Azure backend is running
- Check if endpoint paths are correct
- Contact backend team for correct API endpoints

### Issue 3: Connection Timeout
**Symptom:** Requests timeout or fail to connect

**Solution:**
- Verify Azure services are running
- Check your network connection
- Check if firewall is blocking requests
- Verify URLs in `environment.ts` are correct

### Issue 4: No Data Displays
**Symptom:** Pages load but no data shows

**Solution:**
- Check Network tab - are API calls being made?
- Check Response tab - what data is returned?
- Check if backend has data
- Components may fall back to mock data if API fails

---

## 🔧 Troubleshooting Commands

### Check if Angular is running
```powershell
# Open http://localhost:4200 in browser
# Should see your app
```

### Check Azure backend connectivity
```powershell
# Test primary API
curl http://agent-ops-public.westus2.azurecontainer.io:8009/agent/all

# Test AI Search API
curl http://ai-search-api.azurecontainer.io:8010/health
```

### View real-time logs
```powershell
# Terminal will show:
# - API requests being made
# - Any compilation errors
# - Warnings
```

---

## 📊 Expected Behavior

### ✅ SUCCESS Indicators:
- ✅ App loads at `http://localhost:4200`
- ✅ No red errors in browser console
- ✅ Network tab shows API calls to Azure URLs
- ✅ Status codes are 200, 201, etc.
- ✅ Data displays in tables/lists
- ✅ Forms submit successfully
- ✅ Toast notifications appear

### ❌ FAILURE Indicators:
- ❌ CORS errors in console
- ❌ 404 errors in Network tab
- ❌ Connection timeout errors
- ❌ Blank pages or no data
- ❌ Red error messages in console

---

## 🎯 Quick Start Commands

```powershell
# Navigate to project
cd "c:\Users\soundarya.shanmugam\Downloads\Context-Agent-Angular (1)\src"

# Install dependencies (if needed)
npm install

# Start with proxy (recommended)
ng serve --proxy-config proxy.conf.json

# OR start without proxy
ng serve

# Open browser
start http://localhost:4200
```

---

## 📝 Configuration Files Updated

1. ✅ `src/environments/environment.ts` - Development environment with Azure URLs
2. ✅ `src/environments/environment.dev.ts` - Alternative dev config
3. ✅ `src/proxy.conf.json` - Proxy configuration for CORS handling

---

## 🔗 Azure Backend URLs

**Primary API:** `http://agent-ops-public.westus2.azurecontainer.io:8009`
- Agent endpoints: `/agent/*`
- Context endpoints: `/context/*`, `/contexts/*`
- Memory endpoints: `/memory/*`
- Session endpoints: `/sessions/*`
- Audit endpoints: `/audit/*`

**AI Search API:** `http://ai-search-api.azurecontainer.io:8010`
- Generate context: `/generate/context`

---

## 📞 Next Steps

1. **Start the app:**
   ```powershell
   cd "c:\Users\soundarya.shanmugam\Downloads\Context-Agent-Angular (1)\src"
   ng serve --proxy-config proxy.conf.json
   ```

2. **Open browser:** `http://localhost:4200`

3. **Test modules:** Navigate through each module and verify connectivity

4. **Monitor:** Watch Network tab and Console for any errors

5. **Report issues:** Note any failing endpoints and contact backend team

---

## ✨ You're All Set!

Your Angular UI is now configured to run locally while connecting to Azure backend services. Start the development server and begin testing!

**Command to run:**
```powershell
cd "c:\Users\soundarya.shanmugam\Downloads\Context-Agent-Angular (1)\src"
ng serve --proxy-config proxy.conf.json
```

Then navigate to: `http://localhost:4200`

Good luck! 🚀
