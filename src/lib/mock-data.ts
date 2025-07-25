


import type { Passenger, Transaction, OfficerDesk, Gate, Media, WhitelistEntry, BlacklistEntry } from "@/types/live-processing";
import type { Shift, DayOfWeek } from "@/types/workload";
import { Plane, Car, Ship } from "lucide-react";
import type { Port, Terminal, Zone, Workflow, RiskProfile } from '@/types/configuration';

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
