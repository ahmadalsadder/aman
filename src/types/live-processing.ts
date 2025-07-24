
export interface Passenger {
    id: string;
    firstName: string;
    lastName: string;
    passportNumber: string;
    nationality: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female' | 'Other';
    status: 'Active' | 'Inactive' | 'Watchlisted';
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
    visaExpiryDate?: string;
    residencyFileNumber?: string;
    nationalId?: string;
  }
  
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
    type: 'Entry' | 'Exit';
    gate: string;
    entranceType: 'E-Gate' | 'Officer Desk';
    dateTime: string;
    status: 'Completed' | 'Failed' | 'Pending';
    duration: string;
    riskScore: number;
    officerName: string;
    finalDecision: 'Approved' | 'Rejected' | 'Manual Review';
    triggeredRules: { alert: string, acknowledged: boolean }[];
    officerNotes?: string;
    workflowSteps?: WorkflowStep[];
    tripInformation?: TripInformation;
    civilInformation?: {
      fileType?: 'Citizen' | 'Visa' | 'Residency';
      fileExpiryDate?: string;
      nationalId?: string;
      fileNumber?: string;
    }
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
    
