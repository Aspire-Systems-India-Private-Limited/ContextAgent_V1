import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ContextService, Context, AIGenerateRequest } from '../../../../core/services/context.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-context-form',
  templateUrl: './context-form.component.html',
  styleUrls: ['./context-form.component.scss']
})
export class ContextFormComponent implements OnInit {
  contextForm: FormGroup;
  loading: boolean = false;
  isEditMode: boolean = false;
  contextId?: string;
  showAIHelper: boolean = false;
  aiGenerating: boolean = false;

  // AI Helper form
  aiIntent: string = '';
  aiTask: string = '';
  aiContextType: string = '';
  aiAdditionalInfo: string = '';

  contextTypes: string[] = [
    'taskcontext',
    'domaincontext',
    'responsecontext',
    'parentcontext',
    'pastinteraction'
  ];

  @Input() agentCode: string = '';
  @Output() contextSaved: EventEmitter<Context> = new EventEmitter<Context>();

  constructor(
    private fb: FormBuilder,
    private contextService: ContextService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.contextForm = this.fb.group({
      PromptCode: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9-_]+$/)]],
      ParentPromptCode: [''],
      AgentCode: ['', Validators.required],
      Type: ['', Validators.required],
      Intent: ['', Validators.required],
      VersionId: ['', Validators.required],
      ContextVersion: ['', Validators.required],
      Entity: this.fb.array([]),
      Content: ['', Validators.required],
      Default: [false],
      Latest: [false]
    });
  }

  ngOnInit(): void {
    this.contextId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.contextId) {
      this.isEditMode = true;
      this.loadContext();
    }
  }

  loadContext(): void {
    if (!this.contextId) return;

    this.loading = true;
    this.contextService.getContextById(this.contextId).subscribe({
      next: (context: Context) => {
        this.contextForm.patchValue({
          PromptCode: context.PromptCode,
          ParentPromptCode: context.ParentPromptCode,
          AgentCode: context.AgentCode,
          Type: context.Type,
          Intent: context.Intent,
          VersionId: context.VersionId,
          ContextVersion: context.ContextVersion,
          Content: context.Content,
          Default: context.Default || false,
          Latest: context.Latest || false
        });

        // Load Entity
        if (context.Entity && context.Entity.length > 0) {
          context.Entity.forEach(entity => this.addEntity(entity));
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading context:', error);
        this.toastr.error('Failed to load context', 'Error');
        this.loading = false;
        this.router.navigate(['/admin']);
      }
    });
  }

  get entityArray(): FormArray {
    return this.contextForm.get('Entity') as FormArray;
  }

  addEntity(value: any = { Key: '', Value: '' }): void {
    this.entityArray.push(this.fb.group({
      Key: [value.Key || '', Validators.required],
      Value: [value.Value || '', Validators.required]
    }));
  }

  removeEntity(index: number): void {
    this.entityArray.removeAt(index);
  }

  toggleAIHelper(): void {
    this.showAIHelper = !this.showAIHelper;
  }

  generateWithAI(): void {
    if (!this.aiIntent.trim() || !this.aiTask.trim() || !this.aiContextType) {
      this.toastr.warning('Please fill Intent, Task, and Context Type', 'Validation Error');
      return;
    }

    this.aiGenerating = true;
    const aiRequest: AIGenerateRequest = {
      intent: this.aiIntent,
      task: this.aiTask,
      contextType: this.aiContextType,
      additionalInfo: this.aiAdditionalInfo
    };

    this.contextService.aiGenerateContext(aiRequest).subscribe({
      next: (result) => {
        if (result.content) {
          this.contextForm.patchValue({
            Content: result.content,
            PromptCode: result.promptCode || this.aiIntent.toLowerCase().replace(/\s+/g, '_'),
            Type: this.aiContextType,
            Intent: this.aiIntent
          });

          this.toastr.success('Content generated successfully', 'Success');
          this.showAIHelper = false;
        }
        this.aiGenerating = false;
      },
      error: (error) => {
        console.error('Error generating context:', error);
        this.toastr.error('Failed to generate context', 'Error');
        this.aiGenerating = false;
      }
    });
  }

  onSubmit(): void {
    if (this.contextForm.invalid) {
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      Object.keys(this.contextForm.controls).forEach(key => {
        const control = this.contextForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.loading = true;
    
    // Generate UUID for new contexts
    const contextData: Context = {
      id: this.isEditMode ? this.contextId : this.generateUUID(),
      PromptCode: this.contextForm.value.PromptCode,
      ParentPromptCode: this.contextForm.value.ParentPromptCode || null,
      AgentCode: this.contextForm.value.AgentCode,
      Type: this.contextForm.value.Type,
      Intent: this.contextForm.value.Intent,
      VersionId: this.contextForm.value.VersionId,
      ContextVersion: this.contextForm.value.ContextVersion,
      Entity: this.contextForm.value.Entity,
      Content: this.contextForm.value.Content,
      Default: this.contextForm.value.Default,
      Latest: this.contextForm.value.Latest,
      CreatedBy: 'admin',
      ModifiedBy: 'admin'
    };

    const operation = this.isEditMode
      ? this.contextService.updateContext(this.contextId!, contextData)
      : this.contextService.createContext(contextData);

    operation.subscribe({
      next: (response) => {
        this.toastr.success(
          `Context ${this.isEditMode ? 'updated' : 'created'} successfully`,
          'Success'
        );
        this.contextSaved.emit(response);
        this.router.navigate(['/admin']);
      },
      error: (error) => {
        console.error('Error saving context:', error);
        this.toastr.error(error?.error?.detail || 'Failed to save context', 'Error');
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin']);
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}