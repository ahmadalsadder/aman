

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
  | 'page:airport:transactions:view'
  | 'page:landport:transactions:view'
  | 'page:seaport:transactions:view'
  | 'page:gate-supervisor:transactions:view';


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
