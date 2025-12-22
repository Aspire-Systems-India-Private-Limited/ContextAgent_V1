# Azure Backend Integration Test Script
Write-Host "Testing Azure Backend Connectivity..." -ForegroundColor Cyan
Write-Host ""

$primaryAPI = "http://agent-ops-public.westus2.azurecontainer.io:8009"
$aiSearchAPI = "http://ai-search-api.azurecontainer.io:8010"

Write-Host "Testing Primary API: $primaryAPI" -ForegroundColor Yellow

$endpoints = @(
    @{Path="/agent/all"; Description="Get All Agents"},
    @{Path="/context/all"; Description="Get All Contexts"},
    @{Path="/memory"; Description="Get All Memories"}
)

$results = @()

foreach ($endpoint in $endpoints) {
    $url = "$primaryAPI$($endpoint.Path)"
    Write-Host "  Testing: $($endpoint.Description)..." -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10 -ErrorAction Stop
        Write-Host " SUCCESS" -ForegroundColor Green
        $results += @{Endpoint = $endpoint.Path; Status = "Success"; Code = $response.StatusCode}
    }
    catch {
        Write-Host " FAILED" -ForegroundColor Red
        $results += @{Endpoint = $endpoint.Path; Status = "Failed"; Code = "N/A"}
    }
}

Write-Host ""
$successCount = ($results | Where-Object { $_.Status -eq "Success" }).Count
Write-Host "Results: $successCount of $($results.Count) tests passed" -ForegroundColor $(if($successCount -eq $results.Count){"Green"}else{"Yellow"})
$results | Format-Table -AutoSize
