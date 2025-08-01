
import type { Port, Terminal, Zone, Workflow, RiskProfile, Machine, SystemMessage } from './configuration';
import type { OfficerAssignment } from './workload';
import { PassengerStatus, RiskLevel, Gender, VisaType, TransactionType, EntranceType, TransactionStatus, Decision, CivilFileType, OfficerDeskStatus, MovementType, GateType, GateStatus, MediaType, ListStatus, BlacklistCategory, GateLogEventType, GateLogStatus, DocumentType, MachineType } from '@/lib/enums';

export interface Passenger {
    id: string;
    firstName: string;
    lastName: string;
    localizedName?: string;
    passportNumber: string;
    nationality: string;
    dateOfBirth: string;
    gender: Gender;
    status: PassengerStatus;
    riskLevel: RiskLevel;
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
    visaType?: VisaType;
    visaExpiryDate?: string;
    residencyFileNumber?: string;
    nationalId?: string;
  }
  
  export type CivilRecord = Passenger & {
    documentType: DocumentType;
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
    type: TransactionType;
    gate: string;
    entranceType: EntranceType;
    dateTime: string;
    status: TransactionStatus;
    duration: string;
    riskScore: number;
    officerName: string;
    finalDecision: Decision;
    triggeredRules: { alert: string, acknowledged: boolean }[];
    notes?: string;
    workflow?: WorkflowStep[];
    tripInformation?: TripInformation;
    civilInformation?: {
      fileType?: CivilFileType;
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
    portId: string;
    terminalId: string;
    zoneId: string;
    portName?: string;
    terminalName?: string;
    zoneName?: string;
    ipAddress: string;
    macAddress: string;
    status: OfficerDeskStatus;
    lastUpdatedAt: string;
    movementType: MovementType;
    workflowId: string;
    riskRuleId: string;
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
    type: GateType;
    status: GateStatus;
    ipAddress: string;
    macAddress: string;
    lastMaintenance: string;
    lastModified: string;
    warrantyStartDate?: Date;
    warrantyEndDate?: Date;
    currentLoad?: number;
    passengerCount?: number;
    avgProcessingTime?: string;
    equipment?: { name: string; status: 'online' | 'offline' }[];
    connectedMachines?: { type: MachineType, name: string }[];
    entryConfig?: {
      workflowId: string;
      riskProfileId: string;
      capacity: number;
      configurationFile?: string;
    };
    exitConfig?: {
      workflowId: string;
      riskProfileId: string;
      capacity: number;
      configurationFile?: string;
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
  type: MediaType;
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
  status: ListStatus;
  dateAdded: string; // validFrom
  validUntil: string;
  addedBy: string;
  reason: string;
  attachmentUrl?: string;
  // new fields for more details
  localizedName?: string;
  passportNumber?: string;
  passportExpiryDate?: string;
}

export interface BlacklistEntry {
  id: string;
  passengerId?: string;
  name: string;
  nationality: string;
  status: ListStatus;
  reason: string;
  category: BlacklistCategory;
  dateAdded: string;
  addedBy: string;
  notes?: string;
  attachmentUrl?: string;
  
  // Passenger details
  localizedName?: string;
  passportNumber: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  passportCountry?: string;

  // Validity
  validFrom?: string;
  validUntil?: string;
}

export interface GateLogEntry {
  id: string;
  timestamp: string;
  gateId: string;
  gateName: string;
  eventType: GateLogEventType;
  status: GateLogStatus;
  description: string;
  actor: string; // e.g., 'System', 'Officer John Doe'
}


export { Port, Terminal, Zone, Workflow, RiskProfile, Machine, SystemMessage, OfficerAssignment };
    
