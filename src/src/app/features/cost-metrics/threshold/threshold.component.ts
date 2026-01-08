import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

interface AgentThreshold {
  agentCode: string;
  userDailyCostLimit: number;
  userMonthlyCostLimit: number;
  agentThreshold: number;
  owner: string;
}

@Component({
  selector: 'app-threshold',
  templateUrl: './threshold.component.html',
  styleUrls: ['./threshold.component.scss']
})
export class ThresholdComponent implements OnInit {
  thresholds: AgentThreshold[] = [];
  filteredThresholds: AgentThreshold[] = [];
  filterAgent: string = 'all';
  filterType: string = 'Agent';
  uniqueAgents: string[] = [];
  loading: boolean = false;
  
  // Edit mode
  editingIndex: number | null = null;
  editForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadThresholds();
    
    // Check if agent parameter passed from violations page
    this.route.queryParams.subscribe(params => {
      if (params['agent']) {
        this.filterAgent = params['agent'];
        this.applyFilters();
      }
    });
  }

  initForm(): void {
    this.editForm = this.fb.group({
      agentCode: ['', Validators.required],
      userDailyCostLimit: [0, [Validators.required, Validators.min(0)]],
      userMonthlyCostLimit: [0, [Validators.required, Validators.min(0)]],
      agentThreshold: [0, [Validators.required, Validators.min(0)]],
      owner: ['', Validators.required]
    });
  }

  loadThresholds(): void {
    this.loading = true;
    
    // Mock data matching the screenshot
    setTimeout(() => {
      this.thresholds = [
        {
          agentCode: 'attributeextractor',
          userDailyCostLimit: 1,
          userMonthlyCostLimit: 10,
          agentThreshold: 101,
          owner: 'krishna.janardhanan@aspiresys.com'
        },
        {
          agentCode: 'catalogueagent',
          userDailyCostLimit: 0.0044,
          userMonthlyCostLimit: 10,
          agentThreshold: 100,
          owner: 'krishna.janardhanan@aspiresys.com'
        },
        {
          agentCode: 'knowledgeganda',
          userDailyCostLimit: 10.3,
          userMonthlyCostLimit: 10.3,
          agentThreshold: 100,
          owner: 'krishna.janardhanan@aspiresys.com'
        },
        {
          agentCode: 'ins_acore130_extractor',
          userDailyCostLimit: 1,
          userMonthlyCostLimit: 20,
          agentThreshold: 200,
          owner: 'krishna.janardhanan@aspiresys.com'
        },
        {
          agentCode: 'violation_identification',
          userDailyCostLimit: 1,
          userMonthlyCostLimit: 10,
          agentThreshold: 200,
          owner: 'krishna.janardhanan@aspiresys.com'
        },
        {
          agentCode: 'default_agent_config',
          userDailyCostLimit: 1,
          userMonthlyCostLimit: 10,
          agentThreshold: 20,
          owner: 'uthira.gopi@aspiresys.com'
        }
      ];

      this.extractUniqueAgents();
      this.applyFilters();
      this.loading = false;
    }, 500);
  }

  extractUniqueAgents(): void {
    this.uniqueAgents = [...new Set(this.thresholds.map(t => t.agentCode))];
  }

  applyFilters(): void {
    this.filteredThresholds = this.thresholds.filter(threshold => {
      return this.filterAgent === 'all' || threshold.agentCode === this.filterAgent;
    });
  }

  editThreshold(index: number): void {
    this.editingIndex = index;
    const threshold = this.filteredThresholds[index];
    this.editForm.patchValue(threshold);
  }

  cancelEdit(): void {
    this.editingIndex = null;
    this.editForm.reset();
  }

  updateThreshold(index: number): void {
    if (this.editForm.valid) {
      const updatedThreshold = this.editForm.value;
      const actualIndex = this.thresholds.findIndex(
        t => t.agentCode === this.filteredThresholds[index].agentCode
      );
      
      if (actualIndex !== -1) {
        this.thresholds[actualIndex] = updatedThreshold;
        this.filteredThresholds[index] = updatedThreshold;
        this.editingIndex = null;
        this.editForm.reset();
        this.toastr.success('Threshold updated successfully', 'Success');
      }
    } else {
      this.toastr.error('Please fill all required fields', 'Error');
    }
  }

  formatCurrency(value: number): string {
    return `${value} $`;
  }
}
