import { Component, OnInit } from '@angular/core';
import { SessionService, Session, SessionSearchRequest } from '../../core/services/session.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-session-list',
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.scss']
})
export class SessionListComponent implements OnInit {
  sessions: Session[] = [];
  loading: boolean = false;
  
  // Search filters
  startDate: string = '';
  endDate: string = '';
  hasFeedback: boolean = false;

  // Expanded states
  expandedMessageId: string | null = null;

  constructor(
    private sessionService: SessionService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Don't load mock data on init - wait for user to search
  }

  onSearch(): void {
    if (!this.startDate || !this.endDate) {
      this.toastr.warning('⚠️ Please select both start and end dates', 'Validation Error');
      return;
    }

    this.loading = true;
    const queryParams: Record<string, any> = {
      start_date: this.startDate,
      end_date: this.endDate
    };

    if (this.hasFeedback) {
      queryParams['has_feedback'] = true;
    }

    console.log('🔍 Searching sessions with params:', queryParams);

    this.sessionService.getSessions(queryParams).subscribe({
      next: (response: any) => {
        console.log('✅ API Response:', response);
        
        // Handle different response structures
        let sessions: Session[] = [];
        let total = 0;
        
        if (Array.isArray(response)) {
          sessions = response;
          total = response.length;
        } else if (response.sessions) {
          sessions = response.sessions;
          total = response.total || response.count || sessions.length;
        } else if (response.results) {
          sessions = response.results;
          total = response.total || sessions.length;
        }
        
        console.log('📊 Total sessions:', total);
        console.log('📋 Sessions data:', sessions);
        
        this.sessions = sessions.map(s => ({ ...s, expanded: false }));
        this.loading = false;
        
        if (sessions.length > 0) {
          this.toastr.success(`✅ Found ${sessions.length} session${sessions.length > 1 ? 's' : ''}`, 'Success');
        } else {
          this.toastr.info('ℹ️ No sessions found for the selected criteria', 'No Results');
        }
      },
      error: (error) => {
        console.error('❌ Error searching sessions:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error details:', error.error);
        
        const errorMsg = error.error?.message || error.message || 'Failed to search sessions';
        this.toastr.error(`❌ ${errorMsg}`, 'Error');
        this.loading = false;
        this.sessions = [];
      }
    });
  }

  toggleSession(session: Session): void {
    session.expanded = !session.expanded;
  }

  toggleMessage(messageId: string): void {
    this.expandedMessageId = this.expandedMessageId === messageId ? null : messageId;
  }

  isMessageExpanded(messageId: string): boolean {
    return this.expandedMessageId === messageId;
  }

  saveMemory(session: Session): void {
    if (confirm(`Save session "${session.session_id}" as memory?`)) {
      this.sessionService.saveSessionMemory(session.session_id).subscribe({
        next: () => {
          this.toastr.success('Session saved to memory successfully', 'Success');
        },
        error: (error) => {
          console.error('Error saving memory:', error);
          this.toastr.error('Failed to save session to memory', 'Error');
        }
      });
    }
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.toastr.success('Copied to clipboard', 'Success');
    }).catch(() => {
      this.toastr.error('Failed to copy', 'Error');
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  truncateText(text: string, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
}
