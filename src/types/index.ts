


export type Role = 'admin' | 'auditor' | 'viewer' | 'shiftsupervisor' | 'control-room' | 'analyst' | 'officer';
export type Module = 'landport' | 'seaport' | 'airport' | 'egate' | 'analyst' | 'shiftsupervisor' | 'control-room' | 'duty-manager';
export type Permission = 
  // Module-specific record permissions
  | 'airport:records:view' | 'airport:records:create' | 'airport:records:edit' | 'airport:records:delete'
  | 'landport:records:view' | 'landport:records:create' | 'landport:records:edit' | 'landport:records:delete'
  | 'seaport:records:view' | 'seaport:records:create' | 'seaport:records:edit' | 'seaport:records:delete'
  | 'egate:records:view' | 'egate:records:create' | 'egate:records:edit' | 'egate:records:delete'
  | 'analyst:records:view' | 'analyst:records:create' | 'analyst:records:edit' | 'analyst:records:delete'
  | 'control-room:records:view' | 'control-room:records:create' | 'control-room:records:edit' | 'control-room:records:delete'
  // Desk configuration permissions
  | 'airport:desks:view' | 'airport:desks:create' | 'airport:desks:edit' | 'airport:desks:delete'
  | 'landport:desks:view' | 'landport:desks:create' | 'landport:desks:edit' | 'landport:desks:delete'
  | 'seaport:desks:view' | 'seaport:desks:create' | 'seaport:desks:edit' | 'seaport:desks:delete'
  // Other permissions
  | 'users:manage'
  | 'reports:view'
  | 'duty-manager:view'
  // Page-level view permissions
  | 'airport:dashboard:view'
  | 'landport:dashboard:view'
  | 'seaport:dashboard:view'
  | 'egate:dashboard:view'
  | 'analyst:dashboard:view'
  | 'control-room:dashboard:view'
  | 'airport:transactions:view'
  | 'landport:transactions:view'
  | 'seaport:transactions:view'
  | 'airport:prediction:view'
  | 'landport:prediction:view'
  | 'seaport:prediction:view'
  | 'egate:prediction:view'
  // Component-level view permissions
  | 'airport:dashboard:stats:view'
  | 'airport:dashboard:charts:view'
  | 'airport:dashboard:officer-performance:view'
  | 'landport:dashboard:stats:view'
  | 'landport:dashboard:charts:view'
  | 'landport:dashboard:officer-performance:view'
  | 'seaport:dashboard:stats:view'
  | 'seaport:dashboard:charts:view'
  | 'seaport:dashboard:officer-performance:view'
  | 'egate:dashboard:stats:view'
  | 'egate:dashboard:charts:view'
  | 'analyst:dashboard:stats:view'
  | 'analyst:dashboard:charts:view'
  | 'control-room:dashboard:stats:view'
  | 'control-room:dashboard:charts:view'
  | 'control-room:dashboard:officer-performance:view'
  // Action-level permissions
  | 'airport:transactions:live'
  | 'landport:transactions:live'
  | 'seaport:transactions:live';


export interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  role: Role;
  token: string;
  modules: Module[];
  permissions: Permission[];
}
