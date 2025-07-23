import type { User } from '@/types';

const MOCK_USERS: User[] = [
  { 
    id: '1', 
    name: 'Admin User', 
    email: 'admin@example.com', 
    role: 'admin', 
    token: 'fake-admin-token', 
    modules: ['landport', 'seaport', 'airport', 'egate'],
    permissions: ['records:view', 'records:create', 'records:edit', 'records:delete', 'users:manage', 'reports:view']
  },
  { 
    id: '2', 
    name: 'Auditor User', 
    email: 'auditor@example.com', 
    role: 'auditor', 
    token: 'fake-auditor-token', 
    modules: ['landport', 'seaport'],
    permissions: ['records:view', 'reports:view']
  },
  { 
    id: '3', 
    name: 'Viewer User', 
    email: 'viewer@example.com', 
    role: 'viewer', 
    token: 'fake-viewer-token', 
    modules: ['airport'],
    permissions: ['records:view']
  },
];

export async function mockLogin(email: string, password: string): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.email === email);
      if (user && password === 'password') { // In a real app, never use plain text passwords
        resolve(user);
      } else {
        reject(new Error('Invalid email or password. Hint: use "password" for any user.'));
      }
    }, 1000);
  });
}
