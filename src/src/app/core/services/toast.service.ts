import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  public toasts$ = this.toastSubject.asObservable();

  /**
   * Show a success toast notification
   */
  success(title: string, message?: string, duration: number = 5000): void {
    this.show({
      type: 'success',
      title,
      message,
      duration,
      icon: '✓'
    });
  }

  /**
   * Show an error toast notification
   */
  error(title: string, message?: string, duration: number = 7000): void {
    this.show({
      type: 'error',
      title,
      message,
      duration,
      icon: '✕'
    });
  }

  /**
   * Show a warning toast notification
   */
  warning(title: string, message?: string, duration: number = 6000): void {
    this.show({
      type: 'warning',
      title,
      message,
      duration,
      icon: '⚠'
    });
  }

  /**
   * Show an info toast notification
   */
  info(title: string, message?: string, duration: number = 5000): void {
    this.show({
      type: 'info',
      title,
      message,
      duration,
      icon: 'ℹ'
    });
  }

  /**
   * Show a custom toast notification
   */
  show(toast: Partial<Toast>): void {
    const id = this.generateId();
    const fullToast: Toast = {
      id,
      type: toast.type || 'info',
      title: toast.title || 'Notification',
      message: toast.message,
      duration: toast.duration || 5000,
      icon: toast.icon || 'ℹ'
    };

    this.toastSubject.next(fullToast);
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
