import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { RbacComponent } from './rbac.component';

const routes: Routes = [
  {
    path: '',
    component: RbacComponent
  }
];

@NgModule({
  declarations: [
    RbacComponent
  ],
  imports: [
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class RbacModule { }