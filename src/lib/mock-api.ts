
import type { User } from '@/types';
import { Result, ApiError } from '@/types/api/result';

const users: User[] = [
  { 
    id: '1', 
    name: 'Admin User', 
    email: 'admin@example.com', 
    role: 'admin', 
    token: 'fake-admin-token', 
    modules: ['dashboard', 'landport', 'seaport', 'airport', 'egate', 'analyst', 'shiftsupervisor', 'control-room', 'users', 'settings'],
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
  {
    id: '4',
    name: 'Shift Supervisor User',
    email: 'supervisor@example.com',
    role: 'shiftsupervisor',
    token: 'fake-supervisor-token',
    modules: ['airport', 'landport', 'seaport', 'control-room'],
    permissions: ['records:view', 'records:edit', 'reports:view']
  }
];


// Mock data for the main dashboard
const mainDashboardData = {
    throughput: [
        { name: '00:00', transactions: 110 },
        { name: '02:00', transactions: 180 },
        { name: '04:00', transactions: 250 },
        { name: '06:00', transactions: 450 },
        { name: '08:00', transactions: 730 },
        { name: '10:00', transactions: 890 },
        { name: '12:00', transactions: 820 },
        { name: '14:00', transactions: 950 },
        { name: '16:00', transactions: 1120 },
        { name: '18:00', transactions: 980 },
        { name: '20:00', transactions: 750 },
        { name: '22:00', transactions: 350 },
    ],
    riskRules: [
        { name: 'Watchlist Match', value: 12 },
        { name: 'Irregular Travel Pattern', value: 8 },
        { name: 'Expired Document', value: 5 },
        { name: 'Invalid Visa', value: 3 },
        { name: 'Baggage Anomaly', value: 2 },
    ],
    nationalityDistribution: {
        'USA': 1250,
        'IND': 980,
        'CHN': 750,
        'GBR': 680,
        'DEU': 550,
        'FRA': 490,
        'CAN': 450,
        'AUS': 380,
        'JPN': 320,
        'BRA': 280,
    },
    avgProcessingTime: {
        airport: '2.5m',
        seaport: '12.5m',
        landport: '3.1m',
        egate: '1.2m',
        analyst: '1.2m',
        'shiftsupervisor': '1.2m',
        'control-room': '1.2m',
    }
};

// Mock data for the airport-specific dashboard
const airportDashboardData = {
    ageDistribution: [
        { name: '0-17', value: 1254 },
        { name: '18-24', value: 2341 },
        { name: '25-34', value: 3123 },
        { name: '35-44', value: 2876 },
        { name: '45-59', value: 1987 },
        { name: '60+', value: 872 },
    ],
    nationalityDistribution: [
        { name: 'USA', value: 1021 },
        { name: 'UK', value: 843 },
        { name: 'India', value: 765 },
        { name: 'Germany', value: 654 },
        { name: 'China', value: 543 },
        { name: 'Canada', value: 432 },
        { name: 'Australia', value: 321 },
        { name: 'France', value: 210 },
        { name: 'UAE', value: 198 },
        { name: 'Nigeria', value: 154 },
    ]
};

const passengerData = {
    airport: [
        { type: 'Business', count: 4500 },
        { type: 'Tourist', count: 6200 },
        { type: 'Family', count: 1753 },
    ],
    seaport: [
        { type: 'Cruise', count: 2100 },
        { type: 'Ferry', count: 3400 },
        { type: 'Cargo Crew', count: 800 },
    ],
    landport: [
        { type: 'Commuter', count: 5600 },
        { type: 'Tourist', count: 1200 },
        { type: 'Commercial', count: 323 },
    ],
};

const transactionOverviewData = [
    { name: 'Day 1', entry: 4210, exit: 2390 },
    { name: 'Day 2', entry: 3800, exit: 2100 },
    { name: 'Day 3', entry: 4500, exit: 2500 },
    { name: 'Day 4', entry: 4890, exit: 2800 },
    { name: 'Day 5', entry: 5100, exit: 2900 },
    { name: 'Day 6', entry: 5300, exit: 3100 },
    { name: 'Day 7', entry: 5520, exit: 3300 },
];

const forecastData = {
  airport: {
    current: {
      title: "Current Shift Forecast",
      description: "Expected passenger traffic and resource allocation for the current shift (08:00 - 16:00).",
      recommendedStaff: 45,
      items: [
        { label: "Expected Passengers", value: "6,200", trend: { direction: 'up', percentage: 5, text: 'vs last shift' } },
        { label: "Peak Hours", value: "10:00 - 12:00", trend: { direction: 'up', text: 'High Traffic' } },
      ],
    },
    next: {
      title: "Next Shift Forecast",
      description: "Expected passenger traffic and resource allocation for the next shift (16:00 - 00:00).",
      recommendedStaff: 38,
      items: [
        { label: "Expected Passengers", value: "4,800", trend: { direction: 'down', percentage: 12, text: 'vs current shift' } },
        { label: "Peak Hours", value: "18:00 - 20:00", trend: { direction: 'same', text: 'Medium Traffic' } },
      ],
    },
  },
  landport: {
    current: {
        title: "Current Shift Forecast",
        description: "Expected vehicle and traveler traffic for the current shift (07:00 - 15:00).",
        recommendedStaff: 12,
        items: [
          { label: "Expected Vehicles", value: "2,100", trend: { direction: 'down', percentage: 3, text: 'vs last shift' } },
          { label: "Peak Hours", value: "08:00 - 10:00", trend: { direction: 'same', text: 'Medium Traffic' } },
        ],
    },
    next: {
        title: "Next Shift Forecast",
        description: "Expected vehicle and traveler traffic for the next shift (15:00 - 23:00).",
        recommendedStaff: 15,
        items: [
          { label: "Expected Vehicles", value: "2,500", trend: { direction: 'up', percentage: 8, text: 'vs current shift' } },
          { label: "Peak Hours", value: "17:00 - 19:00", trend: { direction: 'up', text: 'High Traffic' } },
        ],
    }
  },
  seaport: {
      current: {
          title: "Current Shift Forecast",
          description: "Expected vessel arrivals and container traffic for the current shift (06:00 - 18:00).",
          recommendedStaff: 25,
          items: [
            { label: "Expected Vessel Arrivals", value: "4", trend: { direction: 'same', text: 'Normal' } },
            { label: "Expected Passengers", value: "850", trend: { direction: 'up', percentage: 10, text: 'vs last shift' } },
            { label: "Peak Activity", value: "10:00 - 14:00", trend: { direction: 'up', text: 'High Congestion' } },
          ],
      },
      next: {
          title: "Next Shift Forecast",
          description: "Expected vessel arrivals and container traffic for the next shift (18:00 - 06:00).",
          recommendedStaff: 18,
          items: [
            { label: "Expected Vessel Arrivals", value: "2", trend: { direction: 'down', percentage: 50, text: 'vs current shift' } },
            { label: "Expected Passengers", value: "400", trend: { direction: 'down', percentage: 25, text: 'vs current shift' } },
            { label: "Peak Activity", value: "20:00 - 22:00", trend: { direction: 'same', text: 'Low Congestion' } },
          ],
      }
  },
  'control-room': {
    current: {
        title: "Current Shift Forecast",
        description: "Expected system-wide traffic and resource needs for the current shift (08:00 - 16:00).",
        recommendedStaff: 8,
        items: [
          { label: "Expected Traffic", value: "15,000", trend: { direction: 'up', percentage: 7, text: 'vs last shift' } },
          { label: "Potential Alerts", value: "5-8", trend: { direction: 'same', text: 'Normal' } },
          { label: "Peak Hours", value: "11:00 - 14:00", trend: { direction: 'up', text: 'High Activity' } },
        ],
    },
    next: {
        title: "Next Shift Forecast",
        description: "Expected system-wide traffic and resource needs for the next shift (16:00 - 00:00).",
        recommendedStaff: 6,
        items: [
          { label: "Expected Traffic", value: "11,500", trend: { direction: 'down', percentage: 15, text: 'vs current shift' } },
          { label: "Potential Alerts", value: "3-5", trend: { direction: 'down', text: 'Low' } },
          { label: "Peak Hours", value: "17:00 - 19:00", trend: { direction: 'same', text: 'Medium Activity' } },
        ],
    }
  }
};


const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function mockApi<T>(endpoint: string, options: RequestInit = {}): Promise<Result<T>> {
    await delay(500); // Simulate network latency

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
    
    if (method === 'GET' && url.pathname === '/dashboard/main') {
        return Result.success(mainDashboardData) as Result<T>;
    }

    if (method === 'GET' && url.pathname === '/dashboard/airport') {
        return Result.success(airportDashboardData) as Result<T>;
    }

    if (method === 'GET' && url.pathname === '/data/passengers') {
        return Result.success(passengerData) as Result<T>;
    }

    if (method === 'GET' && url.pathname === '/dashboard/transaction-overview') {
        return Result.success(transactionOverviewData) as Result<T>;
    }

    if (method === 'GET' && url.pathname === '/dashboard/forecasts') {
        const module = url.searchParams.get('module') as keyof typeof forecastData;
        if (module && forecastData[module]) {
            return Result.success(forecastData[module]) as Result<T>;
        }
        return Result.failure([new ApiError('NOT_FOUND', `Forecast data for module '${module}' not found.`)]) as Result<T>;
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
