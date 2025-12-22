import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SentimentService, SentimentData } from '../../core/services/sentiment.service';
import { AgentService, Agent } from '../../core/services/agent.service';

@Component({
  selector: 'app-sentiment-analysis',
  templateUrl: './sentiment-analysis.component.html',
  styleUrls: ['./sentiment-analysis.component.scss']
})
export class SentimentAnalysisComponent implements OnInit {
  filterForm!: FormGroup;
  sentiments: SentimentData[] = [];
  loading: boolean = false;
  stats = { total: 0, positive: 0, neutral: 0, negative: 0, overallSentiment: 'N/A' };

  // Autocomplete properties
  agents: Agent[] = [];
  filteredAgents: Agent[] = [];
  showAutocomplete: boolean = false;
  selectedAgentIndex: number = -1;
  agentsLoading: boolean = false;
  agentMap: { [code: string]: string } = {}; // Map agent code to agent ID

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private sentimentService: SentimentService,
    private agentService: AgentService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAgents();
  }

  initForm(): void {
    this.filterForm = this.fb.group({
      agentCode: [''],
      startDate: [''],
      endDate: ['']
    });

    // Listen to agent code input changes
    this.filterForm.get('agentCode')?.valueChanges.subscribe(value => {
      this.filterAgents(value);
    });
  }

  loadAgents(): void {
    this.agentsLoading = true;
    this.agentService.getAllAgents().subscribe({
      next: (data: Agent[]) => {
        this.agents = data;
        this.agentMap = {};
        data.forEach(agent => {
          const code = agent.code || agent.agentCode || agent.name;
          const id = agent.id || agent._id;
          if (code && id) {
            this.agentMap[code] = id;
          }
        });
        console.log('✅ Loaded agents:', this.agents.length);
        console.log('Agent code to ID map:', this.agentMap);
        this.agentsLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading agents:', error);
        this.toastr.error('❌ Failed to load agents', 'Error');
        this.agentsLoading = false;
      }
    });
  }

  filterAgents(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredAgents = [...this.agents];
      this.showAutocomplete = true;
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    this.filteredAgents = this.agents.filter(agent => {
      const code = (agent.code || agent.agentCode || agent.name || '').toLowerCase();
      return code.includes(term);
    });
    this.showAutocomplete = true;
    this.selectedAgentIndex = -1;
  }

  selectAgent(agent: Agent): void {
    const code = agent.code || agent.agentCode || agent.name;
    this.filterForm.patchValue({ agentCode: code });
    this.hideAutocomplete();
  }

  hideAutocomplete(): void {
    this.showAutocomplete = false;
    this.selectedAgentIndex = -1;
  }

  onAgentInputFocus(): void {
    const currentValue = this.filterForm.get('agentCode')?.value;
    this.filterAgents(currentValue || '');
  }

  onAgentInputKeydown(event: KeyboardEvent): void {
    if (!this.showAutocomplete || this.filteredAgents.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedAgentIndex = Math.min(
          this.selectedAgentIndex + 1,
          this.filteredAgents.length - 1
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedAgentIndex = Math.max(this.selectedAgentIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedAgentIndex >= 0 && this.selectedAgentIndex < this.filteredAgents.length) {
          this.selectAgent(this.filteredAgents[this.selectedAgentIndex]);
        }
        break;
      case 'Escape':
        this.hideAutocomplete();
        break;
    }
  }

  search(): void {
    const { agentCode, startDate, endDate } = this.filterForm.value;

    if (!startDate || !endDate) {
      this.toastr.warning('⚠️ Please select both start and end dates', 'Validation Error');
      return;
    }

    this.loading = true;

    const params: any = {
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString()
    };
    
    // Convert agent code to agent ID if provided
    if (agentCode && agentCode.trim()) {
      const agentId = this.agentMap[agentCode.trim()];
      if (agentId) {
        params['agent_id'] = agentId;
        console.log('🔍 Agent Code:', agentCode.trim(), '-> Agent ID:', agentId);
      } else {
        this.toastr.warning('⚠️ Invalid agent code. Please select from the dropdown.', 'Validation Error');
        this.loading = false;
        return;
      }
    }

    console.log('🔍 Searching sentiment data with params:', params);

    this.sentimentService.getSentimentByDateRange(params).subscribe({
      next: (response: any) => {
        console.log('✅ API Response:', response);
        
        // Handle different response structures
        let data: SentimentData[] = [];
        if (Array.isArray(response)) {
          data = response;
        } else if (response.results) {
          data = response.results;
        } else if (response.data) {
          data = response.data;
        }
        
        console.log('📊 Total sentiment records:', data.length);
        console.log('📋 Sentiment data:', data);
        
        this.sentiments = data;
        this.updateStats();
        this.loading = false;
        if (data.length > 0) {
          this.toastr.success(`✅ Found ${data.length} sentiment record${data.length > 1 ? 's' : ''}`, 'Success');
        } else {
          this.toastr.info('ℹ️ No sentiment data found for the selected criteria', 'No Results');
        }
      },
      error: (error) => {
        console.error('❌ Error fetching sentiment data:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error details:', error.error);
        
        const errorMsg = error.error?.message || error.message || 'Failed to fetch sentiment data';
        this.toastr.error(`❌ ${errorMsg}`, 'Error');
  this.loading = false;
  this.sentiments = [];
  this.updateStats();
      }
    });
  }

  reset(): void {
    this.filterForm.reset();
    this.sentiments = [];
    this.updateStats();
    this.hideAutocomplete();
  }

  updateStats(): void {
    const data = this.sentiments || [];
    const total = data.length;
    const positive = data.filter(f => (f.overall_sentiment || f.sentiment) === 'Positive').length;
    const neutral = data.filter(f => (f.overall_sentiment || f.sentiment) === 'Neutral').length;
    const negative = data.filter(f => (f.overall_sentiment || f.sentiment) === 'Negative').length;
    let overallSentiment = 'N/A';
    if (total > 0) {
      if (positive > negative && positive > neutral) {
        overallSentiment = '😊 Positive';
      } else if (negative > positive && negative > neutral) {
        overallSentiment = '😞 Negative';
      } else if (neutral > positive && neutral > negative) {
        overallSentiment = '😐 Neutral';
      } else if (positive === negative && positive > neutral) {
        overallSentiment = '🤔 Mixed';
      } else {
        overallSentiment = '😐 Neutral';
      }
    }
    this.stats = { total, positive, neutral, negative, overallSentiment };
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  toggleExpand(elementId: string, event: Event): void {
    const element = document.getElementById(elementId);
    const button = event.target as HTMLElement;
    if (element && button) {
      if (element.classList.contains('expanded')) {
        element.classList.remove('expanded');
        button.textContent = 'Expand';
      } else {
        element.classList.add('expanded');
        button.textContent = 'Collapse';
      }
    }
  }

  toggleCategoryAccordion(accordionId: string, event: Event): void {
    const body = document.getElementById(accordionId);
    const header = (event.target as HTMLElement).closest('.category-accordion-header');
    if (body && header) {
      if (body.classList.contains('active')) {
        body.classList.remove('active');
        header.classList.remove('active');
      } else {
        body.classList.add('active');
        header.classList.add('active');
      }
    }
  }

  toggleExpandAll(rowIndex: number, event: Event): void {
    const button = event.target as HTMLElement;
    const isExpanding = button.textContent === 'Expand';
    const elementIds = [
      `summary-${rowIndex}`,
      `feedback-${rowIndex}`,
      `negative-${rowIndex}`,
      `request-${rowIndex}`,
      `response-${rowIndex}`
    ];
    elementIds.forEach(id => {
      const element = document.getElementById(id);
      const elementButton = element?.nextElementSibling as HTMLElement;
      if (element && elementButton && elementButton.classList.contains('expand-btn')) {
        if (isExpanding) {
          element.classList.add('expanded');
          elementButton.textContent = 'Collapse';
        } else {
          element.classList.remove('expanded');
          elementButton.textContent = 'Expand';
        }
      }
    });
    button.textContent = isExpanding ? 'Collapse' : 'Expand';
  }
}
