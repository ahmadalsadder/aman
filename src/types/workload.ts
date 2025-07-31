

import type { User } from '.';
import { Status, DayOfWeek, AssignmentStatus } from '@/lib/enums';

export { DayOfWeek };

export interface Break {
    id: string;
    name: string;
    startTime: string;
    duration: number; // in minutes
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
    days: DayOfWeek[];
    status: Status;
    assignedOfficers?: Officer[];
    lastModified: string;
    createdBy?: string;
    module?: string;
    breaks?: Break[];
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
    status: AssignmentStatus;
    module: string;
    createdBy?: string;
    lastModified?: string;
    notes?: string;
}

