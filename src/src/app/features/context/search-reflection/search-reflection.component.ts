import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ContextService, FeedbackContext } from '../../../core/services/context.service';

@Component({
  selector: 'app-search-reflection',
  templateUrl: './search-reflection.component.html',
  styleUrls: ['./search-reflection.component.scss']
})
export class SearchReflectionComponent implements OnInit {
  searchForm!: FormGroup;
  reflections: FeedbackContext[] = [];
  loading: boolean = false;
  selectedFeedbackType: 'good' | 'bad' = 'good';

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private contextService: ContextService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.searchForm = this.fb.group({
      agentCode: ['']
    });
  }

  selectFeedbackType(type: 'good' | 'bad'): void {
    this.selectedFeedbackType = type;
  }

  search(): void {
    const agentCode = this.searchForm.value.agentCode?.trim();
    
    if (!agentCode) {
      this.toastr.warning('Please enter an agent code', 'Warning');
      return;
    }

    this.loading = true;
    console.log('Searching reflections with:', { agentCode, feedbackType: this.selectedFeedbackType });

    this.contextService.searchFeedback(agentCode, this.selectedFeedbackType).subscribe({
      next: (data: FeedbackContext[]) => {
        console.log('Search reflection response:', data);
        this.reflections = data;
        this.loading = false;
        this.toastr.success(`Found ${data.length} reflection context(s)`, 'Success');
      },
      error: (error) => {
        console.error('Search reflection error:', error);
        this.loading = false;
        this.toastr.error('Failed to search reflections', 'Error');
        this.reflections = [];
      }
    });
  }

  reset(): void {
    this.searchForm.reset();
    this.reflections = [];
  }
}
