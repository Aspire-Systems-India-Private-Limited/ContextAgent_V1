import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ContextService } from '../../../core/services/context.service';
import { AgentService, Agent } from '../../../core/services/agent.service';

@Component({
  selector: 'app-create-reflection-context',
  templateUrl: './create-reflection-context.component.html',
  styleUrls: ['./create-reflection-context.component.scss']
})
export class CreateReflectionContextComponent implements OnInit {
  reflectionForm!: FormGroup;
  saving: boolean = false;
  feedbackType: string = 'good'; // Default to 'good'
  
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

  selectFeedbackType(type: string): void {
    this.feedbackType = type;
    this.reflectionForm.patchValue({ intent: type });
  }

  initForm(): void {
    this.reflectionForm = this.fb.group({
      agentCode: ['', Validators.required],
      intent: ['', Validators.required],
      reason: [''],
      filters: this.fb.array([]),
      content: ['', Validators.required]
    });
    
    // Add initial filter row
    this.addFilter();
  }

  get filters(): FormArray {
    return this.reflectionForm.get('filters') as FormArray;
  }

  addFilter(): void {
    const filterGroup = this.fb.group({
      key: [''],
      value: ['']
    });
    this.filters.push(filterGroup);
  }

  removeFilter(index: number): void {
    if (this.filters.length > 1) {
      this.filters.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.reflectionForm.invalid) {
      Object.keys(this.reflectionForm.controls).forEach(key => {
        this.reflectionForm.get(key)?.markAsTouched();
      });
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      return;
    }

    this.saving = true;

    // Convert filters array to object, filtering out empty entries
    const filtersArray = this.filters.value.filter((item: any) => item.key && item.value);
    const entityArray = filtersArray.map((item: any) => ({
      Key: item.key.trim(),
      Value: item.value.trim()
    }));

    // Generate UUID for the feedback context
    const feedbackId = this.generateUUID();

    const reflectionData = {
      id: feedbackId,
      AgentCode: this.reflectionForm.value.agentCode.trim(),
      Intent: this.reflectionForm.value.intent.trim(),
      Reason: this.reflectionForm.value.reason?.trim() || '',
      Entity: entityArray.length > 0 ? entityArray : undefined,
      Content: this.reflectionForm.value.content.trim(),
      CreatedBy: 'admin',
      ModifiedBy: 'admin'
    };

    console.log('Creating reflection context:', reflectionData);
    console.log('Feedback type:', this.feedbackType);

    const createMethod = this.feedbackType === 'good'
      ? this.contextService.createGoodFeedback(reflectionData)
      : this.contextService.createBadFeedback(reflectionData);

    createMethod.subscribe({
      next: (response) => {
        console.log('Reflection created successfully:', response);
        const feedbackIcon = this.feedbackType === 'good' ? '👍' : '👎';
        this.toastr.success(
          `${feedbackIcon} ${this.feedbackType === 'good' ? 'Good' : 'Bad'} reflection context created successfully`,
          'Success'
        );
        this.resetForm();
        this.saving = false;
      },
      error: (error) => {
        console.error('Create reflection error:', error);
        const errorMessage = error.error?.detail || error.message || 'Failed to create reflection context';
        this.toastr.error(`❌ ${errorMessage}`, 'Error');
        this.saving = false;
      }
    });
  }

  resetForm(): void {
    this.reflectionForm.reset();
    this.filters.clear();
    this.addFilter();
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
}
