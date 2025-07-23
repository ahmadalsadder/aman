export type Role = 'admin' | 'auditor' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  token: string;
}
