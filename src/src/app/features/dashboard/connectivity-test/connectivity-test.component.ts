import { Component, OnInit } from '@angular/core';
import { ConnectivityTestService, EndpointTestResult } from '../../../core/services/connectivity-test.service';

@Component({
  selector: 'app-connectivity-test',
  templateUrl: './connectivity-test.component.html',
  styleUrls: ['./connectivity-test.component.scss']
})
export class ConnectivityTestComponent implements OnInit {
  testResults: EndpointTestResult[] = [];
  testing: boolean = false;
  testComplete: boolean = false;
  healthCheckPassed: boolean | null = null;

  constructor(private connectivityTest: ConnectivityTestService) {}

  ngOnInit(): void {
    // Optionally run quick health check on init
  }

  async runQuickHealthCheck(): Promise<void> {
    this.testing = true;
    this.healthCheckPassed = await this.connectivityTest.quickHealthCheck();
    this.testing = false;
  }

  async runFullTest(): Promise<void> {
    this.testing = true;
    this.testComplete = false;
    this.testResults = [];
    
    this.testResults = await this.connectivityTest.testAllEndpoints();
    
    this.testing = false;
    this.testComplete = true;
  }

  downloadReport(): void {
    this.connectivityTest.downloadHTMLReport(this.testResults);
  }

  get successCount(): number {
    return this.testResults.filter(r => r.status === 'SUCCESS').length;
  }

  get failedCount(): number {
    return this.testResults.filter(r => r.status === 'FAILED').length;
  }

  get successRate(): number {
    if (this.testResults.length === 0) return 0;
    return (this.successCount / this.testResults.length) * 100;
  }

  get avgResponseTime(): number {
    const successful = this.testResults.filter(r => r.status === 'SUCCESS' && r.responseTime);
    if (successful.length === 0) return 0;
    return successful.reduce((sum, r) => sum + (r.responseTime || 0), 0) / successful.length;
  }
}
