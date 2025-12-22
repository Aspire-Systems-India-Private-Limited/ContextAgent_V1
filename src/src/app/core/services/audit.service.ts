import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface AuditLog {
  id: string;
  content: string;
  createdOn: string;
  modifiedOn: string;
  source?: string;
  session_id?: string;
  user_id?: string;
  request_id?: string;
}

export interface AuditSearchParams {
  date?: string;
  minutes?: number;
  start?: string;
  end?: string;
  source?: string;
  session_id?: string;
  request_id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  constructor(private apiService: ApiService) {}

  // Filter by specific date
  getAuditByDate(date: string): Observable<AuditLog[]> {
    return this.apiService.get<AuditLog[]>(`/audit?date=${date}`);
  }

  // Filter by last N minutes
  getAuditByMinutes(minutes: number): Observable<AuditLog[]> {
    return this.apiService.get<AuditLog[]>(`/audit?minutes=${minutes}`);
  }

  // Filter by datetime range with optional source
  getAuditByDateTimeRange(params: AuditSearchParams): Observable<AuditLog[]> {
    const queryParams = new URLSearchParams();
    if (params.start) queryParams.append('start', params.start);
    if (params.end) queryParams.append('end', params.end);
    if (params.source) queryParams.append('source', params.source);
    
    return this.apiService.get<AuditLog[]>(`/audit/datetime-range?${queryParams.toString()}`);
  }

  // Filter by session ID
  getAuditBySessionId(sessionId: string): Observable<AuditLog[]> {
    return this.apiService.get<AuditLog[]>(`/audit/session/${sessionId}`);
  }

  // Filter by request ID
  getAuditByRequestId(requestId: string): Observable<AuditLog[]> {
    return this.apiService.get<AuditLog[]>(`/audit/request/${requestId}`);
  }

  // Export logs
  exportLogs(logs: AuditLog[], format: 'csv' | 'json'): void {
    if (format === 'json') {
      this.downloadJSON(logs);
    } else {
      this.downloadCSV(logs);
    }
  }

  private downloadJSON(logs: AuditLog[]): void {
    const dataStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    this.downloadBlob(blob, `audit-logs-${Date.now()}.json`);
  }

  private downloadCSV(logs: AuditLog[]): void {
    const headers = ['ID', 'Content', 'Created On', 'Modified On', 'Source', 'Session ID', 'User ID', 'Request ID'];
    const rows = logs.map(log => [
      log.id,
      `"${log.content.replace(/"/g, '""')}"`,
      log.createdOn,
      log.modifiedOn,
      log.source || '',
      log.session_id || '',
      log.user_id || '',
      log.request_id || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    this.downloadBlob(blob, `audit-logs-${Date.now()}.csv`);
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
