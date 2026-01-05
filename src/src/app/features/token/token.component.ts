export * from './token.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.scss']
})
export class TokenComponent {
  token: string = '';
  status: string = '';
  showValue: string = '';

  saveToken() {
    if (this.token.trim()) {
      localStorage.setItem('userToken', this.token);
      this.status = 'Token saved in localStorage.';
      this.showValue = '';
    }
  }

  showToken() {
    const value = localStorage.getItem('userToken');
    this.showValue = value ? value : 'No token found.';
    this.status = '';
  }

  clearToken() {
    localStorage.removeItem('userToken');
    this.status = 'Token cleared from localStorage.';
    this.showValue = '';
    this.token = '';
  }
}
