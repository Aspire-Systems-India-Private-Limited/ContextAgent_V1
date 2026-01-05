import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CostMetricsService, AgentMetric, AggregatedCost } from '../../core/services/cost-metrics.service';
import { AgentService, Agent } from '../../core/services/agent.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

export interface AgentCostData {
  agent: string;
  totalCost: number;
  period: string;
  updatedOn: string;
}

@Component({
  selector: 'app-cost-metrics',
  templateUrl: './cost-metrics.component.html',
  styleUrls: ['./cost-metrics.component.scss']
})
export class CostMetricsComponent implements OnInit, AfterViewInit {
  @ViewChild('metricsChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  metricsData: AgentMetric[] = [];
  allRecords: AgentMetric[] = [];
  loading: boolean = false;
  showMetrics: boolean = false;
  chart: Chart | null = null;
  
  // Intent filter
  uniqueIntents: string[] = [];
  selectedIntent: string = 'all';

  // Search filters
  agents: Agent[] = [];
  agentCode: string = '';
  metricCode: string = 'COST';
  startTime: string = '';
  endTime: string = '';
  minValue: number | null = null;
  maxValue: number | null = null;

  constructor(
    private toastr: ToastrService,
    private costMetricsService: CostMetricsService,
    private agentService: AgentService
  ) {}

  ngOnInit(): void {
    this.loadAgents();
  }

  loadAgents(): void {
    this.agentService.getAllAgents().subscribe({
      next: (agents: Agent[]) => {
        this.agents = agents;
        console.log('✅ Loaded agents:', agents.length);
      },
      error: (error) => {
        console.error('❌ Error loading agents:', error);
        // Silently fail - user can still type agent code manually
      }
    });
  }

  fetchMetrics(): void {
    if (!this.agentCode || !this.startTime || !this.endTime) {
      this.toastr.warning('Please fill in Agent Code, Start Time, and End Time', 'Validation Error');
      return;
    }

    this.loading = true;
    this.showMetrics = true;

    console.log('🔍 Fetching cost metrics...');
    console.log('Agent Code:', this.agentCode);
    console.log('Start Time (raw):', this.startTime);
    console.log('End Time (raw):', this.endTime);

    // Convert datetime-local to ISO format
    const startTimeISO = new Date(this.startTime).toISOString();
    const endTimeISO = new Date(this.endTime).toISOString();

    console.log('Start Time (ISO):', startTimeISO);
    console.log('End Time (ISO):', endTimeISO);

    const params: any = {
      agent_code: this.agentCode,
      metric_code: this.metricCode,
      start_time: startTimeISO,
      end_time: endTimeISO
    };

    if (this.minValue !== null) {
      params.min_value = this.minValue;
    }
    if (this.maxValue !== null) {
      params.max_value = this.maxValue;
    }

    console.log('📤 API params:', params);

    this.costMetricsService.getAgentMetrics(params).subscribe({
      next: (data: any) => {
        console.log('✅ Raw API response:', data);
        console.log('📊 Response type:', typeof data, Array.isArray(data));
        
        // Extract records - API returns array with Metrics inside first element
        let records: AgentMetric[] = [];
        if (Array.isArray(data) && data.length > 0 && data[0].Metrics) {
          records = data[0].Metrics;
          console.log('📦 Extracted from data[0].Metrics:', records.length, 'records');
        } else if (Array.isArray(data)) {
          records = data;
          console.log('� Using data directly:', records.length, 'records');
        }

        // Filter by metric code (COST)
        records = records.filter(r => 
          (r.MetricCode || r.metric_code || '').toLowerCase() === 'cost'
        );
        
        console.log('🎯 After filtering for COST:', records.length, 'records');
        
        this.allRecords = records;
        this.metricsData = records;
        this.loading = false;
        
        if (records.length > 0) {
          this.toastr.success(`Found ${records.length} cost metrics`, 'Success');
          this.populateIntentFilter(records);
          // Use setTimeout to ensure view is ready
          setTimeout(() => {
            this.renderChart(records);
          }, 0);
        } else {
          this.toastr.info('No cost metrics found for the selected criteria', 'Info');
          this.destroyChart();
        }
      },
      error: (error) => {
        console.error('❌ Error fetching metrics:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error details:', error);
        this.toastr.error('Failed to fetch metrics. Check console for details.', 'Error');
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    // Chart canvas is now available
  }

  populateIntentFilter(records: AgentMetric[]): void {
    // Normalize IntentCode - treat empty/missing as 'agent'
    const normalizedRecords = records.map(r => ({
      ...r,
      IntentCode: (!r.IntentCode || r.IntentCode.trim() === '') ? 'agent' : r.IntentCode
    }));

    // Get unique intents
    const intents = new Set(normalizedRecords.map(r => r.IntentCode || 'agent'));
    this.uniqueIntents = ['all', ...Array.from(intents).sort()];
    
    // Default to 'all' intents
    this.selectedIntent = 'all';
    
    console.log('📋 Unique intents:', this.uniqueIntents);
    console.log('🎯 Default selected: All Intents');
  }

  onIntentFilterChange(): void {
    console.log('🔍 Intent filter changed to:', this.selectedIntent);
    this.renderChart(this.allRecords);
  }

  renderChart(records: AgentMetric[]): void {
    console.log('📊 renderChart called with', records?.length, 'records');
    console.log('📊 chartCanvas available:', !!this.chartCanvas);
    
    if (!this.chartCanvas) {
      console.log('⚠️ Chart canvas not available yet');
      return;
    }
    
    if (!records || records.length === 0) {
      console.log('⚠️ No records to render');
      return;
    }

    // Normalize IntentCode
    const normalizedRecords = records.map(r => ({
      ...r,
      IntentCode: (!r.IntentCode || r.IntentCode.trim() === '') ? 'agent' : r.IntentCode
    }));

    // Filter by selected intent
    const filteredRecords = this.selectedIntent === 'all'
      ? normalizedRecords
      : normalizedRecords.filter(r => r.IntentCode === this.selectedIntent);

    if (filteredRecords.length === 0) {
      console.log('⚠️ No records after intent filter');
      this.destroyChart();
      return;
    }

    // Sort by DateTime
    const sortedRecords = [...filteredRecords].sort((a, b) => {
      const dateA = new Date(a.DateTime || '').getTime();
      const dateB = new Date(b.DateTime || '').getTime();
      return dateA - dateB;
    });

    // Prepare chart data
    const labels = sortedRecords.map(r => {
      const date = new Date(r.DateTime || '');
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    const values = sortedRecords.map(r => parseFloat(String(r.MetricValue || r.metric_value || 0)));

    // Destroy existing chart
    this.destroyChart();

    // Create new chart
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Cost ($)',
          data: values,
          borderColor: '#65336e',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#65336e',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: `Cost Metrics${this.selectedIntent !== 'all' ? ' - ' + this.selectedIntent : ''}`,
            font: { size: 16, weight: 'bold' },
            color: '#65336e'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cost ($)',
              color: '#666'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date & Time',
              color: '#666'
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45
            },
            grid: {
              display: false
            }
          }
        }
      }
    });

    console.log('📊 Chart rendered with', sortedRecords.length, 'data points');
  }

  destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
      console.log('🗑️ Chart destroyed');
    }
  }
}
