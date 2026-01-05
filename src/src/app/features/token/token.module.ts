import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenComponent } from './token.component';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: '', component: TokenComponent }
];

@NgModule({
  declarations: [TokenComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule.forChild(routes)]
})
export class TokenModule {}
