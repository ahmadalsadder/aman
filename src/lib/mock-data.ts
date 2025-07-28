

import { Status, PortType, RiskLevel, PassengerStatus, Gender } from './enums';
import type { Passenger, Transaction, OfficerDesk, Gate, Media, WhitelistEntry, BlacklistEntry, OfficerAssignment, GateLogEntry } from "@/types/live-processing";
import type { Shift, DayOfWeek } from "@/types/workload";
import { Plane, Car, Ship } from "lucide-react";
import type { Port, Terminal, Zone, Workflow, RiskProfile, User, CountryLanguageMapping, CountryPassportMapping, Machine, SystemMessage } from '@/types';

// This is the correct order for initialization.
// Define data first, then functions that use it.
const mockPassengersData: Passenger[] = [
    {
      id: "P001",
      firstName: "John",
      lastName: "Doe",
      passportNumber: "A12345678",
      nationality: "United States",
      dateOfBirth: "1985-05-20",
      gender: Gender.Male,
      status: PassengerStatus.Active,
      riskLevel: RiskLevel.Low,
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
      gender: Gender.Female,
      status: PassengerStatus.Active,
      riskLevel: RiskLevel.Medium,
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
      gender: Gender.Male,
      status: PassengerStatus.Flagged,
      riskLevel: RiskLevel.High,
      profilePicture: "https://placehold.co/400x400.png"
    }
];

const getMockTransactions = (): Transaction[] => [
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
      passenger: mockPassengersData.find(p => p.id === 'P001'),
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
      passenger: mockPassengersData.find(p => p.id === 'P002'),
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
      passenger: mockPassengersData.find(p => p.id === 'P003'),
    }
];


let mockPassengers = [...mockPassengersData];
let mockTransactions = getMockTransactions();

let mockOfficerDesks: OfficerDesk[] = [
    { id: 'DESK-A1', name: 'Officer Desk A1', terminalId: 'TERM-DXB-1', zoneId: 'ZONE-A', ipAddress: '192.168.1.10', macAddress: '00:1A:2B:3C:4D:5E', status: 'Active', lastUpdatedAt: '2023-05-20T10:00:00Z', movementType: 'Entry', workflowId: 'WF-Standard', riskRuleId: 'RR-Low' },
    { id: 'DESK-A2', name: 'Officer Desk A2', terminalId: 'TERM-DXB-1', zoneId: 'ZONE-A', ipAddress: '192.168.1.11', macAddress: '00:1A:2B:3C:4D:5F', status: 'Inactive', lastUpdatedAt: '2023-05-19T11:30:00Z', movementType: 'Bidirectional', workflowId: 'WF-Standard', riskRuleId: 'RR-Low' },
    { id: 'DESK-B1', name: 'Officer Desk B1', terminalId: 'TERM-DXB-2', zoneId: 'ZONE-B', ipAddress: '192.168.2.20', macAddress: '11:22:33:44:55:66', status: 'Active', lastUpdatedAt: '2023-05-20T09:00:00Z', movementType: 'Exit', workflowId: 'WF-FastTrack', riskRuleId: 'RR-Med' },
    { id: 'DESK-S1', name: 'Officer Desk S1', terminalId: 'TERM-PC-1', zoneId: 'ZONE-SA', ipAddress: '10.0.1.5', macAddress: 'AA:BB:CC:DD:EE:FF', status: 'Active', lastUpdatedAt: '2023-05-20T12:00:00Z', movementType: 'Bidirectional', workflowId: 'WF-Standard', riskRuleId: 'RR-Low' },
    { id: 'DESK-L1', name: 'Officer Desk L1', terminalId: 'TERM-HE-1', zoneId: 'ZONE-LA', ipAddress: '172.16.0.100', macAddress: 'BB:CC:DD:EE:FF:00', status: 'Closed', lastUpdatedAt: '2023-04-10T15:00:00Z', movementType: 'Bidirectional', workflowId: 'WF-Standard', riskRuleId: 'RR-High' },
];

let mockPorts: Port[] = [
    { id: 'PORT-DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', type: PortType.Airport, status: Status.Active, lastModified: '2023-05-20T10:00:00Z', createdBy: 'Admin User' },
    { id: 'PORT-PC', name: 'Port Rashid', city: 'Dubai', country: 'United Arab Emirates', type: PortType.Seaport, status: Status.Active, lastModified: '2023-05-20T10:00:00Z', createdBy: 'Admin User' },
    { id: 'PORT-HE', name: 'Hatta Land Port', city: 'Hatta', country: 'United Arab Emirates', type: PortType.Landport, status: Status.Inactive, lastModified: '2023-05-20T10:00:00Z', createdBy: 'Admin User' },
];

let mockTerminals: Terminal[] = [
    { id: 'TERM-DXB-1', name: 'Terminal 1', portId: 'PORT-DXB', status: Status.Active, lastModified: '2023-05-20T10:00:00Z', createdBy: 'Admin User' },
    { id: 'TERM-DXB-2', name: 'Terminal 2', portId: 'PORT-DXB', status: Status.Active, lastModified: '2023-05-20T10:00:00Z', createdBy: 'Admin User' },
    { id: 'TERM-DXB-3', name: 'Terminal 3', portId: 'PORT-DXB', status: Status.Active, lastModified: '2023-05-20T10:00:00Z', createdBy: 'Admin User' },
    { id: 'TERM-PC-1', name: 'Cruise Terminal 1', portId: 'PORT-PC', status: Status.Active, lastModified: '2023-05-20T10:00:00Z', createdBy: 'Admin User' },
    { id: 'TERM-PC-2', name: 'Cruise Terminal 2', portId: 'PORT-PC', status: Status.Inactive, lastModified: '2023-05-20T10:00:00Z', createdBy: 'Admin User' },
    { id: 'TERM-HE-1', name: 'Main Terminal', portId: 'PORT-HE', status: Status.Active, lastModified: '2023-05-20T10:00:00Z', createdBy: 'Admin User' },
];

let mockZones: Zone[] = [
    { id: 'ZONE-A', name: 'Zone A', terminalId: 'TERM-DXB-1', status: Status.Active, lastModified: '2023-05-20T10:00:00Z', createdBy: 'Admin User' },
    { id: 'ZONE-B', name: 'Zone B', terminalId: 'TERM-DXB-2', status: Status.Active, lastModified: '2023-05-20T10:00:00Z', createdBy: 'Admin User' },
    { id: 'ZONE-SA', name: 'Arrivals', terminalId: 'TERM-PC-1', status: Status.Active, lastModified: '2023-05-20T10:00:00Z', createdBy: 'Admin User' },
    { id: 'ZONE-LA', name: 'Commercial Lanes', terminalId: 'TERM-HE-1', status: Status.Active, lastModified: '2023-05-20T10:00:00Z', createdBy: 'Admin User' },
];

let mockMachines: Machine[] = [
    { id: 'MACHINE-01', name: 'Passport Scanner A1-1', type: 'Scanner', ipAddress: '192.168.1.200', macAddress: '1A:2B:3C:4D:5E:6F', status: 'Active', portId: 'PORT-DXB', terminalId: 'TERM-DXB-1', zoneId: 'ZONE-A', lastModified: '2023-05-21', createdBy: 'Admin User' },
    { id: 'MACHINE-02', name: 'Face Camera A1-1', type: 'Camera', ipAddress: '192.168.1.201', macAddress: '1A:2B:3C:4D:5E:70', status: 'Active', portId: 'PORT-DXB', terminalId: 'TERM-DXB-1', zoneId: 'ZONE-A', lastModified: '2023-05-21', createdBy: 'Admin User' },
    { id: 'MACHINE-03', name: 'Biometric Reader B2-1', type: 'Biometric', ipAddress: '192.168.2.200', macAddress: '1A:2B:3C:4D:5E:71', status: 'Inactive', portId: 'PORT-DXB', terminalId: 'TERM-DXB-2', zoneId: 'ZONE-B', lastModified: '2023-05-20', createdBy: 'Admin User' },
    { id: 'MACHINE-04', name: 'Seaport Scanner S1-1', type: 'Scanner', ipAddress: '10.0.1.50', macAddress: 'DE:AD:BE:EF:00:01', status: 'Maintenance', portId: 'PORT-PC', terminalId: 'TERM-PC-1', zoneId: 'ZONE-SA', lastModified: '2023-05-19', createdBy: 'Admin User' },
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

let mockShifts: Shift[] = [
    { id: 'S001', name: 'Morning Shift', startTime: '08:00', endTime: '16:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], status: 'Active', lastModified: '2023-05-20' },
    { id: 'S002', name: 'Evening Shift', startTime: '16:00', endTime: '00:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], status: 'Active', lastModified: '2023-05-20' },
    { id: 'S003', name: 'Night Shift', startTime: '00:00', endTime: '08:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], status: 'Inactive', lastModified: '2023-05-18' },
    { id: 'S004', name: 'Weekend Day', startTime: '09:00', endTime: '21:00', days: ['saturday', 'sunday'], status: 'Active', lastModified: '2023-05-19' },
];

let mockOfficerAssignments: OfficerAssignment[] = [
  { id: 'ASSIGN-001', officerId: '3', officerName: 'Viewer User', shiftId: 'S001', portId: 'PORT-DXB', terminalId: 'TERM-DXB-1', zoneId: 'ZONE-A', assignmentDate: '2023-10-25', status: 'Confirmed', module: 'airport' },
  { id: 'ASSIGN-002', officerId: '7', officerName: 'Landport Officer', shiftId: 'S002', portId: 'PORT-HE', terminalId: 'TERM-HE-1', zoneId: 'ZONE-LA', assignmentDate: '2023-10-25', status: 'Confirmed', module: 'landport' },
  { id: 'ASSIGN-003', officerId: '3', officerName: 'Viewer User', shiftId: 'S004', portId: 'PORT-PC', terminalId: 'TERM-PC-1', zoneId: 'ZONE-SA', assignmentDate: '2023-10-28', status: 'Pending', module: 'seaport' },
];

export const mockCountryLanguageMapping: CountryLanguageMapping[] = [
    { countryCode: 'USA', countryName: 'United States', language: 'English' },
    { countryCode: 'FRA', countryName: 'France', language: 'French' },
    { countryCode: 'SAU', countryName: 'Saudi Arabia', language: 'Arabic' },
    { countryCode: 'CHN', countryName: 'China', language: 'English' },
];
export const availableLanguages = ['English', 'Arabic', 'French', 'Spanish', 'Urdu'];

export const mockCountryPassportMapping: CountryPassportMapping[] = [
    { countryCode: 'USA', countryName: 'United States', passportType: 'E-Passport' },
    { countryCode: 'GBR', countryName: 'United Kingdom', passportType: 'E-Passport' },
    { countryCode: 'IND', countryName: 'India', passportType: 'Normal' },
    { countryCode: 'SYR', countryName: 'Syrian Arab Republic', passportType: 'Normal' },
];

let mockSystemMessages: SystemMessage[] = [
    {
        id: 'MSG-001',
        name: 'WelcomeMessage_DXB',
        description: 'Welcome to Dubai International Airport. Please have your travel documents ready.',
        localizedName: 'رسالة الترحيب',
        localizedDescription: 'مرحباً بكم في مطار دبي الدولي. يرجى تجهيز وثائق السفر الخاصة بكم.',
        category: 'General Alert',
        status: 'Active',
        lastModified: '2023-05-20',
        createdBy: 'Admin User',
    },
    {
        id: 'MSG-002',
        name: 'EGateDown_T3',
        description: 'E-Gates in Terminal 3 are temporarily out of service. Please proceed to the manual counters.',
        localizedName: 'تعطل البوابات الإلكترونية',
        localizedDescription: 'البوابات الإلكترونية في مبنى 3 خارج الخدمة مؤقتاً. يرجى التوجه إلى الكاونترات اليدوية.',
        category: 'Machine Issue',
        status: 'Active',
        lastModified: '2023-10-28',
        createdBy: 'Admin User',
    },
    {
        id: 'MSG-003',
        name: 'LiquidWarning',
        description: 'Please ensure all liquids in your carry-on are under 100ml and in a clear bag.',
        localizedName: 'تنبيه السوائل',
        localizedDescription: 'يرجى التأكد من أن جميع السوائل في حقائبكم المحمولة أقل من 100 مل وفي كيس شفاف.',
        category: 'General Alert',
        status: 'Inactive',
        lastModified: '2023-01-15',
        createdBy: 'Admin User',
    },
];

let mockGateLogs: GateLogEntry[] = [
    { id: 'LOG-001', timestamp: '2023-10-29 14:30:05', gateId: 'EGATE-01', gateName: 'Main Entry Gate', eventType: 'Transaction', status: 'Success', description: 'Passenger P001 processed successfully.', actor: 'System' },
    { id: 'LOG-002', timestamp: '2023-10-29 14:32:15', gateId: 'EGATE-02', gateName: 'Main Entry Gate 2', eventType: 'Error', status: 'Error', description: 'Biometric scanner failed to initialize. Error code: 503', actor: 'System' },
    { id: 'LOG-003', timestamp: '2023-10-29 14:35:00', gateId: 'EGATE-03', gateName: 'Business Class Gate', eventType: 'StatusChange', status: 'Offline', description: 'Gate taken offline for scheduled maintenance.', actor: 'Control Room' },
    { id: 'LOG-004', timestamp: '2023-10-29 14:40:22', gateId: 'EGATE-01', gateName: 'Main Entry Gate', eventType: 'Transaction', status: 'Failure', description: 'Passenger rejected due to biometric mismatch (78%).', actor: 'System' },
];


// Getters
export const getMockPassengers = () => mockPassengers;
export { getMockTransactions };
export const getMockOfficerDesks = () => mockOfficerDesks;
export const getMockPorts = () => mockPorts;
export const getMockTerminals = () => mockTerminals;
export const getMockZones = () => mockZones;
export const getMockGates = () => mockGates;
export const getMockMedia = () => mockMedia;
export const getMockWhitelist = () => mockWhitelist;
export const getMockBlacklist = () => mockBlacklist;
export const getMockShifts = () => mockShifts;
export const getMockOfficerAssignments = () => mockOfficerAssignments;
export const getMockMachines = () => mockMachines;
export const getMockSystemMessages = () => mockSystemMessages;
export const getMockGateLogs = () => mockGateLogs;


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
export const setMockShifts = (newShifts: Shift[]) => {
    mockShifts = newShifts;
};
export const setMockOfficerAssignments = (newAssignments: OfficerAssignment[]) => {
    mockOfficerAssignments = newAssignments;
};
export const setMockMachines = (newMachines: Machine[]) => {
    mockMachines = newMachines;
};
export const setMockPorts = (newPorts: Port[]) => {
    mockPorts = newPorts;
};
export const setMockTerminals = (newTerminals: Terminal[]) => {
    mockTerminals = newTerminals;
};
export const setMockZones = (newZones: Zone[]) => {
    mockZones = newZones;
};
export const setMockSystemMessages = (newSystemMessages: SystemMessage[]) => {
    mockSystemMessages = newSystemMessages;
};
export const setMockGateLogs = (newGateLogs: GateLogEntry[]) => {
    mockGateLogs = newGateLogs;
};


// Re-export other mock data if needed
export const mockData = {
    // All specific data objects have been moved to mock-api.ts
};
