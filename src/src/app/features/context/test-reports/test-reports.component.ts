import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { AgentService } from '../../../core/services/agent.service';

interface TestReportRow {
  request_id: string;
  user_id: string;
  agent_code: string;
  intent: string;
  created_on?: string;
  createdOn?: string;
}

interface TestReportDetails {
  id?: string;
  request_id: string;
  user_id: string;
  agent_code: string;
  intent: string;
  created_on?: string;
  createdOn?: string;
  user_msg?: string;
  entity?: any[];
  context_list?: any[];
  image_set?: any[];
  test_reports?: any;
  top_results?: string;
  default?: string;
  latest?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-test-reports',
  templateUrl: './test-reports.component.html',
  styleUrls: ['./test-reports.component.scss']
})

export class TestReportsComponent implements OnInit {

  filterForm: FormGroup;
  users: string[] = [];
  agentCodes: string[] = [];
  reports: TestReportRow[] = [];
  displayedReports: TestReportRow[] = [];
  totalReports = 0;
  page = 1;
  pageSize = 10;
  loading = false;
  loadingUsers = false;
  loadingAgents = false;
  error: string | null = null;
  selectedReport: TestReportDetails | null = null;
  showModal = false;
  serverPaginated = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private agentService: AgentService,
    private toastr: ToastrService
  ) {
    this.filterForm = this.fb.group({
      user: [''],
      agentCode: [''],
      intent: [''],
      fromDate: [''],
      toDate: ['']
    });
  }

  ngOnInit() {
    this.loadUsers();
    this.loadAgents();
    this.loadReports();
  }

  loadUsers() {
    this.loadingUsers = true;
    this.apiService.get('/evaluation-reports/users').subscribe({
      next: (response: any) => {
        if (response.status === 'success' && Array.isArray(response.users)) {
          this.users = response.users;
        } else if (Array.isArray(response)) {
          this.users = response;
        } else {
          this.users = [];
        }
        this.loadingUsers = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.users = [];
        this.loadingUsers = false;
      }
    });
  }

  loadAgents() {
    this.loadingAgents = true;
    this.agentService.getAllAgents().subscribe({
      next: (agents: any[]) => {
        this.agentCodes = agents
          .map(agent => agent.agentCode || agent.code || agent.agent_code)
          .filter((code): code is string => !!code)
          .sort();
        this.loadingAgents = false;
      },
      error: (err) => {
        console.error('Error loading agents:', err);
        this.agentCodes = [];
        this.loadingAgents = false;
      }
    });
  }

  loadReports(page: number = 1) {
    this.loading = true;
    this.error = null;
    const params: any = {
      page: page,
      page_size: this.pageSize
    };
    const f = this.filterForm.value;
    if (f.user) params.user_id = f.user;
    if (f.agentCode) params.agent_code = f.agentCode;
    if (f.intent) params.intent = f.intent;
    if (f.fromDate) {
      // Convert datetime-local to ISO string
      const fromDate = new Date(f.fromDate);
      params.from_date = fromDate.toISOString();
    }
    if (f.toDate) {
      const toDate = new Date(f.toDate);
      params.to_date = toDate.toISOString();
    }
    
    this.apiService.get('/evaluation-reports/all', params).subscribe({
      next: (resp: any) => {
        this.loading = false;
        const rawResults = resp?.results ?? resp?.data ?? resp ?? [];
        const normalizedResults: TestReportRow[] = Array.isArray(rawResults) ? rawResults : [];
        const reportedTotal = typeof resp?.total === 'number' ? resp.total : (typeof resp?.count === 'number' ? resp.count : null);

        if (reportedTotal && reportedTotal > normalizedResults.length) {
          this.serverPaginated = true;
          this.totalReports = reportedTotal;
          this.reports = normalizedResults;
          this.page = page;
        } else {
          this.serverPaginated = false;
          this.reports = normalizedResults;
          this.totalReports = this.reports.length;
          this.page = page;
        }

        this.updateDisplayedReports();

        if (this.totalReports === 0 && this.page === 1) {
          this.toastr.info('No test reports found', 'Info');
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load reports';
        this.reports = [];
        this.displayedReports = [];
        this.totalReports = 0;
        this.toastr.error('Failed to load test reports', 'Error');
        console.error('Load reports error:', err);
      }
    });
  }

  applyFilters() {
    this.toastr.info('Applying filters...', 'Info');
    this.loadReports(1);
  }

  clearFilters() {
    this.filterForm.reset();
    this.toastr.info('Filters cleared', 'Info');
    this.loadReports(1);
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    if (this.serverPaginated) {
      this.loadReports(page);
    } else {
      this.page = page;
      this.updateDisplayedReports();
    }
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('en-US', { 
        month: 'short', 
        day: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dateStr;
    }
  }

  viewReport(report: TestReportRow) {
    // Fetch full report details by request_id
    this.loading = true;
    this.apiService.get('/evaluation-report', {
      request_id: report.request_id,
      user_id: report.user_id,
      agent_code: report.agent_code,
      intent: report.intent
    }).subscribe({
      next: (resp: any) => {
        this.loading = false;
        if (resp.status === 'success' && resp.data) {
          this.selectedReport = resp.data;
          // Parse test_reports if string
          if (typeof this.selectedReport?.test_reports === 'string') {
            try {
              this.selectedReport.test_reports = JSON.parse(this.selectedReport.test_reports);
            } catch (e) {
              console.error('Failed to parse test_reports:', e);
            }
          }
        } else {
          this.selectedReport = resp;
        }
        this.showModal = true;
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error('Failed to load report details', 'Error');
        console.error('View report error:', err);
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedReport = null;
  }

  private updateDisplayedReports(): void {
    if (this.serverPaginated) {
      this.displayedReports = this.reports;
      return;
    }

    const startIndex = (this.page - 1) * this.pageSize;
    this.displayedReports = this.reports.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.totalReports / this.pageSize) || 1;
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.page;
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, -1, total);
      } else if (current >= total - 2) {
        pages.push(1, -1, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, -1, current - 1, current, current + 1, -1, total);
      }
    }
    
    return pages;
  }

  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  formatJson(value: any): string {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }

  isObject(value: any): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  // Expose Math for template
  Math = Math;

  getCreatedOn(record: { created_on?: string; createdOn?: string; createdDate?: string } | null | undefined): string {
    if (!record) {
      return '';
    }
    return record.created_on || record.createdOn || record.createdDate || '';
  }

  formatRefinedOutput(output: any): string {
    if (!output) {
      return '<p style="color: #999; font-style: italic;">No output available</p>';
    }

    let parsedOutput = output;
    if (typeof output === 'string') {
      try {
        parsedOutput = JSON.parse(output);
      } catch (e) {
        return `<div style="white-space: pre-wrap; line-height: 1.8; color: #333;">${this.escapeHtml(output)}</div>`;
      }
    }

    let html = '<div style="line-height: 1.8;">';

    if (typeof parsedOutput === 'object' && parsedOutput !== null && !Array.isArray(parsedOutput)) {
      for (const [key, value] of Object.entries(parsedOutput)) {
        html += `
          <div style="margin-bottom: 12px; padding: 12px; background-color: rgba(102, 126, 234, 0.05); border-left: 3px solid #667eea; border-radius: 4px;">
            <div style="font-weight: 600; color: #667eea; margin-bottom: 6px; text-transform: capitalize;">
              ${this.escapeHtml(key.replace(/_/g, ' '))}:
            </div>
            <div style="color: #333; padding-left: 12px;">
              ${this.formatValue(value)}
            </div>
          </div>
        `;
      }
    } else {
      html += `<div style="color: #333;">${this.escapeHtml(String(parsedOutput))}</div>`;
    }

    html += '</div>';
    return html;
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '<span style="color: #999; font-style: italic;">N/A</span>';
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '<span style="color: #999; font-style: italic;">Empty list</span>';
      }
      return '<ul style="margin: 4px 0; padding-left: 20px;">' +
        value.map(item => `<li style="margin: 4px 0;">${this.formatValue(item)}</li>`).join('') +
        '</ul>';
    }

    if (typeof value === 'object') {
      let html = '<div style="margin-left: 12px; padding: 8px; background-color: rgba(0,0,0,0.02); border-radius: 4px;">';
      for (const [k, v] of Object.entries(value)) {
        html += `
          <div style="margin: 6px 0;">
            <span style="font-weight: 600; color: #555;">${this.escapeHtml(k)}:</span>
            <span style="color: #333;">${this.formatValue(v)}</span>
          </div>
        `;
      }
      html += '</div>';
      return html;
    }

    if (typeof value === 'boolean') {
      return value ?
        '<span style="color: #28a745; font-weight: 600;">✓ True</span>' :
        '<span style="color: #dc3545; font-weight: 600;">✗ False</span>';
    }

    if (typeof value === 'number') {
      return `<span style="color: #667eea; font-weight: 600;">${value}</span>`;
    }

    return `<span style="color: #333;">${this.escapeHtml(String(value))}</span>`;
  }

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}
