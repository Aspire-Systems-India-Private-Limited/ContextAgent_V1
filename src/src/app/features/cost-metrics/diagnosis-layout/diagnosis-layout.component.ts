import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-diagnosis-layout',
  templateUrl: './diagnosis-layout.component.html',
  styleUrls: ['./diagnosis-layout.component.scss']
})
export class DiagnosisLayoutComponent implements OnInit {
  metricsExpanded: boolean = true;  // Open by default like old HTML
  aggregatedCostExpanded: boolean = false;

  ngOnInit(): void {
    // Metrics submenu should be open by default
  }

  toggleMetrics(): void {
    this.metricsExpanded = !this.metricsExpanded;
  }

  toggleAggregatedCost(): void {
    this.aggregatedCostExpanded = !this.aggregatedCostExpanded;
  }
}