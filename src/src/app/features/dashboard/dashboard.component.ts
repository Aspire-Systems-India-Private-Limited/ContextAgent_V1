import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

interface StatCard {
  title: string;
  value: string;
  icon: string;
  color: string;
  change?: string;
  trend?: 'up' | 'down';
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isAuthenticated: boolean = false;
  userName: string = '';
  userEmail: string = '';
  loading: boolean = false;

  stats: StatCard[] = [
    {
      title: 'Total Contexts',
      value: '1,247',
      icon: 'database',
      color: '#65336e',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Active Agents',
      value: '34',
      icon: 'robot',
      color: '#2196F3',
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Active Sessions',
      value: '128',
      icon: 'comments',
      color: '#4CAF50',
      change: '-3%',
      trend: 'down'
    },
    {
      title: 'Memory Entries',
      value: '3,456',
      icon: 'brain',
      color: '#FF9800',
      change: '+18%',
      trend: 'up'
    }
  ];

  quickActions = [
    { title: 'Context Management', icon: 'database', route: '/admin/context', color: '#65336e' },
    { title: 'Agent Management', icon: 'robot', route: '/agent-sol', color: '#2196F3' },
    { title: 'Session Management', icon: 'comments', route: '/session', color: '#4CAF50' },
    { title: 'Memory Management', icon: 'brain', route: '/memory', color: '#FF9800' },
    { title: 'Audit Logs', icon: 'clipboard-list', route: '/audit', color: '#FF5722' },
    { title: 'Cost Metrics', icon: 'dollar-sign', route: '/cost-metrics', color: '#10b981' },
    { title: 'Sentiment Analysis', icon: 'chart-line', route: '/sentiment', color: '#8b5cf6' },
    { title: 'RBAC Management', icon: 'user-shield', route: '/rbac', color: '#ef4444' }
  ];

  recentActivities = [
    {
      title: 'New context created',
      description: 'customer-support-greeting',
      time: '5 minutes ago',
      icon: 'plus-circle',
      color: '#65336e'
    },
    {
      title: 'Agent updated',
      description: 'CustomerServiceBot configuration changed',
      time: '23 minutes ago',
      icon: 'robot',
      color: '#2196F3'
    },
    {
      title: 'Session completed',
      description: 'User interaction completed successfully',
      time: '1 hour ago',
      icon: 'check-circle',
      color: '#4CAF50'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.isAuthenticated = !!user;
      this.userName = user?.name || '';
      this.userEmail = user?.email || '';
    });
  }

  onLogin(): void {
    // Simulate login - in real app, this would be a proper auth flow
    const email = prompt('Enter your email:');
    const name = prompt('Enter your name:');
    
    if (email && name) {
      this.authService.login(email, name, 'admin');
      this.toastr.success('Welcome to Agent Operations Platform!', 'Login Successful');
    }
  }

  navigateTo(route: string): void {
    if (this.isAuthenticated || route === '/dashboard') {
      this.router.navigate([route]);
    } else {
      this.toastr.warning('Please login to access this feature', 'Authentication Required');
    }
  }
}