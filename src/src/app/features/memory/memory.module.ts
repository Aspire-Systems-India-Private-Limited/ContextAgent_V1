import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { MemoryLayoutComponent } from './memory-layout/memory-layout.component';
import { CreateMemoryComponent } from './create-memory/create-memory.component';
import { SearchMemoryComponent } from './search-memory/search-memory.component';

const routes: Routes = [
  {
    path: '',
    component: MemoryLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'create',
        pathMatch: 'full'
      },
      {
        path: 'create',
        component: CreateMemoryComponent
      },
      {
        path: 'search',
        component: SearchMemoryComponent
      }
    ]
  }
];

@NgModule({
  declarations: [
    MemoryLayoutComponent,
    CreateMemoryComponent,
    SearchMemoryComponent
  ],
  imports: [
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class MemoryModule { }