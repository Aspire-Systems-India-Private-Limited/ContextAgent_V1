import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { DiagnosisLayoutComponent } from './diagnosis-layout/diagnosis-layout.component';
import { CostMetricsComponent } from './cost-metrics.component';
import { AgentAggregatedComponent } from './agent-aggregated/agent-aggregated.component';
import { UserCostComponent } from './user-cost/user-cost.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ViolationsComponent } from './violations/violations.component';
import { PerformanceComponent } from './performance/performance.component';
import { DiagnosisComponent } from './diagnosis/diagnosis.component';
import { ThresholdComponent } from './threshold/threshold.component';

const routes: Routes = [
  {
    path: '',
    component: DiagnosisLayoutComponent,
    children: [
      {
        path: '',
        component: CostMetricsComponent  // Metrics > Cost (individual cost metrics)
      },
      {
        path: 'agent',
        component: AgentAggregatedComponent  // Cost Governance > Agent (aggregated monthly costs)
      },
      {
        path: 'user',
        component: UserCostComponent  // Cost Governance > User (monthly user costs)
      },
      {
        path: 'notifications',
        component: NotificationsComponent  // Cost Governance > Notifications
      },
      {
        path: 'violations',
        component: ViolationsComponent  // Cost Governance > Violations
      },
      {
        path: 'threshold',
        component: ThresholdComponent  // Cost Governance > Threshold
      },
      {
        path: 'performance',
        component: PerformanceComponent  // Metrics > Performance
      },
      {
        path: 'diagnosis',
        component: DiagnosisComponent  // Diagnosis
      }
    ]
  }
];

@NgModule({
  declarations: [
    DiagnosisLayoutComponent,
    CostMetricsComponent,
    AgentAggregatedComponent,
    UserCostComponent,
    NotificationsComponent,
    ViolationsComponent,
    PerformanceComponent,
    DiagnosisComponent,
    ThresholdComponent
  ],
  imports: [
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class CostMetricsModule { }