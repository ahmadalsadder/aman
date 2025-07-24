
import type { Passenger, Transaction, OfficerDesk } from "@/types/live-processing";

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
    },
    {
      id: 'TXN951753486',
      passengerId: 'P002',
      passengerName: 'Jane Smith',
      passportNumber: 'B87654321',
      type: 'Entry',
      gate: 'Desk 02',
      entranceType: 'Officer Desk',
      dateTime: '2023-05-20 14:35',
      status: 'Completed',
      duration: '3m 45s',
      riskScore: 45,
      officerName: 'Emily White',
      finalDecision: 'Approved',
      triggeredRules: [{ alert: 'Baggage Anomaly', acknowledged: true }],
      officerNotes: 'Passenger states the bag was a gift. Contents cleared after secondary screening.'
    },
    {
      id: 'TXN357159852',
      passengerId: 'P003',
      passengerName: 'Wei Chen',
      passportNumber: 'G55566677',
      type: 'Entry',
      gate: 'Desk 01',
      entranceType: 'Officer Desk',
      dateTime: '2023-05-19 18:00',
      status: 'Pending',
      duration: '5m 10s',
      riskScore: 85,
      officerName: 'David Green',
      finalDecision: 'Manual Review',
      triggeredRules: [{ alert: 'Watchlist Match', acknowledged: false }],
      officerNotes: 'Passenger matches a name on the internal watchlist. Escalated to supervisor for identity verification.'
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
