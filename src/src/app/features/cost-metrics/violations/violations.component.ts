import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface CostViolation {
  agent: string;
  cost: number;
  status: string;
  date: string;
  modifiedOn: string | null;
  threshold: number;
}

@Component({
  selector: 'app-cost-violations',
  templateUrl: './violations.component.html',
  styleUrls: ['./violations.component.scss']
})
export class ViolationsComponent implements OnInit {
  loading: boolean = false;
  violations: CostViolation[] = [];
  filteredViolations: CostViolation[] = [];
  uniqueAgents: string[] = [];
  uniqueDates: string[] = [];
  filterAgent: string = 'all';
  filterDate: string = 'all';
  filterStatus: string = 'all';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadMockData();
  }

  loadMockData(): void {
    // Mock data matching the screenshot
    this.violations = [
      {
        agent: 'attributeextractor',
        cost: 12628459,
        status: 'Exceeded',
        date: '2025-12-10',
        modifiedOn: null,
        threshold: 10000000
      },
      {
        agent: 'attributeextractor',
        cost: 1425340,
        status: 'Resolved',
        date: '2025-12-03',
        modifiedOn: '12/3/2025, 8:08:44 AM',
        threshold: 1500000
      }
    ];

    this.extractUniqueValues();
    this.applyFilters();
  }

  extractUniqueValues(): void {
    this.uniqueAgents = [...new Set(this.violations.map(v => v.agent))];
    this.uniqueDates = [...new Set(this.violations.map(v => v.date))];
  }

  applyFilters(): void {
    this.filteredViolations = this.violations.filter(violation => {
      const agentMatch = this.filterAgent === 'all' || violation.agent === this.filterAgent;
      const dateMatch = this.filterDate === 'all' || violation.date === this.filterDate;
      const statusMatch = this.filterStatus === 'all' || violation.status === this.filterStatus;
      return agentMatch && dateMatch && statusMatch;
    });
  }

  navigateToThreshold(agent: string): void {
    // Navigate to threshold management page with agent parameter
    this.router.navigate(['/cost-metrics/threshold'], { 
      queryParams: { agent: agent } 
    });
  }
}

