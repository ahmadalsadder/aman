

import type { Port, Terminal, Zone, Workflow, RiskProfile } from './configuration';

export interface Passenger {
    id: string;
    firstName: string;
    lastName: string;
    localizedName?: string;
    passportNumber: string;
    nationality: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female' | 'Other';
    status: 'Active' | 'Inactive' | 'Flagged' | 'Blocked';
    riskLevel: 'Low' | 'Medium' | 'High';
    lastEntry?: string;
    notes?: string;
  
    // Biometric & Document URLs
    profilePicture?: string;
    passportPhotoUrl?: string;
    personalPhotoUrl?: string;
    faceScanUrl?: string;
    leftIrisScanUrl?: string;
    rightIrisScanUrl?: string;
    fingerprintUrl?: string;
  
    // Document Details from Passport
    passportIssueDate?: string;
    passportExpiryDate?: string;
    passportCountry?: string;
  
    // Optional additional info
    visaNumber?: string;
    visaType?: 'Tourism' | 'Work' | 'Residency';
    visaExpiryDate?: string;
    residencyFileNumber?: string;
    nationalId?: string;
  }
  
  export type CivilRecord = Passenger & {
    documentType: 'Citizen' | 'Resident' | 'Visitor';
    documentNumber: string;
  };

  export interface WorkflowStep {
    id: string;
    name: string;
    status: 'Pending' | 'Completed' | 'Skipped' | 'Failed';
    timestamp: string;
    details?: Record<string, any>;
  }

  export interface ProcessingWorkflowStep {
    id: string;
    name: string;
    description: string;
    duration: string; // e.g. "1.5s" or "manual"
    status: 'pending' | 'in-progress' | 'completed' | 'skipped' | 'failed';
    details?: React.ReactNode;
  }

  export type AirportTripInformation = {
    type: 'airport';
    flightNumber?: string;
    carrier?: string;
    departureCountry?: string;
    seatNumber?: string;
  };
  
  export type SeaportTripInformation = {
    type: 'seaport';
    vesselName?: string;
    voyageNumber?: string;
    berth?: string;
    lastPortOfCall?: string;
  };
  
  export type LandportTripInformation = {
    type: 'landport';
    vehiclePlateNumber?: string;
    vehicleType?: 'Car' | 'Bus' | 'Truck';
    laneNumber?: string;
    vehicleMake?: string;
  };
  
  export type TripInformation = AirportTripInformation | SeaportTripInformation | LandportTripInformation;
  
  
  export interface Transaction {
    id: string;
    passengerId: string;
    passengerName: string;
    passportNumber: string;
    type: 'Entry' | 'Exit' | 'Transit';
    gate: string;
    entranceType: 'E-Gate' | 'Officer Desk';
    dateTime: string;
    status: 'Completed' | 'Failed' | 'Pending' | 'In Progress';
    duration: string;
    riskScore: number;
    officerName: string;
    finalDecision: 'Approved' | 'Rejected' | 'Manual Review';
    triggeredRules: { alert: string, acknowledged: boolean }[];
    notes?: string;
    workflow?: WorkflowStep[];
    tripInformation?: TripInformation;
    civilInformation?: {
      fileType?: 'Citizen' | 'Visa' | 'Residency';
      fileExpiryDate?: string;
      nationalId?: string;
      fileNumber?: string;
    },
    passenger?: Partial<Passenger>;
    passportScan?: string | null;
    biometrics?: {
        face: string | null;
        leftIris: string | null;
        rightIris: string | null;
        fingerprint: string | null;
    };
    biometricMatch?: {
      irisMatch?: number;
      faceMatch?: number;
      fingerprintMatch?: number;
    };
  }

  export interface TestCase {
    id: string;
    scenario: string;
    passenger: Partial<Passenger>;
    workflowTemplate: Omit<ProcessingWorkflowStep, 'status' | 'details'>[];
    expectedOutcome: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';
    finalRiskScore: number;
    alerts: {
        variant: 'default' | 'destructive';
        title: string;
        description: string;
    }[];
}
  
export interface OfficerDesk {
    id: string;
    name: string;
}

export interface Gate {
    id: string;
    code: string;
    name: string;
    portId: string;
    terminalId: string;
    zoneId: string;
    terminalName: string;
    zoneName: string;
    type: 'Entry' | 'Exit' | 'Bidirectional' | 'VIP' | 'Crew';
    status: 'Active' | 'Maintenance' | 'Offline' | 'Limited';
    ipAddress: string;
    macAddress: string;
    lastMaintenance: string;
    lastModified: string;
    warrantyStartDate?: string;
    warrantyEndDate?: string;
    currentLoad?: number;
    passengerCount?: number;
    avgProcessingTime?: string;
    equipment?: { name: string; status: 'online' | 'offline' }[];
    entryConfig?: {
      workflowId: string;
      riskProfileId: string;
      capacity: number;
    };
    exitConfig?: {
      workflowId: string;
      riskProfileId: string;
      capacity: number;
    };
  }
export interface MediaFile {
    id: string;
    language: string;
    fileName: string;
    fileType: string;
    fileUrl: string; // This can be a data URI or a remote URL
    content?: string; // base64
    fileBytes?: ArrayBuffer;
}
export interface Media {
  id: string;
  name: string;
  localizedName?: string;
  type: 'Audio' | 'Image' | 'Video';
  status: 'Active' | 'Inactive';
  description: string;
  lastModified: string;
  createdBy: string;
  mediaFiles: MediaFile[];
}

export interface WhitelistEntry {
  id: string;
  passengerId: string;
  name: string;
  nationality: string;
  status: 'Active' | 'Expired' | 'Revoked';
  dateAdded: string;
  validUntil: string;
  addedBy: string;
  reason: string;
  attachmentUrl?: string;
}

export interface BlacklistEntry {
  id: string;
  passengerId?: string;
  name: string;
  nationality: string;
  reason: string;
  category: 'No-Fly' | 'Wanted' | 'Financial' | 'Other';
  dateAdded: string;
  addedBy: string;
  notes?: string;
  attachmentUrl?: string;
}

export { Port, Terminal, Zone, Workflow, RiskProfile };
    
