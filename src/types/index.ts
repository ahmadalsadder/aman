

export * from './live-processing';
export * from './configuration';
export * from './workload';

export type Role = 'admin' | 'auditor' | 'viewer' | 'shiftsupervisor' | 'control-room' | 'analyst' | 'officer';
export type Module = 'landport' | 'seaport' | 'airport' | 'egate' | 'analyst' | 'shiftsupervisor' | 'control-room' | 'duty-manager' | 'users' | 'settings' | 'passengers' | 'configuration';
export type Permission = 
  // Passenger permissions
  | 'airport:passengers:view' | 'airport:passengers:create' | 'airport:passengers:edit' | 'airport:passengers:delete'
  | 'landport:passengers:view' | 'landport:passengers:create' | 'landport:passengers:edit' | 'landport:passengers:delete'
  | 'seaport:passengers:view' | 'seaport:passengers:create' | 'seaport:passengers:edit' | 'seaport:passengers:delete'
  | 'egate:passengers:view' | 'egate:passengers:create' | 'egate:passengers:edit' | 'egate:passengers:delete'

  // Whitelist permissions
  | 'airport:whitelist:view' | 'airport:whitelist:create' | 'airport:whitelist:edit' | 'airport:whitelist:delete'
  | 'landport:whitelist:view' | 'landport:whitelist:create' | 'landport:whitelist:edit' | 'landport:whitelist:delete'
  | 'seaport:whitelist:view' | 'seaport:whitelist:create' | 'seaport:whitelist:edit' | 'seaport:whitelist:delete'
  | 'egate:whitelist:view' | 'egate:whitelist:create' | 'egate:whitelist:edit' | 'egate:whitelist:delete'

  // Blacklist permissions
  | 'airport:blacklist:view' | 'airport:blacklist:create' | 'airport:blacklist:edit' | 'airport:blacklist:delete'
  | 'landport:blacklist:view' | 'landport:blacklist:create' | 'landport:blacklist:edit' | 'landport:blacklist:delete'
  | 'seaport:blacklist:view' | 'seaport:blacklist:create' | 'seaport:blacklist:edit' | 'seaport:blacklist:delete'
  | 'egate:blacklist:view' | 'egate:blacklist:create' | 'egate:blacklist:edit' | 'egate:blacklist:delete'

  // Module-specific record permissions
  | 'airport:records:create' | 'airport:records:edit' | 'airport:records:delete'
  | 'landport:records:create' | 'landport:records:edit' | 'landport:records:delete'
  | 'seaport:records:create' | 'seaport:records:edit' | 'seaport:records:delete'
  | 'egate:records:view' | 'egate:records:create' | 'egate:records:edit' | 'egate:records:delete'
  | 'analyst:records:view' | 'analyst:records:create' | 'analyst:records:edit' | 'analyst:records:delete'
  | 'control-room:records:view' | 'control-room:records:create' | 'control-room:records:edit' | 'control-room:records:delete'
  | 'airport:civil-records:view' 
  | 'landport:civil-records:view'
  | 'seaport:civil-records:view'
  | 'egate:civil-records:view'

  // Desk configuration permissions
  | 'airport:desks:view' | 'airport:desks:create' | 'airport:desks:edit' | 'airport:desks:delete'
  | 'landport:desks:view' | 'landport:desks:create' | 'landport:desks:edit' | 'landport:desks:delete'
  | 'seaport:desks:view' | 'seaport:desks:create' | 'seaport:desks:edit' | 'seaport:desks:delete'
  
  // Workload permissions
  | 'airport:workload:view' | 'airport:workload:create' | 'airport:workload:edit' | 'airport:workload:delete'
  | 'landport:workload:view' | 'landport:workload:create' | 'landport:workload:edit' | 'landport:workload:delete'
  | 'seaport:workload:view' | 'seaport:workload:create' | 'seaport:workload:edit' | 'seaport:workload:delete'
  | 'egate:workload:view' | 'egate:workload:create' | 'egate:workload:edit' | 'egate:workload:delete'

  // E-Gate media permissions
  | 'egate:media:view' | 'egate:media:create' | 'egate:media:edit' | 'egate:media:delete'
  // Other permissions
  | 'users:manage'
  | 'reports:view'
  | 'duty-manager:view'
  // Page-level view permissions
  | 'airport:dashboard:view'
  | 'landport:dashboard:view'
  | 'seaport:dashboard:view'
  | 'egate:dashboard:view'
  | 'analyst:dashboard:view'
  | 'control-room:dashboard:view'
  | 'configuration:dashboard:view'
  | 'configuration:country-language:view' | 'configuration:country-language:edit'
  | 'configuration:country-passport:view' | 'configuration:country-passport:edit'
  | 'configuration:ports:view' | 'configuration:ports:create' | 'configuration:ports:edit' | 'configuration:ports:delete'
  | 'airport:transactions:view' | 'egate:transactions:view'
  | 'landport:transactions:view'
  | 'seaport:transactions:view'
  | 'egate:transactions:view'
  | 'airport:prediction:view'
  | 'landport:prediction:view'
  | 'seaport:prediction:view'
  | 'egate:prediction:view'
  // Component-level view permissions
  | 'airport:dashboard:stats:view'
  | 'airport:dashboard:charts:view'
  | 'airport:dashboard:forecasts:view'
  | 'airport:dashboard:officer-performance:view'
  | 'landport:dashboard:stats:view'
  | 'landport:dashboard:charts:view'
  | 'landport:dashboard:forecasts:view'
  | 'landport:dashboard:officer-performance:view'
  | 'seaport:dashboard:stats:view'
  | 'seaport:dashboard:charts:view'
  | 'seaport:dashboard:forecasts:view'
  | 'seaport:dashboard:officer-performance:view'
  | 'egate:dashboard:stats:view'
  | 'egate:dashboard:charts:view'
  | 'analyst:dashboard:stats:view'
  | 'analyst:dashboard:charts:view'
  | 'control-room:dashboard:stats:view'
  | 'control-room:dashboard:charts:view'
  | 'control-room:dashboard:forecasts:view'
  | 'control-room:dashboard:officer-performance:view'
  // Action-level permissions
  | 'airport:transactions:live'
  | 'landport:transactions:live'
  | 'seaport:transactions:live';


export interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  role: Role;
  token: string;
  modules: Module[];
  permissions: Permission[];
}
