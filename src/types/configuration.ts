

import { Status, PortType, MachineType, MachineStatus, MovementType, OfficerDeskStatus, SystemMessageCategory } from '@/lib/enums';

export interface Port {
    id: string;
    name: string;
    shortName?: string;
    localizedName?: string;
    city: string;
    country: string;
    type: PortType;
    status: Status;
    lastModified: string;
    createdBy: string;
    address?: string;
    localizedAddress?: string;
}

export interface Terminal {
    id: string;
    name: string;
    portId: string;
    status: Status;
    lastModified: string;
    createdBy: string;
}

export interface Zone {
    id: string;
    name: string;
    terminalId: string;
    status: Status;
    lastModified: string;
    createdBy: string;
}

export interface Machine {
    id: string;
    name: string;
    type: MachineType;
    ipAddress: string;
    macAddress: string;
    status: MachineStatus;
    portId: string;
    terminalId: string;
    zoneId: string;
    lastModified: string;
    createdBy: string;
}

export interface SystemMessage {
    id: string;
    name: string;
    description: string;
    localizedName?: string;
    localizedDescription?: string;
    category: SystemMessageCategory;
    status: Status;
    lastModified: string;
    createdBy: string;
}

export interface Workflow {
    id: string;
    name: string;
}

export interface RiskProfile {
    id: string;
    name: string;
}

export interface CountryLanguageMapping {
    countryCode: string;
    countryName: string;
    language: string;
}

export interface CountryPassportMapping {
    countryCode: string;
    countryName: string;
    passportType: 'Normal' | 'E-Passport';
}

export interface LookupItemTranslation {
    language: 'en' | 'es' | 'ar';
    value: string;
}

export interface LookupItem {
    id: string;
    lookupId: string;
    parentId?: string | null;
    code: string;
    isEnabled: boolean;
    translations: LookupItemTranslation[];
    displayOrder: number;
}

export interface Lookup {
    id: string;
    name: string;
    description: string;
    items: LookupItem[];
}
