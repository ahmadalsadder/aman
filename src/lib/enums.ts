


export enum Status {
    Active = 'Active',
    Inactive = 'Inactive',
}

export enum PortType {
    Airport = 'Airport',
    Seaport = 'Seaport',
    Landport = 'Landport',
}

export enum Gender {
    Male = 'Male',
    Female = 'Female',
    Other = 'Other',
}

export enum PassengerStatus {
    Active = 'Active',
    Inactive = 'Inactive',
    Flagged = 'Flagged',
    Blocked = 'Blocked',
}

export enum RiskLevel {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
}

export enum VisaType {
    Tourism = 'Tourism',
    Work = 'Work',
    Residency = 'Residency',
}

export enum DayOfWeek {
    Monday = 'monday',
    Tuesday = 'tuesday',
    Wednesday = 'wednesday',
    Thursday = 'thursday',
    Friday = 'friday',
    Saturday = 'saturday',
    Sunday = 'sunday',
}

export enum TransactionType {
    Entry = 'Entry',
    Exit = 'Exit',
    Transit = 'Transit',
}

export enum TransactionStatus {
    Completed = 'Completed',
    Failed = 'Failed',
    Pending = 'Pending',
    InProgress = 'In Progress',
}

export enum Decision {
    Approved = 'Approved',
    Rejected = 'Rejected',
    ManualReview = 'Manual Review',
}

export enum EntranceType {
    EGate = 'E-Gate',
    OfficerDesk = 'Officer Desk',
}

export enum CivilFileType {
    Citizen = 'Citizen',
    Visa = 'Visa',
    Residency = 'Residency',
}

export enum MachineType {
    Scanner = 'Scanner',
    Biometric = 'Biometric',
    Camera = 'Camera',
}

export enum MachineStatus {
    Active = 'Active',
    Inactive = 'Inactive',
    Maintenance = 'Maintenance',
}

export enum MovementType {
    Entry = 'Entry',
    Exit = 'Exit',
    Bidirectional = 'Bidirectional',
}

export enum OfficerDeskStatus {
    Active = 'Active',
    Inactive = 'Inactive',
    Closed = 'Closed',
}

export enum GateType {
    Entry = 'Entry',
    Exit = 'Exit',
    Bidirectional = 'Bidirectional',
    VIP = 'VIP',
    Crew = 'Crew',
}

export enum GateStatus {
    Active = 'Active',
    Maintenance = 'Maintenance',
    Offline = 'Offline',
    Limited = 'Limited',
}

export enum MediaType {
    Audio = 'Audio',
    Image = 'Image',
    Video = 'Video',
}

export enum ListStatus {
    Active = 'Active',
    Expired = 'Expired',
    Revoked = 'Revoked',
}

export enum BlacklistCategory {
    NoFly = 'No-Fly',
    Wanted = 'Wanted',
    Financial = 'Financial',
    Other = 'Other',
}

export enum SystemMessageCategory {
    PassengerIssue = 'Passenger Issue',
    MachineIssue = 'Machine Issue',
    GeneralAlert = 'General Alert',
    SystemInfo = 'System Info',
}

export enum GateLogEventType {
    StatusChange = 'StatusChange',
    Transaction = 'Transaction',
    Error = 'Error',
    Maintenance = 'Maintenance',
}

export enum GateLogStatus {
    Online = 'Online',
    Offline = 'Offline',
    Error = 'Error',
    Success = 'Success',
    Failure = 'Failure',
}

export enum AssignmentStatus {
    Confirmed = 'Confirmed',
    Pending = 'Pending',
    Cancelled = 'Cancelled',
}

export enum DocumentType {
    Citizen = 'Citizen',
    Resident = 'Resident',
    Visitor = 'Visitor',
}