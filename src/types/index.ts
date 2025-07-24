


export type Role = 'admin' | 'auditor' | 'viewer' | 'shiftsupervisor' | 'control-room' | 'analyst' | 'gate-supervisor';
export type Module = 'landport' | 'seaport' | 'airport' | 'egate' | 'analyst' | 'shiftsupervisor' | 'control-room' | 'gate-supervisor';
export type Permission = 
  | 'records:view'
  | 'records:create'
  | 'records:edit'
  | 'records:delete'
  | 'users:manage'
  | 'reports:view'
  // Page-level view permissions
  | 'airport:dashboard:view'
  | 'landport:dashboard:view'
  | 'seaport:dashboard:view'
  | 'egate:dashboard:view'
  | 'analyst:dashboard:view'
  | 'control-room:dashboard:view'
  | 'gate-supervisor:dashboard:view'
  | 'airport:transactions:view'
  | 'landport:transactions:view'
  | 'seaport:transactions:view'
  | 'gate-supervisor:transactions:view'
  // Component-level view permissions
  | 'airport:dashboard:stats:view'
  | 'airport:dashboard:forecasts:view'
  | 'airport:dashboard:charts:view'
  // Action-level permissions
  | 'airport:transactions:live'
  | 'landport:transactions:live'
  | 'seaport:transactions:live'
  | 'gate-supervisor:transactions:live';


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
