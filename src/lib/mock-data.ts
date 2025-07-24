
import type { Passenger, Transaction, OfficerDesk } from "@/types/live-processing";
import { Plane, Car, Ship } from "lucide-react";

export const mockPassengers: Passenger[] = [
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

export const mockTransactions: Transaction[] = [
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

export const mockOfficerDesks: OfficerDesk[] = [
    { id: 'D01', name: 'Desk 01' },
    { id: 'D02', name: 'Desk 02' },
    { id: 'D03', name: 'Desk 03' },
    { id: 'D04', name: 'Desk 04' },
];


export const mockVisaDatabase: { passportNumber: string, nationality: string, visaType: string, expiryDate: string }[] = [
    {
        passportNumber: "J98765432",
        nationality: "Jordan",
        visaType: "Tourism",
        expiryDate: "2025-06-30"
    }
];
