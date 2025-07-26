


export interface DayOfWeek {
    id: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    label: string;
}
  
export interface Officer {
    id: string;
    name: string;
    badgeNumber: string;
}

export interface Shift {
    id: string;
    name:string;
    startTime: string;
    endTime: string;
    days: DayOfWeek['id'][];
    status: 'Active' | 'Inactive';
    assignedOfficers?: Officer[];
    lastModified: string;
    createdBy?: string;
    module?: string;
}

export interface OfficerAssignment {
    id: string;
    officerId: string;
    officerName: string;
    shiftId: string;
    shiftName: string;
    portId: string;
    portName: string;
    terminalId: string;
    terminalName: string;
    zoneId: string;
    zoneName: string;
    assignmentDate: string; // YYYY-MM-DD
    status: 'Confirmed' | 'Pending' | 'Cancelled';
    module: string;
    createdBy?: string;
    lastModified?: string;
    notes?: string;
}
