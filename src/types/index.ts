
export type Role = 'admin' | 'auditor' | 'viewer' | 'gate-supervisor';
export type Module = 'landport' | 'seaport' | 'airport' | 'egate' | 'analyst' | 'gate-supervisor' | 'control-room';
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
  email: string;
  role: Role;
  token: string;
  modules: Module[];
  permissions: Permission[];
}
