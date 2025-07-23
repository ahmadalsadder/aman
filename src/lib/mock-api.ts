
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
        { name: '08:00', transactions: 230 },
        { name: '10:00', transactions: 290 },
        { name: '12:00', transactions: 220 },
        { name: '14:00', transactions: 250 },
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

const dashboardStats = {
    airport: {
        passengersProcessed: '12,453',
        bagsScanned: '25,832',
        securityAlerts: '3',
        flightsMonitored: '128',
    },
    landport: {
        vehiclesProcessed: '4,589',
        travelersChecked: '7,123',
        documentsScanned: '9,876',
        activeLanes: '8',
    },
    seaport: {
        vesselsInPort: '23',
        cruisePassengers: '2,480',
        passengersProcessed: '1,250',
        activeBerths: '6',
    },
    egate: {
        successfulEntries: '8,210',
        failedAttempts: '14',
        biometricVerifications: '8,224',
        activeGates: '24',
        activeAlerts: '2',
    },
    analyst: {
        successfulEntries: '8,210',
        failedAttempts: '14',
        biometricVerifications: '8,224',
        activeGates: '24',
    },
    shiftsupervisor: {
        successfulEntries: '8,210',
        failedAttempts: '14',
        biometricVerifications: '8,224',
        activeGates: '24',
        activeAlerts: '3',
    },
    'control-room': {
        successfulEntries: '8,210',
        failedAttempts: '14',
        biometricVerifications: '8,224',
        activeGates: '24',
        activeAlerts: '5',
    }
}

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
        { name: 'Citizen', value: 4500 },
        { name: 'Visitor', value: 6200 },
        { name: 'Resident', value: 1753 },
        { name: 'Transit', value: 800 },
        { name: 'VIP', value: 150 },
    ],
    seaport: [
        { name: 'Citizen', value: 1200 },
        { name: 'Visitor', value: 3400 },
        { name: 'Resident', value: 800 },
        { name: 'Transit', value: 300 },
        { name: 'VIP', value: 50 },
    ],
    landport: [
        { name: 'Citizen', value: 5600 },
        { name: 'Visitor', value: 1200 },
        { name: 'Resident', value: 323 },
        { name: 'Transit', value: 100 },
        { name: 'VIP', value: 20 },
    ],
};

const transactionOverviewData = [
    { name: 'Day 1', entry: 4210, exit: 2390 },
    { name: 'Day 2', entry: 3800, exit: 1100 },
    { name: 'Day 3', entry: 4500, exit: 1500 },
    { name: 'Day 4', entry: 4890, exit: 9800 },
    { name: 'Day 5', entry: 5100, exit: 5900 },
    { name: 'Day 6', entry: 5300, exit: 3100 },
    { name: 'Day 7', entry: 5520, exit: 3300 },
];

const forecastData = {
  airport: {
    current: {
      title: "Current Shift Forecast",
      description: "Predicted passenger volume for the current shift (08:00 - 16:00).",
      recommendedStaff: 45,
      metrics: [
        { title: 'Incoming Pax', value: '6,200', description: 'Predicted arrivals' },
        { title: 'Outgoing Pax', value: '5,800', description: 'Predicted departures' },
      ],
    },
    next: {
      title: "Next Shift Forecast",
      description: "Predicted passenger volume for the next shift (16:00 - 00:00).",
      recommendedStaff: 38,
      metrics: [
        { title: 'Incoming Pax', value: '4,800', description: 'Predicted arrivals' },
        { title: 'Outgoing Pax', value: '4,500', description: 'Predicted departures' },
      ],
    },
  },
  landport: {
    current: {
        title: "Current Shift Forecast",
        description: "Expected vehicle and traveler traffic for the current shift (07:00 - 15:00).",
        recommendedStaff: 12,
        metrics: [
            { title: 'Inbound Vehicles', value: '2,100', description: 'Predicted entries' },
            { title: 'Outbound Vehicles', value: '1,950', description: 'Predicted exits' },
        ],
    },
    next: {
        title: "Next Shift Forecast",
        description: "Expected vehicle and traveler traffic for the next shift (15:00 - 23:00).",
        recommendedStaff: 15,
        metrics: [
            { title: 'Inbound Vehicles', value: '2,500', description: 'Predicted entries' },
            { title: 'Outbound Vehicles', value: '2,600', description: 'Predicted exits' },
        ],
    }
  },
  seaport: {
      current: {
          title: "Current Shift Forecast",
          description: "Expected passenger and vessel traffic for the current shift (06:00 - 18:00).",
          recommendedStaff: 25,
          metrics: [
            { title: 'Passenger Arrivals', value: '850', description: 'Predicted arrivals' },
            { title: 'Passenger Departures', value: '700', description: 'Predicted departures' },
          ],
      },
      next: {
          title: "Next Shift Forecast",
          description: "Expected passenger and vessel traffic for the next shift (18:00 - 06:00).",
          recommendedStaff: 18,
          metrics: [
            { title: 'Passenger Arrivals', value: '400', description: 'Predicted arrivals' },
            { title: 'Passenger Departures', value: '350', description: 'Predicted departures' },
          ],
      }
  },
  'control-room': {
    current: {
        title: "Current Shift Forecast",
        description: "Expected system-wide traffic and resource needs for the current shift (08:00 - 16:00).",
        recommendedStaff: 8,
        metrics: [
            { title: 'Total Entries', value: '15,000', description: 'Predicted system-wide entries' },
            { title: 'Potential Alerts', value: '5-8', description: 'Predicted security/risk alerts' },
        ],
    },
    next: {
        title: "Next Shift Forecast",
        description: "Expected system-wide traffic and resource needs for the next shift (16:00 - 00:00).",
        recommendedStaff: 6,
        metrics: [
            { title: 'Total Entries', value: '11,500', description: 'Predicted system-wide entries' },
            { title: 'Potential Alerts', value: '3-5', description: 'Predicted security/risk alerts' },
        ],
    }
  }
};

const gateRejectionReasonsData = [
    { name: 'Biometric Mismatch', value: 45 },
    { name: 'Expired Passport', value: 30 },
    { name: 'Watchlist Flag', value: 15 },
    { name: 'Invalid Visa', value: 8 },
    { name: 'Other', value: 2 },
];

const transactionListData = {
  whitelisted: [
    { name: 'Whitelisted', value: 75, fill: 'hsl(var(--chart-1))' },
    { name: 'Not Whitelisted', value: 25, fill: 'hsl(var(--chart-2))' },
  ],
  blacklisted: [
    { name: 'Not Blacklisted', value: 98, fill: 'hsl(var(--chart-1))' },
    { name: 'Blacklisted', value: 2, fill: 'hsl(var(--destructive))' },
  ],
  risky: [
    { name: 'Non-Risky', value: 95, fill: 'hsl(var(--chart-1))' },
    { name: 'Risky', value: 5, fill: 'hsl(var(--chart-4))' },
  ]
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

    if (method === 'GET' && url.pathname === '/dashboard/stats') {
        const module = url.searchParams.get('module') as keyof typeof dashboardStats;
        if (module && dashboardStats[module]) {
            return Result.success(dashboardStats[module]) as Result<T>;
        }
        return Result.failure([new ApiError('NOT_FOUND', `Stats for module '${module}' not found.`)]) as Result<T>;
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

    if (method === 'GET' && url.pathname === '/dashboard/gate-rejection-reasons') {
        return Result.success(gateRejectionReasonsData) as Result<T>;
    }

    if (method === 'GET' && url.pathname === '/dashboard/transaction-lists') {
        return Result.success(transactionListData) as Result<T>;
    }
    
    if (method === 'GET' && url.pathname === '/dashboard/stats-error') {
        const errorResponse = { "error": "invalid_token", "error_description": "The access token is expired or invalid", "user_id": 12345, "internal_debug_info": "trace_id: xyz-abc-123" };
        return Result.failure([new ApiError("INVALID_TOKEN", JSON.stringify(errorResponse))]) as Result<T>;
    }

    return Result.failure([new ApiError('NOT_FOUND', `Mock endpoint ${method} ${endpoint} not found.`)]) as Result<T>;
}
