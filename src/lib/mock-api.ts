import type { User } from '@/types';
import { Result, ApiError } from '@/types/api/result';

const users: User[] = [
  { 
    id: '1', 
    name: 'Admin User', 
    email: 'admin@example.com', 
    role: 'admin', 
    token: 'fake-admin-token', 
    modules: ['dashboard', 'landport', 'seaport', 'airport', 'egate', 'analyst', 'gate-supervisor', 'control-room', 'users', 'settings'],
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

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function mockApi<T>(endpoint: string, options: RequestInit = {}): Promise<Result<T>> {
    await delay(1500); // Simulate network latency

    const { method = 'GET', body } = options;
    const url = new URL(endpoint, 'http://mock.com'); // Base URL doesn't matter, just for parsing

    console.log(`[Mock API] ${method} ${url.pathname}`);

    if (method === 'POST' && url.pathname === '/login') {
        const { email } = JSON.parse(body as string);

        if (!email) {
            return Result.failure([new ApiError('BAD_REQUEST', 'Email and password are required.')]) as Result<T>;
        }

        const user = users.find(user => user.email.toLowerCase().startsWith(email.toLowerCase()));

        if (!user) {
            // Also find by just the name part of the email, e.g. 'admin' for 'admin@example.com'
             const userByName = users.find(u => u.email.toLowerCase().split('@')[0] === email.toLowerCase());
             if (userByName) {
                 return Result.success(userByName) as Result<T>;
             }
            return Result.failure([new ApiError('UNAUTHORIZED', 'Invalid credentials.')]) as Result<T>;
        }
        
        return Result.success(user) as Result<T>;
    }

    if (method === 'GET' && url.pathname === '/dashboard/stats') {
        return Result.success({
            totalAnomalies: 12,
            monitoredEndpoints: 42,
            uptimePercentage: 99.9,
        }) as Result<T>;
    }
    
    if (method === 'GET' && url.pathname === '/dashboard/stats-error') {
        const errorResponse = { "error": "invalid_token", "error_description": "The access token is expired or invalid", "user_id": 12345, "internal_debug_info": "trace_id: xyz-abc-123" };
        return Result.failure([new ApiError("INVALID_TOKEN", JSON.stringify(errorResponse))]) as Result<T>;
    }

    return Result.failure([new ApiError('NOT_FOUND', `Mock endpoint ${method} ${endpoint} not found.`)]) as Result<T>;
}
