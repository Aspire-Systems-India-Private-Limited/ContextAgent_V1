import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/admin',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'agent-sol',
    loadChildren: () => import('./features/agent/agent.module').then(m => m.AgentModule)
  },
  {
    path: 'context',
    loadChildren: () => import('./features/context/context.module').then(m => m.ContextModule)
  },
  {
    path: 'session',
    loadChildren: () => import('./features/session/session.module').then(m => m.SessionModule)
  },
  {
    path: 'sentiment',
    loadChildren: () => import('./features/sentiment/sentiment.module').then(m => m.SentimentModule)
  },
  {
    path: 'memory',
    loadChildren: () => import('./features/memory/memory.module').then(m => m.MemoryModule)
  },
  {
    path: 'cost-metrics',
    loadChildren: () => import('./features/cost-metrics/cost-metrics.module').then(m => m.CostMetricsModule)
  },
  {
    path: 'audit',
    loadChildren: () => import('./features/audit/audit.module').then(m => m.AuditModule)
  },
  {
    path: 'rbac',
    loadChildren: () => import('./features/rbac/rbac.module').then(m => m.RbacModule)
  },
  {
    path: '**',
    redirectTo: '/admin'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
