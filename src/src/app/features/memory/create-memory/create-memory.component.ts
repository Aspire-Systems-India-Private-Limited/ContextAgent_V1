import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MemoryService, Memory } from '../../../core/services/memory.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-memory',
  templateUrl: './create-memory.component.html',
  styleUrls: ['./create-memory.component.scss']
})
export class CreateMemoryComponent implements OnInit {
  memoryForm!: FormGroup;
  selectedIdType: 'user' | 'agent' = 'user';
  saving: boolean = false;

  constructor(
    private fb: FormBuilder,
    private memoryService: MemoryService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.memoryForm = this.fb.group({
      idValue: ['', Validators.required],
      content: ['', Validators.required],
      metadata: this.fb.array([])
    });
    
    // Add initial metadata row with default memory_type
    const initialMeta = this.fb.group({
      key: ['memory_type'],
      value: ['']
    });
    this.metadata.push(initialMeta);
  }

  get metadata(): FormArray {
    return this.memoryForm.get('metadata') as FormArray;
  }

  addMetadata(): void {
    const metadataGroup = this.fb.group({
      key: [''],
      value: ['']
    });
    this.metadata.push(metadataGroup);
  }

  removeMetadata(index: number): void {
    if (this.metadata.length > 1) {
      this.metadata.removeAt(index);
    }
  }

  selectIdType(type: 'user' | 'agent'): void {
    this.selectedIdType = type;
    this.memoryForm.patchValue({ idValue: '' });
  }

  onSubmit(): void {
    if (this.memoryForm.invalid) {
      Object.keys(this.memoryForm.controls).forEach(key => {
        this.memoryForm.get(key)?.markAsTouched();
      });
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      return;
    }

    this.saving = true;

    // Convert metadata array to object
    const metadataObj: Record<string, any> = {};
    this.metadata.value.forEach((item: any) => {
      if (item.key && item.value) {
        metadataObj[item.key] = item.value;
      }
    });

    // Match the old HTML API structure exactly
    const memoryData = {
      user_id: this.memoryForm.value.idValue, // Works for both user and agent IDs
      content: this.memoryForm.value.content,
      metadata: Object.keys(metadataObj).length > 0 ? metadataObj : { memory_type: '' }
    };

    console.log('📝 Creating memory with data:', memoryData);

    this.memoryService.addMemory(memoryData).subscribe({
      next: (response) => {
        console.log('✅ Memory created successfully:', response);
        this.toastr.success('Memory added successfully!', 'Success');
        this.resetForm();
        this.saving = false;
      },
      error: (error) => {
        console.error('❌ Error creating memory:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        this.toastr.error('Failed to add memory: ' + (error.error?.message || error.message), 'Error');
        this.saving = false;
      }
    });
  }

  resetForm(): void {
    this.memoryForm.reset();
    this.metadata.clear();
    // Re-add initial metadata row
    const initialMeta = this.fb.group({
      key: ['memory_type'],
      value: ['']
    });
    this.metadata.push(initialMeta);
    this.selectedIdType = 'user';
  }

  // Remove unused UUID generator
}
