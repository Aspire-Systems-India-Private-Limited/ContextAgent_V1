import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { SessionListComponent } from './session-list.component';

const routes: Routes = [
  {
    path: '',
    component: SessionListComponent
  }
];

@NgModule({
  declarations: [
    SessionListComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class SessionModule { }
