
import type { Passenger, Transaction, OfficerDesk, Gate, Media, WhitelistEntry, BlacklistEntry } from "@/types/live-processing";
import type { Shift, DayOfWeek } from "@/types/workload";
import { Plane, Car, Ship } from "lucide-react";
import type { Port, Terminal, Zone, Workflow, RiskProfile, User } from '@/types';

let mockPassengers: Passenger[] = [
    {
      id: "P001",
      firstName: "John",
      lastName: "Doe",
      passportNumber: "A12345678",
      nationality: "United States",
      dateOfBirth: "1985-05-20",
      gender: "Male",
      status: "Active",
      riskLevel: "Low",
      lastEntry: "2023-10-15",
      profilePicture: "https://placehold.co/400x400.png"
    },
    {
      id: "P002",
      firstName: "Jane",
      lastName: "Smith",
      passportNumber: "B87654321",
      nationality: "United Kingdom",
      dateOfBirth: "1992-11-30",
      gender: "Female",
      status: "Active",
      riskLevel: "Medium",
      lastEntry: "2023-11-01",
      notes: "Previous baggage inspection triggered a minor alert.",
      profilePicture: "https://placehold.co/400x400.png"
    },
    {
      id: "P003",
      firstName: "Wei",
      lastName: "Chen",
      passportNumber: "G55566677",
      nationality: "China",
      dateOfBirth: "1988-08-08",
      gender: "Male",
      status: "Watchlisted",
      riskLevel: "High",
      profilePicture: "https://placehold.co/400x400.png"
    }
];

let mockTransactions: Transaction[] = [
    {
      id: 'TXN741852963',
      passengerId: 'P001',
      passengerName: 'John Doe',
      passportNumber: 'A12345678',
      type: 'Entry',
      gate: 'E-Gate 05',
      entranceType: 'E-Gate',
      dateTime: '2023-05-20 14:30',
      status: 'Completed',
      duration: '1m 15s',
      riskScore: 15,
      officerName: 'System',
      finalDecision: 'Approved',
      triggeredRules: [],
      notes: 'Standard entry, no issues.',
      workflow: [
        { id: 'doc_scan', name: 'Document Scan', status: 'Completed', timestamp: '14:30:05' },
        { id: 'biometric_capture', name: 'Biometric Capture', status: 'Completed', timestamp: '14:30:15' },
        { id: 'security_ai_checks', name: 'Security & AI Checks', status: 'Completed', timestamp: '14:30:45' },
        { id: 'officer_review', name: 'Officer Review', status: 'Completed', timestamp: '14:31:20' }
      ],
      tripInformation: { type: 'airport', flightNumber: 'EK202', carrier: 'Emirates', departureCountry: 'USA', seatNumber: '14A' },
      passportScan: 'https://placehold.co/600x400.png',
      biometrics: {
        face: 'https://placehold.co/400x400.png',
        leftIris: 'https://placehold.co/400x400.png',
        rightIris: 'https://placehold.co/400x400.png',
        fingerprint: 'https://placehold.co/400x400.png',
      },
      biometricMatch: {
        faceMatch: 99,
        irisMatch: 97,
        fingerprintMatch: 98,
      },
      civilInformation: {
        fileType: 'Visa',
        nationalId: 'N/A',
        fileNumber: 'V-987654',
        fileExpiryDate: '2024-12-31'
      },
      passenger: mockPassengers.find(p => p.id === 'P001'),
    },
    {
      id: 'TXN951753486',
      passengerId: 'P002',
      passengerName: 'Jane Smith',
      passportNumber: 'B87654321',
      type: 'Exit',
      gate: 'Desk 02',
      entranceType: 'Officer Desk',
      dateTime: '2023-05-20 14:35',
      status: 'Completed',
      duration: '3m 45s',
      riskScore: 45,
      officerName: 'Emily White',
      finalDecision: 'Approved',
      triggeredRules: [{ alert: 'Baggage Anomaly', acknowledged: true }],
      notes: 'Passenger states the bag was a gift. Contents cleared after secondary screening.',
      tripInformation: { type: 'landport', vehiclePlateNumber: 'UK-JS-123', vehicleType: 'Car', laneNumber: '3', vehicleMake: 'Range Rover' },
      passenger: mockPassengers.find(p => p.id === 'P002'),
    },
    {
      id: 'TXN357159852',
      passengerId: 'P003',
      passengerName: 'Wei Chen',
      passportNumber: 'G55566677',
      type: 'Transit',
      gate: 'Desk 01',
      entranceType: 'Officer Desk',
      dateTime: '2023-05-19 18:00',
      status: 'Pending',
      duration: '5m 10s',
      riskScore: 85,
      officerName: 'David Green',
      finalDecision: 'Manual Review',
      triggeredRules: [{ alert: 'Watchlist Match', acknowledged: false }],
      notes: 'Passenger matches a name on the internal watchlist. Escalated to supervisor for identity verification.',
      tripInformation: { type: 'seaport', vesselName: 'Oceanic Explorer', voyageNumber: 'OE-555', berth: 'C4', lastPortOfCall: 'SGP' },
      passenger: mockPassengers.find(p => p.id === 'P003'),
    }
];

let mockOfficerDesks: OfficerDesk[] = [
    { id: 'DESK-A1', name: 'Officer Desk A1', terminalId: 'TERM-DXB-1', zoneId: 'ZONE-A', ipAddress: '192.168.1.10', macAddress: '00:1A:2B:3C:4D:5E', status: 'Active', lastUpdatedAt: '2023-05-20T10:00:00Z', movementType: 'Entry', workflowId: 'WF-Standard', riskRuleId: 'RR-Low' },
    { id: 'DESK-A2', name: 'Officer Desk A2', terminalId: 'TERM-DXB-1', zoneId: 'ZONE-A', ipAddress: '192.168.1.11', macAddress: '00:1A:2B:3C:4D:5F', status: 'Inactive', lastUpdatedAt: '2023-05-19T11:30:00Z', movementType: 'Bidirectional', workflowId: 'WF-Standard', riskRuleId: 'RR-Low' },
    { id: 'DESK-B1', name: 'Officer Desk B1', terminalId: 'TERM-DXB-2', zoneId: 'ZONE-B', ipAddress: '192.168.2.20', macAddress: '11:22:33:44:55:66', status: 'Active', lastUpdatedAt: '2023-05-20T09:00:00Z', movementType: 'Exit', workflowId: 'WF-FastTrack', riskRuleId: 'RR-Med' },
    { id: 'DESK-S1', name: 'Officer Desk S1', terminalId: 'TERM-PC-1', zoneId: 'ZONE-SA', ipAddress: '10.0.1.5', macAddress: 'AA:BB:CC:DD:EE:FF', status: 'Active', lastUpdatedAt: '2023-05-20T12:00:00Z', movementType: 'Bidirectional', workflowId: 'WF-Standard', riskRuleId: 'RR-Low' },
    { id: 'DESK-L1', name: 'Officer Desk L1', terminalId: 'TERM-HE-1', zoneId: 'ZONE-LA', ipAddress: '172.16.0.100', macAddress: 'BB:CC:DD:EE:FF:00', status: 'Closed', lastUpdatedAt: '2023-04-10T15:00:00Z', movementType: 'Bidirectional', workflowId: 'WF-Standard', riskRuleId: 'RR-High' },
];

export const mockPorts: Port[] = [
    { id: 'PORT-DXB', name: 'Dubai International Airport', type: 'Airport' },
    { id: 'PORT-PC', name: 'Port Rashid', type: 'Seaport' },
    { id: 'PORT-HE', name: 'Hatta Land Port', type: 'Landport' },
];

export const mockTerminals: Terminal[] = [
    { id: 'TERM-DXB-1', name: 'Terminal 1', portId: 'PORT-DXB' },
    { id: 'TERM-DXB-2', name: 'Terminal 2', portId: 'PORT-DXB' },
    { id: 'TERM-DXB-3', name: 'Terminal 3', portId: 'PORT-DXB' },
    { id: 'TERM-PC-1', name: 'Cruise Terminal 1', portId: 'PORT-PC' },
    { id: 'TERM-PC-2', name: 'Cruise Terminal 2', portId: 'PORT-PC' },
    { id: 'TERM-HE-1', name: 'Main Terminal', portId: 'PORT-HE' },
];

export const mockZones: Zone[] = [
    { id: 'ZONE-A', name: 'Zone A', terminalId: 'TERM-DXB-1' },
    { id: 'ZONE-B', name: 'Zone B', terminalId: 'TERM-DXB-2' },
    { id: 'ZONE-SA', name: 'Arrivals', terminalId: 'TERM-PC-1' },
    { id: 'ZONE-LA', name: 'Commercial Lanes', terminalId: 'TERM-HE-1' },
];

export const mockWorkflows: Workflow[] = [
    { id: 'WF-Standard', name: 'Standard Processing' },
    { id: 'WF-FastTrack', name: 'Fast Track' },
    { id: 'WF-HighRisk', name: 'High-Risk Scrutiny' },
];

export const mockRiskProfiles: RiskProfile[] = [
    { id: 'RR-Low', name: 'Low Risk Profile' },
    { id: 'RR-Med', name: 'Medium Risk Profile' },
    { id: 'RR-High', name: 'High Risk Profile' },
];


export const mockVisaDatabase: { passportNumber: string, nationality: string, visaType: string, expiryDate: string }[] = [
    {
        passportNumber: "J98765432",
        nationality: "Jordan",
        visaType: "Tourism",
        expiryDate: "2025-06-30"
    }
];

let mockGates: Gate[] = [
    { id: 'EGATE-01', code: 'A-01', name: 'Main Entry Gate', terminalName: 'Terminal 1', type: 'Entry', status: 'Active', ipAddress: '192.168.1.50', macAddress: 'A1:B2:C3:D4:E5:F6', lastMaintenance: '2023-04-15', lastModified: '2023-05-20', currentLoad: 75, passengerCount: 15, avgProcessingTime: '45s', equipment: [{ name: 'Passport Reader', status: 'online' }, { name: 'Biometric Scanner', status: 'online' }], entryConfig: { workflowId: 'WF-Standard', riskProfileId: 'RR-Low', capacity: 20 } },
    { id: 'EGATE-02', code: 'A-02', name: 'Main Entry Gate', terminalName: 'Terminal 1', type: 'Entry', status: 'Active', ipAddress: '192.168.1.51', macAddress: 'A1:B2:C3:D4:E5:F7', lastMaintenance: '2023-04-16', lastModified: '2023-05-21', currentLoad: 50, passengerCount: 10, avgProcessingTime: '42s', equipment: [{ name: 'Passport Reader', status: 'online' }, { name: 'Biometric Scanner', status: 'online' }], entryConfig: { workflowId: 'WF-Standard', riskProfileId: 'RR-Low', capacity: 20 } },
    { id: 'EGATE-03', code: 'B-01', name: 'Business Class Gate', terminalName: 'Terminal 3', type: 'Bidirectional', status: 'Maintenance', ipAddress: '192.168.3.10', macAddress: 'A1:B2:C3:D4:E5:F8', lastMaintenance: '2023-05-18', lastModified: '2023-05-18', currentLoad: 0, passengerCount: 0, avgProcessingTime: 'N/A', equipment: [{ name: 'Passport Reader', status: 'offline' }, { name: 'Biometric Scanner', status: 'online' }], entryConfig: { workflowId: 'WF-FastTrack', riskProfileId: 'RR-Low', capacity: 15 }, exitConfig: { workflowId: 'WF-FastTrack', riskProfileId: 'RR-Low', capacity: 15 } },
    { id: 'EGATE-04', code: 'C-05', name: 'Exit Gate', terminalName: 'Terminal 1', type: 'Exit', status: 'Offline', ipAddress: '192.168.1.55', macAddress: 'A1:B2:C3:D4:E5:F9', lastMaintenance: '2023-03-20', lastModified: '2023-05-10', currentLoad: 0, passengerCount: 0, avgProcessingTime: 'N/A', equipment: [{ name: 'Passport Reader', status: 'offline' }, { name: 'Biometric Scanner', status: 'offline' }], exitConfig: { workflowId: 'WF-Standard', riskProfileId: 'RR-Low', capacity: 25 } },
];

let mockMedia: Media[] = [
    { 
        id: 'MEDIA-001', 
        name: 'Entry Greeting', 
        localizedName: 'تحية الدخول', 
        type: 'Audio', 
        status: 'Active', 
        description: 'Standard welcome audio for all entry points.', 
        lastModified: '2023-05-15', 
        createdBy: 'Admin User',
        mediaFiles: [
            { id: 'F001', language: 'English', fileName: 'entry_greeting_en.mp3', fileType: 'audio/mpeg', fileUrl: '/audio/entry_greeting_en.mp3' },
            { id: 'F002', language: 'Arabic', fileName: 'entry_greeting_ar.mp3', fileType: 'audio/mpeg', fileUrl: '/audio/entry_greeting_ar.mp3' },
        ]
    },
    { 
        id: 'MEDIA-002', 
        name: 'Prohibited Items', 
        localizedName: 'الأصناف الممنوعة', 
        type: 'Video', 
        status: 'Active', 
        description: 'Security video displaying prohibited items.', 
        lastModified: '2023-05-10', 
        createdBy: 'Admin User',
        mediaFiles: [
            { id: 'F003', language: 'English', fileName: 'prohibited_items.mp4', fileType: 'video/mp4', fileUrl: '/video/prohibited_items.mp4' },
        ]
    },
    { 
        id: 'MEDIA-003', 
        name: 'E-Gate Instructions', 
        localizedName: 'تعليمات البوابة الإلكترونية', 
        type: 'Image', 
        status: 'Inactive', 
        description: 'Visual guide for using the e-gates.', 
        lastModified: '2023-04-20', 
        createdBy: 'Admin User',
        mediaFiles: [
            { id: 'F004', language: 'English', fileName: 'egate_instructions_en.png', fileType: 'image/png', fileUrl: '/images/egate_instructions.png' },
            { id: 'F005', language: 'Arabic', fileName: 'egate_instructions_ar.png', fileType: 'image/png', fileUrl: '/images/egate_instructions_ar.png' },
        ]
    },
];

let mockWhitelist: WhitelistEntry[] = [
  { id: 'WL-001', passengerId: 'P001', name: 'John Doe', nationality: 'United States', status: 'Active', dateAdded: '2023-01-15', validUntil: '2025-01-14', addedBy: 'Admin User', reason: 'Diplomatic Staff' },
  { id: 'WL-002', passengerId: 'P002', name: 'Jane Smith', nationality: 'United Kingdom', status: 'Active', dateAdded: '2022-11-20', validUntil: '2024-11-19', addedBy: 'Admin User', reason: 'Frequent Business Traveler' },
  { id: 'WL-003', passengerId: 'P003', name: 'Wei Chen', nationality: 'China', status: 'Revoked', dateAdded: '2023-03-01', validUntil: '2024-03-01', addedBy: 'Admin User', reason: 'Temporary clearance for conference' },
];

let mockBlacklist: BlacklistEntry[] = [
    { id: 'BL-001', passengerId: 'P003', name: 'Wei Chen', nationality: 'China', reason: 'International No-Fly List Match', category: 'No-Fly', dateAdded: '2023-01-10', addedBy: 'Interpol Feed', passportNumber: 'G55566677' },
    { id: 'BL-002', name: 'Unknown Male', nationality: 'Syrian Arab Republic', reason: 'Attempted use of fraudulent document', category: 'Wanted', dateAdded: '2023-04-22', addedBy: 'Admin User', notes: 'Subject fled during secondary screening.', passportNumber: 'S12398765' },
];

export const daysOfWeek: DayOfWeek[] = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' },
];
  
export const mockShifts: Shift[] = [
    { id: 'S001', name: 'Morning Shift', startTime: '08:00', endTime: '16:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], status: 'Active', lastModified: '2023-05-20' },
    { id: 'S002', name: 'Evening Shift', startTime: '16:00', endTime: '00:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], status: 'Active', lastModified: '2023-05-20' },
    { id: 'S003', name: 'Night Shift', startTime: '00:00', endTime: '08:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], status: 'Inactive', lastModified: '2023-05-18' },
    { id: 'S004', name: 'Weekend Day', startTime: '09:00', endTime: '21:00', days: ['saturday', 'sunday'], status: 'Active', lastModified: '2023-05-19' },
];

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
        'airport:workload:view',
        'landport:dashboard:view', 'landport:dashboard:stats:view', 'landport:prediction:view', 'landport:dashboard:charts:view', 'landport:dashboard:officer-performance:view',
        'landport:workload:view',
        'seaport:dashboard:view', 'seaport:dashboard:stats:view', 'seaport:prediction:view', 'seaport:dashboard:charts:view', 'seaport:dashboard:officer-performance:view',
        'seaport:workload:view',
        'control-room:dashboard:view', 'control-room:dashboard:stats:view', 'control-room:dashboard:charts:view', 'control-room:dashboard:officer-performance:view',
        'duty-manager:view',
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

// Getters
export const getMockPassengers = () => mockPassengers;
export const getMockTransactions = () => mockTransactions;
export const getMockOfficerDesks = () => mockOfficerDesks;
export const getMockGates = () => mockGates;
export const getMockMedia = () => mockMedia;
export const getMockWhitelist = () => mockWhitelist;
export const getMockBlacklist = () => mockBlacklist;

// Setters
export const setMockPassengers = (newPassengers: Passenger[]) => {
    mockPassengers = newPassengers;
};
export const setMockTransactions = (newTransactions: Transaction[]) => {
    mockTransactions = newTransactions;
};
export const setMockOfficerDesks = (newDesks: OfficerDesk[]) => {
    mockOfficerDesks = newDesks;
};
export const setMockGates = (newGates: Gate[]) => {
    mockGates = newGates;
};
export const setMockMedia = (newMedia: Media[]) => {
    mockMedia = newMedia;
};
export const setMockWhitelist = (newWhitelist: WhitelistEntry[]) => {
    mockWhitelist = newWhitelist;
};
export const setMockBlacklist = (newBlacklist: BlacklistEntry[]) => {
    mockBlacklist = newBlacklist;
};

// This export is needed for the mockApi to work.
export { users, mainDashboardData, dashboardStats, airportDashboardData, passengerData, transactionOverviewData, forecastData, gateRejectionReasonsData, transactionListData, transactionBreakdownData, gatePerformanceData, officerPerformanceData, processingTimeDistributionData, seaportTravelerCategoriesData, predictionData };
