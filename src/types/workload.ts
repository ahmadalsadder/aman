

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
