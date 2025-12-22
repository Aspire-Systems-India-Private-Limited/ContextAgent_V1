import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface DashboardCard {
  icon: string;
  title: string;
  description: string;
  actionText: string;
  route: string;
  iconBg: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  dashboardCards: DashboardCard[] = [
    {
      icon: 'fa-cog',
      title: 'Context Management',
      description: 'Create, search, and manage application contexts. Configure source types, intents, and entity mappings.',
      actionText: 'Open Context Admin',
      route: '/context/create',
      iconBg: '#6b4c7a'
    },
    {
      icon: 'fa-user',
      title: 'User Interactions',
      description: 'Monitor and manage user sessions. View session history, active connections, and session data.',
      actionText: 'Open User Interaction',
      route: '/session',
      iconBg: '#6b4c7a'
    },
    {
      icon: 'fa-comments',
      title: 'Memory Management',
      description: 'Add, search, and organize memories. Manage user specific data with metadata tagging and retrieval.',
      actionText: 'Open Memory Portal',
      route: '/memory',
      iconBg: '#6b4c7a'
    },
    {
      icon: 'fa-file-alt',
      title: 'Diagnosis',
      description: 'Review system inference by date. Track changes, monitor activities, and ensure compliance.',
      actionText: 'View Inferences',
      route: '/cost-metrics',
      iconBg: '#6b4c7a'
    }
  ];

  constructor(private router: Router) {}

  navigateToCard(route: string): void {
    this.router.navigate([route]);
  }
}