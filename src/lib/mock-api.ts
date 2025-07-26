
import type { User } from '@/types';
import { Result, ApiError } from '@/types/api/result';
import { mockVisaDatabase, mockPorts, mockTerminals, mockZones, mockWorkflows, mockRiskProfiles, setMockOfficerDesks, setMockGates, setMockMedia, setMockWhitelist, setMockBlacklist, setMockPassengers, setMockShifts, getMockPassengers, getMockTransactions, getMockOfficerDesks, getMockGates, getMockMedia, getMockWhitelist, getMockBlacklist, getMockShifts, setMockOfficerAssignments, getMockOfficerAssignments } from './mock-data';
import { assessPassengerRisk } from '@/ai/flows/assess-risk-flow';
import { countries } from './countries';
import { Fingerprint, ScanLine, UserCheck, ShieldAlert, User as UserIcon } from 'lucide-react';
import { extractPassportData } from '@/ai/flows/extract-passport-data-flow';
import type { Transaction, Gate, CivilRecord, Media, BlacklistEntry, WhitelistEntry, Passenger, Shift, OfficerAssignment } from '@/types/live-processing';

const getAuthInfo = (): Partial<User> => {
  try {
    const authCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('guardian-gate-auth='))
      ?.split('=')[1];
      
    if (authCookie) {
      // The cookie is URI encoded
      return JSON.parse(decodeURIComponent(authCookie));
    }
  } catch (error) {
    console.error('Failed to parse auth data from cookie', error);
  }
  return {};
};

const users: User[] = [
  { 
    id: '1', 
    name: 'Admin User', 
    fullName: 'Admin User',
    email: 'admin@example.com', 
    role: 'admin', 
    token: 'fake-admin-token', 
    modules: ['landport', 'seaport', 'airport', 'egate', 'analyst', 'control-room', 'users', 'settings', 'duty-manager'],
    permissions: [
        'users:manage', 'reports:view',
        // Airport
        'airport:passengers:view', 'airport:passengers:create', 'airport:passengers:edit', 'airport:passengers:delete',
        'airport:whitelist:view', 'airport:whitelist:create', 'airport:whitelist:edit', 'airport:whitelist:delete',
        'airport:blacklist:view', 'airport:blacklist:create', 'airport:blacklist:edit', 'airport:blacklist:delete',
        'airport:records:create',
        'airport:civil-records:view',
        'airport:transactions:view',
        'airport:transactions:live',
        'airport:dashboard:view', 'airport:dashboard:stats:view', 'airport:prediction:view', 'airport:dashboard:charts:view', 'airport:dashboard:officer-performance:view',
        'airport:desks:view', 'airport:desks:create', 'airport:desks:edit', 'airport:desks:delete',
        'airport:workload:view',
        // Landport
        'landport:passengers:view', 'landport:passengers:create', 'landport:passengers:edit', 'landport:passengers:delete',
        'landport:whitelist:view', 'landport:whitelist:create', 'landport:whitelist:edit', 'landport:whitelist:delete',
        'landport:blacklist:view', 'landport:blacklist:create', 'landport:blacklist:edit', 'landport:blacklist:delete',
        'landport:records:create',
        'landport:civil-records:view',
        'landport:transactions:view',
        'landport:transactions:live',
        'landport:dashboard:view', 'landport:dashboard:stats:view', 'landport:prediction:view', 'landport:dashboard:charts:view', 'landport:dashboard:officer-performance:view',
        'landport:desks:view', 'landport:desks:create', 'landport:desks:edit', 'landport:desks:delete',
        'landport:workload:view',
        // Seaport
        'seaport:passengers:view', 'seaport:passengers:create', 'seaport:passengers:edit', 'seaport:passengers:delete',
        'seaport:whitelist:view', 'seaport:whitelist:create', 'seaport:whitelist:edit', 'seaport:whitelist:delete',
        'seaport:blacklist:view', 'seaport:blacklist:create', 'seaport:blacklist:edit', 'seaport:blacklist:delete',
        'seaport:records:create',
        'seaport:civil-records:view',
        'seaport:transactions:view',
        'seaport:transactions:live',
        'seaport:dashboard:view', 'seaport:dashboard:stats:view', 'seaport:prediction:view', 'seaport:dashboard:charts:view', 'seaport:dashboard:officer-performance:view',
        'seaport:desks:view', 'seaport:desks:create', 'seaport:desks:edit', 'seaport:desks:delete',
        'seaport:workload:view',
        // E-Gate
        'egate:passengers:view', 'egate:passengers:create', 'egate:passengers:edit', 'egate:passengers:delete',
        'egate:whitelist:view', 'egate:whitelist:create', 'egate:whitelist:edit', 'egate:whitelist:delete',
        'egate:blacklist:view', 'egate:blacklist:create', 'egate:blacklist:edit', 'egate:blacklist:delete',
        'egate:records:create', 'egate:records:edit', 'egate:records:delete',
        'egate:civil-records:view',
        'egate:dashboard:view', 'egate:dashboard:stats:view', 'egate:prediction:view', 'egate:dashboard:charts:view', 'egate:media:view', 'egate:media:create', 'egate:media:edit', 'egate:media:delete',
        'egate:workload:view',
        // Other Modules
        'analyst:records:view', 'analyst:records:create', 'analyst:records:edit', 'analyst:records:delete',
        'analyst:dashboard:view', 'analyst:dashboard:stats:view', 'analyst:dashboard:charts:view',
        'control-room:dashboard:view', 'control-room:dashboard:stats:view', 'control-room:dashboard:charts:view', 'control-room:dashboard:officer-performance:view',
        'duty-manager:view'
    ]
  },
  { 
    id: '2', 
    name: 'Auditor User', 
    fullName: 'Auditor User',
    email: 'auditor@example.com', 
    role: 'auditor', 
    token: 'fake-auditor-token', 
    modules: ['landport', 'seaport'],
    permissions: ['reports:view', 'landport:transactions:view', 'seaport:transactions:view', 'landport:dashboard:view', 'seaport:dashboard:view', 'landport:civil-records:view', 'seaport:civil-records:view']
  },
  { 
    id: '3', 
    name: 'Viewer User', 
    fullName: 'Viewer User',
    email: 'viewer@example.com', 
    role: 'viewer', 
    token: 'fake-viewer-token', 
    modules: ['airport'],
    permissions: ['airport:civil-records:view', 'airport:dashboard:view', 'airport:dashboard:stats:view']
  },
  {
    id: '4',
    name: 'Shift Supervisor User',
    fullName: 'Shift Supervisor User',
    email: 'supervisor@example.com',
    role: 'shiftsupervisor',
    token: 'fake-supervisor-token',
    modules: ['airport', 'landport', 'seaport', 'control-room', 'duty-manager'],
    permissions: [
        'reports:view', 
        'airport:civil-records:view',
        'landport:civil-records:view',
        'seaport:civil-records:view',
        'airport:transactions:view', 'landport:transactions:view', 'seaport:transactions:view', 
        'airport:transactions:live', 'landport:transactions:live', 'seaport:transactions:live',
        'airport:dashboard:view', 'airport:dashboard:stats:view', 'airport:prediction:view', 'airport:dashboard:charts:view', 'airport:dashboard:officer-performance:view',
        'landport:dashboard:view', 'landport:dashboard:stats:view', 'landport:prediction:view', 'landport:dashboard:charts:view', 'landport:dashboard:officer-performance:view',
        'seaport:dashboard:view', 'seaport:dashboard:stats:view', 'seaport:prediction:view', 'seaport:dashboard:charts:view', 'seaport:dashboard:officer-performance:view',
        'control-room:dashboard:view', 'control-room:dashboard:stats:view', 'control-room:dashboard:charts:view', 'control-room:dashboard:officer-performance:view',
        'duty-manager:view',
        'airport:workload:view', 'landport:workload:view', 'seaport:workload:view',
        // Granular permissions for editing across modules they supervise
        'airport:passengers:edit', 'airport:whitelist:edit', 'airport:blacklist:edit',
        'landport:passengers:edit', 'landport:whitelist:edit', 'landport:blacklist:edit',
        'seaport:passengers:edit', 'seaport:whitelist:edit', 'seaport:blacklist:edit',
    ]
  },
  {
    id: '5',
    name: 'Analyst User',
    fullName: 'Analyst User',
    email: 'analyst@example.com',
    role: 'analyst',
    token: 'fake-analyst-token',
    modules: ['analyst'],
    permissions: ['analyst:records:view', 'reports:view', 'analyst:dashboard:view', 'analyst:records:create', 'analyst:records:edit', 'analyst:records:delete']
  },
  {
    id: '6',
    name: 'Control Room User',
    fullName: 'Control Room User',
    email: 'controlroom@example.com',
    role: 'control-room',
    token: 'fake-control-room-token',
    modules: ['control-room'],
    permissions: ['control-room:records:view', 'reports:view', 'control-room:dashboard:view', 'control-room:dashboard:stats:view', 'control-room:dashboard:charts:view']
  },
  {
    id: '7',
    name: 'Landport Officer',
    fullName: 'Landport Officer',
    email: 'officer.land@example.com',
    role: 'officer',
    token: 'fake-officer-token',
    modules: ['landport'],
    permissions: [
        'landport:civil-records:view', 'landport:records:create',
        'landport:dashboard:view', 'landport:dashboard:stats:view', 'landport:dashboard:charts:view',
        'landport:transactions:view', 'landport:transactions:live'
    ]
  }
];

const NATIONALITIES_REQUIRING_VISA = ['Jordan'];


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
        avgOfficerProcessingTime: '1.8m',
        biometricVerifications: '8,224',
        activeGates: '24',
    },
    shiftsupervisor: {
        successfulEntries: '8,210',
        avgOfficerProcessingTime: '2.1m',
        biometricVerifications: '8,224',
        activeGates: '24',
        activeAlerts: '3',
    },
    'control-room': {
        successfulEntries: '8,210',
        failedAttempts: '14',
        biometricVerifications: '8,224',
        activeGates: '24',
        totalGates: 30,
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
  },
  shiftsupervisor: {
    current: {
        title: "Current Shift Forecast",
        description: "Predicted traffic and staffing for the current shift (08:00 - 16:00).",
        recommendedStaff: 12,
        metrics: [
            { title: 'Total Transactions', value: '8,500', description: 'Predicted entries & exits' },
            { title: 'Peak Hour', value: '14:00-15:00', description: 'Highest traffic expected' },
        ],
    },
    next: {
        title: "Next Shift Forecast",
        description: "Predicted traffic and staffing for the next shift (16:00 - 00:00).",
        recommendedStaff: 10,
        metrics: [
            { title: 'Total Transactions', value: '6,200', description: 'Predicted entries & exits' },
            { title: 'Peak Hour', value: '18:00-19:00', description: 'Highest traffic expected' },
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

const transactionBreakdownData = {
    gate: [
        { name: 'Success', value: 2200, fill: 'hsl(var(--chart-1))' },
        { name: 'Rejected', value: 150, fill: 'hsl(var(--chart-2))' },
        { name: 'Cancelled', value: 50, fill: 'hsl(var(--chart-4))' },
    ],
    counter: [
        { name: 'Success', value: 1800, fill: 'hsl(var(--chart-1))' },
        { name: 'Rejected', value: 250, fill: 'hsl(var(--chart-2))' },
        { name: 'Cancelled', value: 100, fill: 'hsl(var(--chart-4))' },
    ],
    total: [
        { name: 'Success', value: 4000, fill: 'hsl(var(--chart-1))' },
        { name: 'Rejected', value: 400, fill: 'hsl(var(--chart-2))' },
        { name: 'Cancelled', value: 150, fill: 'hsl(var(--chart-4))' },
    ]
};

const gatePerformanceData = [
    { id: 'G-01', name: 'Gate 01', type: 'E-Gate', status: 'Active', totalTransactions: 1254, avgProcessingTime: '1.2m' },
    { id: 'G-02', name: 'Gate 02', type: 'E-Gate', status: 'Active', totalTransactions: 1302, avgProcessingTime: '1.1m' },
    { id: 'G-03', name: 'Gate 03', type: 'E-Gate', status: 'Maintenance', totalTransactions: 56, avgProcessingTime: '1.5m' },
    { id: 'D-01', name: 'Desk 01', type: 'Officer Desk', status: 'Active', totalTransactions: 432, avgProcessingTime: '2.8m' },
    { id: 'D-02', name: 'Desk 02', type: 'Officer Desk', status: 'Offline', totalTransactions: 0, avgProcessingTime: 'N/A' },
    { id: 'D-03', name: 'Desk 03', type: 'Officer Desk', status: 'Active', totalTransactions: 512, avgProcessingTime: '2.5m' },
];

const officerPerformanceData = {
    officers: [
        { id: 'O-01', name: 'John Smith', totalTransactions: 432, avgProcessingTime: 2.8, decisions: { approved: 420, rejected: 12 }, approvalRate: 97.2 },
        { id: 'O-02', name: 'Jane Doe', totalTransactions: 512, avgProcessingTime: 2.5, decisions: { approved: 500, rejected: 12 }, approvalRate: 97.6 },
        { id: 'O-03', name: 'Peter Jones', totalTransactions: 380, avgProcessingTime: 3.1, decisions: { approved: 370, rejected: 10 }, approvalRate: 97.4 },
        { id: 'O-04', name: 'Emily White', totalTransactions: 620, avgProcessingTime: 2.2, decisions: { approved: 610, rejected: 10 }, approvalRate: 98.4 },
        { id: 'O-05', name: 'David Green', totalTransactions: 450, avgProcessingTime: 2.6, decisions: { approved: 445, rejected: 5 }, approvalRate: 98.9 },
        { id: 'O-06', name: 'Susan Black', totalTransactions: 210, avgProcessingTime: 3.5, decisions: { approved: 200, rejected: 10 }, approvalRate: 95.2 },
    ],
    decisionBreakdown: [
        { name: 'Approved', value: 2545, fill: 'hsl(var(--chart-2))' },
        { name: 'Rejected', value: 59, fill: 'hsl(var(--destructive))' },
        { name: 'Escalated', value: 20, fill: 'hsl(var(--chart-4))' },
    ],
};

const processingTimeDistributionData = [
    { name: '< 1m', value: 1200 },
    { name: '1-3m', value: 3400 },
    { name: '3-5m', value: 2100 },
    { name: '> 5m', value: 800 },
];

const seaportTravelerCategoriesData = [
    { name: 'Citizens', value: 1200 },
    { name: 'Visitors', value: 3400 },
    { name: 'Residents', value: 800 },
    { name: 'Crew', value: 450 },
];

const predictionData = {
    stats: {
      passengers: { total: 12500, change: 5.2 },
      vehicles: { total: 4300, change: -2.1 },
      vessels: { total: 18, change: 10.0 },
      processingTime: { avg: '2m 15s', change: 3.5 },
      staff: { recommended: 62, change: 8.0 },
    },
    passengerFlow: [
        { hour: '08:00', air: 450, land: 210, sea: 80, egate: 300 },
        { hour: '10:00', air: 620, land: 300, sea: 120, egate: 450 },
        { hour: '12:00', air: 580, land: 280, sea: 110, egate: 400 },
        { hour: '14:00', air: 710, land: 350, sea: 150, egate: 550 },
        { hour: '16:00', air: 950, land: 420, sea: 180, egate: 700 },
    ],
    processingVelocity: [
        { type: 'Citizen', time: 35 },
        { type: 'Resident', time: 60 },
        { type: 'Visitor (Visa)', time: 150 },
        { type: 'Visitor (No Visa)', time: 90 },
        { type: 'Crew', time: 75 },
    ],
    queueDynamics: [
        { time: '08:00', current: 25, historical: 22 },
        { time: '10:00', current: 40, historical: 35 },
        { time: '12:00', current: 35, historical: 38 },
        { time: '14:00', current: 50, historical: 45 },
        { time: '16:00', current: 65, historical: 60 },
    ],
    flightSchedule: {
        arrivals: [
            { id: 'EK201', from: 'JFK', time: '08:30', gate: 'A12', status: 'On Time' },
            { id: 'BA105', from: 'LHR', time: '08:45', gate: 'B05', status: 'On Time' },
            { id: 'AF672', from: 'CDG', time: '09:10', gate: 'A14', status: 'Delayed' },
        ],
        departures: [
            { id: 'EK202', to: 'JFK', time: '09:00', gate: 'A15', status: 'Boarding' },
            { id: 'QF002', to: 'SYD', time: '09:20', gate: 'C22', status: 'On Time' },
        ]
    },
    vesselSchedule: {
        arrivals: [
            { id: 'MSC Bellissima', from: 'DOH', time: '07:00', berth: 'T1-B2', status: 'On Time' },
            { id: 'Costa Toscana', from: 'MCT', time: '08:30', berth: 'T1-B3', status: 'Expected' },
        ],
        departures: [
            { id: 'MSC Opera', to: 'BAH', time: '14:00', berth: 'T1-B1', status: 'On Time' },
        ]
    }
};

let allTransactions = [...getMockTransactions()];

export async function mockApi<T>(endpoint: string, options: RequestInit = {}): Promise<Result<T>> {
    const { method = 'GET', body } = options;
    const url = new URL(endpoint, 'http://mock.com'); // Base URL doesn't matter, just for parsing
    const pathParts = url.pathname.split('/');

    console.log(`[Mock API] ${method} ${url.pathname}`);

    // AUTH
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
    
    // USERS
    if (method === 'GET' && url.pathname === '/data/users') {
        const role = url.searchParams.get('role');
        if(role) {
            return Result.success(users.filter(u => u.role === role)) as Result<T>;
        }
        return Result.success(users) as Result<T>;
    }


    // COUNTRIES
    if (method === 'GET' && url.pathname === '/data/countries') {
        return Result.success(countries) as Result<T>;
    }
    
    // CIVIL RECORDS
    if (method === 'GET' && url.pathname === '/data/civil-records') {
        const getDocumentType = (passenger: User): CivilRecord['documentType'] => {
            if (passenger.nationality === 'United Arab Emirates') return 'Citizen';
            if ((passenger as any).visaType === 'Residency' || (passenger as any).residencyFileNumber) return 'Resident';
            return 'Visitor';
        };

        const getDocumentNumber = (passenger: User, type: CivilRecord['documentType']): string => {
            switch(type) {
                case 'Citizen': return (passenger as any).nationalId || (passenger as any).passportNumber;
                case 'Resident': return (passenger as any).residencyFileNumber || (passenger as any).passportNumber;
                case 'Visitor': return (passenger as any).visaNumber || (passenger as any).passportNumber;
                default: return (passenger as any).passportNumber;
            }
        }
        
        const civilRecords = getMockPassengers().map(p => {
            const docType = getDocumentType(p as any);
            return {
                ...p,
                documentType: docType,
                documentNumber: getDocumentNumber(p as any, docType),
            }
        });

        return Result.success(civilRecords) as Result<T>;
    }

    // PASSENGERS
    if (method === 'POST' && url.pathname === '/data/passengers/delete') {
        const { id } = JSON.parse(body as string);
        const currentPassengers = getMockPassengers();
        const initialLength = currentPassengers.length;
        setMockPassengers(currentPassengers.filter(p => p.id !== id));
        if (getMockPassengers().length < initialLength) {
            return Result.success({ id }) as Result<T>;
        }
        return Result.failure([new ApiError('NOT_FOUND', 'Passenger not found.')]) as Result<T>;
    }

    if (method === 'POST' && url.pathname === '/data/passengers/save') {
        const passengerData = JSON.parse(body as string) as Passenger;
        const isNew = !passengerData.id;
        const currentPassengers = getMockPassengers();

        if (isNew) {
            const newPassenger = { ...passengerData, id: `P-NEW-${Date.now()}` };
            setMockPassengers([...currentPassengers, newPassenger]);
            return Result.success(newPassenger) as Result<T>;
        } else {
            let found = false;
            const updatedPassengers = currentPassengers.map(p => {
                if (p.id === passengerData.id) {
                    found = true;
                    return { ...p, ...passengerData };
                }
                return p;
            });
            if (found) {
                setMockPassengers(updatedPassengers);
                return Result.success(passengerData) as Result<T>;
            }
            return Result.failure([new ApiError('NOT_FOUND', 'Passenger not found to update.')]) as Result<T>;
        }
    }

    if (method === 'GET' && url.pathname.startsWith('/data/passengers/')) {
        const id = pathParts[pathParts.length - 1];
        const passenger = getMockPassengers().find(p => p.id === id);
        return passenger ? Result.success(passenger) as Result<T> : Result.failure([new ApiError('NOT_FOUND', `Passenger with id ${id} not found.`)]) as Result<T>;
    }

    if (method === 'GET' && url.pathname === '/data/passenger-by-passport') {
        const passportNumber = url.searchParams.get('passportNumber');
        const passenger = getMockPassengers().find(p => p.passportNumber === passportNumber);
        if (passenger) {
            return Result.success(passenger) as Result<T>;
        }
        return Result.failure([new ApiError('NOT_FOUND', `Passenger with passport ${passportNumber} not found.`)]) as Result<T>;
    }

    if (method === 'GET' && url.pathname === '/data/passengers') {
        // This simulates scoped data fetching for non-admin users, though in a real app,
        // the backend would derive the scope from the user's auth token, not a query param.
        const module = url.searchParams.get('module');
        if (module && module !== 'admin') {
            const passengerSubset = getMockPassengers().slice(0, 2); // Return a smaller, "scoped" list
            return Result.success(passengerSubset) as Result<T>;
        }
        // Admin gets all passengers
        return Result.success(getMockPassengers()) as Result<T>;
    }

    // TRANSACTIONS
    if (method === 'POST' && url.pathname === '/data/transactions') {
        const transactionData = JSON.parse(body as string);
        allTransactions.push(transactionData);
        return Result.success(transactionData) as Result<T>;
    }

    if (method === 'POST' && url.pathname === '/data/transactions/delete') {
        const { id } = JSON.parse(body as string);
        allTransactions = allTransactions.filter(t => t.id !== id);
        return Result.success({ id }) as Result<T>;
    }
    
    if (method === 'GET' && url.pathname.startsWith('/data/transactions/pending')) {
        const pending = allTransactions.filter(t => t.status === 'Pending');
        return Result.success(pending) as Result<T>;
    }

    if (method === 'GET' && url.pathname.startsWith('/data/transactions/')) {
        const id = pathParts[pathParts.length - 1];
        const transaction = allTransactions.find(t => t.id === id);
        if (transaction) {
            return Result.success({ transaction }) as Result<T>;
        }
        return Result.failure([new ApiError('NOT_FOUND', `Transaction with id ${id} not found.`)]) as Result<T>;
    }

    if (method === 'GET' && url.pathname === '/data/transactions') {
        return Result.success(allTransactions) as Result<T>;
    }
    
    // LIVE PROCESSING
    if (method === 'POST' && url.pathname === '/api/process-transaction') {
        const { module, passportScan, livePhoto } = JSON.parse(body as string);
    
        // 0. Extract Data
        const extractedData = await extractPassportData({ passportPhotoDataUri: passportScan });
        if (!extractedData) {
            return Result.failure([new ApiError('EXTRACTION_FAILED', 'Could not extract data from passport.')]) as Result<T>;
        }

        // 1. Check for existing passenger
        const existingPassenger = getMockPassengers().find(p => p.passportNumber === extractedData.passportNumber) || null;
    
        // 2. Visa Check
        const countryLabel = countries.find(c => c.value === extractedData.nationality)?.label || extractedData.nationality;
        const needsVisa = NATIONALITIES_REQUIRING_VISA.includes(countryLabel);
        let isVisaValid = false;
        if (needsVisa) {
            const visaHolder = mockVisaDatabase.find(v => v.passportNumber === extractedData.passportNumber && v.nationality === countryLabel);
            isVisaValid = !!visaHolder;
        }
        const visaCheckResult = needsVisa ? (isVisaValid ? 'valid' : 'invalid') : 'not_required';
    
        // 3. Risk Assessment
        const riskResult = await assessPassengerRisk({
            passengerDetails: {
                nationality: extractedData.nationality,
                dateOfBirth: extractedData.dateOfBirth,
                riskLevel: existingPassenger?.riskLevel || 'Low',
            },
            passportPhotoDataUri: passportScan,
            livePhotoDataUri: livePhoto,
        });
    
        // 4. Combine alerts & Define Workflow
        if (visaCheckResult === 'invalid') {
            riskResult.alerts.unshift("Visa Required - Not Found");
            riskResult.recommendation = 'Reject';
            riskResult.riskScore = Math.max(riskResult.riskScore, 85);
        }

        // 5. Get Trip Information
        let tripInformation = {};
        if (module === 'airport') {
            tripInformation = { type: 'airport', flightNumber: 'EK202', carrier: 'Emirates', departureCountry: 'USA', seatNumber: '14A' };
        } else if (module === 'landport') {
            tripInformation = { type: 'landport', vehiclePlateNumber: 'AUH 12345', vehicleType: 'Car', laneNumber: '3', vehicleMake: 'Toyota' };
        } else if (module === 'seaport') {
            tripInformation = { type: 'seaport', vesselName: 'Symphony of the Seas', voyageNumber: 'SYM-004', berth: 'C4', lastPortOfCall: 'SGP' };
        }


        const workflow = [
            { id: 'doc_scan', name: 'Document Scan', status: 'completed', Icon: ScanLine },
            { id: 'data_confirmation', name: 'Identity Confirmation', status: 'completed', Icon: UserCheck },
            { id: 'biometric_capture', name: 'Biometric Capture', status: 'completed', Icon: Fingerprint },
            { id: 'security_ai_checks', name: 'Security & AI Checks', status: 'completed', Icon: ShieldAlert },
            { id: 'officer_review', name: 'Officer Review', status: 'in-progress', Icon: UserIcon }
        ];
    
        const responsePayload = {
            riskResult,
            existingPassenger,
            visaCheckResult,
            workflow,
            extractedData,
            tripInformation,
        };
    
        return Result.success(responsePayload) as Result<T>;
    }
    
    // GATES DATA
    if (method === 'GET' && url.pathname.startsWith('/data/gates/')) {
        const id = pathParts[pathParts.length - 1];
        const gate = getMockGates().find(g => g.id === id);
        if (gate) {
            return Result.success({ gate }) as Result<T>;
        }
        return Result.failure([new ApiError('NOT_FOUND', `Gate with id ${id} not found.`)]) as Result<T>;
    }
    
    if (method === 'GET' && url.pathname === '/data/gates') {
        return Result.success(getMockGates()) as Result<T>;
    }

    if (method === 'POST' && url.pathname === '/data/gates/save') {
        const gateData = JSON.parse(body as string) as Gate;
        const isNew = !gateData.id;
        
        let updatedGate: Gate;
        if (isNew) {
            updatedGate = { ...gateData, id: `GATE-NEW-${Date.now()}`, lastModified: new Date().toISOString() };
            const newGates = [...getMockGates(), updatedGate];
            setMockGates(newGates);
        } else {
            updatedGate = { ...gateData, lastModified: new Date().toISOString() };
            const newGates = getMockGates().map(d => d.id === gateData.id ? updatedGate : d);
            setMockGates(newGates);
        }
        return Result.success(updatedGate) as Result<T>;
    }

    if (method === 'POST' && url.pathname === '/data/gates/update-status') {
        const { gateId, status } = JSON.parse(body as string);
        const newGates = getMockGates().map(gate =>
            gate.id === gateId 
            ? { ...gate, status, lastModified: new Date().toISOString().split('T')[0] } 
            : gate
        );
        setMockGates(newGates);
        const updatedGate = newGates.find(g => g.id === gateId);
        return Result.success(updatedGate) as Result<T>;
    }

    if (method === 'POST' && url.pathname === '/data/gates/delete') {
        const { id } = JSON.parse(body as string);
        setMockGates(getMockGates().filter(g => g.id !== id));
        return Result.success({ id }) as Result<T>;
    }

    // MEDIA DATA
    if (method === 'GET' && url.pathname.startsWith('/data/media/')) {
        const id = pathParts[pathParts.length - 1];
        const media = getMockMedia().find(m => m.id === id);
        if (media) {
            return Result.success({ media }) as Result<T>;
        }
        return Result.failure([new ApiError('NOT_FOUND', `Media with id ${id} not found.`)]) as Result<T>;
    }

    if (method === 'GET' && url.pathname === '/data/media') {
        return Result.success(getMockMedia()) as Result<T>;
    }

    if (method === 'POST' && url.pathname === '/data/media/save') {
        const mediaData = JSON.parse(body as string) as Media;
        const isNew = !mediaData.id;

        let updatedMedia: Media;
        if (isNew) {
            updatedMedia = { ...mediaData, id: `MEDIA-NEW-${Date.now()}` };
            setMockMedia([...getMockMedia(), updatedMedia]);
        } else {
            updatedMedia = { ...mediaData };
            setMockMedia(getMockMedia().map(m => m.id === mediaData.id ? updatedMedia : m));
        }
        return Result.success(updatedMedia) as Result<T>;
    }

    if (method === 'POST' && url.pathname === '/data/media/delete') {
        const { id } = JSON.parse(body as string);
        setMockMedia(getMockMedia().filter(m => m.id !== id));
        return Result.success({ id }) as Result<T>;
    }
    
    // WHITELIST
    if (method === 'GET' && url.pathname === '/data/whitelist') {
        return Result.success(getMockWhitelist()) as Result<T>;
    }
    if (method === 'POST' && url.pathname === '/data/whitelist/delete') {
        const { id } = JSON.parse(body as string);
        setMockWhitelist(getMockWhitelist().filter(e => e.id !== id));
        return Result.success({ id }) as Result<T>;
    }
    if (method === 'POST' && url.pathname === '/data/whitelist/save') {
        const entryData = JSON.parse(body as string) as WhitelistEntry;
        const isNew = !entryData.id;
        let updatedEntry: WhitelistEntry;
        if (isNew) {
            updatedEntry = { ...entryData, id: `WL-NEW-${Date.now()}` };
            setMockWhitelist([...getMockWhitelist(), updatedEntry]);
        } else {
            updatedEntry = { ...entryData };
            setMockWhitelist(getMockWhitelist().map(e => e.id === entryData.id ? updatedEntry : e));
        }
        return Result.success(updatedEntry) as Result<T>;
    }
    if (method === 'GET' && url.pathname.startsWith('/data/whitelist/')) {
        const id = pathParts[pathParts.length - 1];
        const entry = getMockWhitelist().find(e => e.id === id);
        return entry ? Result.success({ entry }) as Result<T> : Result.failure([new ApiError('NOT_FOUND', 'Entry not found')]) as Result<T>;
    }

    // BLACKLIST
     if (method === 'GET' && url.pathname === '/data/blacklist') {
        return Result.success(getMockBlacklist()) as Result<T>;
    }
    if (method === 'POST' && url.pathname === '/data/blacklist/save') {
        const entryData = JSON.parse(body as string) as BlacklistEntry;
        const isNew = !entryData.id;
        let updatedEntry: BlacklistEntry;
        if (isNew) {
            updatedEntry = { ...entryData, id: `BL-NEW-${Date.now()}` };
            setMockBlacklist([...getMockBlacklist(), updatedEntry]);
        } else {
            updatedEntry = { ...entryData };
            setMockBlacklist(getMockBlacklist().map(e => e.id === entryData.id ? updatedEntry : e));
        }
        return Result.success(updatedEntry) as Result<T>;
    }
    if (method === 'POST' && url.pathname === '/data/blacklist/delete') {
        const { id } = JSON.parse(body as string);
        setMockBlacklist(getMockBlacklist().filter(e => e.id !== id));
        return Result.success({ id }) as Result<T>;
    }
    if (method === 'GET' && url.pathname.startsWith('/data/blacklist/')) {
        const id = pathParts[pathParts.length - 1];
        const entry = getMockBlacklist().find(e => e.id === id);
        return entry ? Result.success({ entry }) as Result<T> : Result.failure([new ApiError('NOT_FOUND', 'Entry not found')]) as Result<T>;
    }

    // SHIFTS
    if (method === 'GET' && url.pathname.startsWith('/data/shifts/')) {
        const id = pathParts[pathParts.length - 1];
        const shift = getMockShifts().find(s => s.id === id);
        if (shift) {
            return Result.success({ shift }) as Result<T>;
        }
        return Result.failure([new ApiError('NOT_FOUND', `Shift with id ${id} not found.`)]) as Result<T>;
    }

    if (method === 'POST' && url.pathname === '/data/shifts/save') {
        const shiftData = JSON.parse(body as string) as Shift;
        const { name } = getAuthInfo();
        const isNew = !shiftData.id;

        let updatedShift: Shift;
        if (isNew) {
            updatedShift = { ...shiftData, id: `SHIFT-NEW-${Date.now()}`, lastModified: new Date().toISOString(), createdBy: name };
            setMockShifts([...getMockShifts(), updatedShift]);
        } else {
            updatedShift = { ...shiftData, lastModified: new Date().toISOString() };
            setMockShifts(getMockShifts().map(d => d.id === shiftData.id ? updatedShift : d));
        }
        return Result.success(updatedShift) as Result<T>;
    }

    if (method === 'GET' && url.pathname === '/data/shifts') {
        return Result.success(getMockShifts()) as Result<T>;
    }
    if (method === 'POST' && url.pathname === '/data/shifts/delete') {
        const { id } = JSON.parse(body as string);
        const currentShifts = getMockShifts();
        const initialLength = currentShifts.length;
        setMockShifts(currentShifts.filter(s => s.id !== id));
        if (getMockShifts().length < initialLength) {
            return Result.success({ id }) as Result<T>;
        }
        return Result.failure([new ApiError('NOT_FOUND', 'Shift not found.')]) as Result<T>;
    }
    if (method === 'POST' && url.pathname === '/data/shifts/toggle-status') {
        const { id } = JSON.parse(body as string);
        let updatedShift;
        const newShifts = getMockShifts().map(shift => {
            if (shift.id === id) {
                updatedShift = { ...shift, status: shift.status === 'Active' ? 'Inactive' : 'Active' };
                return updatedShift;
            }
            return shift;
        });
        setMockShifts(newShifts);
        return updatedShift 
            ? Result.success(updatedShift) as Result<T> 
            : Result.failure([new ApiError('NOT_FOUND', 'Shift not found.')]) as Result<T>;
    }

    // OFFICER ASSIGNMENTS
    if (method === 'GET' && url.pathname === '/data/officer-assignments') {
        const assignments = getMockOfficerAssignments().map(a => {
            const officer = users.find(u => u.id === a.officerId);
            const shift = getMockShifts().find(s => s.id === a.shiftId);
            const zone = mockZones.find(z => z.id === a.zoneId);
            const terminal = mockTerminals.find(t => t.id === zone?.terminalId);
            const port = mockPorts.find(p => p.id === terminal?.portId);
            return {
                ...a,
                officerName: officer?.name || 'N/A',
                shiftName: shift?.name || 'N/A',
                portName: port?.name || 'N/A',
                terminalName: terminal?.name || 'N/A',
                zoneName: zone?.name || 'N/A',
                portId: port?.id,
            };
        });
        return Result.success(assignments) as Result<T>;
    }

    if (method === 'GET' && url.pathname.startsWith('/data/officer-assignments/')) {
        const id = pathParts[pathParts.length - 1];
        const assignment = getMockOfficerAssignments().find(a => a.id === id);
        if (assignment) {
            return Result.success({ assignment }) as Result<T>;
        }
        return Result.failure([new ApiError('NOT_FOUND', 'Assignment not found.')]) as Result<T>;
    }

    if (method === 'POST' && url.pathname === '/data/officer-assignments/save') {
        const assignmentData = JSON.parse(body as string) as OfficerAssignment;
        const isNew = !assignmentData.id;
        let updatedAssignment: OfficerAssignment;
        if (isNew) {
            updatedAssignment = { ...assignmentData, id: `ASSIGN-NEW-${Date.now()}` };
            setMockOfficerAssignments([...getMockOfficerAssignments(), updatedAssignment]);
        } else {
            updatedAssignment = { ...assignmentData };
            setMockOfficerAssignments(getMockOfficerAssignments().map(a => a.id === assignmentData.id ? updatedAssignment : a));
        }
        return Result.success(updatedAssignment) as Result<T>;
    }

    if (method === 'POST' && url.pathname === '/data/officer-assignments/delete') {
        const { id } = JSON.parse(body as string);
        setMockOfficerAssignments(getMockOfficerAssignments().filter(a => a.id !== id));
        return Result.success({ id }) as Result<T>;
    }


    // CONFIGURATION DATA
    if(method === 'GET' && url.pathname === '/data/desks') {
        const moduleType = url.searchParams.get('moduleType');
        const allPorts = mockPorts.filter(p => p.type.toLowerCase() === moduleType);
        const allTerminals = mockTerminals.filter(t => allPorts.some(p => p.id === t.portId));
        
        const desksForModule = getMockOfficerDesks().filter(desk => allTerminals.some(t => t.id === desk.terminalId));

        const enrichedDesks = desksForModule.map(desk => {
            const terminal = mockTerminals.find(t => t.id === desk.terminalId);
            const port = mockPorts.find(p => p.id === terminal?.portId);
            const zone = mockZones.find(z => z.id === desk.zoneId);
            return {
                ...desk,
                portId: port?.id,
                portName: port?.name,
                terminalName: terminal?.name,
                zoneName: zone?.name,
            };
        });
        return Result.success(enrichedDesks) as Result<T>;
    }

    if (method === 'POST' && url.pathname === '/data/desks/update-status') {
        const { deskId, status } = JSON.parse(body as string);
        const newDesks = getMockOfficerDesks().map(desk => 
            desk.id === deskId 
            ? { ...desk, status, lastUpdatedAt: new Date().toISOString() } 
            : desk
        );
        setMockOfficerDesks(newDesks);
        const updatedDesk = newDesks.find(d => d.id === deskId);
        return Result.success(updatedDesk) as Result<T>;
    }

    if (method === 'POST' && url.pathname === '/data/desks/save') {
        let deskData = JSON.parse(body as string) as OfficerDesk;
        const isNew = !deskData.id;
        
        if (isNew) {
            deskData = { ...deskData, id: `DESK-NEW-${Date.now()}` };
            const newDesks = [...getMockOfficerDesks(), deskData];
            setMockOfficerDesks(newDesks);
        } else {
            const newDesks = getMockOfficerDesks().map(d => d.id === deskData.id ? deskData : d);
            setMockOfficerDesks(newDesks);
        }
        return Result.success(deskData) as Result<T>;
    }
    
    if (method === 'POST' && url.pathname === '/data/desks/delete') {
        const { id } = JSON.parse(body as string);
        setMockOfficerDesks(getMockOfficerDesks().filter(d => d.id !== id));
        return Result.success({ id }) as Result<T>;
    }

    if (method === 'GET' && url.pathname === '/data/ports') {
        const moduleType = url.searchParams.get('moduleType');
        let portsForModule = mockPorts;
        if (moduleType === 'egate') {
            // E-gates are typically at airports, so return airport-type ports.
            portsForModule = mockPorts.filter(p => p.type === 'Airport');
        } else if (moduleType) {
            portsForModule = mockPorts.filter(p => p.type.toLowerCase() === moduleType);
        }
        return Result.success(portsForModule) as Result<T>;
    }
    if (method === 'GET' && url.pathname === '/data/terminals') {
        return Result.success(mockTerminals) as Result<T>;
    }
    if (method === 'GET' && url.pathname === '/data/zones') {
        return Result.success(mockZones) as Result<T>;
    }
    if (method === 'GET' && url.pathname === '/data/workflows') {
        return Result.success(mockWorkflows) as Result<T>;
    }
    if (method === 'GET' && url.pathname === '/data/risk-profiles') {
        return Result.success(mockRiskProfiles) as Result<T>;
    }


    // DASHBOARD DATA
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

    if (method === 'GET' && url.pathname === '/dashboard/prediction') {
        const module = url.searchParams.get('module');
        if (module && (predictionData as any)[module]) {
            return Result.success((predictionData as any)[module]) as Result<T>;
        }
        return Result.success(predictionData) as Result<T>;
    }
    
    if (method === 'GET' && url.pathname === '/dashboard/gate-rejection-reasons') {
        return Result.success(gateRejectionReasonsData) as Result<T>;
    }

    if (method === 'GET' && url.pathname === '/dashboard/transaction-lists') {
        return Result.success(transactionListData) as Result<T>;
    }
    
    if (method === 'GET' && url.pathname === '/dashboard/transaction-breakdown') {
        return Result.success(transactionBreakdownData) as Result<T>;
    }

    if (method === 'GET' && url.pathname === '/dashboard/stats-error') {
        const errorResponse = { "error": "invalid_token", "error_description": "The access token is expired or invalid", "user_id": 12345, "internal_debug_info": "trace_id: xyz-abc-123" };
        return Result.failure([new ApiError("INVALID_TOKEN", JSON.stringify(errorResponse))]) as Result<T>;
    }

    if (method === 'GET' && url.pathname === '/dashboard/gate-performance') {
        return Result.success(gatePerformanceData) as Result<T>;
    }
    
    if (method === 'GET' && url.pathname === '/dashboard/officer-performance') {
        return Result.success(officerPerformanceData) as Result<T>;
    }

    if (method === 'GET' && url.pathname === '/dashboard/processing-time-distribution') {
        return Result.success(processingTimeDistributionData) as Result<T>;
    }

    if (method === 'GET' && url.pathname === '/dashboard/seaport-traveler-categories') {
        return Result.success(seaportTravelerCategoriesData) as Result<T>;
    }

    return Result.failure([new ApiError('NOT_FOUND', `Mock endpoint ${method} ${endpoint} not found.`)]) as Result<T>;
}
