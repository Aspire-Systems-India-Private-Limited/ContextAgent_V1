import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

interface TestCase {
  id: string;
  name: string;
  description: string;
  status: 'Passed' | 'Failed' | 'Pending' | 'Skipped';
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  executionTime?: number;
  lastRun?: string;
  author?: string;
}

@Component({
  selector: 'app-test-cases',
  templateUrl: './test-cases.component.html',
  styleUrls: ['./test-cases.component.scss']
})
export class TestCasesComponent implements OnInit {
  searchForm!: FormGroup;
  loading: boolean = false;
  searched: boolean = false;
  testCases: TestCase[] = [];
  filteredTestCases: TestCase[] = [];
  
  filterStatus: string = 'all';
  filterCategory: string = 'all';
  filterPriority: string = 'all';
  
  uniqueCategories: string[] = [];
  
  stats = {
    total: 0,
    passed: 0,
    failed: 0,
    pending: 0,
    skipped: 0,
    passRate: 0
  };

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.searchForm = this.fb.group({
      agentCode: [''],
      versionId: ['']
    });
  }

  search(): void {
    const formValue = this.searchForm.value;
    
    if (!formValue.agentCode) {
      this.toastr.warning('Please enter an Agent Code', 'Warning');
      return;
    }

    this.loading = true;
    this.searched = true;

    // Mock test cases data
    setTimeout(() => {
      this.testCases = [
        {
          id: 'TC001',
          name: 'User Authentication - Valid Credentials',
          description: 'Verify that user can login with valid credentials',
          status: 'Passed',
          category: 'Authentication',
          priority: 'High',
          executionTime: 1.2,
          lastRun: '2026-01-08 10:30:00',
          author: 'John Doe'
        },
        {
          id: 'TC002',
          name: 'User Authentication - Invalid Credentials',
          description: 'Verify that user cannot login with invalid credentials',
          status: 'Passed',
          category: 'Authentication',
          priority: 'High',
          executionTime: 0.8,
          lastRun: '2026-01-08 10:30:15',
          author: 'John Doe'
        },
        {
          id: 'TC003',
          name: 'Context Creation - Valid Data',
          description: 'Verify that context can be created with valid data',
          status: 'Failed',
          category: 'Context Management',
          priority: 'High',
          executionTime: 2.5,
          lastRun: '2026-01-08 10:31:00',
          author: 'Jane Smith'
        },
        {
          id: 'TC004',
          name: 'Context Search - By Agent Code',
          description: 'Verify that context can be searched by agent code',
          status: 'Passed',
          category: 'Context Management',
          priority: 'Medium',
          executionTime: 1.8,
          lastRun: '2026-01-08 10:32:00',
          author: 'Jane Smith'
        },
        {
          id: 'TC005',
          name: 'Agent List - Display All Agents',
          description: 'Verify that all agents are displayed in the list',
          status: 'Pending',
          category: 'Agent Management',
          priority: 'Medium',
          executionTime: undefined,
          lastRun: undefined,
          author: 'Bob Johnson'
        },
        {
          id: 'TC006',
          name: 'Sentiment Analysis - Positive Feedback',
          description: 'Verify sentiment analysis for positive feedback',
          status: 'Passed',
          category: 'Analytics',
          priority: 'Low',
          executionTime: 3.2,
          lastRun: '2026-01-08 10:35:00',
          author: 'Alice Brown'
        },
        {
          id: 'TC007',
          name: 'Cost Metrics - Monthly Report',
          description: 'Verify monthly cost metrics report generation',
          status: 'Skipped',
          category: 'Reporting',
          priority: 'Low',
          executionTime: undefined,
          lastRun: '2026-01-08 10:36:00',
          author: 'Charlie Wilson'
        },
        {
          id: 'TC008',
          name: 'API Integration - External Service',
          description: 'Verify integration with external API service',
          status: 'Failed',
          category: 'Integration',
          priority: 'High',
          executionTime: 5.1,
          lastRun: '2026-01-08 10:40:00',
          author: 'David Lee'
        }
      ];

      this.extractUniqueValues();
      this.applyFilters();
      this.calculateStats();
      this.loading = false;
      this.toastr.success('Test cases loaded successfully', 'Success');
    }, 1000);
  }

  extractUniqueValues(): void {
    this.uniqueCategories = [...new Set(this.testCases.map(tc => tc.category))];
  }

  applyFilters(): void {
    this.filteredTestCases = this.testCases.filter(testCase => {
      const statusMatch = this.filterStatus === 'all' || testCase.status === this.filterStatus;
      const categoryMatch = this.filterCategory === 'all' || testCase.category === this.filterCategory;
      const priorityMatch = this.filterPriority === 'all' || testCase.priority === this.filterPriority;
      return statusMatch && categoryMatch && priorityMatch;
    });
    this.calculateStats();
  }

  calculateStats(): void {
    const cases = this.filteredTestCases;
    this.stats.total = cases.length;
    this.stats.passed = cases.filter(tc => tc.status === 'Passed').length;
    this.stats.failed = cases.filter(tc => tc.status === 'Failed').length;
    this.stats.pending = cases.filter(tc => tc.status === 'Pending').length;
    this.stats.skipped = cases.filter(tc => tc.status === 'Skipped').length;
    this.stats.passRate = this.stats.total > 0 
      ? Math.round((this.stats.passed / this.stats.total) * 100) 
      : 0;
  }

  reset(): void {
    this.searchForm.reset();
    this.testCases = [];
    this.filteredTestCases = [];
    this.searched = false;
    this.filterStatus = 'all';
    this.filterCategory = 'all';
    this.filterPriority = 'all';
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      pending: 0,
      skipped: 0,
      passRate: 0
    };
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'Passed': 'fa-check-circle',
      'Failed': 'fa-times-circle',
      'Pending': 'fa-clock',
      'Skipped': 'fa-forward'
    };
    return icons[status] || 'fa-question-circle';
  }

  getPriorityIcon(priority: string): string {
    const icons: { [key: string]: string } = {
      'High': 'fa-exclamation-circle',
      'Medium': 'fa-info-circle',
      'Low': 'fa-minus-circle'
    };
    return icons[priority] || 'fa-circle';
  }
}
