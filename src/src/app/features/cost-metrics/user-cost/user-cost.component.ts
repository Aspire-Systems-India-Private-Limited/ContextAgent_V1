import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CostMetricsService, MonthlyUserCost } from '../../../core/services/cost-metrics.service';

@Component({
  selector: 'app-user-cost',
  templateUrl: './user-cost.component.html',
  styleUrls: ['./user-cost.component.scss']
})
export class UserCostComponent implements OnInit {
  filterForm!: FormGroup;
  userCostData: MonthlyUserCost[] = [];
  filteredData: MonthlyUserCost[] = [];
  loading: boolean = false;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  allAgents: string[] = [];
  allUsers: string[] = [];
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
      filterUser: ['all'],
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
    console.log('🔍 Loading monthly user cost data...');
    this.loading = true;

    this.costMetricsService.getMonthlyUserCost().subscribe({
      next: (data: MonthlyUserCost[]) => {
        console.log('✅ Fetched monthly user costs:', data);
        console.log('📊 Total records:', data.length);
        this.userCostData = data;
        this.populateFilters();
        this.applyFilters();
        this.loading = false;
        this.toastr.success(`Loaded ${data.length} user cost records`, 'Success');
      },
      error: (error) => {
        console.error('❌ Error fetching user costs:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        this.toastr.error('Failed to fetch user cost data', 'Error');
        this.loading = false;
      }
    });
  }

  populateFilters(): void {
    const agentSet = new Set<string>();
    const userSet = new Set<string>();
    const monthSet = new Set<string>();

    this.userCostData.forEach(record => {
      agentSet.add(record.AgentCode);
      userSet.add(record.UserName);
      monthSet.add(record.Month);
    });

    this.allAgents = Array.from(agentSet).sort();
    this.allUsers = Array.from(userSet).sort();
    this.allMonths = Array.from(monthSet).sort();

    console.log('📋 Populated filters - Agents:', this.allAgents.length, 'Users:', this.allUsers.length, 'Months:', this.allMonths.length);
  }

  applyFilters(): void {
    let filtered = [...this.userCostData];

    const selectedAgent = this.filterForm.get('filterAgent')?.value;
    const selectedUser = this.filterForm.get('filterUser')?.value;
    const selectedMonth = this.filterForm.get('filterMonth')?.value;

    if (selectedAgent && selectedAgent !== 'all') {
      filtered = filtered.filter(r => r.AgentCode === selectedAgent);
    }

    if (selectedUser && selectedUser !== 'all') {
      filtered = filtered.filter(r => r.UserName === selectedUser);
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

  get paginatedData(): MonthlyUserCost[] {
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
