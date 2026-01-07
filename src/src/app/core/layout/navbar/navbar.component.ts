import { Component, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  activeDropdown: string | null = null;
  currentRoute: string = '';
  private hideTimeout: any;
  dropdownPosition: { top: number; left: number } = { top: 0, left: 0 };

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
        // Close any open dropdown when navigating
        this.activeDropdown = null;
      });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-dropdown')) {
      this.activeDropdown = null;
    }
  }

  showDropdown(menu: string, event?: any): void {
    // Clear any pending hide timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    
    if (event) {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      this.dropdownPosition = {
        top: rect.bottom,
        left: rect.left
      };
    }
    
    this.activeDropdown = menu;
  }

  toggleDropdown(menu: string, event?: any): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      
      const target = event.currentTarget as HTMLElement;
      const parent = target.closest('.nav-dropdown') as HTMLElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        this.dropdownPosition = {
          top: rect.bottom,
          left: rect.left
        };
      }
    }
    // Clear any pending hide timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    this.activeDropdown = this.activeDropdown === menu ? null : menu;
  }

  hideDropdown(menu: string): void {
    // Add a longer delay to make it more user-friendly
    this.hideTimeout = setTimeout(() => {
      if (this.activeDropdown === menu) {
        this.activeDropdown = null;
      }
    }, 300);
  }

  isActive(route: string): boolean {
    return this.currentRoute === route || this.currentRoute.startsWith(route + '/');
  }

  isContextActive(): boolean {
    return this.currentRoute.includes('/context');
  }

  isInteractionActive(): boolean {
    return this.currentRoute.includes('/session') || this.currentRoute.includes('/sentiment');
  }

  isMemoryActive(): boolean {
    return this.currentRoute.includes('/memory');
  }

  isDiagnosisActive(): boolean {
    return this.currentRoute.includes('/cost-metrics') || this.currentRoute.includes('/audit');
  }
}