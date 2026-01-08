import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ContextService } from '../../../core/services/context.service';

interface TreeNode {
  name: string;
  type: string;
  description?: string;
  expanded?: boolean;
  children?: TreeNode[];
  metadata?: any;
}

@Component({
  selector: 'app-tree-structure',
  templateUrl: './tree-structure.component.html',
  styleUrls: ['./tree-structure.component.scss']
})
export class TreeStructureComponent implements OnInit {
  searchForm!: FormGroup;
  loading: boolean = false;
  searched: boolean = false;
  treeData: TreeNode[] = [];
  selectedNode: TreeNode | null = null;
  expandedNodes: Set<string> = new Set();

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private contextService: ContextService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.searchForm = this.fb.group({
      agentCode: [''],
      versionId: ['']
    });
  }

  search(): void {
    const formValue = this.searchForm.value;
    
    if (!formValue.agentCode) {
      this.toastr.warning('Please enter an Agent Code', 'Warning');
      return;
    }

    this.loading = true;
    this.searched = true;

    // Mock tree structure data
    setTimeout(() => {
      this.treeData = [
        {
          name: 'Root Context',
          type: 'context',
          description: 'Main application context',
          expanded: true,
          children: [
            {
              name: 'Authentication Module',
              type: 'module',
              description: 'Handles user authentication',
              children: [
                {
                  name: 'Login Component',
                  type: 'component',
                  description: 'User login interface'
                },
                {
                  name: 'Auth Service',
                  type: 'service',
                  description: 'Authentication service'
                }
              ]
            },
            {
              name: 'Data Layer',
              type: 'module',
              description: 'Data management layer',
              children: [
                {
                  name: 'API Service',
                  type: 'service',
                  description: 'HTTP API communication'
                },
                {
                  name: 'State Management',
                  type: 'service',
                  description: 'Application state'
                }
              ]
            },
            {
              name: 'UI Components',
              type: 'module',
              description: 'Reusable UI components',
              children: [
                {
                  name: 'Button Component',
                  type: 'component',
                  description: 'Reusable button'
                },
                {
                  name: 'Modal Component',
                  type: 'component',
                  description: 'Modal dialog'
                },
                {
                  name: 'Table Component',
                  type: 'component',
                  description: 'Data table'
                }
              ]
            }
          ]
        }
      ];
      this.loading = false;
      this.toastr.success('Tree structure loaded successfully', 'Success');
    }, 1000);
  }

  toggleNode(node: TreeNode, nodePath: string): void {
    node.expanded = !node.expanded;
    
    if (node.expanded) {
      this.expandedNodes.add(nodePath);
    } else {
      this.expandedNodes.delete(nodePath);
    }
  }

  selectNode(node: TreeNode): void {
    this.selectedNode = node;
  }

  getNodePath(node: TreeNode, index: number, parentPath: string = ''): string {
    return parentPath ? `${parentPath}-${index}` : `${index}`;
  }

  reset(): void {
    this.searchForm.reset();
    this.treeData = [];
    this.selectedNode = null;
    this.searched = false;
    this.expandedNodes.clear();
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'context': 'fa-cube',
      'module': 'fa-folder',
      'component': 'fa-puzzle-piece',
      'service': 'fa-cogs',
      'default': 'fa-file'
    };
    return icons[type] || icons['default'];
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'context': '#8b5cf6',
      'module': '#3b82f6',
      'component': '#10b981',
      'service': '#f59e0b',
      'default': '#6b7280'
    };
    return colors[type] || colors['default'];
  }
}
