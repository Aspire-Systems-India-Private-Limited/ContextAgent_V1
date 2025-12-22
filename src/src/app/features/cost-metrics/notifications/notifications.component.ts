import { Component, OnInit } from '@angular/core';

interface CostNotification {
  agentCode: string;
  userName: string;
  cost: number;
  status: string;
  type: string;
  createdOn: string;
  updatedOn: string;
}

@Component({
  selector: 'app-cost-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  loading: boolean = false;
  notifications: CostNotification[] = [];
  filteredNotifications: CostNotification[] = [];
  uniqueAgents: string[] = [];
  uniqueUsers: string[] = [];
  filterAgent: string = 'all';
  filterUser: string = 'all';

  constructor() {}

  ngOnInit(): void {
    this.loadMockData();
  }

  loadMockData(): void {
    // Mock data matching the screenshot
    this.notifications = [
      {
        agentCode: 'attributeextractor',
        userName: 'krishna.janardhanan@aspiresys.com',
        cost: 5937412,
        status: 'pending',
        type: 'monthly',
        createdOn: '12/5/2025, 5:19:12 PM',
        updatedOn: '12/5/2025, 5:19:13 PM'
      },
      {
        agentCode: 'attributeextractor',
        userName: 'krishna.janardhanan@aspiresys.com',
        cost: 5415072,
        status: 'pending',
        type: 'daily',
        createdOn: '12/5/2025, 5:19:12 PM',
        updatedOn: '12/5/2025, 5:19:13 PM'
      },
      {
        agentCode: 'attributeextractor',
        userName: 'rebiga.rangasamy@aspiresys.com',
        cost: 3000000,
        status: 'completed',
        type: 'daily',
        createdOn: '12/5/2025, 3:25:28 PM',
        updatedOn: '12/5/2025, 9:05:24 PM'
      },
      {
        agentCode: 'attributeextractor',
        userName: 'uthira.gopi@aspiresys.com',
        cost: 10995860,
        status: 'completed',
        type: 'monthly',
        createdOn: '12/5/2025, 12:50:18 PM',
        updatedOn: '12/5/2025, 6:25:09 PM'
      },
      {
        agentCode: 'attributeextractor',
        userName: 'uthira.gopi@aspiresys.com',
        cost: 8071636,
        status: 'completed',
        type: 'daily',
        createdOn: '12/5/2025, 12:47:27 PM',
        updatedOn: '12/5/2025, 6:26:02 PM'
      },
      {
        agentCode: 'attributeextractor',
        userName: 'ameen.khathathir@aspiresys.com',
        cost: 1022233,
        status: 'completed',
        type: 'monthly',
        createdOn: '12/5/2025, 3:19:46 AM',
        updatedOn: '12/5/2025, 8:41:22 AM'
      },
      {
        agentCode: 'attributeextractor',
        userName: 'swetha.selvan@aspiresys.com',
        cost: 1042534,
        status: 'completed',
        type: 'monthly',
        createdOn: '12/3/2025, 7:47:34 AM',
        updatedOn: '12/3/2025, 1:33:33 PM'
      }
    ];

    this.extractUniqueValues();
    this.applyFilters();
  }

  extractUniqueValues(): void {
    this.uniqueAgents = [...new Set(this.notifications.map(n => n.agentCode))];
    this.uniqueUsers = [...new Set(this.notifications.map(n => n.userName))];
  }

  applyFilters(): void {
    this.filteredNotifications = this.notifications.filter(notification => {
      const agentMatch = this.filterAgent === 'all' || notification.agentCode === this.filterAgent;
      const userMatch = this.filterUser === 'all' || notification.userName === this.filterUser;
      return agentMatch && userMatch;
    });
  }
}

