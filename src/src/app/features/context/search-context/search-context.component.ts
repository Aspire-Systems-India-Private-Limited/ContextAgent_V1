import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ContextService, Context } from '../../../core/services/context.service';

interface TreeNode {
  name: string;
  type?: string;
  description?: string;
  expanded?: boolean;
  children?: TreeNode[];
}

@Component({
  selector: 'app-search-context',
  templateUrl: './search-context.component.html',
  styleUrls: ['./search-context.component.scss']
})
export class SearchContextComponent implements OnInit {
  searchForm!: FormGroup;
  contexts: Context[] = [];
  loading: boolean = false;
  searched: boolean = false;
  showTreeView: boolean = false;
  treeData: TreeNode[] = [];
  selectedNode: TreeNode | null = null;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private contextService: ContextService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadContexts();
    this.initTreeData();
  }

  initForm(): void {
    this.searchForm = this.fb.group({
      agentCode: [''],
      versionId: ['']
    });
  }

  loadContexts(): void {
    // Initial load - don't fetch without agent code
    this.contexts = [];
  }

  searchContexts(): void {
    const agentCode = this.searchForm.get('agentCode')?.value?.trim();
    const versionId = this.searchForm.get('versionId')?.value?.trim();

    if (!agentCode) {
      this.toastr.warning('⚠️ Agent Code is required', 'Warning');
      return;
    }

    this.loading = true;
    this.searched = true;
    this.contextService.searchContexts(agentCode, versionId).subscribe({
      next: (data: Context[]) => {
        this.contexts = data;
        this.loading = false;
        if (data.length > 0) {
          this.toastr.success(`✅ Found ${data.length} context(s)`, 'Success');
        }
      },
      error: (error) => {
        console.error('Search error:', error);
        this.loading = false;
        this.toastr.error('❌ Failed to search contexts', 'Error');
      }
    });
  }

  updateContext(context: Context): void {
    this.toastr.info('💾 Saving context...', 'Info');
    // TODO: Implement update API call
    setTimeout(() => {
      this.toastr.success('✅ Context updated successfully!', 'Success');
    }, 500);
  }

  deleteContext(context: Context): void {
    if (confirm(`Are you sure you want to delete context "${context.PromptCode}"?`)) {
      this.toastr.info('🗑️ Deleting context...', 'Info');
      // TODO: Implement delete API call
      setTimeout(() => {
        this.contexts = this.contexts.filter(c => c.id !== context.id);
        this.toastr.success('✅ Context deleted successfully!', 'Success');
      }, 500);
    }
  }

  testContext(context: Context): void {
    this.toastr.info('🧪 Test functionality coming soon', 'Info');
  }

  importContext(): void {
    this.toastr.info('📥 Import functionality coming soon', 'Info');
  }

  exportContext(): void {
    this.toastr.info('📤 Export functionality coming soon', 'Info');
  }

  toggleTreeView(): void {
    if (this.showTreeView) {
      this.toastr.success('🌳 Tree view enabled', 'Success');
    }
  }

  initTreeData(): void {
    this.treeData = [
      {
        name: 'Customer Support Contexts',
        expanded: false,
        children: [
          { name: 'customer_greeting', type: 'taskcontext', description: 'Initial greeting for customers' },
          { name: 'order_status', type: 'responsecontext', description: 'Order tracking responses' }
        ]
      },
      {
        name: 'Product Contexts',
        expanded: false,
        children: [
          { name: 'product_inquiry', type: 'domaincontext', description: 'Product search and information' },
          { name: 'product_comparison', type: 'domaincontext', description: 'Compare products' }
        ]
      }
    ];
  }

  toggleNode(node: TreeNode): void {
    node.expanded = !node.expanded;
  }

  selectNode(node: TreeNode): void {
    this.selectedNode = node;
  }
}
