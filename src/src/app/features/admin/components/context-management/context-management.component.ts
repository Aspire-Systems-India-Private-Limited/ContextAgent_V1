import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ContextService, Context, FeedbackContext } from '../../../../core/services/context.service';
import { AgentService, Agent } from '../../../../core/services/agent.service';

@Component({
  selector: 'app-context-management',
  templateUrl: './context-management.component.html',
  styleUrls: ['./context-management.component.scss']
})
export class ContextManagementComponent implements OnInit {
  currentView: 'create' | 'search' | 'create-reflection' | 'search-reflection' = 'create';
  
  // Search Context
  searchForm!: FormGroup;
  contexts: Context[] = [];
  loading: boolean = false;
  updateContextVersion: boolean[] = [];
  
  // Create Reflection
  createReflectionForm!: FormGroup;
  createReflectionType: 'good' | 'bad' = 'good';
  
  // Search Reflection
  searchReflectionForm!: FormGroup;
  reflections: FeedbackContext[] = [];
  reflectionLoading: boolean = false;
  selectedFeedbackType: 'good' | 'bad' = 'good';
  expandedContents: boolean[] = [];
  
  // Agent List
  agents: Agent[] = [];
  agentCodes: string[] = [];
  loadingAgents: boolean = false;

  constructor(
    private fb: FormBuilder,
    private contextService: ContextService,
    private agentService: AgentService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadAgents();
  }

  initForms(): void {
    this.searchForm = this.fb.group({
      agentCode: ['', Validators.required],
      versionId: ['']
    });

    this.createReflectionForm = this.fb.group({
      agentCode: ['', Validators.required],
      intent: ['', Validators.required],
      reason: ['', Validators.required],
      content: ['', Validators.required],
      entities: this.fb.array([])
    });

    this.searchReflectionForm = this.fb.group({
      agentCode: ['', Validators.required],
      feedbackType: ['good']
    });
  }

  /**
   * Load all available agents to populate dropdowns
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
        // Set empty array as fallback
        this.agentCodes = [];
      }
    });
  }

  setView(view: 'create' | 'search' | 'create-reflection' | 'search-reflection'): void {
    this.currentView = view;
  }

  // Search Contexts
  searchContexts(): void {
    const agentCode = this.searchForm.get('agentCode')?.value?.trim();
    const versionId = this.searchForm.get('versionId')?.value?.trim();

    if (!agentCode) {
      this.toastr.warning('Agent Code is required', 'Warning');
      return;
    }

    this.loading = true;
    this.contextService.searchContexts(agentCode, versionId).subscribe({
      next: (data: Context[]) => {
        this.contexts = data;
        this.updateContextVersion = new Array(data.length).fill(false);
        this.loading = false;
        this.toastr.success(`Found ${data.length} context(s)`, 'Success');
      },
      error: (error) => {
        console.error('Search error:', error);
        this.loading = false;
        this.toastr.error('Failed to search contexts', 'Error');
        this.contexts = [];
      }
    });
  }

  toggleUpdateVersion(index: number): void {
    // Toggle is handled by [(ngModel)] binding
  }

  updateContextInline(index: number): void {
    const context = this.contexts[index];
    if (!context.id) {
      this.toastr.error('Cannot update context without ID', 'Error');
      return;
    }

    const contentElement = document.getElementById(`content-${index}`) as HTMLTextAreaElement;
    const versionElement = document.getElementById(`contextVersion-${index}`) as HTMLInputElement;
    
    if (!contentElement) {
      this.toastr.error('Cannot find content element', 'Error');
      return;
    }

    const updatedContext: Partial<Context> = {
      Content: contentElement.value,
      ContextVersion: versionElement?.value || context.ContextVersion
    };

    const shouldUpdateVersion = this.updateContextVersion[index];

    this.contextService.updateContext(context.id, updatedContext, shouldUpdateVersion).subscribe({
      next: () => {
        this.toastr.success('Context updated successfully', 'Success');
        this.searchContexts(); // Reload
      },
      error: (error) => {
        console.error('Update error:', error);
        this.toastr.error('Failed to update context', 'Error');
      }
    });
  }

  openTestModal(context: Context): void {
    this.toastr.info(`Test functionality for ${context.AgentCode} - Version ${context.VersionId}`, 'Info');
    // TODO: Implement test modal
  }

  openHistoryModal(promptCode: string): void {
    this.toastr.info(`History for ${promptCode}`, 'Info');
    // TODO: Implement history modal
  }

  // Search Reflections
  searchReflections(): void {
    const agentCode = this.searchReflectionForm.get('agentCode')?.value?.trim();
    const feedbackType = this.selectedFeedbackType; // Use the selectedFeedbackType property instead of form value

    if (!agentCode) {
      this.toastr.warning('Agent Code is required', 'Warning');
      return;
    }

    console.log('Searching reflections with:', { agentCode, feedbackType });
    console.log('API URL will be:', `/agent-code/${agentCode}/feedback-type/${feedbackType}/feedback-contexts`);

    this.reflectionLoading = true;
    this.contextService.searchFeedback(agentCode, feedbackType).subscribe({
      next: (data: FeedbackContext[]) => {
        console.log('Search reflection response:', data);
        this.reflections = data;
        this.expandedContents = new Array(data.length).fill(false);
        this.reflectionLoading = false;
        this.toastr.success(`Found ${data.length} reflection(s)`, 'Success');
      },
      error: (error) => {
        console.error('Search reflection error:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        this.reflectionLoading = false;
        this.toastr.error('Failed to search reflections', 'Error');
        this.reflections = [];
      }
    });
  }

  onEditContext(context: Context): void {
    // Navigate to edit or show edit modal
    this.toastr.info(`Edit functionality for ${context.PromptCode}`, 'Info');
  }

  onDeleteContext(context: Context): void {
    if (!context.id) {
      this.toastr.error('Cannot delete context without ID', 'Error');
      return;
    }

    this.contextService.deleteContext(context.id).subscribe({
      next: () => {
        this.toastr.success(`Context deleted successfully`, 'Success');
        this.searchContexts(); // Reload
      },
      error: (error) => {
        console.error('Delete error:', error);
        this.toastr.error('Failed to delete context', 'Error');
      }
    });
  }

  onViewContext(context: Context): void {
    this.toastr.info(`View details for ${context.PromptCode}`, 'Info');
  }

  selectFeedbackType(type: 'good' | 'bad'): void {
    this.selectedFeedbackType = type;
  }

  // Create Reflection Methods
  getReflectionEntities(): FormArray {
    return this.createReflectionForm.get('entities') as FormArray;
  }

  addReflectionEntity(): void {
    const entities = this.getReflectionEntities();
    entities.push(this.fb.group({
      Key: [''],
      Value: ['']
    }));
  }

  removeReflectionEntity(index: number): void {
    const entities = this.getReflectionEntities();
    entities.removeAt(index);
  }

  createReflection(): void {
    if (this.createReflectionForm.invalid) {
      this.toastr.warning('Please fill all required fields', 'Warning');
      Object.keys(this.createReflectionForm.controls).forEach(key => {
        const control = this.createReflectionForm.get(key);
        if (control && control.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.reflectionLoading = true;
    
    const formValue = this.createReflectionForm.value;
    
    // Filter out empty entities
    const filteredEntities = formValue.entities
      .filter((e: any) => e.Key && e.Value)
      .map((e: any) => ({ Key: e.Key.trim(), Value: e.Value.trim() }));
    
    // Generate UUID for the feedback context
    const feedbackId = this.generateUUID();
    
    const feedbackData: FeedbackContext = {
      id: feedbackId,
      AgentCode: formValue.agentCode.trim(),
      Intent: formValue.intent.trim(),
      Reason: formValue.reason.trim(),
      Content: formValue.content.trim(),
      Entity: filteredEntities.length > 0 ? filteredEntities : undefined,
      CreatedBy: 'admin',
      ModifiedBy: 'admin'
    };

    console.log('Creating reflection context:', feedbackData);
    console.log('Feedback type:', this.createReflectionType);

    const createMethod = this.createReflectionType === 'good' 
      ? this.contextService.createGoodFeedback(feedbackData)
      : this.contextService.createBadFeedback(feedbackData);

    createMethod.subscribe({
      next: (response) => {
        console.log('Reflection created successfully:', response);
        const feedbackIcon = this.createReflectionType === 'good' ? '👍' : '👎';
        this.toastr.success(
          `${feedbackIcon} ${this.createReflectionType === 'good' ? 'Good' : 'Bad'} reflection context created successfully`, 
          'Success'
        );
        this.createReflectionForm.reset();
        this.getReflectionEntities().clear();
        this.createReflectionType = 'good';
        this.reflectionLoading = false;
      },
      error: (error) => {
        console.error('Create reflection error:', error);
        const errorMessage = error.error?.detail || error.message || 'Failed to create reflection context';
        this.toastr.error(`❌ ${errorMessage}`, 'Error');
        this.reflectionLoading = false;
      }
    });
  }

  /**
   * Generate a UUID v4
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Toggle content expand/collapse
  toggleContentExpand(index: number): void {
    this.expandedContents[index] = !this.expandedContents[index];
  }

  // Update reflection
  updateReflection(reflection: FeedbackContext): void {
    if (!reflection.id) {
      this.toastr.error('Cannot update reflection without ID', 'Error');
      return;
    }

    this.reflectionLoading = true;
    const feedbackType = this.selectedFeedbackType;

    this.contextService.updateFeedback(reflection.id, feedbackType, reflection).subscribe({
      next: () => {
        this.toastr.success('Reflection updated successfully', 'Success');
        this.reflectionLoading = false;
      },
      error: (error) => {
        console.error('Update reflection error:', error);
        this.toastr.error('Failed to update reflection', 'Error');
        this.reflectionLoading = false;
      }
    });
  }

  // Delete reflection
  deleteReflection(reflection: FeedbackContext): void {
    if (!reflection.id) {
      this.toastr.error('Cannot delete reflection without ID', 'Error');
      return;
    }

    if (!confirm(`Are you sure you want to delete this ${this.selectedFeedbackType} feedback context?`)) {
      return;
    }

    this.reflectionLoading = true;
    const feedbackType = this.selectedFeedbackType;

    this.contextService.deleteFeedback(reflection.id, feedbackType).subscribe({
      next: () => {
        this.toastr.success('Reflection deleted successfully', 'Success');
        this.searchReflections(); // Reload
      },
      error: (error) => {
        console.error('Delete reflection error:', error);
        this.toastr.error('Failed to delete reflection', 'Error');
        this.reflectionLoading = false;
      }
    });
  }
}