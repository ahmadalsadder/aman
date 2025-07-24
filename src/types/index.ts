
export type Role = 'admin' | 'auditor' | 'viewer' | 'shiftsupervisor';
export type Module = 'landport' | 'seaport' | 'airport' | 'egate' | 'analyst' | 'control-room' | 'gate-supervisor';
export type Permission = 
  | 'records:view'
  | 'records:create'
  | 'records:edit'
  | 'records:delete'
  | 'users:manage'
  | 'reports:view';

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
