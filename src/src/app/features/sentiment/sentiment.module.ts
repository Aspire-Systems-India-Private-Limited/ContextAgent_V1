import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { SentimentAnalysisComponent } from './sentiment-analysis.component';

const routes: Routes = [
  {
    path: '',
    component: SentimentAnalysisComponent
  }
];

@NgModule({
  declarations: [
    SentimentAnalysisComponent
  ],
  imports: [
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class SentimentModule { }