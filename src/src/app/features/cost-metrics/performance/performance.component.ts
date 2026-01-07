import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CostMetricsService, AgentMetric } from '../../../core/services/cost-metrics.service';
import { AgentService, Agent } from '../../../core/services/agent.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.scss']
})
export class PerformanceComponent implements OnInit, AfterViewInit {
  @ViewChild('metricsChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  metricsData: AgentMetric[] = [];
  allRecords: AgentMetric[] = [];
  loading: boolean = false;
  showMetrics: boolean = false;
  chart: Chart | null = null;
  agents: Agent[] = [];
  
  // Intent filter
  uniqueIntents: string[] = [];
  selectedIntent: string = 'all';

  // Search filters (same as Cost metrics)
  agentCode: string = '';
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
    // Don't load data automatically, wait for user to search
    this.loadAgents();
  }

  loadAgents(): void {
    this.agentService.getAllAgents().subscribe({
      next: (agents) => {
        this.agents = agents;
      },
      error: (error) => {
        console.error('Error loading agents:', error);
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

    console.log('🔍 Fetching performance metrics...');
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
      metric_code: 'PERFORMANCE',  // PERFORMANCE instead of COST
      start_time: startTimeISO,
      end_time: endTimeISO
    };

    if (this.minValue !== null) {
      params.min_value = this.minValue;
    }
    if (this.maxValue !== null) {
      params.max_value = this.maxValue;
    }

    console.log('� API params:', params);

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

        // Filter by metric code (PERFORMANCE)
        records = records.filter(r => 
          (r.MetricCode || r.metric_code || '').toLowerCase() === 'performance'
        );
        
        console.log('🎯 After filtering for PERFORMANCE:', records.length, 'records');
        
        this.allRecords = records;
        this.metricsData = records;
        this.loading = false;
        if (records.length > 0) {
          this.toastr.success(`Found ${records.length} performance metrics`, 'Success');
          this.populateIntentFilter(records);
          // Use setTimeout to ensure view is ready
          setTimeout(() => {
            this.renderChart(records);
          }, 0);
        } else {
          this.toastr.info('No performance metrics found for the selected criteria', 'Info');
          this.destroyChart();
        }
      },
      error: (error) => {
        console.error('❌ Error fetching performance metrics:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        this.toastr.error('Failed to fetch performance metrics', 'Error');
        this.loading = false;
        this.metricsData = [];
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
          label: 'Performance (sec)',
          data: values,
          borderColor: '#65336e',
          backgroundColor: (context) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return 'rgba(101, 51, 110, 0.1)';
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, 'rgba(216, 197, 219, 0.1)');
            gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.2)');
            gradient.addColorStop(1, 'rgba(101, 51, 110, 0.3)');
            return gradient;
          },
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: '#65336e',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#d8c5db',
          pointHoverBorderColor: '#65336e',
          pointHoverBorderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: {
                size: 16,
                weight: 700,
                family: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              },
              color: '#c582d1',
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          title: {
            display: true,
            text: `Performance Metrics${this.selectedIntent !== 'all' ? ' - ' + this.selectedIntent : ''}`,
            font: { 
              size: 22, 
              weight: 900,
              family: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            },
            color: '#c582d1',
            padding: {
              top: 16,
              bottom: 24
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(101, 51, 110, 0.95)',
            titleColor: '#fff',
            bodyColor: '#fff',
            titleFont: {
              size: 14,
              weight: 600,
              family: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            },
            bodyFont: {
              size: 13,
              family: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            },
            padding: 12,
            cornerRadius: 8,
            displayColors: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Time (seconds)',
              color: '#c582d1',
              font: {
                size: 16,
                weight: 700,
                family: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }
            },
            ticks: {
              color: '#c582d1',
              font: {
                size: 15,
                weight: 700,
                family: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }
            },
            grid: {
              color: 'rgba(197, 130, 209, 0.12)',
              lineWidth: 2
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date & Time',
              color: '#c582d1',
              font: {
                size: 16,
                weight: 700,
                family: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              color: '#c582d1',
              font: {
                size: 14,
                weight: 700,
                family: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }
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
