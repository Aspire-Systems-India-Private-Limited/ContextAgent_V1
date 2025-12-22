import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { AgentListComponent } from './agent-list.component';

const routes: Routes = [
  {
    path: '',
    component: AgentListComponent
  }
];

@NgModule({
  declarations: [
    AgentListComponent
  ],
  imports: [
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class AgentModule { }