

export type PortType = 'Airport' | 'Seaport' | 'Landport';

export interface Port {
    id: string;
    name: string;
    shortName?: string;
    localizedName?: string;
    city: string;
    country: string;
    type: PortType;
    status: 'Active' | 'Inactive';
    lastModified: string;
    createdBy: string;
    address?: string;
    localizedAddress?: string;
}

export interface Terminal {
    id: string;
    name: string;
    portId: string;
    status: 'Active' | 'Inactive';
    lastModified: string;
    createdBy: string;
}

export interface Zone {
    id: string;
    name: string;
    terminalId: string;
    status: 'Active' | 'Inactive';
    lastModified: string;
    createdBy: string;
}

export interface Machine {
    id: string;
    name: string;
    type: 'Scanner' | 'Biometric' | 'Camera';
    ipAddress: string;
    macAddress: string;
    status: 'Active' | 'Inactive' | 'Maintenance';
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
    category: 'Passenger Issue' | 'Machine Issue' | 'General Alert' | 'System Info';
    status: 'Active' | 'Inactive';
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
