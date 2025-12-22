import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { AdminComponent } from './admin.component';
import { ContextListComponent } from './components/context-list/context-list.component';
import { ContextFormComponent } from './components/context-form/context-form.component';
import { ContextDetailComponent } from './components/context-detail/context-detail.component';
import { ContextManagementComponent } from './components/context-management/context-management.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent
  },
  {
    path: 'context',
    component: ContextManagementComponent
  },
  {
    path: 'create',
    component: ContextFormComponent
  },
  {
    path: 'edit/:id',
    component: ContextFormComponent
  },
  {
    path: 'detail/:id',
    component: ContextDetailComponent
  }
];

@NgModule({
  declarations: [
    AdminComponent,
    ContextListComponent,
    ContextFormComponent,
    ContextDetailComponent,
    ContextManagementComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminModule { }