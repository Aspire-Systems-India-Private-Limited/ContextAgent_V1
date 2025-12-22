import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';

interface InferenceLog {
  id: string;
  source: string;
  sessionId: string;
  userId: string;
  requestId: string;
  createdOn: string;
  modifiedOn: string;
  content: any[];
}

@Component({
  selector: 'app-diagnosis',
  templateUrl: './diagnosis.component.html',
  styleUrls: ['./diagnosis.component.scss']
})
export class DiagnosisComponent implements OnInit {
  startDateTime: string = '';
  endDateTime: string = '';
  selectedSource: string = '';
  
  inferenceLogs: InferenceLog[] = [];
  showResults: boolean = false;
  loading: boolean = false;

  sources: string[] = ['agent', 'inference', 'contextdiscovery'];

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    console.log('📋 Diagnosis (Inference Logs) component initialized');
  }

  onSubmit(): void {
    if (!this.startDateTime || !this.endDateTime) {
      this.toastr.warning('Please select both start and end date/time', 'Validation Error');
      return;
    }

    // Validate date range
    if (new Date(this.startDateTime) >= new Date(this.endDateTime)) {
      this.toastr.warning('Start date/time must be before end date/time', 'Validation Error');
      return;
    }

    this.loading = true;
    this.showResults = true;

    console.log('🔍 Fetching inference logs...');
    console.log('Start DateTime:', this.startDateTime);
    console.log('End DateTime:', this.endDateTime);
    console.log('Source:', this.selectedSource);

    // Convert to ISO format for API
    const startISO = new Date(this.startDateTime).toISOString();
    const endISO = new Date(this.endDateTime).toISOString();

    console.log('Start Time (ISO):', startISO);
    console.log('End Time (ISO):', endISO);

    // Build query parameters
    const params: Record<string, string> = {
      start_time: startISO,
      end_time: endISO
    };

    if (this.selectedSource) {
      params['source'] = this.selectedSource;
    }

    console.log('� API params:', params);

    this.apiService.get<InferenceLog[]>('/logs-by-datetime-source', params).subscribe({
      next: (data: InferenceLog[]) => {
        console.log('✅ Fetched inference logs:', data);
        console.log('📊 Total records:', data.length);
        
        // Sort by createdOn in descending order (newest first)
        this.inferenceLogs = data.sort((a, b) => {
          const dateA = new Date(a.createdOn || 0).getTime();
          const dateB = new Date(b.createdOn || 0).getTime();
          return dateB - dateA;
        });

        this.loading = false;
        
        if (this.inferenceLogs.length > 0) {
          this.toastr.success(`Found ${this.inferenceLogs.length} inference logs`, 'Success');
        } else {
          this.toastr.info('No inference logs found for the specified criteria', 'Info');
        }
      },
      error: (error) => {
        console.error('❌ Error fetching inference logs:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        this.toastr.error('Failed to fetch inference logs. Check console for details.', 'Error');
        this.loading = false;
        this.inferenceLogs = [];
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }

  formatContent(content: any): string {
    if (!content) return 'N/A';
    try {
      return JSON.stringify(content, null, 2);
    } catch {
      return String(content);
    }
  }
}
