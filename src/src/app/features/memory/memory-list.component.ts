import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MemoryService, Memory } from '../../core/services/memory.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-memory-list',
  templateUrl: './memory-list.component.html',
  styleUrls: ['./memory-list.component.scss']
})
export class MemoryListComponent implements OnInit {
  memories: Memory[] = [];
  memoryForm: FormGroup;
  loading: boolean = false;
  selectedMemory: Memory | null = null;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private memoryService: MemoryService,
    private toastr: ToastrService
  ) {
    this.memoryForm = this.fb.group({
      user_id: ['', Validators.required],
      session_id: [''],
      agent_code: [''],
      memory_text: ['', Validators.required],
      context: [''],
      metadata: ['']
    });
  }

  ngOnInit(): void {
    this.loadMemories();
  }

  loadMemories(): void {
    this.loading = true;
    console.log('Loading memories from API...');
    // Use searchMemories with minimal parameters to get all memories
    this.memoryService.searchMemories({ query: '', user_id: '' }).subscribe({
      next: (memories: Memory[]) => {
        console.log('Memories loaded:', memories);
        this.memories = memories;
        this.loading = false;
        this.toastr.success(`Loaded ${memories.length} memor${memories.length === 1 ? 'y' : 'ies'}`, 'Success');
      },
      error: (error) => {
        console.error('Error loading memories:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        this.toastr.error('Failed to load memories', 'Error');
        this.loading = false;
        this.memories = [];
      }
    });
  }

  selectMemory(memory: Memory): void {
    this.selectedMemory = memory;
    this.isEditMode = true;

    this.memoryForm.patchValue({
      user_id: memory.user_id,
      session_id: memory.session_id,
      agent_code: memory.agent_code,
      memory_text: memory.memory_text,
      context: memory.context,
      metadata: memory.metadata ? JSON.stringify(memory.metadata, null, 2) : ''
    });
  }

  onSubmit(): void {
    if (this.memoryForm.invalid) {
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      Object.keys(this.memoryForm.controls).forEach(key => {
        const control = this.memoryForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    // Parse metadata JSON
    let metadata: Record<string, any> | undefined;
    if (this.memoryForm.value.metadata) {
      try {
        metadata = JSON.parse(this.memoryForm.value.metadata);
      } catch (error) {
        this.toastr.error('Invalid JSON in metadata field', 'Validation Error');
        return;
      }
    }

    const memoryData: Memory = {
      id: this.isEditMode && this.selectedMemory ? this.selectedMemory.id : this.generateUUID(),
      user_id: this.memoryForm.value.user_id,
      session_id: this.memoryForm.value.session_id,
      agent_code: this.memoryForm.value.agent_code,
      memory_text: this.memoryForm.value.memory_text,
      context: this.memoryForm.value.context,
      timestamp: new Date().toISOString(),
      metadata: metadata
    };

    const operation = this.isEditMode && this.selectedMemory
      ? this.memoryService.updateMemory(this.selectedMemory.id, memoryData)
      : this.memoryService.createMemory(memoryData);

    this.loading = true;
    operation.subscribe({
      next: () => {
        this.toastr.success(
          `Memory ${this.isEditMode ? 'updated' : 'created'} successfully`,
          'Success'
        );
        this.loadMemories();
        this.resetForm();
      },
      error: (error) => {
        console.error('Error saving memory:', error);
        this.toastr.error('Failed to save memory', 'Error');
        this.loading = false;
      }
    });
  }

  deleteMemory(): void {
    if (!this.selectedMemory) return;

    if (confirm(`Are you sure you want to delete this memory?`)) {
      this.memoryService.deleteMemory(this.selectedMemory.id, this.selectedMemory.user_id).subscribe({
        next: () => {
          this.toastr.success('Memory deleted successfully', 'Success');
          this.loadMemories();
          this.resetForm();
        },
        error: (error) => {
          console.error('Error deleting memory:', error);
          this.toastr.error('Failed to delete memory', 'Error');
        }
      });
    }
  }

  addNew(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.memoryForm.reset();
    this.selectedMemory = null;
    this.isEditMode = false;
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

  private generateUUID(): string {
    return 'mem_' + Math.random().toString(36).substring(2, 15);
  }
}
