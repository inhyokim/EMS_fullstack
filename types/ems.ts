// 건물 관련 타입
export interface Building {
  id: string;
  name: string;
  address: string;
  totalArea: number;
  buildingType: string;
  createdAt: Date;
  updatedAt: Date;
}

// 구역 관련 타입
export interface Zone {
  id: string;
  buildingId: string;
  name: string;
  area: number;
  floor: number;
  zoneType: string;
  createdAt: Date;
  updatedAt: Date;
}

// 계측기 관련 타입
export interface Meter {
  id: string;
  zoneId: string;
  name: string;
  meterType: 'electric' | 'gas' | 'water';
  serialNumber: string;
  installDate: Date;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

// 전력 데이터 타입
export interface PowerReading {
  id: string;
  meterId: string;
  timestamp: Date;
  value: number;
  unit: string;
  quality: 'good' | 'fair' | 'poor';
  createdAt: Date;
}

// 알람 규칙 타입
export interface AlertRule {
  id: string;
  name: string;
  meterId?: string;
  buildingId?: string;
  ruleType: 'threshold' | 'tariff' | 'baseline';
  condition: 'greater_than' | 'less_than' | 'equal_to';
  threshold: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 알람 타입
export interface Alert {
  id: string;
  ruleId: string;
  meterId?: string;
  buildingId?: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

// 집계 작업 타입
export interface AggregationJob {
  id: string;
  name: string;
  jobType: 'hourly' | 'daily' | 'monthly';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 리포트 타입
export interface Report {
  id: string;
  name: string;
  reportType: 'energy_consumption' | 'cost_analysis' | 'efficiency';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  buildingId?: string;
  createdBy: string;
  createdAt: Date;
  data?: any;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 사용자 인증 타입
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'operator';
  name: string;
  createdAt: Date;
}