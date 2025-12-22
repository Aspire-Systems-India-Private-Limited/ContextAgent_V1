import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CostMetricsService, AggregatedCost } from '../../../core/services/cost-metrics.service';

@Component({
  selector: 'app-agent-aggregated',
  templateUrl: './agent-aggregated.component.html',
  styleUrls: ['./agent-aggregated.component.scss']
})
export class AgentAggregatedComponent implements OnInit {
  filterForm!: FormGroup;
  aggregatedData: AggregatedCost[] = [];
  filteredData: AggregatedCost[] = [];
  loading: boolean = false;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  allAgents: string[] = [];
  allMonths: string[] = [];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private costMetricsService: CostMetricsService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
    this.setupFilterListeners();
  }

  initForm(): void {
    this.filterForm = this.fb.group({
      filterAgent: ['all'],
      filterMonth: ['all']
    });
  }

  setupFilterListeners(): void {
    this.filterForm.valueChanges.subscribe(() => {
      console.log('🔍 Filters changed:', this.filterForm.value);
      this.currentPage = 1;
      this.applyFilters();
    });
  }

  loadData(): void {
    console.log('🔍 Loading aggregated agent monthly cost data...');
    this.loading = true;

    this.costMetricsService.getAggregatedAgentMonthlyCost().subscribe({
      next: (data: AggregatedCost[]) => {
        console.log('✅ Fetched aggregated agent costs:', data);
        console.log('📊 Total records:', data.length);
        this.aggregatedData = data;
        this.populateFilters();
        this.applyFilters();
        this.loading = false;
        this.toastr.success(`Loaded ${data.length} aggregated cost records`, 'Success');
      },
      error: (error) => {
        console.error('❌ Error fetching aggregated costs:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        this.toastr.error('Failed to fetch aggregated cost data', 'Error');
        this.loading = false;
      }
    });
  }

  populateFilters(): void {
    const agentSet = new Set<string>();
    const monthSet = new Set<string>();

    this.aggregatedData.forEach(record => {
      agentSet.add(record.AgentCode);
      monthSet.add(record.Month);
    });

    this.allAgents = Array.from(agentSet).sort();
    this.allMonths = Array.from(monthSet).sort();

    console.log('📋 Populated filters - Agents:', this.allAgents.length, 'Months:', this.allMonths.length);
  }

  applyFilters(): void {
    let filtered = [...this.aggregatedData];

    const selectedAgent = this.filterForm.get('filterAgent')?.value;
    const selectedMonth = this.filterForm.get('filterMonth')?.value;

    if (selectedAgent && selectedAgent !== 'all') {
      filtered = filtered.filter(r => r.AgentCode === selectedAgent);
    }

    if (selectedMonth && selectedMonth !== 'all') {
      filtered = filtered.filter(r => r.Month === selectedMonth);
    }

    console.log('🎯 Filtered results:', filtered.length, 'records');
    this.filteredData = filtered;
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    
    // Ensure current page is valid
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  get paginatedData(): AggregatedCost[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredData.slice(start, end);
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  lastPage(): void {
    this.currentPage = this.totalPages;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}
