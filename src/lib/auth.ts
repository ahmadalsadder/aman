import type { User } from '@/types';
import { Result } from '@/types/api/result';
import { api } from './api';

export async function mockLogin(email: string, password: string): Promise<User> {
  const result: Result<User> = await api.post('/login', { email, password });

  if (result.isSuccess && result.data) {
    return result.data;
  } else {
    const errorMessage = result.errors?.[0]?.message || 'An unknown error occurred.';
    throw new Error(errorMessage);
  }
}
