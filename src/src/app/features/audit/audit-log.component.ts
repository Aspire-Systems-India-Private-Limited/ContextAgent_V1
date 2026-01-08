import { Component, OnInit } from '@angular/core';
import { AuditService, AuditLog, AuditSearchParams } from '../../core/services/audit.service';
import { ToastrService } from 'ngx-toastr';

type FilterMode = 'datetime-range';

interface InferenceTreeData {
  agent: any;
  agentCode: string;
  inference: any[];
  source: string;
}

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.scss']
})
export class AuditLogComponent implements OnInit {
  auditLogs: AuditLog[] = [];
  logs: any[] = [];
  loading: boolean = false;
  filterMode: FilterMode = 'datetime-range';
  expandedLogId: string | null = null;
  searchPerformed: boolean = false;

  // Filter inputs - datetime range only
  startDateTime: string = '';
  endDateTime: string = '';
  sourceFilter: string = '';

  // Root Cause Modal
  showRootCauseModal: boolean = false;
  rootCauseLog: any = null;
  expectedResult: string = '';
  problemArea: string = '';

  // Inference Tree Modal
  showInferenceModal: boolean = false;
  inferenceTreeData: InferenceTreeData | null = null;
  expandedInferenceNodes: Set<string> = new Set();
  currentRequestId: string = '';
  currentAgentCode: string = '';
  selectedInferenceLog: any = null;

  constructor(
    private auditService: AuditService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeDateTimes();
  }

  // Initialize with current time and 1 hour ago
  initializeDateTimes(): void {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    this.startDateTime = this.formatDateTimeLocal(oneHourAgo);
    this.endDateTime = this.formatDateTimeLocal(now);
  }

  formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  clearFilters(): void {
    this.initializeDateTimes();
    this.sourceFilter = '';
    this.auditLogs = [];
  }

  onSearch(): void {
    this.loading = true;
    this.searchByDateTimeRange();
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
        this.logs = logs;
        this.searchPerformed = true;
        this.loading = false;
        this.toastr.success(`Found ${logs.length} audit logs`, 'Success');
      },
      error: (error) => {
        console.error('Error fetching audit logs:', error);
        this.toastr.error('Failed to fetch audit logs', 'Error');
        this.loading = false;
      }
    });
  }

  // Root Cause Modal Methods
  openRootCauseModal(log: any): void {
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
      this.toastr.warning('Please fill in both fields', 'Validation');
      return;
    }

    console.log('Root Cause Analysis Submitted:', {
      logId: this.rootCauseLog?.id,
      logContent: this.rootCauseLog,
      expectedResult: this.expectedResult,
      problemArea: this.problemArea,
      timestamp: new Date().toISOString()
    });

    this.toastr.success('Root Cause analysis submitted successfully!', 'Success');
    this.closeRootCauseModal();
  }

  // Inference Tree Modal Methods
  openInferenceModal(log: any): void {
    this.currentRequestId = log.requestId || log.request_id || '';
    this.currentAgentCode = this.extractAgentCodeFromLog(log);
    
    console.log(`Opening inference modal for requestId=${this.currentRequestId}, agentCode=${this.currentAgentCode}`);
    
    this.showInferenceModal = true;
    this.loading = true;
    
    // Calculate time range (±12 hours from the log's creation time)
    const baseTime = new Date(log.createdOn);
    const startTime = new Date(baseTime.getTime() - 12 * 60 * 60 * 1000).toISOString();
    const endTime = new Date(baseTime.getTime() + 12 * 60 * 60 * 1000).toISOString();
    
    this.fetchInferenceLogsByRequestIdAndAgentCode(this.currentRequestId, this.currentAgentCode, startTime, endTime, log);
  }

  closeInferenceModal(): void {
    this.showInferenceModal = false;
    this.inferenceTreeData = null;
    this.expandedInferenceNodes.clear();
    this.selectedInferenceLog = null;
  }

  extractAgentCodeFromLog(log: any): string {
    if (!log || !log.content) return '';
    
    if (Array.isArray(log.content)) {
      if (log.content.length > 0 && log.content[0].agent_code) {
        return log.content[0].agent_code;
      }
      
      for (let i = 0; i < log.content.length; i++) {
        if (log.content[i].agent_code) {
          return log.content[i].agent_code;
        }
      }
    }
    
    if (typeof log.content === 'object' && log.content.agent_code) {
      return log.content.agent_code;
    }
    
    if (typeof log.content === 'string') {
      try {
        const parsed = JSON.parse(log.content);
        if (parsed.agent_code) return parsed.agent_code;
      } catch (e) {}
    }
    
    return '';
  }

  async fetchInferenceLogsByRequestIdAndAgentCode(requestId: string, agentCode: string, startTime: string, endTime: string, agentLog: any): Promise<void> {
    try {
      const start = encodeURIComponent(startTime);
      const end = encodeURIComponent(endTime);
      
      const inferenceUrl = `/logs-by-datetime-source?start_time=${start}&end_time=${endTime}&source=inference`;
      
      // Call through audit service
      const params: AuditSearchParams = {
        start: startTime,
        end: endTime,
        source: 'inference'
      };
      
      this.auditService.getAuditByDateTimeRange(params).subscribe({
        next: (inferenceLogs: any[]) => {
          console.log(`Total inference logs fetched: ${inferenceLogs.length}`);
          console.log(`Filtering for requestId: ${requestId}, agentCode: ${agentCode}`);
          
          const filteredInference = inferenceLogs.filter(log => {
            const logRequestId = log.requestId || log.request_id || '';
            const logAgentCode = this.extractAgentCodeFromLog(log);
            return logRequestId === requestId && logAgentCode === agentCode;
          });
          
          console.log(`Filtered inferences: Found ${filteredInference.length} logs`);
          
          this.buildInferenceTree({ inference: filteredInference }, agentLog);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching inference logs:', error);
          this.toastr.error('Failed to fetch inference logs', 'Error');
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Error fetching inference logs:', error);
      this.loading = false;
    }
  }

  buildInferenceTree(logs: any, agentLog: any): void {
    this.inferenceTreeData = {
      agent: agentLog,
      agentCode: this.currentAgentCode,
      source: agentLog.source || 'agent',
      inference: logs.inference.map((log: any) => ({
        ...log,
        parsedContent: this.tryParseJSON(log.content),
        agentCode: this.extractAgentCodeFromLog(log)
      }))
    };
    
    // Sort inference logs by timestamp
    if (this.inferenceTreeData) {
      this.inferenceTreeData.inference.sort((a, b) => 
        new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime()
      );
    }
  }

  tryParseJSON(str: any): any {
    if (typeof str !== 'string') return str;
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  }

  toggleInferenceNode(nodeId: string): void {
    if (this.expandedInferenceNodes.has(nodeId)) {
      this.expandedInferenceNodes.delete(nodeId);
    } else {
      this.expandedInferenceNodes.add(nodeId);
    }
  }

  isNodeExpanded(nodeId: string): boolean {
    return this.expandedInferenceNodes.has(nodeId);
  }

  selectInferenceLog(log: any, type: string = 'inference'): void {
    this.selectedInferenceLog = { ...log, type };
  }

  private searchByMinutes(): void {
    // Removed - not needed
  }

  private searchBySessionId(): void {
    // Removed - not needed
  }

  private searchByRequestId(): void {
    // Removed - not needed
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
    return 'Filter by DateTime Range';
  }

  formatLogContent(log: any): string {
    if (Array.isArray(log.content)) {
      return log.content.map((item: any, idx: number) => {
        let text = `\n=== Iteration ${idx + 1} ===\n`;
        if (typeof item === 'object') {
          for (const [key, value] of Object.entries(item)) {
            text += `${key}: ${JSON.stringify(value, null, 2)}\n`;
          }
        } else {
          text += JSON.stringify(item, null, 2);
        }
        return text;
      }).join('\n' + '='.repeat(60) + '\n\n');
    } else if (typeof log.parsedContent === 'object') {
      return JSON.stringify(log.parsedContent, null, 2);
    } else {
      return JSON.stringify(log.content, null, 2);
    }
  }

  // Helper methods for template
  isObject(value: any): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  formatValue(value: any): string {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }

  // For template access
  Array = Array;
}