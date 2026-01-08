import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ContextLayoutComponent } from './context-layout/context-layout.component';
import { CreateContextComponent } from './create-context/create-context.component';
import { SearchContextComponent } from './search-context/search-context.component';
import { CreateReflectionContextComponent } from './create-reflection-context/create-reflection-context.component';
import { SearchReflectionContextComponent } from './search-reflection-context/search-reflection-context.component';
import { TreeStructureComponent } from './tree-structure/tree-structure.component';
import { TestCasesComponent } from './test-cases/test-cases.component';
import { TestReportsComponent } from './test-reports/test-reports.component';
import { DiagnosisComponent } from './diagnosis/diagnosis.component';

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
        path: 'tree-structure',
        component: TreeStructureComponent
      },
      {
        path: 'test-cases',
        component: TestCasesComponent
      },
      {
        path: 'test-reports',
        component: TestReportsComponent
      },
      {
        path: 'diagnosis',
        component: DiagnosisComponent
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
    SearchReflectionContextComponent,
    TreeStructureComponent,
    TestCasesComponent,
    TestReportsComponent,
    DiagnosisComponent
  ],
  imports: [
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ContextModule { }