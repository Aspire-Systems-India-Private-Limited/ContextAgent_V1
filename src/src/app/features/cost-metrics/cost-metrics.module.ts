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
        component: AgentAggregatedComponent  // Aggregated Cost > Agent (aggregated monthly costs)
      },
      {
        path: 'user',
        component: UserCostComponent  // Aggregated Cost > User (monthly user costs)
      },
      {
        path: 'notifications',
        component: NotificationsComponent  // Aggregated Cost > Notifications
      },
      {
        path: 'violations',
        component: ViolationsComponent  // Aggregated Cost > Violations
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
    DiagnosisComponent
  ],
  imports: [
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class CostMetricsModule { }