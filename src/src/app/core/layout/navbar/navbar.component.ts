import { Component } from '@angular/core';
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

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });
  }

  showDropdown(menu: string): void {
    // Clear any pending hide timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    this.activeDropdown = menu;
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