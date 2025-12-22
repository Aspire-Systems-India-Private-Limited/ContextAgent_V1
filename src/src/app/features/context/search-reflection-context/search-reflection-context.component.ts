import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ContextService, FeedbackContext } from '../../../core/services/context.service';
import { AgentService, Agent } from '../../../core/services/agent.service';

@Component({
  selector: 'app-search-reflection-context',
  templateUrl: './search-reflection-context.component.html',
  styleUrls: ['./search-reflection-context.component.scss']
})
export class SearchReflectionContextComponent implements OnInit {
  searchForm!: FormGroup;
  reflections: FeedbackContext[] = [];
  loading: boolean = false;
  selectedFeedbackType: 'good' | 'bad' = 'good';
  expandedContent: { [key: string]: boolean } = {};
  
  // Agent List
  agents: Agent[] = [];
  agentCodes: string[] = [];
  loadingAgents: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private contextService: ContextService,
    private agentService: AgentService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAgents();
  }

  initForm(): void {
    this.searchForm = this.fb.group({
      agentCode: ['']
    });
  }

  /**
   * Load all available agents to populate dropdown
   */
  loadAgents(): void {
    this.loadingAgents = true;
    this.agentService.getAllAgents().subscribe({
      next: (agents: Agent[]) => {
        this.agents = agents;
        // Extract agent codes for dropdown
        this.agentCodes = agents
          .map(agent => agent.agentCode || agent.code)
          .filter((code): code is string => !!code)
          .sort();
        this.loadingAgents = false;
        console.log('Loaded agents:', this.agentCodes);
      },
      error: (error) => {
        console.error('Error loading agents:', error);
        this.loadingAgents = false;
        this.toastr.error('Failed to load agents', 'Error');
        this.agentCodes = [];
      }
    });
  }

  selectFeedbackType(type: 'good' | 'bad'): void {
    this.selectedFeedbackType = type;
  }

  search(): void {
    const agentCode = this.searchForm.value.agentCode?.trim();
    
    if (!agentCode) {
      this.toastr.warning('⚠️ Please enter an agent code', 'Warning');
      return;
    }

    this.loading = true;
    console.log('Searching reflections with:', { agentCode, feedbackType: this.selectedFeedbackType });

    this.contextService.searchFeedback(agentCode, this.selectedFeedbackType).subscribe({
      next: (data: FeedbackContext[]) => {
        console.log('Search reflection response:', data);
        // Sort by ModifiedOn descending
        this.reflections = data.sort((a, b) => 
          new Date(b.ModifiedOn || 0).getTime() - new Date(a.ModifiedOn || 0).getTime()
        );
        this.loading = false;
        const feedbackIcon = this.selectedFeedbackType === 'good' ? '👍' : '👎';
        this.toastr.success(`${feedbackIcon} Found ${data.length} reflection context(s)`, 'Success');
      },
      error: (error) => {
        console.error('Search reflection error:', error);
        const errorMessage = error.error?.detail || error.message || 'Failed to search reflections';
        this.loading = false;
        this.toastr.error(`❌ ${errorMessage}`, 'Error');
        this.reflections = [];
      }
    });
  }

  toggleContentExpand(id: string | undefined): void {
    if (!id) return;
    this.expandedContent[id] = !this.expandedContent[id];
  }

  updateFeedback(reflection: FeedbackContext): void {
    if (!reflection.id) {
      this.toastr.error('❌ Invalid reflection ID', 'Error');
      return;
    }

    console.log('Updating feedback:', reflection);
    
    this.contextService.updateFeedback(reflection.id, this.selectedFeedbackType, reflection).subscribe({
      next: () => {
        const feedbackIcon = this.selectedFeedbackType === 'good' ? '👍' : '👎';
        this.toastr.success(`${feedbackIcon} Feedback updated successfully`, 'Success');
        this.search(); // Refresh results
      },
      error: (error) => {
        console.error('Update feedback error:', error);
        const errorMessage = error.error?.detail || error.message || 'Failed to update feedback';
        this.toastr.error(`❌ ${errorMessage}`, 'Error');
      }
    });
  }

  deleteFeedback(reflection: FeedbackContext): void {
    if (!reflection.id) {
      this.toastr.error('❌ Invalid reflection ID', 'Error');
      return;
    }

    if (!confirm('Are you sure you want to delete this feedback context?')) {
      return;
    }

    console.log('Deleting feedback:', reflection.id);

    this.contextService.deleteFeedback(reflection.id, this.selectedFeedbackType).subscribe({
      next: () => {
        this.toastr.success('✅ Feedback deleted successfully', 'Success');
        this.search(); // Refresh results
      },
      error: (error) => {
        console.error('Delete feedback error:', error);
        this.toastr.error('❌ Failed to delete feedback', 'Error');
      }
    });
  }

  reset(): void {
    this.searchForm.reset();
    this.reflections = [];
  }
}
