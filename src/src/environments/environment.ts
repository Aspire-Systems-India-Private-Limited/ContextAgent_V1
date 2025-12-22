export const environment = {
  production: false,
  // Azure Backend - Update these URLs when backend team confirms the correct endpoints
  apiBase: 'http://agent-ops-public.westus2.azurecontainer.io:8009',
  aiSearchApiBase: 'http://ai-search-api.azurecontainer.io:8010',
  
  // Set to true to enable mock data fallback when API calls fail
  useMockDataFallback: true,
  enableDebugLogs: true
};
