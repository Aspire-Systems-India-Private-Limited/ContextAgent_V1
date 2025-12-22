import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

export interface User {
  id?: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  lastLogin?: Date;
}

export interface Role {
  id?: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  userCount: number;
  permissions?: string[];
  isSystem?: boolean;
}

export interface PermissionModule {
  key: string;
  name: string;
  icon: string;
  actions: string[];
}

@Component({
  selector: 'app-rbac',
  templateUrl: './rbac.component.html',
  styleUrls: ['./rbac.component.scss']
})
export class RbacComponent implements OnInit {
  activeTab: 'users' | 'roles' | 'permissions' = 'users';
  users: User[] = [];
  roles: Role[] = [];
  permissionModules: PermissionModule[] = [];
  loading: boolean = false;
  saving: boolean = false;

  showUserModal: boolean = false;
  showRoleModal: boolean = false;
  userForm!: FormGroup;
  roleForm!: FormGroup;
  editingUser: User | null = null;
  editingRole: Role | null = null;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadData();
  }

  initForms(): void {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', Validators.required],
      role: ['', Validators.required],
      password: [''],
      isActive: [true]
    });

    this.roleForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      icon: ['user'],
      color: ['#8b5cf6']
    });
  }

  loadData(): void {
    this.loading = true;
    setTimeout(() => {
      this.users = this.getMockUsers();
      this.roles = this.getMockRoles();
      this.permissionModules = this.getMockPermissionModules();
      this.loading = false;
    }, 500);
  }

  setActiveTab(tab: 'users' | 'roles' | 'permissions'): void {
    this.activeTab = tab;
  }

  // User Management
  openAddUserModal(): void {
    this.editingUser = null;
    this.userForm.reset({ isActive: true });
    this.userForm.get('password')?.setValidators([Validators.required]);
    this.showUserModal = true;
  }

  editUser(user: User): void {
    this.editingUser = user;
    this.userForm.patchValue(user);
    this.userForm.get('password')?.clearValidators();
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.editingUser = null;
    this.userForm.reset();
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.saving = true;
    setTimeout(() => {
      if (this.editingUser) {
        this.toastr.success('User updated successfully', 'Success');
      } else {
        this.toastr.success('User created successfully', 'Success');
      }
      this.loadData();
      this.closeUserModal();
      this.saving = false;
    }, 500);
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      this.toastr.success('User deleted successfully', 'Success');
      this.loadData();
    }
  }

  // Role Management
  openAddRoleModal(): void {
    this.editingRole = null;
    this.roleForm.reset({ icon: 'user', color: '#8b5cf6' });
    this.showRoleModal = true;
  }

  editRole(role: Role): void {
    this.editingRole = role;
    this.roleForm.patchValue(role);
    this.showRoleModal = true;
  }

  closeRoleModal(): void {
    this.showRoleModal = false;
    this.editingRole = null;
    this.roleForm.reset();
  }

  saveRole(): void {
    if (this.roleForm.invalid) {
      Object.keys(this.roleForm.controls).forEach(key => {
        this.roleForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.saving = true;
    setTimeout(() => {
      if (this.editingRole) {
        this.toastr.success('Role updated successfully', 'Success');
      } else {
        this.toastr.success('Role created successfully', 'Success');
      }
      this.loadData();
      this.closeRoleModal();
      this.saving = false;
    }, 500);
  }

  deleteRole(role: Role): void {
    if (confirm(`Are you sure you want to delete role "${role.name}"?`)) {
      this.toastr.success('Role deleted successfully', 'Success');
      this.loadData();
    }
  }

  // Permissions
  hasPermission(role: Role, module: string, action: string): boolean {
    const permissionKey = `${module}:${action}`;
    return role.permissions?.includes(permissionKey) || false;
  }

  togglePermission(role: Role, module: string, action: string): void {
    const permissionKey = `${module}:${action}`;
    this.toastr.success(`Permission ${permissionKey} toggled for ${role.name}`, 'Success');
  }

  // Mock Data
  getMockUsers(): User[] {
    return [
      {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        fullName: 'System Administrator',
        role: 'Admin',
        isActive: true,
        lastLogin: new Date('2024-12-10T10:30:00')
      },
      {
        id: '2',
        username: 'jdoe',
        email: 'john.doe@example.com',
        fullName: 'John Doe',
        role: 'Manager',
        isActive: true,
        lastLogin: new Date('2024-12-09T15:45:00')
      },
      {
        id: '3',
        username: 'asmith',
        email: 'alice.smith@example.com',
        fullName: 'Alice Smith',
        role: 'Developer',
        isActive: true,
        lastLogin: new Date('2024-12-10T09:20:00')
      },
      {
        id: '4',
        username: 'bwilson',
        email: 'bob.wilson@example.com',
        fullName: 'Bob Wilson',
        role: 'Developer',
        isActive: false,
        lastLogin: new Date('2024-11-28T14:10:00')
      },
      {
        id: '5',
        username: 'mjohnson',
        email: 'mary.johnson@example.com',
        fullName: 'Mary Johnson',
        role: 'Viewer',
        isActive: true,
        lastLogin: new Date('2024-12-10T08:00:00')
      }
    ];
  }

  getMockRoles(): Role[] {
    return [
      {
        id: '1',
        name: 'Admin',
        description: 'Full system access with all permissions',
        icon: 'user-shield',
        color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        userCount: 1,
        isSystem: true,
        permissions: ['context:create', 'context:read', 'context:update', 'context:delete', 
                     'agent:create', 'agent:read', 'agent:update', 'agent:delete',
                     'session:read', 'session:delete', 'memory:create', 'memory:read', 'memory:update', 'memory:delete',
                     'audit:read', 'rbac:create', 'rbac:read', 'rbac:update', 'rbac:delete']
      },
      {
        id: '2',
        name: 'Manager',
        description: 'Manage agents and contexts with limited admin access',
        icon: 'user-tie',
        color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        userCount: 1,
        permissions: ['context:create', 'context:read', 'context:update', 
                     'agent:create', 'agent:read', 'agent:update',
                     'session:read', 'memory:read', 'audit:read']
      },
      {
        id: '3',
        name: 'Developer',
        description: 'Create and manage contexts and agents',
        icon: 'code',
        color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        userCount: 2,
        permissions: ['context:create', 'context:read', 'context:update',
                     'agent:read', 'session:read', 'memory:create', 'memory:read']
      },
      {
        id: '4',
        name: 'Viewer',
        description: 'Read-only access to all modules',
        icon: 'eye',
        color: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
        userCount: 1,
        permissions: ['context:read', 'agent:read', 'session:read', 'memory:read', 'audit:read']
      }
    ];
  }

  getMockPermissionModules(): PermissionModule[] {
    return [
      {
        key: 'context',
        name: 'Context Management',
        icon: 'database',
        actions: ['create', 'read', 'update', 'delete']
      },
      {
        key: 'agent',
        name: 'Agent Management',
        icon: 'robot',
        actions: ['create', 'read', 'update', 'delete']
      },
      {
        key: 'session',
        name: 'Session Management',
        icon: 'comments',
        actions: ['read', 'delete']
      },
      {
        key: 'memory',
        name: 'Memory Management',
        icon: 'brain',
        actions: ['create', 'read', 'update', 'delete']
      },
      {
        key: 'audit',
        name: 'Audit Logs',
        icon: 'clipboard-list',
        actions: ['read']
      },
      {
        key: 'rbac',
        name: 'RBAC Management',
        icon: 'user-shield',
        actions: ['create', 'read', 'update', 'delete']
      }
    ];
  }
}
