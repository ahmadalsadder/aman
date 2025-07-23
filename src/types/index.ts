export type Role = 'admin' | 'auditor' | 'viewer';
export type Module = 'landport' | 'seaport' | 'airport' | 'egate';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  token: string;
  modules: Module[];
}
