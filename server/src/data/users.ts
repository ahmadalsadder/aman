
import type { User } from '../types';

export const users: User[] = [
  { 
    id: '1', 
    name: 'Admin User', 
    email: 'admin@example.com', 
    role: 'admin', 
    token: 'fake-admin-token', 
    modules: ['dashboard', 'landport', 'seaport', 'airport', 'egate', 'analyst', 'shiftsupervisor', 'control-room', 'users', 'settings'],
    permissions: [
        'records:view', 'records:create', 'records:edit', 'records:delete', 'users:manage', 'reports:view',
        'airport:transactions:view', 'landport:transactions:view', 'seaport:transactions:view',
        'airport:transactions:live', 'landport:transactions:live', 'seaport:transactions:live',
        'airport:dashboard:view', 'airport:dashboard:stats:view', 'airport:dashboard:forecasts:view', 'airport:dashboard:charts:view', 'airport:dashboard:officer-performance:view',
        'landport:dashboard:view', 'landport:dashboard:stats:view', 'landport:dashboard:forecasts:view', 'landport:dashboard:charts:view', 'landport:dashboard:officer-performance:view',
        'seaport:dashboard:view', 'seaport:dashboard:stats:view', 'seaport:dashboard:forecasts:view', 'seaport:dashboard:charts:view', 'seaport:dashboard:officer-performance:view',
        'egate:dashboard:view', 'egate:dashboard:stats:view', 'egate:dashboard:charts:view',
        'analyst:dashboard:view', 'analyst:dashboard:stats:view', 'analyst:dashboard:charts:view',
        'control-room:dashboard:view', 'control-room:dashboard:stats:view', 'control-room:dashboard:forecasts:view', 'control-room:dashboard:charts:view', 'control-room:dashboard:officer-performance:view'
    ]
  },
  { 
    id: '2', 
    name: 'Auditor User', 
    email: 'auditor@example.com', 
    role: 'auditor', 
    token: 'fake-auditor-token', 
    modules: ['landport', 'seaport'],
    permissions: ['records:view', 'reports:view', 'landport:transactions:view', 'seaport:transactions:view', 'landport:dashboard:view', 'seaport:dashboard:view']
  },
  { 
    id: '3', 
    name: 'Viewer User', 
    email: 'viewer@example.com', 
    role: 'viewer', 
    token: 'fake-viewer-token', 
    modules: ['airport'],
    permissions: ['records:view', 'airport:dashboard:view', 'airport:dashboard:stats:view']
  },
  {
    id: '4',
    name: 'Shift Supervisor User',
    email: 'supervisor@example.com',
    role: 'shiftsupervisor',
    token: 'fake-supervisor-token',
    modules: ['airport', 'landport', 'seaport', 'control-room'],
    permissions: [
        'records:view', 'records:edit', 'reports:view', 
        'airport:transactions:view', 'landport:transactions:view', 'seaport:transactions:view', 
        'airport:transactions:live', 'landport:transactions:live', 'seaport:transactions:live',
        'airport:dashboard:view', 'airport:dashboard:stats:view', 'airport:dashboard:forecasts:view', 'airport:dashboard:charts:view', 'airport:dashboard:officer-performance:view',
        'landport:dashboard:view', 'landport:dashboard:stats:view', 'landport:dashboard:forecasts:view', 'landport:dashboard:charts:view', 'landport:dashboard:officer-performance:view',
        'seaport:dashboard:view', 'seaport:dashboard:stats:view', 'seaport:dashboard:forecasts:view', 'seaport:dashboard:charts:view', 'seaport:dashboard:officer-performance:view',
        'control-room:dashboard:view', 'control-room:dashboard:stats:view', 'control-room:dashboard:forecasts:view', 'control-room:dashboard:charts:view', 'control-room:dashboard:officer-performance:view'
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
        'records:view', 'records:create',
        'landport:dashboard:view', 'landport:dashboard:stats:view', 'landport:dashboard:charts:view',
        'landport:transactions:view', 'landport:transactions:live'
    ]
  }
];
