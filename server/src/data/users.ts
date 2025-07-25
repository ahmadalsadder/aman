
import type { User } from '../types';

export const users: User[] = [
  { 
    id: '1', 
    name: 'Admin User', 
    email: 'admin@example.com', 
    role: 'admin', 
    token: 'fake-admin-token', 
    modules: ['landport', 'seaport', 'airport', 'egate', 'analyst', 'shiftsupervisor', 'control-room', 'users', 'settings', 'duty-manager'],
    permissions: [
        'users:manage', 'reports:view',
        'airport:records:view', 'airport:records:create', 'airport:records:edit', 'airport:records:delete',
        'landport:records:view', 'landport:records:create', 'landport:records:edit', 'landport:records:delete',
        'seaport:records:view', 'seaport:records:create', 'seaport:records:edit', 'seaport:records:delete',
        'egate:records:view', 'egate:records:create', 'egate:records:edit', 'egate:records:delete',
        'airport:transactions:view', 'landport:transactions:view', 'seaport:transactions:view',
        'airport:transactions:live', 'landport:transactions:live', 'seaport:transactions:live',
        'airport:dashboard:view', 'airport:dashboard:stats:view', 'airport:dashboard:officer-performance:view', 'airport:prediction:view',
        'landport:dashboard:view', 'landport:dashboard:stats:view', 'landport:dashboard:charts:view', 'landport:dashboard:officer-performance:view', 'landport:prediction:view',
        'seaport:dashboard:view', 'seaport:dashboard:stats:view', 'seaport:dashboard:charts:view', 'seaport:dashboard:officer-performance:view', 'seaport:prediction:view',
        'egate:dashboard:view', 'egate:dashboard:stats:view', 'egate:dashboard:charts:view', 'egate:prediction:view',
        'analyst:dashboard:view', 'analyst:dashboard:stats:view', 'analyst:dashboard:charts:view',
        'control-room:dashboard:view', 'control-room:dashboard:stats:view', 'control-room:dashboard:forecasts:view', 'control-room:dashboard:charts:view', 'control-room:dashboard:officer-performance:view',
        'airport:desks:view', 'airport:desks:create', 'airport:desks:edit', 'airport:desks:delete',
        'landport:desks:view', 'landport:desks:create', 'landport:desks:edit', 'landport:desks:delete',
        'seaport:desks:view', 'seaport:desks:create', 'seaport:desks:edit', 'seaport:desks:delete',
        'duty-manager:view'
    ]
  },
  { 
    id: '2', 
    name: 'Auditor User', 
    email: 'auditor@example.com', 
    role: 'auditor', 
    token: 'fake-auditor-token', 
    modules: ['landport', 'seaport'],
    permissions: ['reports:view', 'landport:transactions:view', 'seaport:transactions:view', 'landport:dashboard:view', 'seaport:dashboard:view', 'landport:records:view', 'seaport:records:view']
  },
  { 
    id: '3', 
    name: 'Viewer User', 
    email: 'viewer@example.com', 
    role: 'viewer', 
    token: 'fake-viewer-token', 
    modules: ['airport'],
    permissions: ['airport:records:view', 'airport:dashboard:view', 'airport:dashboard:stats:view']
  },
  {
    id: '4',
    name: 'Shift Supervisor User',
    email: 'supervisor@example.com',
    role: 'shiftsupervisor',
    token: 'fake-supervisor-token',
    modules: ['airport', 'landport', 'seaport', 'control-room', 'duty-manager'],
    permissions: [
        'reports:view', 
        'airport:records:view', 'airport:records:edit',
        'landport:records:view', 'landport:records:edit',
        'seaport:records:view', 'seaport:records:edit',
        'airport:transactions:view', 'landport:transactions:view', 'seaport:transactions:view', 
        'airport:transactions:live', 'landport:transactions:live', 'seaport:transactions:live',
        'airport:dashboard:view', 'airport:dashboard:stats:view', 'airport:dashboard:charts:view', 'airport:dashboard:officer-performance:view', 'airport:prediction:view',
        'landport:dashboard:view', 'landport:dashboard:stats:view', 'landport:dashboard:charts:view', 'landport:dashboard:officer-performance:view', 'landport:prediction:view',
        'seaport:dashboard:view', 'seaport:dashboard:stats:view', 'seaport:dashboard:charts:view', 'seaport:dashboard:officer-performance:view', 'seaport:prediction:view',
        'control-room:dashboard:view', 'control-room:dashboard:stats:view', 'control-room:dashboard:forecasts:view', 'control-room:dashboard:charts:view', 'control-room:dashboard:officer-performance:view',
        'duty-manager:view'
    ]
  },
  {
    id: '7',
    name: 'Landport Officer',
    email: 'officer.land@example.com',
    role: 'officer',
    token: 'fake-officer-token',
    modules: ['landport'],
    permissions: [
        'landport:records:view', 'landport:records:create',
        'landport:dashboard:view', 'landport:dashboard:stats:view', 'landport:dashboard:charts:view',
        'landport:transactions:view', 'landport:transactions:live'
    ]
  }
];
