
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
}

export interface Zone {
    id: string;
    name: string;
    terminalId: string;
}

export interface OfficerDesk {
    id: string;
    name: string;
    terminalId: string;
    zoneId: string;
    ipAddress: string;
    macAddress: string;
    status: 'Active' | 'Inactive' | 'Closed';
    lastUpdatedAt: string;
    movementType: 'Entry' | 'Exit' | 'Bidirectional';
    workflowId: string;
    riskRuleId: string;
    // These will be enriched for display purposes
    portId?: string;
    portName?: string;
    terminalName?: string;
    zoneName?: string;
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
