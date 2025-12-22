import { Injectable } from '@angular/core';
import { AgentService } from './agent.service';
import { ContextService } from './context.service';
import { MemoryService } from './memory.service';
import { SessionService } from './session.service';
import { AuditService } from './audit.service';
import { firstValueFrom } from 'rxjs';

export interface EndpointTestResult {
  service: string;
  endpoint: string;
  status: 'SUCCESS' | 'FAILED' | 'TIMEOUT';
  responseTime?: number;
  error?: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConnectivityTestService {

  constructor(
    private agentService: AgentService,
    private contextService: ContextService,
    private memoryService: MemoryService,
    private sessionService: SessionService,
    private auditService: AuditService
  ) {}

  /**
   * Test all backend endpoints and return comprehensive results
   */
  async testAllEndpoints(): Promise<EndpointTestResult[]> {
    console.log('🔍 Starting Backend Connectivity Tests...\n');
    
    const results: EndpointTestResult[] = [];

    // Test Agent Service
    results.push(...await this.testAgentService());
    
    // Test Context Service
    results.push(...await this.testContextService());
    
    // Test Memory Service
    results.push(...await this.testMemoryService());
    
    // Test Session Service
    results.push(...await this.testSessionService());
    
    // Test Audit Service
    results.push(...await this.testAuditService());

    // Print summary
    this.printSummary(results);
    
    return results;
  }

  /**
   * Test Agent Service Endpoints
   */
  private async testAgentService(): Promise<EndpointTestResult[]> {
    const results: EndpointTestResult[] = [];
    
    console.log('📋 Testing Agent Service...');
    
    // Test GET all agents
    results.push(await this.testEndpoint(
      'AgentService',
      'GET /agent/all',
      () => firstValueFrom(this.agentService.getAllAgents())
    ));

    return results;
  }

  /**
   * Test Context Service Endpoints
   */
  private async testContextService(): Promise<EndpointTestResult[]> {
    const results: EndpointTestResult[] = [];
    
    console.log('📋 Testing Context Service...');
    
    // Test GET all contexts
    results.push(await this.testEndpoint(
      'ContextService',
      'GET /context/all',
      () => firstValueFrom(this.contextService.getAllContexts())
    ));

    return results;
  }

  /**
   * Test Memory Service Endpoints
   */
  private async testMemoryService(): Promise<EndpointTestResult[]> {
    const results: EndpointTestResult[] = [];
    
    console.log('📋 Testing Memory Service...');
    
    // Test GET all memories
    results.push(await this.testEndpoint(
      'MemoryService',
      'GET /memory',
      () => firstValueFrom(this.memoryService.getAllMemories())
    ));

    return results;
  }

  /**
   * Test Session Service Endpoints
   */
  private async testSessionService(): Promise<EndpointTestResult[]> {
    const results: EndpointTestResult[] = [];
    
    console.log('📋 Testing Session Service...');
    
    // Test POST search sessions
    results.push(await this.testEndpoint(
      'SessionService',
      'POST /sessions/search',
      () => firstValueFrom(this.sessionService.searchSessions({
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date().toISOString()
      }))
    ));

    return results;
  }

  /**
   * Test Audit Service Endpoints
   */
  private async testAuditService(): Promise<EndpointTestResult[]> {
    const results: EndpointTestResult[] = [];
    
    console.log('📋 Testing Audit Service...');
    
    // Test GET audit by date
    const today = new Date().toISOString().split('T')[0];
    results.push(await this.testEndpoint(
      'AuditService',
      'GET /audit?date=' + today,
      () => firstValueFrom(this.auditService.getAuditByDate(today))
    ));

    // Test GET audit by last minutes
    results.push(await this.testEndpoint(
      'AuditService',
      'GET /audit?minutes=60',
      () => firstValueFrom(this.auditService.getAuditByMinutes(60))
    ));

    return results;
  }

  /**
   * Generic endpoint tester
   */
  private async testEndpoint(
    service: string,
    endpoint: string,
    apiCall: () => Promise<any>
  ): Promise<EndpointTestResult> {
    const startTime = Date.now();
    
    try {
      await apiCall();
      const responseTime = Date.now() - startTime;
      
      console.log(`  ✅ ${endpoint} - ${responseTime}ms`);
      
      return {
        service,
        endpoint,
        status: 'SUCCESS',
        responseTime,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error?.message || error?.error?.message || 'Unknown error';
      
      console.log(`  ❌ ${endpoint} - ${errorMessage}`);
      
      return {
        service,
        endpoint,
        status: 'FAILED',
        responseTime,
        error: errorMessage,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Print test summary
   */
  private printSummary(results: EndpointTestResult[]): void {
    console.log('\n📊 Test Summary\n');
    console.log('='.repeat(80));
    
    const successful = results.filter(r => r.status === 'SUCCESS').length;
    const failed = results.filter(r => r.status === 'FAILED').length;
    const total = results.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Successful: ${successful} (${((successful/total)*100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${failed} (${((failed/total)*100).toFixed(1)}%)`);
    
    if (successful > 0) {
      const avgResponseTime = results
        .filter(r => r.status === 'SUCCESS' && r.responseTime)
        .reduce((sum, r) => sum + (r.responseTime || 0), 0) / successful;
      console.log(`⚡ Avg Response Time: ${avgResponseTime.toFixed(0)}ms`);
    }
    
    console.log('='.repeat(80));
    
    if (failed > 0) {
      console.log('\n❌ Failed Endpoints:\n');
      results
        .filter(r => r.status === 'FAILED')
        .forEach(r => {
          console.log(`  • ${r.service} - ${r.endpoint}`);
          console.log(`    Error: ${r.error}\n`);
        });
    }
    
    // Print detailed results table
    console.log('\n📋 Detailed Results:\n');
    console.table(results.map(r => ({
      Service: r.service,
      Endpoint: r.endpoint,
      Status: r.status,
      'Time (ms)': r.responseTime,
      Error: r.error || '-'
    })));
  }

  /**
   * Quick health check - tests one endpoint from each service
   */
  async quickHealthCheck(): Promise<boolean> {
    console.log('🏥 Running Quick Health Check...\n');
    
    const criticalTests = [
      this.testEndpoint('AgentService', 'GET /agent/all', 
        () => firstValueFrom(this.agentService.getAllAgents())),
      this.testEndpoint('ContextService', 'GET /context/all',
        () => firstValueFrom(this.contextService.getAllContexts())),
      this.testEndpoint('MemoryService', 'GET /memory',
        () => firstValueFrom(this.memoryService.getAllMemories()))
    ];

    const results = await Promise.all(criticalTests);
    const allPassed = results.every(r => r.status === 'SUCCESS');
    
    if (allPassed) {
      console.log('✅ Health Check PASSED - All critical services are responding\n');
    } else {
      console.log('❌ Health Check FAILED - Some services are not responding\n');
    }
    
    return allPassed;
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport(results: EndpointTestResult[]): string {
    const successful = results.filter(r => r.status === 'SUCCESS').length;
    const failed = results.filter(r => r.status === 'FAILED').length;
    const total = results.length;
    const successRate = ((successful/total)*100).toFixed(1);

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Backend Connectivity Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 3px solid #65336e; padding-bottom: 10px; }
    .summary { display: flex; gap: 20px; margin: 20px 0; }
    .stat-card { flex: 1; padding: 20px; border-radius: 8px; text-align: center; }
    .stat-card.success { background: #d4edda; color: #155724; }
    .stat-card.failed { background: #f8d7da; color: #721c24; }
    .stat-card.total { background: #d1ecf1; color: #0c5460; }
    .stat-value { font-size: 36px; font-weight: bold; }
    .stat-label { font-size: 14px; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #65336e; color: white; }
    tr:hover { background: #f5f5f5; }
    .status-success { color: #28a745; font-weight: bold; }
    .status-failed { color: #dc3545; font-weight: bold; }
    .timestamp { color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔌 Backend Connectivity Test Report</h1>
    <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
    
    <div class="summary">
      <div class="stat-card total">
        <div class="stat-value">${total}</div>
        <div class="stat-label">Total Tests</div>
      </div>
      <div class="stat-card success">
        <div class="stat-value">${successful}</div>
        <div class="stat-label">Successful (${successRate}%)</div>
      </div>
      <div class="stat-card failed">
        <div class="stat-value">${failed}</div>
        <div class="stat-label">Failed</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Service</th>
          <th>Endpoint</th>
          <th>Status</th>
          <th>Response Time</th>
          <th>Error</th>
        </tr>
      </thead>
      <tbody>
        ${results.map(r => `
          <tr>
            <td>${r.service}</td>
            <td><code>${r.endpoint}</code></td>
            <td class="status-${r.status.toLowerCase()}">${r.status}</td>
            <td>${r.responseTime ? r.responseTime + 'ms' : '-'}</td>
            <td>${r.error || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Download HTML report
   */
  downloadHTMLReport(results: EndpointTestResult[]): void {
    const html = this.generateHTMLReport(results);
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `connectivity-test-${Date.now()}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
