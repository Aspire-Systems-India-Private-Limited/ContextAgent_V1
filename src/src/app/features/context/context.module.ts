import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ContextLayoutComponent } from './context-layout/context-layout.component';
import { CreateContextComponent } from './create-context/create-context.component';
import { SearchContextComponent } from './search-context/search-context.component';
import { CreateReflectionContextComponent } from './create-reflection-context/create-reflection-context.component';
import { SearchReflectionContextComponent } from './search-reflection-context/search-reflection-context.component';

const routes: Routes = [
  {
    path: '',
    component: ContextLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'create',
        pathMatch: 'full'
      },
      {
        path: 'create',
        component: CreateContextComponent
      },
      {
        path: 'search',
        component: SearchContextComponent
      },
      {
        path: 'create-reflection',
        component: CreateReflectionContextComponent
      },
      {
        path: 'search-reflection',
        component: SearchReflectionContextComponent
      }
    ]
  }
];

@NgModule({
  declarations: [
    ContextLayoutComponent,
    CreateContextComponent,
    SearchContextComponent,
    CreateReflectionContextComponent,
    SearchReflectionContextComponent
  ],
  imports: [
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ContextModule { }