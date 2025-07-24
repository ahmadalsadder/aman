
export interface Port {
    id: string;
    name: string;
    type: 'Airport' | 'Seaport' | 'Landport';
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
