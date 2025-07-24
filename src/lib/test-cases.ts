import type { TestCase } from '@/types/live-processing';

export const testCases: TestCase[] = [
  {
    id: 'case_001',
    scenario: 'Standard UAE Citizen - Low Risk',
    passenger: {
      id: 'P004',
      firstName: 'Fatima',
      lastName: 'Al-Mansoori',
      passportNumber: 'UAE12345678',
      nationality: 'United Arab Emirates',
      dateOfBirth: '1990-01-15',
      gender: 'Female',
      status: 'Active',
      riskLevel: 'Low',
      profilePicture: 'https://placehold.co/400x400.png',
      passportExpiryDate: '2030-01-01',
    },
    workflowTemplate: [
      { id: 'document_scan', name: 'Document Scan', description: 'Read passport data', duration: '1s' },
      { id: 'data_confirmation', name: 'Data Confirmation', description: 'Officer verifies extracted data', duration: 'manual' },
      { id: 'biometric_capture', name: 'Biometric Capture', description: 'Capture face, iris, and fingerprints', duration: 'manual' },
      { id: 'visa_check', name: 'Visa Check', description: 'Verify visa requirements', duration: '0.5s' },
      { id: 'blacklist_check', name: 'Security Checks', description: 'Check against watchlists', duration: '1.5s' },
    ],
    expectedOutcome: 'APPROVED',
    finalRiskScore: 10,
    alerts: [
      {
        variant: 'default',
        title: 'Clear',
        description: 'No significant risks identified. Standard processing.',
      },
    ],
  },
  {
    id: 'case_002',
    scenario: 'High-Risk Nationality - Manual Review',
    passenger: {
      id: 'P005',
      firstName: 'Alex',
      lastName: 'Volkov',
      passportNumber: 'RUS98765432',
      nationality: 'Russian Federation',
      dateOfBirth: '1982-07-22',
      gender: 'Male',
      status: 'Active',
      riskLevel: 'Medium',
      profilePicture: 'https://placehold.co/400x400.png',
      passportExpiryDate: '2028-05-10',
    },
    workflowTemplate: [
       { id: 'document_scan', name: 'Document Scan', description: 'Read passport data', duration: '1s' },
       { id: 'data_confirmation', name: 'Data Confirmation', description: 'Officer verifies extracted data', duration: 'manual' },
       { id: 'biometric_capture', name: 'Biometric Capture', description: 'Capture face, iris, and fingerprints', duration: 'manual' },
       { id: 'visa_check', name: 'Visa Check', description: 'Verify visa requirements', duration: '1s' },
       { id: 'blacklist_check', name: 'Security Checks', description: 'Check against watchlists', duration: '2s' },
    ],
    expectedOutcome: 'MANUAL_REVIEW',
    finalRiskScore: 65,
    alerts: [
      {
        variant: 'destructive',
        title: 'High-Risk Country of Origin',
        description: 'Passenger nationality is on the risk watch list. Additional screening required.',
      },
      {
        variant: 'default',
        title: 'Irregular Travel Pattern',
        description: 'Multiple short trips to different countries in the last 6 months.',
      },
    ],
  },
  {
    id: 'case_003',
    scenario: 'Watchlist Match - REJECTED',
    passenger: {
        id: "P003",
        firstName: "Wei",
        lastName: "Chen",
        passportNumber: "G55566677",
        nationality: "China",
        dateOfBirth: "1988-08-08",
        gender: "Male",
        status: "Watchlisted",
        riskLevel: "High",
        profilePicture: "https://placehold.co/400x400.png",
        passportExpiryDate: '2025-11-20',
    },
    workflowTemplate: [
        { id: 'document_scan', name: 'Document Scan', description: 'Read passport data', duration: '1s' },
        { id: 'data_confirmation', name: 'Data Confirmation', description: 'Officer verifies extracted data', duration: 'manual' },
        { id: 'biometric_capture', name: 'Biometric Capture', description: 'Capture face, iris, and fingerprints', duration: 'manual' },
        { id: 'visa_check', name: 'Visa Check', description: 'Verify visa requirements', duration: '1s' },
        { id: 'blacklist_check', name: 'Security Checks', description: 'Check against watchlists', duration: '2s' },
    ],
    expectedOutcome: 'REJECTED',
    finalRiskScore: 95,
    alerts: [
        {
            variant: 'destructive',
            title: 'Blacklist Match Found',
            description: 'Passenger matches an entry on the international no-fly list. Immediate rejection and detention as per protocol.',
        }
    ],
  }
];
