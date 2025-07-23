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
    triggeredRules: string[];
    officerNotes?: string;
    workflowSteps: WorkflowStep[];
    tripInformation?: {
      flightNumber?: string;
      carrier?: string;
      departureCountry?: string;
      seatNumber?: string;
    };
    civilInformation?: {
      fileType?: 'Citizen' | 'Visa' | 'Residency';
      fileExpiryDate?: string;
      nationalId?: string;
      fileNumber?: string;
    }
  }
  