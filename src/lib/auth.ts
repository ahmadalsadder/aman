import type { User, Role } from '@/types';

const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin', token: 'fake-admin-token' },
  { id: '2', name: 'Auditor User', email: 'auditor@example.com', role: 'auditor', token: 'fake-auditor-token' },
  { id: '3', name: 'Viewer User', email: 'viewer@example.com', role: 'viewer', token: 'fake-viewer-token' },
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
