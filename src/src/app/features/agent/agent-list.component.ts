import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AgentService, Agent } from '../../core/services/agent.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-agent-list',
  templateUrl: './agent-list.component.html',
  styleUrls: ['./agent-list.component.scss']
})
export class AgentListComponent implements OnInit {
  agents: Agent[] = [];
  loading: boolean = false;
  showAgentModal: boolean = false;
  showThumbnailModal: boolean = false;
  agentForm!: FormGroup;
  editingAgent: Agent | null = null;
  thumbnailAgent: Agent | null = null;
  saving: boolean = false;
  thumbnailPreview: string | null = null;
  thumbnailPreviewUrl: string | null = null;
  selectedFile: File | null = null;
  selectedThumbnailFile: File | null = null;
  readonly IMAGE_BASE_PATH = 'https://agentdashboardaiui.z5.web.core.windows.net/';

  solutionId: string | null = null;
  constructor(
    private agentService: AgentService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.route.paramMap.subscribe(params => {
      this.solutionId = params.get('solutionId');
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadAgents();
  }

  initForm(): void {
    this.agentForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      supportEmail: [''],
      supportPhone: [''],
      url: [''],
      agentCode: [''],
      type: [''],
      thumbnail: [''],
      scopes: this.fb.array([]) // Add scopes as FormArray
    });
  }

  loadAgents(): void {
    this.loading = true;
    this.agentService.getAllAgentSolutions().subscribe({
      next: (agents: Agent[]) => {
        this.agents = agents;
        this.loading = false;
        this.toastr.success(`Loaded ${agents.length} agent solution(s)`, 'Success');
      },
      error: (error) => {
        this.toastr.error('Failed to load agent solutions', 'Error');
        this.loading = false;
        this.agents = [];
      }
    });
  }

  loadAgentsForSolution(): void {
    if (!this.solutionId) {
      this.toastr.warning('No solutionId in route', 'Warning');
      return;
    }
    this.loading = true;
    this.agentService.getAgentsForSolution(this.solutionId).subscribe({
      next: (agents: Agent[]) => {
        this.agents = agents;
        this.loading = false;
        this.toastr.success(`Loaded ${agents.length} agent(s) for solution`, 'Success');
      },
      error: (error) => {
        this.toastr.error('Failed to load agents for solution', 'Error');
        this.loading = false;
        this.agents = [];
      }
    });
  }

  openAddAgentModal(): void {
    this.editingAgent = null;
    this.agentForm.reset();
    this.thumbnailPreview = null;
    this.selectedFile = null;
    this.showAgentModal = true;
  }

  editAgent(agent: Agent): void {
    this.editingAgent = agent;
    
    // Clear existing scopes
    while (this.scopes.length) {
      this.scopes.removeAt(0);
    }
    
    // Populate scopes if they exist (check both field names)
    const scopesArray = agent.permission_scopes || agent.scopes || [];
    if (scopesArray.length > 0) {
      scopesArray.forEach(scope => {
        this.scopes.push(this.fb.control(scope));
      });
    }
    
    this.agentForm.patchValue({
      name: agent.name,
      description: agent.description,
      supportEmail: agent.support?.email || agent.supportEmail || '',
      supportPhone: agent.support?.phone || agent.supportPhone || '',
      url: agent.url || '',
      agentCode: agent.agentCode || agent.code || '',
      type: agent.type || ''
    });
    this.thumbnailPreview = this.getThumbnailUrl(agent) || null;
    this.showAgentModal = true;
  }

  closeAgentModal(): void {
    this.showAgentModal = false;
    this.editingAgent = null;
    this.agentForm.reset();
    this.thumbnailPreview = null;
    this.selectedFile = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.thumbnailPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveAgent(): void {
    if (this.agentForm.invalid) {
      Object.keys(this.agentForm.controls).forEach(key => {
        this.agentForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.saving = true;
    
    // Get form values
    const formValues = this.agentForm.value;
    
    // Transform to API format with nested support object
    const formData: any = {
      name: formValues.name,
      description: formValues.description,
      url: formValues.url,
      agentCode: formValues.agentCode,
      type: formValues.type,
      thumbnail: this.thumbnailPreview || undefined,
      status: 'active',
      support: {
        email: formValues.supportEmail || '',
        phone: formValues.supportPhone || ''
      },
      permission_scopes: formValues.scopes || []  // API expects permission_scopes
    };

    if (this.editingAgent) {
      // Update existing agent
      this.agentService.updateAgentSolution(this.editingAgent._id || this.editingAgent.id!, formData).subscribe({
        next: () => {
          this.toastr.success('Agent updated successfully', 'Success');
          this.loadAgents();
          this.closeAgentModal();
          this.saving = false;
        },
        error: (error) => {
          console.error('Error updating agent:', error);
          this.toastr.error('Failed to update agent', 'Error');
          this.saving = false;
        }
      });
    } else {
      // Create new agent
      this.agentService.createAgentSolution(formData).subscribe({
        next: () => {
          this.toastr.success('Agent created successfully', 'Success');
          this.loadAgents();
          this.closeAgentModal();
          this.saving = false;
        },
        error: (error) => {
          console.error('Error creating agent:', error);
          this.toastr.error('Failed to create agent', 'Error');
          this.saving = false;
        }
      });
    }
  }

  deleteAgent(agent: Agent): void {
    if (confirm(`Are you sure you want to delete agent \"${agent.name}\"?`)) {
      this.agentService.deleteAgentSolution(agent._id!).subscribe({
        next: () => {
          this.toastr.success('Agent deleted successfully', 'Success');
          this.loadAgents();
        },
        error: (error) => {
          console.error('Error deleting agent:', error);
          this.toastr.error('Failed to delete agent', 'Error');
        }
      });
    }
  }

  // Scopes/Roles methods
  get scopes(): FormArray {
    return this.agentForm.get('scopes') as FormArray;
  }

  addScope(): void {
    this.scopes.push(this.fb.control(''));
  }

  removeScope(index: number): void {
    this.scopes.removeAt(index);
  }

  // Get thumbnail URL with base path
  getThumbnailUrl(agent: Agent): string {
    if (agent.thumbnail_url) {
      return agent.thumbnail_url;
    }
    if (agent.thumbnail) {
      return this.IMAGE_BASE_PATH + agent.thumbnail;
    }
    return '';
  }

  // Get full thumbnail URL for display
  getFullThumbnailUrl(thumbnail: string | undefined): string {
    if (!thumbnail) return '';
    // If already full URL, return as is
    if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) {
      return thumbnail;
    }
    // Otherwise, prepend base path
    return this.IMAGE_BASE_PATH + thumbnail;
  }

  // Get scopes array handling both field names
  getScopes(agent: Agent): string[] {
    return agent.permission_scopes || agent.scopes || [];
  }

  // Open thumbnail upload modal
  openThumbnailModal(agent: Agent): void {
    this.thumbnailAgent = agent;
    this.showThumbnailModal = true;
    this.thumbnailPreviewUrl = null;
    this.selectedThumbnailFile = null;
  }

  closeThumbnailModal(): void {
    this.showThumbnailModal = false;
    this.thumbnailAgent = null;
    this.thumbnailPreviewUrl = null;
    this.selectedThumbnailFile = null;
  }

  onThumbnailFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedThumbnailFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.thumbnailPreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveThumbnail(): void {
    if (!this.selectedThumbnailFile || !this.thumbnailAgent) {
      this.toastr.warning('Please select an image file', 'Warning');
      return;
    }

    const agentId = this.thumbnailAgent._id || this.thumbnailAgent.id;
    if (!agentId) {
      this.toastr.error('Agent ID is missing', 'Error');
      return;
    }

    this.saving = true;

    // Upload thumbnail via API
    this.agentService.uploadThumbnail(agentId, this.selectedThumbnailFile).subscribe({
      next: (response: any) => {
        this.toastr.success('Thumbnail updated successfully', 'Success');
        this.closeThumbnailModal();
        this.loadAgents(); // Reload agents to show new thumbnail
        this.saving = false;
      },
      error: (error: any) => {
        console.error('Error uploading thumbnail:', error);
        this.toastr.error('Failed to upload thumbnail', 'Error');
        this.saving = false;
      }
    });
  }
}