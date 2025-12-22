import { Component, OnInit } from '@angular/core';
import { AuditService, AuditLog, AuditSearchParams } from '../../core/services/audit.service';
import { ToastrService } from 'ngx-toastr';

type FilterMode = 'date' | 'datetime-range' | 'minutes' | 'session' | 'request';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.scss']
})
export class AuditLogComponent implements OnInit {
  auditLogs: AuditLog[] = [];
  loading: boolean = false;
  filterMode: FilterMode = 'date';
  expandedLogId: string | null = null;

  // Filter inputs
  selectedDate: string = '';
  startDateTime: string = '';
  endDateTime: string = '';
  sourceFilter: string = '';
  minutesFilter: number | null = null;
  sessionIdFilter: string = '';
  requestIdFilter: string = '';

  constructor(
    private auditService: AuditService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadMockAuditLogs();
  }

  setFilterMode(mode: FilterMode): void {
    this.filterMode = mode;
    this.clearFilters();
  }

  clearFilters(): void {
    this.selectedDate = '';
    this.startDateTime = '';
    this.endDateTime = '';
    this.sourceFilter = '';
    this.minutesFilter = null;
    this.sessionIdFilter = '';
    this.requestIdFilter = '';
    this.auditLogs = [];
  }

  onSearch(): void {
    this.loading = true;

    switch (this.filterMode) {
      case 'date':
        this.searchByDate();
        break;
      case 'datetime-range':
        this.searchByDateTimeRange();
        break;
      case 'minutes':
        this.searchByMinutes();
        break;
      case 'session':
        this.searchBySessionId();
        break;
      case 'request':
        this.searchByRequestId();
        break;
    }
  }

  private searchByDate(): void {
    if (!this.selectedDate) {
      this.toastr.warning('Please select a date', 'Validation Error');
      this.loading = false;
      return;
    }

    this.auditService.getAuditByDate(this.selectedDate).subscribe({
      next: (logs: AuditLog[]) => {
        this.auditLogs = logs;
        this.loading = false;
        this.toastr.success(`Found ${logs.length} audit logs`, 'Success');
      },
      error: (error) => {
        console.error('Error fetching audit logs:', error);
        this.toastr.error('Failed to fetch audit logs. Using mock data.', 'Error');
        this.loading = false;
        this.loadMockAuditLogs();
      }
    });
  }

  private searchByDateTimeRange(): void {
    if (!this.startDateTime || !this.endDateTime) {
      this.toastr.warning('Please select both start and end datetime', 'Validation Error');
      this.loading = false;
      return;
    }

    const params: AuditSearchParams = {
      start: this.startDateTime,
      end: this.endDateTime,
      source: this.sourceFilter || undefined
    };

    this.auditService.getAuditByDateTimeRange(params).subscribe({
      next: (logs: AuditLog[]) => {
        this.auditLogs = logs;
        this.loading = false;
        this.toastr.success(`Found ${logs.length} audit logs`, 'Success');
      },
      error: (error) => {
        console.error('Error fetching audit logs:', error);
        this.toastr.error('Failed to fetch audit logs. Using mock data.', 'Error');
        this.loading = false;
        this.loadMockAuditLogs();
      }
    });
  }

  private searchByMinutes(): void {
    if (!this.minutesFilter || this.minutesFilter <= 0) {
      this.toastr.warning('Please enter a valid number of minutes', 'Validation Error');
      this.loading = false;
      return;
    }

    this.auditService.getAuditByMinutes(this.minutesFilter).subscribe({
      next: (logs: AuditLog[]) => {
        this.auditLogs = logs;
        this.loading = false;
        this.toastr.success(`Found ${logs.length} audit logs`, 'Success');
      },
      error: (error) => {
        console.error('Error fetching audit logs:', error);
        this.toastr.error('Failed to fetch audit logs. Using mock data.', 'Error');
        this.loading = false;
        this.loadMockAuditLogs();
      }
    });
  }

  private searchBySessionId(): void {
    if (!this.sessionIdFilter) {
      this.toastr.warning('Please enter a session ID', 'Validation Error');
      this.loading = false;
      return;
    }

    this.auditService.getAuditBySessionId(this.sessionIdFilter).subscribe({
      next: (logs: AuditLog[]) => {
        this.auditLogs = logs;
        this.loading = false;
        this.toastr.success(`Found ${logs.length} audit logs`, 'Success');
      },
      error: (error) => {
        console.error('Error fetching audit logs:', error);
        this.toastr.error('Failed to fetch audit logs. Using mock data.', 'Error');
        this.loading = false;
        this.loadMockAuditLogs();
      }
    });
  }

  private searchByRequestId(): void {
    if (!this.requestIdFilter) {
      this.toastr.warning('Please enter a request ID', 'Validation Error');
      this.loading = false;
      return;
    }

    this.auditService.getAuditByRequestId(this.requestIdFilter).subscribe({
      next: (logs: AuditLog[]) => {
        this.auditLogs = logs;
        this.loading = false;
        this.toastr.success(`Found ${logs.length} audit logs`, 'Success');
      },
      error: (error) => {
        console.error('Error fetching audit logs:', error);
        this.toastr.error('Failed to fetch audit logs. Using mock data.', 'Error');
        this.loading = false;
        this.loadMockAuditLogs();
      }
    });
  }

  toggleLogExpansion(logId: string): void {
    this.expandedLogId = this.expandedLogId === logId ? null : logId;
  }

  isLogExpanded(logId: string): boolean {
    return this.expandedLogId === logId;
  }

  exportLogs(format: 'csv' | 'json'): void {
    if (this.auditLogs.length === 0) {
      this.toastr.warning('No logs to export', 'Warning');
      return;
    }

    this.auditService.exportLogs(this.auditLogs, format);
    this.toastr.success(`Exported ${this.auditLogs.length} logs as ${format.toUpperCase()}`, 'Success');
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  truncateContent(content: string, length: number): string {
    if (!content) return '';
    return content.length > length ? content.substring(0, length) + '...' : content;
  }

  getFilterTitle(): string {
    const titles: Record<FilterMode, string> = {
      'date': 'Filter by Date',
      'datetime-range': 'Filter by DateTime Range',
      'minutes': 'Filter by Last N Minutes',
      'session': 'Filter by Session ID',
      'request': 'Filter by Request ID'
    };
    return titles[this.filterMode];
  }

  private loadMockAuditLogs(): void {
    this.auditLogs = [
      {
        id: 'audit_001',
        content: 'User authentication successful. User ID: user_123 logged in from IP: 192.168.1.100',
        createdOn: '2024-12-09T09:00:00Z',
        modifiedOn: '2024-12-09T09:00:00Z',
        source: 'AUTH_SERVICE',
        session_id: 'sess_001',
        user_id: 'user_123',
        request_id: 'req_001'
      },
      {
        id: 'audit_002',
        content: 'Context created: PromptCode="WELCOME_MESSAGE", AgentCode="CS-BOT-001", Type="System"',
        createdOn: '2024-12-09T09:15:00Z',
        modifiedOn: '2024-12-09T09:15:00Z',
        source: 'CONTEXT_SERVICE',
        session_id: 'sess_001',
        user_id: 'user_123',
        request_id: 'req_002'
      },
      {
        id: 'audit_003',
        content: 'API rate limit warning: User user_456 approaching limit (850/1000 requests)',
        createdOn: '2024-12-09T09:30:00Z',
        modifiedOn: '2024-12-09T09:30:00Z',
        source: 'API_GATEWAY',
        user_id: 'user_456',
        request_id: 'req_003'
      },
      {
        id: 'audit_004',
        content: 'Session started: session_id=sess_002, user=jane.smith@example.com, agent=SALES-BOT-001',
        createdOn: '2024-12-09T10:00:00Z',
        modifiedOn: '2024-12-09T10:00:00Z',
        source: 'SESSION_SERVICE',
        session_id: 'sess_002',
        user_id: 'user_456',
        request_id: 'req_004'
      },
      {
        id: 'audit_005',
        content: 'Memory saved: user_id=user_123, session_id=sess_001, context="Customer Support - Communication Preference"',
        createdOn: '2024-12-09T10:30:00Z',
        modifiedOn: '2024-12-09T10:30:00Z',
        source: 'MEMORY_SERVICE',
        session_id: 'sess_001',
        user_id: 'user_123',
        request_id: 'req_005'
      },
      {
        id: 'audit_006',
        content: 'Failed authentication attempt from IP: 203.0.113.42, username: admin',
        createdOn: '2024-12-09T11:00:00Z',
        modifiedOn: '2024-12-09T11:00:00Z',
        source: 'AUTH_SERVICE',
        request_id: 'req_006'
      },
      {
        id: 'audit_007',
        content: 'Context updated: PromptCode="WELCOME_MESSAGE", VersionId="v2.0.1", changes={Content: modified}',
        createdOn: '2024-12-09T11:30:00Z',
        modifiedOn: '2024-12-09T11:30:00Z',
        source: 'CONTEXT_SERVICE',
        user_id: 'user_123',
        request_id: 'req_007'
      },
      {
        id: 'audit_008',
        content: 'Database backup completed successfully. Backup size: 245 MB, duration: 45 seconds',
        createdOn: '2024-12-09T12:00:00Z',
        modifiedOn: '2024-12-09T12:00:00Z',
        source: 'DATABASE_SERVICE',
        request_id: 'req_008'
      },
      {
        id: 'audit_009',
        content: 'Agent configuration updated: AgentCode="TECH-BOT-001", model changed from gpt-3.5-turbo to gpt-4',
        createdOn: '2024-12-09T12:30:00Z',
        modifiedOn: '2024-12-09T12:30:00Z',
        source: 'AGENT_SERVICE',
        user_id: 'user_789',
        request_id: 'req_009'
      },
      {
        id: 'audit_010',
        content: 'Session ended: session_id=sess_002, duration=32 minutes, messages_exchanged=8',
        createdOn: '2024-12-09T13:00:00Z',
        modifiedOn: '2024-12-09T13:00:00Z',
        source: 'SESSION_SERVICE',
        session_id: 'sess_002',
        user_id: 'user_456',
        request_id: 'req_010'
      }
    ];
  }
}