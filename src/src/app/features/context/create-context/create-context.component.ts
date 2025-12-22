import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-context',
  templateUrl: './create-context.component.html',
  styleUrls: ['./create-context.component.scss']
})
export class CreateContextComponent implements OnInit {
  contextForm!: FormGroup;
  loading: boolean = false;
  aiGenerating: boolean = false;
  aiGenerationSuccess: boolean = false;

  // AI Generation fields
  aiIntent: string = '';
  aiTask: string = '';
  aiContextType: string = '';
  aiAdditionalInfo: string = '';

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.contextForm = this.fb.group({
      PromptCode: [''],
      ParentPromptCode: [''],
      agentCode: [''],
      type: [''],
      intent: [''],
      versionId: [''],
      contextVersion: [''],
      content: [''],
      default: [false],
      latest: [false],
      entities: this.fb.array([])
    });
  }

  generateWithAI(): void {
    if (!this.aiIntent || !this.aiTask || !this.aiContextType) {
      this.toastr.warning('⚠️ Please fill in Intent, Task, and Context Type for AI generation', 'Missing Information');
      return;
    }

    this.aiGenerating = true;
    this.aiGenerationSuccess = false;

    // Simulate AI generation (TODO: Replace with actual API call to /generate/context)
    setTimeout(() => {
      const generatedContent = `This is an AI-generated context for ${this.aiIntent}. The task is to ${this.aiTask}. ${this.aiAdditionalInfo}`;
      
      // Map context type to the correct format
      const contextTypeMapping: { [key: string]: string } = {
        'system': 'taskcontext',
        'user': 'domaincontext',
        'assistant': 'responsecontext',
        'function': 'parentcontext'
      };
      
      const mappedType = contextTypeMapping[this.aiContextType] || this.aiContextType;
      
      this.contextForm.patchValue({
        intent: this.aiIntent,
        type: mappedType,
        content: generatedContent
      });

      this.aiGenerating = false;
      this.aiGenerationSuccess = true;
      
      // Scroll to the content field
      setTimeout(() => {
        const contentField = document.getElementById('content');
        if (contentField) {
          contentField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }, 1500);
  }

  get entities(): FormArray {
    return this.contextForm.get('entities') as FormArray;
  }

  addEntityRow(): void {
    const entityGroup = this.fb.group({
      key: [''],
      value: ['']
    });
    this.entities.push(entityGroup);
  }

  removeEntityRow(index: number): void {
    this.entities.removeAt(index);
  }

  onSubmit(): void {
    this.loading = true;
    
    // TODO: Replace with actual API call to create context
    setTimeout(() => {
      this.toastr.success('Context created successfully!', 'Success');
      this.loading = false;
      this.resetForm();
    }, 1000);
  }

  resetForm(): void {
    this.contextForm.reset({
      default: false,
      latest: false
    });
    this.entities.clear();
    this.aiIntent = '';
    this.aiTask = '';
    this.aiContextType = '';
    this.aiAdditionalInfo = '';
    this.aiGenerationSuccess = false;
  }
}