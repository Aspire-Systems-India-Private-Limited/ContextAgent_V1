import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MemoryService, Memory } from '../../../core/services/memory.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-search-memory',
  templateUrl: './search-memory.component.html',
  styleUrls: ['./search-memory.component.scss']
})
export class SearchMemoryComponent implements OnInit {
  searchForm!: FormGroup;
  memories: Memory[] = [];
  loading: boolean = false;
  selectedMemory: Memory | null = null;
  selectedIdType: 'user' | 'agent' = 'user';

  constructor(
    private fb: FormBuilder,
    private memoryService: MemoryService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.searchForm = this.fb.group({
      query: [''],
      user_id: ['']
    });
  }

  selectIdType(type: 'user' | 'agent'): void {
    this.selectedIdType = type;
    this.searchForm.patchValue({ user_id: '' });
  }

  search(): void {
    const userId = this.searchForm.value.user_id;
    
    if (!userId) {
      this.toastr.warning('⚠️ Please provide either User ID or Agent ID', 'Validation Error');
      return;
    }

    this.loading = true;
    const searchParams = {
      query: this.searchForm.value.query || '',
      user_id: userId
    };
    
    console.log('🔍 Searching memories with params:', searchParams);
    
    this.memoryService.searchMemories(searchParams).subscribe({
      next: (response: any) => {
        console.log('✅ Search API response:', response);
        
        // Handle different response structures
        let results: Memory[] = [];
        if (Array.isArray(response)) {
          results = response;
        } else if (Array.isArray(response.results)) {
          results = response.results;
        } else if (response.result && Array.isArray(response.result)) {
          results = response.result;
        }

        this.memories = results;
        this.loading = false;
        
        if (results.length > 0) {
          this.toastr.success(`Found ${results.length} memories`, 'Success');
        } else {
          this.toastr.info('No memories found for the search criteria', 'Info');
        }
      },
      error: (error: any) => {
        console.error('❌ Error searching memories:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        this.toastr.error('Failed to search memory: ' + (error.error?.message || error.message), 'Error');
        this.loading = false;
        this.memories = [];
      }
    });
  }

  reset(): void {
    this.searchForm.reset();
    this.memories = [];
    this.selectedMemory = null;
  }

  selectMemory(memory: Memory): void {
    this.selectedMemory = memory;
  }

  deleteMemory(memory: Memory): void {
    if (confirm('Are you sure you want to delete this memory?')) {
      const memoryId = memory.id || '';
      const userId = memory.user_id || memory.agent_code || '';
      
      this.memoryService.deleteMemory(memoryId, userId).subscribe({
        next: () => {
          this.toastr.success('✅ Memory deleted successfully!', 'Success');
          this.memories = this.memories.filter(m => m.id !== memory.id);
          if (this.selectedMemory?.id === memory.id) {
            this.selectedMemory = null;
          }
        },
        error: (error) => {
          console.error('❌ Error deleting memory:', error);
          this.toastr.error('Failed to delete memory', 'Error');
        }
      });
    }
  }

  getContentPreview(memory: Memory): string {
    const text = memory.memory_text || (memory as any).memory || (memory as any).content || '(No content)';
    return text.length > 80 ? text.substring(0, 80) + '...' : text;
  }

  getContent(memory: Memory): string {
    return memory.memory_text || (memory as any).memory || (memory as any).content || '(No content)';
  }

  formatMetadata(metadata: any): string {
    return JSON.stringify(metadata || {}, null, 2);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

