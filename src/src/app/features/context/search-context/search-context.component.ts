import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ContextService, Context } from '../../../core/services/context.service';

interface TreeVersionGroup {
  version: string;
  expanded: boolean;
  contexts: Context[];
}

interface TreeTypeGroup {
  name: string;
  expanded: boolean;
  versions: TreeVersionGroup[];
}

interface TreeIntentGroup {
  name: string;
  expanded: boolean;
  types: TreeTypeGroup[];
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
  treeIntents: TreeIntentGroup[] = [];
  selectedTreeContext: Context | null = null;
  selectedTreeContextUpdateVersion = false;
  updateContextVersion: boolean[] = [];
  historyModalVisible = false;
  historyLoading = false;
  historyPromptCode = '';
  historyContexts: Context[] = [];
  actionInProgress = false;

  // Test Modal Properties
  showTestModal: boolean = false;
  currentTestContext: Context | null = null;
  testAgentCode: string = '';
  testIntent: string = '';
  testUserMsg: string = '';
  testUserId: string = 'admin';
  testSessionId: string = '';
  testRequestId: string = '';
  testVersionId: string = '';
  testModel: string = 'gpt-4o-mini';
  testTop: number = 5;
  testDefault: boolean = false;
  testLatest: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private contextService: ContextService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadContexts();
    this.initFormListeners();
  }

  initForm(): void {
    this.searchForm = this.fb.group({
      agentCode: [''],
      versionId: ['']
    });
  }

  initFormListeners(): void {
    this.searchForm.get('agentCode')?.valueChanges.subscribe(() => {
      // Reset tree view when agent code changes to mimic HTML behavior
      this.showTreeView = false;
      this.selectedTreeContext = null;
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
        this.updateContextVersion = new Array(data.length).fill(false);
        this.loading = false;
        if (data.length > 0) {
          this.toastr.success(`✅ Found ${data.length} context(s)`, 'Success');
          if (this.showTreeView) {
            this.buildTreeData();
          }
        } else {
          this.showTreeView = false;
          this.treeIntents = [];
          this.selectedTreeContext = null;
        }
      },
      error: (error) => {
        console.error('Search error:', error);
        this.loading = false;
        this.toastr.error('❌ Failed to search contexts', 'Error');
        this.contexts = [];
        this.treeIntents = [];
        this.updateContextVersion = [];
        this.selectedTreeContext = null;
      }
    });
  }

  addEntityRow(context: Context): void {
    if (!context.Entity) {
      context.Entity = [];
    }
    context.Entity.push({ Key: '', Value: '' });
  }

  removeEntityRow(context: Context, index: number): void {
    if (!context.Entity) {
      return;
    }
    context.Entity.splice(index, 1);
  }

  saveContext(context: Context, updateVersion: boolean, index?: number): void {
    if (!context.id) {
      this.toastr.error('❌ Cannot update context without ID', 'Error');
      return;
    }

    const payload = this.buildContextPayload(context);
    this.actionInProgress = true;
    this.contextService.updateContext(context.id, payload, updateVersion).subscribe({
      next: () => {
        this.toastr.success('✅ Context updated successfully', 'Success');
        if (typeof index === 'number') {
          this.updateContextVersion[index] = false;
        } else {
          this.selectedTreeContextUpdateVersion = false;
        }
        this.actionInProgress = false;
        this.buildTreeData();
      },
      error: (error) => {
        console.error('Update error:', error);
        this.toastr.error('❌ Failed to update context', 'Error');
        this.actionInProgress = false;
      }
    });
  }

  deleteContext(context: Context): void {
    if (confirm(`Are you sure you want to delete context "${context.PromptCode}"?`)) {
      if (!context.id) {
        this.toastr.error('❌ Cannot delete context without ID', 'Error');
        return;
      }

      this.actionInProgress = true;
      this.contextService.deleteContext(context.id).subscribe({
        next: () => {
          this.contexts = this.contexts.filter(c => c.id !== context.id);
          this.updateContextVersion = new Array(this.contexts.length).fill(false);
          if (this.selectedTreeContext?.id === context.id) {
            this.selectedTreeContext = null;
            this.selectedTreeContextUpdateVersion = false;
          }
          this.buildTreeData();
          this.actionInProgress = false;
          this.toastr.success('✅ Context deleted successfully!', 'Success');
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.actionInProgress = false;
          this.toastr.error('❌ Failed to delete context', 'Error');
        }
      });
    }
  }

  testContext(context: Context): void {
    console.log('Opening test modal for context:', context);
    
    // Set current test context
    this.currentTestContext = context;
    this.testAgentCode = context.AgentCode || '';
    this.testIntent = context.Intent || '';
    this.testVersionId = context.VersionId || 'v1';
    this.testModel = 'gpt-4o-mini';
    this.testUserId = 'admin';
    
    // Generate Session ID with admin_datetime format
    const now = new Date();
    const datetime = now.toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
    this.testSessionId = `admin_${datetime}`;
    
    // Set Request ID
    this.testRequestId = `req_${Date.now()}`;
    
    this.showTestModal = true;
    console.log('Test modal should be visible now:', this.showTestModal);
  }

  closeTestModal(): void {
    this.showTestModal = false;
    this.currentTestContext = null;
  }

  async executeTest(): Promise<void> {
    if (!this.testAgentCode || !this.testIntent || !this.testUserMsg) {
      this.toastr.warning('Please fill in Agent Code, Intent, and User Message', 'Warning');
      return;
    }

    this.loading = true;

    try {
      // Build the payload matching the admin.html structure
      const testPayload = {
        versionSets: [{
          model: this.testModel,
          contexts: [this.testAgentCode],
          images: [],
          versionId: this.testVersionId
        }],
        userMsg: this.testUserMsg,
        userId: this.testUserId,
        sessionId: this.testSessionId,
        requestId: this.testRequestId,
        topK: this.testTop,
        default: this.testDefault,
        latest: this.testLatest,
        agentCode: this.testAgentCode,
        intent: this.testIntent
      };

      console.log('Executing test with payload:', testPayload);

      // Call the test API endpoint
      this.contextService.testContext(testPayload).subscribe({
        next: (response) => {
          console.log('Test results:', response);
          this.toastr.success('✅ Test executed successfully', 'Success');
          console.log('Test response:', response);
        },
        error: (error) => {
          console.error('Test execution error:', error);
          const errorMessage = error.error?.detail || error.message || 'Test execution failed';
          this.toastr.error(`❌ ${errorMessage}`, 'Error');
        },
        complete: () => {
          this.loading = false;
        }
      });

    } catch (error) {
      console.error('Test execution error:', error);
      this.toastr.error('Failed to execute test', 'Error');
      this.loading = false;
    }
  }

  importContext(): void {
    this.toastr.info('📥 Import functionality coming soon', 'Info');
  }

  exportContext(): void {
    this.toastr.info('📤 Export functionality coming soon', 'Info');
  }

  toggleTreeView(): void {
    if (this.showTreeView) {
      if (!this.contexts.length) {
        this.toastr.info('🔍 Search contexts before enabling tree view', 'Info');
        this.showTreeView = false;
        return;
      }
      this.buildTreeData();
      this.toastr.success('🌳 Tree view enabled', 'Success');
    } else {
      this.selectedTreeContext = null;
    }
  }

  buildTreeData(): void {
    if (!this.contexts.length) {
      this.treeIntents = [];
      return;
    }

    const intentMap = new Map<string, Map<string, Map<string, Context[]>>>();

    this.contexts.forEach(ctx => {
      const intentKey = ctx.Intent || 'No Intent';
      const typeKey = ctx.Type || 'No Type';
      const versionKey = ctx.ContextVersion || 'No Version';

      if (!intentMap.has(intentKey)) {
        intentMap.set(intentKey, new Map());
      }
      const typeMap = intentMap.get(intentKey)!;

      if (!typeMap.has(typeKey)) {
        typeMap.set(typeKey, new Map());
      }
      const versionMap = typeMap.get(typeKey)!;

      if (!versionMap.has(versionKey)) {
        versionMap.set(versionKey, []);
      }

      versionMap.get(versionKey)!.push(ctx);
    });

    this.treeIntents = Array.from(intentMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([intent, typeMap]) => ({
        name: intent,
        expanded: false,
        types: Array.from(typeMap.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([type, versionMap]) => ({
            name: type,
            expanded: false,
            versions: Array.from(versionMap.entries())
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([version, contexts]) => ({
                version,
                expanded: false,
                contexts: contexts.sort((a, b) => {
                  const dateA = new Date(a.ModifiedOn || a.CreatedOn || 0).getTime();
                  const dateB = new Date(b.ModifiedOn || b.CreatedOn || 0).getTime();
                  return dateB - dateA;
                })
              }))
          }))
      }));
  }

  toggleIntent(item: TreeIntentGroup): void {
    item.expanded = !item.expanded;
  }

  toggleType(intent: TreeIntentGroup, type: TreeTypeGroup): void {
    if (!intent.expanded) {
      intent.expanded = true;
    }
    type.expanded = !type.expanded;
  }

  toggleVersion(type: TreeTypeGroup, version: TreeVersionGroup): void {
    if (!type.expanded) {
      type.expanded = true;
    }
    version.expanded = !version.expanded;
  }

  selectTreeContext(context: Context): void {
    this.selectedTreeContext = context;
    this.selectedTreeContextUpdateVersion = false;
  }

  openHistoryModal(promptCode?: string): void {
    if (!promptCode) {
      this.toastr.warning('⚠️ Unable to fetch history without prompt code', 'Warning');
      return;
    }

    this.historyPromptCode = promptCode;
    this.historyModalVisible = true;
    this.historyLoading = true;
    this.contextService.getContextHistory(promptCode).subscribe({
      next: (history) => {
        this.historyContexts = history;
        this.historyLoading = false;
      },
      error: (error) => {
        console.error('History error:', error);
        this.toastr.error('❌ Failed to fetch context history', 'Error');
        this.historyLoading = false;
      }
    });
  }

  closeHistoryModal(): void {
    this.historyModalVisible = false;
    this.historyContexts = [];
    this.historyPromptCode = '';
  }

  formatDate(value?: Date | string): string {
    if (!value) {
      return '-';
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return '-';
    }
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  trackByContextId(_: number, context: Context): string | undefined {
    return context.id;
  }

  private buildContextPayload(context: Context): Partial<Context> {
    const sanitizedEntities = (context.Entity || [])
      .filter(e => e && e.Key && e.Value)
      .map(e => ({
        Key: e.Key.trim(),
        Value: e.Value.trim()
      }));

    context.Entity = sanitizedEntities;

    return {
      PromptCode: context.PromptCode?.trim(),
      ParentPromptCode: context.ParentPromptCode?.trim(),
      AgentCode: context.AgentCode?.trim(),
      Type: context.Type?.trim(),
      Intent: context.Intent?.trim(),
      VersionId: context.VersionId?.trim(),
      ContextVersion: context.ContextVersion?.trim(),
      Content: context.Content,
      Entity: sanitizedEntities,
      Default: !!context.Default,
      Latest: !!context.Latest
    };
  }
}
