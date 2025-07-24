
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
        'airport:transactions:view', 'landport:transactions:view', 'seaport:transactions:view', 'gate-supervisor:transactions:view'
    ]
  },
  { 
    id: '2', 
    name: 'Auditor User', 
    email: 'auditor@example.com', 
    role: 'auditor', 
    token: 'fake-auditor-token', 
    modules: ['landport', 'seaport'],
    permissions: ['records:view', 'reports:view', 'landport:transactions:view', 'seaport:transactions:view']
  },
  { 
    id: '3', 
    name: 'Viewer User', 
    email: 'viewer@example.com', 
    role: 'viewer', 
    token: 'fake-viewer-token', 
    modules: ['airport'],
    permissions: ['records:view'] // This user can view records, but not the transactions page itself
  },
];

    
