export type UserRole = 'admin' | 'operator' | null;

export interface Building {
  id: number;
  name: string;
  location: string;
  address: string;
  type: string;
  totalArea: number;
  zones: number;
  meters: number;
  status: 'active' | 'inactive' | 'maintenance';
  lastUpdate: string;
  monthlyUsage: number;
}

export interface Zone {
  id: number;
  name: string;
  buildingId: number;
  buildingName: string;
  floor: string;
  area: number;
  meters: number;
  status: 'active' | 'inactive';
  description: string;
  lastUpdate: string;
}

export interface Meter {
  id: number;
  meterNo: string;
  name: string;
  buildingId: number;
  buildingName: string;
  zoneId: number;
  zoneName: string;
  type: string;
  unit: string;
  status: 'active' | 'inactive' | 'error';
  lastReading: number;
  lastUpdate: string;
  installDate: string;
}

export interface AlertRule {
  id: number;
  name: string;
  scope: 'building' | 'zone' | 'meter';
  scopeId: number;
  scopeName: string;
  condition: 'threshold' | 'baseline' | 'peak';
  threshold: number;
  unit: string;
  window: number;
  severity: 'low' | 'medium' | 'high';
  isActive: boolean;
  description: string;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

export interface Alert {
  id: number;
  ruleId: number;
  ruleName: string;
  building: string;
  meter: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  status: 'OPEN' | 'ACK' | 'CLOSED';
  timestamp: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  closedBy?: string;
  closedAt?: string;
  comments: string[];
}