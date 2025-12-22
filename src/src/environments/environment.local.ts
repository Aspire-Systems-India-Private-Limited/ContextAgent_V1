export const environment = {
  production: false,
  // Toggle between Azure backend and mock data
  useAzureBackend: false, // Set to true when Azure endpoints are confirmed
  useMockDataFallback: true, // Automatically use mock data if API fails
  
  // Azure Backend URLs
  apiBase: 'http://agent-ops-public.westus2.azurecontainer.io:8009',
  aiSearchApiBase: 'http://ai-search-api.azurecontainer.io:8010',
  
  // Local Backend URLs (for testing)
  localApiBase: 'http://localhost:8009',
  localAiSearchApiBase: 'http://localhost:8010',
  
  // API Configuration
  apiTimeout: 10000, // 10 seconds
  enableDebugLogs: true
};
