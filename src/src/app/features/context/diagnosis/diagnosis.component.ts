import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';

interface AuditLog {
  id: string;
  source: string;
  sessionId: string;
  userId: string;
  requestId: string;
  createdOn: string;
  modifiedOn: string;
  content: ContentItem[];
}

interface ContentItem {
  iteration: number;
  request: string;
  response: string;
  refinement: string;
  model: string;
  cost: string;
  agent_code: string;
  user_id: string;
  context_code: string;
  token_count: string;
  ai_call_time: string;
  iteration_time: string;
}

@Component({
  selector: 'app-diagnosis',
  templateUrl: './diagnosis.component.html',
  styleUrls: ['./diagnosis.component.scss']
})
export class DiagnosisComponent implements OnInit {
  filterForm: FormGroup;
  logs: AuditLog[] = [];
  expandedLogs: Set<string> = new Set();
  loading = false;
  error: string | null = null;

  sources = ['agent', 'inference', 'contextdiscovery'];

  // Root Cause Modal
  showRootCauseModal = false;
  rootCauseLog: AuditLog | null = null;
  expectedResult = '';
  problemArea = '';

  // Inference Tree Modal
  showInferenceModal = false;
  loadingInference = false;
  inferenceError: string | null = null;
  inferenceTreeData: any = null;
  inferenceExpanded = true;
  currentRequestId = '';
  currentAgentCode = '';
  currentSourceFilter = '';
  selectedInferenceLog: any = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastr: ToastrService
  ) {
    this.filterForm = this.fb.group({
      startDateTime: ['', Validators.required],
      endDateTime: ['', Validators.required],
      source: ['']
    });
  }

  ngOnInit() {
    // Set default dates: start = today's date at 00:00, end = now
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    this.filterForm.patchValue({
      startDateTime: this.formatDateTimeLocal(todayStart),
      endDateTime: this.formatDateTimeLocal(now)
    });
  }

  formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onFetchLogs() {
    if (this.filterForm.invalid) {
      this.toastr.error('Start and End Date & Time are required');
      return;
    }

    const { startDateTime, endDateTime, source } = this.filterForm.value;

    // Convert to ISO format
    const startISO = new Date(startDateTime).toISOString();
    const endISO = new Date(endDateTime).toISOString();

    // Validate date range: reject start > end and also reject exact equality (same datetime)
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      this.toastr.error('Invalid start or end datetime');
      return;
    }

    if (start.getTime() > end.getTime()) {
      this.toastr.error('Start date must be before end date');
      return;
    }

    if (start.getTime() === end.getTime()) {
      this.toastr.error('Start and end date/time cannot be the same');
      return;
    }

    this.loading = true;
    this.error = null;
    this.logs = [];
    this.expandedLogs.clear();

    const params: any = {
      start_time: startISO,
      end_time: endISO
    };

    if (source) {
      params.source = source;
    }

    this.apiService.get('/logs-by-datetime-source', params).subscribe({
      next: (data: any) => {
        this.loading = false;
        
        if (!Array.isArray(data)) {
          this.toastr.error('Invalid response format');
          return;
        }

        if (data.length === 0) {
          this.toastr.info('No inference logs found for the specified criteria');
          this.logs = [];
          return;
        }

        // Sort by createdOn descending (newest first)
        this.logs = data.sort((a: AuditLog, b: AuditLog) => {
          const dateA = new Date(a.createdOn || 0).getTime();
          const dateB = new Date(b.createdOn || 0).getTime();
          return dateB - dateA;
        });

        this.toastr.success(`Found ${this.logs.length} inference log(s)`);
      },
      error: (err) => {
        this.loading = false;
        this.error = `Failed to fetch inference logs: ${err.message}`;
        this.toastr.error(this.error);
      }
    });
  }

  toggleLogExpansion(logId: string) {
    if (this.expandedLogs.has(logId)) {
      this.expandedLogs.delete(logId);
    } else {
      this.expandedLogs.add(logId);
    }
  }

  isLogExpanded(logId: string): boolean {
    return this.expandedLogs.has(logId);
  }

  formatJson(value: any): string {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value || 'N/A');
  }

  getSourceBadgeClass(source: string): string {
    const sourceMap: any = {
      'agent': 'badge-primary',
      'inference': 'badge-success',
      'contextdiscovery': 'badge-info'
    };
    return sourceMap[source] || 'badge-secondary';
  }

  // Root Cause Modal Methods
  openRootCauseModal(log: AuditLog): void {
    this.rootCauseLog = log;
    this.expectedResult = '';
    this.problemArea = '';
    this.showRootCauseModal = true;
  }

  closeRootCauseModal(): void {
    this.showRootCauseModal = false;
    this.rootCauseLog = null;
  }

  submitRootCause(): void {
    if (!this.expectedResult.trim() || !this.problemArea.trim()) {
      this.toastr.warning('Please fill in both fields');
      return;
    }

    console.log('Root Cause Analysis Submitted:', {
      logId: this.rootCauseLog?.id,
      logContent: this.rootCauseLog,
      expectedResult: this.expectedResult,
      problemArea: this.problemArea,
      timestamp: new Date().toISOString()
    });

    this.toastr.success('✅ Root Cause analysis submitted successfully!');
    this.closeRootCauseModal();
  }

  // Inference Tree Modal Methods
  openInferenceModal(log: AuditLog): void {
    this.currentRequestId = log.requestId;
    this.currentSourceFilter = log.source;
    this.currentAgentCode = this.extractAgentCodeFromLog(log);
    
    this.showInferenceModal = true;
    this.loadingInference = true;
    this.inferenceError = null;
    this.selectedInferenceLog = null;

    console.log(`Opening inference modal for requestId=${this.currentRequestId}, agentCode=${this.currentAgentCode}`);

    this.fetchInferenceLogsByRequestIdAndAgentCode(log);
  }

  closeInferenceModal(): void {
    this.showInferenceModal = false;
    this.inferenceTreeData = null;
    this.selectedInferenceLog = null;
    this.currentRequestId = '';
    this.currentAgentCode = '';
    this.currentSourceFilter = '';
  }

  extractAgentCodeFromLog(log: AuditLog): string {
    if (!log || !log.content) {
      return 'N/A';
    }

    // If content is an array (iterations)
    if (Array.isArray(log.content) && log.content.length > 0) {
      const firstItem = log.content[0];
      if (firstItem && firstItem.agent_code) {
        return firstItem.agent_code;
      }
    }

    // If content is an object with agent_code
    if (typeof log.content === 'object' && (log.content as any).agent_code) {
      return (log.content as any).agent_code;
    }

    return 'N/A';
  }

  fetchInferenceLogsByRequestIdAndAgentCode(agentLog: AuditLog): void {
    if (!this.currentRequestId || !this.currentAgentCode || this.currentAgentCode === 'N/A') {
      this.loadingInference = false;
      this.inferenceError = 'Cannot fetch inference logs: Missing requestId or agentCode';
      return;
    }

    // Create a time range around the agent log (±12 hours)
    const agentTime = new Date(agentLog.createdOn);
    const startTime = new Date(agentTime.getTime() - 12 * 60 * 60 * 1000);
    const endTime = new Date(agentTime.getTime() + 12 * 60 * 60 * 1000);

    const params: any = {
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      source: 'inference'
    };

    this.apiService.get('/logs-by-datetime-source', params).subscribe(
      (data: any) => {
        this.loadingInference = false;

        if (!Array.isArray(data)) {
          this.inferenceError = 'Invalid response format';
          return;
        }

        // Filter by requestId and agentCode
        const filteredInferences = data.filter((log: any) => {
          if (log.requestId !== this.currentRequestId) {
            return false;
          }

          // Check if log contains matching agent_code
          const logAgentCode = this.extractAgentCodeFromLog(log);
          return logAgentCode === this.currentAgentCode;
        });

        // Build tree structure
        this.inferenceTreeData = {
          agent: agentLog,
          agentCode: this.currentAgentCode,
          inference: filteredInferences.sort((a: any, b: any) => {
            const dateA = new Date(a.createdOn || 0).getTime();
            const dateB = new Date(b.createdOn || 0).getTime();
            return dateA - dateB;
          })
        };

        if (filteredInferences.length === 0) {
          this.toastr.info('No inference logs found for this agent execution');
        } else {
          this.toastr.success(`Found ${filteredInferences.length} inference log(s)`);
        }
      },
      (err: any) => {
        this.loadingInference = false;
        this.inferenceError = `Failed to fetch inference logs: ${err.message}`;
        this.toastr.error(this.inferenceError!);
      }
    );
  }

  toggleInferenceExpansion(): void {
    this.inferenceExpanded = !this.inferenceExpanded;
  }

  selectInferenceLog(log: any): void {
    this.selectedInferenceLog = log;
  }

  closeDetailPanel(): void {
    this.selectedInferenceLog = null;
  }

  formatLogContent(log: any): string {
    if (Array.isArray(log.content)) {
      return log.content.map((item: any, index: number) => {
        return `Iteration ${item.iteration || index + 1}:\n` +
               `Request: ${item.request || 'N/A'}\n` +
               `Response: ${item.response || 'N/A'}\n` +
               `Refinement: ${item.refinement || 'N/A'}\n` +
               `Model: ${item.model || 'N/A'}\n` +
               `Cost: ${item.cost || 'N/A'}\n` +
               `Agent Code: ${item.agent_code || 'N/A'}\n` +
               `Token Count: ${item.token_count || 'N/A'}\n` +
               `AI Call Time: ${item.ai_call_time || 'N/A'}\n` +
               `Iteration Time: ${item.iteration_time || 'N/A'}`;
      }).join('\n' + '='.repeat(60) + '\n\n');
    } else if (typeof log.content === 'object') {
      return JSON.stringify(log.content, null, 2);
    } else {
      return String(log.content || 'N/A');
    }
  }
}
