import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { Subject, takeUntil } from 'rxjs';

interface ActiveToast extends Toast {
  timeoutId?: any;
  removing?: boolean;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let toast of toasts" 
        [class]="'toast ' + toast.type + (toast.removing ? ' removing' : '')"
        (click)="removeToast(toast.id)"
        role="alert"
        [attr.aria-live]="toast.type === 'error' ? 'assertive' : 'polite'"
      >
        <div class="toast-icon" *ngIf="toast.icon">
          {{ toast.icon }}
        </div>
        
        <div class="toast-content">
          <h4 class="toast-title">{{ toast.title }}</h4>
          <p class="toast-message" *ngIf="toast.message">{{ toast.message }}</p>
        </div>
        
        <button 
          class="toast-close" 
          (click)="removeToast(toast.id); $event.stopPropagation()"
          aria-label="Close notification"
          type="button"
        >
          ×
        </button>
        
        <div class="toast-progress" *ngIf="toast.duration && toast.duration > 0"></div>
      </div>
    </div>
  `,
  styles: []
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ActiveToast[] = [];
  private destroy$ = new Subject<void>();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toasts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(toast => {
        this.addToast(toast);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clear all timeouts
    this.toasts.forEach(toast => {
      if (toast.timeoutId) {
        clearTimeout(toast.timeoutId);
      }
    });
  }

  private addToast(toast: Toast): void {
    const activeToast: ActiveToast = { ...toast };
    
    // Add to the beginning of the array (bottom of the stack visually)
    this.toasts.unshift(activeToast);

    // Auto-remove after duration
    if (toast.duration && toast.duration > 0) {
      activeToast.timeoutId = setTimeout(() => {
        this.removeToast(toast.id);
      }, toast.duration);
    }

    // Limit to 5 toasts maximum
    if (this.toasts.length > 5) {
      const oldestToast = this.toasts[this.toasts.length - 1];
      this.removeToast(oldestToast.id);
    }
  }

  removeToast(id: string): void {
    const toast = this.toasts.find(t => t.id === id);
    if (!toast) return;

    // Clear timeout if exists
    if (toast.timeoutId) {
      clearTimeout(toast.timeoutId);
    }

    // Mark as removing for animation
    toast.removing = true;

    // Remove from array after animation completes
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 300); // Match animation duration
  }
}
