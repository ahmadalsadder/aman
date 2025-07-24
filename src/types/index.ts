

export type Role = 'admin' | 'auditor' | 'viewer' | 'shiftsupervisor' | 'control-room' | 'analyst' | 'officer';
export type Module = 'landport' | 'seaport' | 'airport' | 'egate' | 'analyst' | 'shiftsupervisor' | 'control-room';
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
  | 'airport:transactions:view'
  | 'landport:transactions:view'
  | 'seaport:transactions:view'
  // Component-level view permissions
  | 'airport:dashboard:stats:view'
  | 'airport:dashboard:forecasts:view'
  | 'airport:dashboard:charts:view'
  | 'airport:dashboard:officer-performance:view'
  | 'landport:dashboard:stats:view'
  | 'landport:dashboard:forecasts:view'
  | 'landport:dashboard:charts:view'
  | 'landport:dashboard:officer-performance:view'
  | 'seaport:dashboard:stats:view'
  | 'seaport:dashboard:forecasts:view'
  | 'seaport:dashboard:charts:view'
  | 'seaport:dashboard:officer-performance:view'
  | 'egate:dashboard:stats:view'
  | 'egate:dashboard:charts:view'
  | 'analyst:dashboard:stats:view'
  | 'analyst:dashboard:charts:view'
  | 'control-room:dashboard:stats:view'
  | 'control-room:dashboard:forecasts:view'
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
