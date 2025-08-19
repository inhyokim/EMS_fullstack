export interface Meter {
  id: number;
  name: string;
  meterNo: string;
  building: string;
  zone: string;
  type: 'hvac' | 'lighting' | 'power' | 'elevator' | 'security';
  unit: string;
  status: 'active' | 'inactive' | 'maintenance';
  location?: string;
  model?: string;
  installDate?: string;
  lastReading?: number;
  lastReadingTime?: string;
}

export const mockMeters: Meter[] = [
  {
    id: 1,
    name: '본관 3층 공조기',
    meterNo: 'METER_001',
    building: 'KT 본사',
    zone: '본관 3층 사무실',
    type: 'hvac',
    unit: 'kWh',
    status: 'active',
    location: '본관 3층 기계실',
    model: 'SMART-M100',
    installDate: '2024-01-15',
    lastReading: 425.8,
    lastReadingTime: '2024-12-24 14:30:00'
  },
  {
    id: 2,
    name: '본관 1층 조명',
    meterNo: 'METER_002',
    building: 'KT 본사',
    zone: '본관 1층 로비',
    type: 'lighting',
    unit: 'kWh',
    status: 'active',
    location: '본관 1층 전기실',
    model: 'SMART-L200',
    installDate: '2024-01-15',
    lastReading: 87.2,
    lastReadingTime: '2024-12-24 14:30:00'
  },
  {
    id: 3,
    name: '지하 주차장 환기팬',
    meterNo: 'METER_003',
    building: 'KT 본사',
    zone: '지하 1층 주차장',
    type: 'hvac',
    unit: 'kWh',
    status: 'active',
    location: '지하 1층 기계실',
    model: 'SMART-V150',
    installDate: '2024-01-15',
    lastReading: 125.5,
    lastReadingTime: '2024-12-24 14:30:00'
  },
  {
    id: 4,
    name: '엘리베이터 시스템',
    meterNo: 'METER_004',
    building: 'KT 본사',
    zone: '승강기실',
    type: 'elevator',
    unit: 'kWh',
    status: 'maintenance',
    location: '승강기 기계실',
    model: 'SMART-E300',
    installDate: '2024-01-15',
    lastReading: 203.8,
    lastReadingTime: '2024-12-24 12:00:00'
  },
  {
    id: 5,
    name: '연구실 A 전력',
    meterNo: 'METER_005',
    building: '연구개발센터',
    zone: '별관 연구실 A',
    type: 'power',
    unit: 'kWh',
    status: 'active',
    location: '별관 2층 전기실',
    model: 'SMART-P250',
    installDate: '2024-02-25',
    lastReading: 156.3,
    lastReadingTime: '2024-12-24 14:30:00'
  },
  {
    id: 6,
    name: '보안 시스템',
    meterNo: 'METER_006',
    building: 'KT 본사',
    zone: '보안실',
    type: 'security',
    unit: 'kWh',
    status: 'active',
    location: '본관 지하 1층',
    model: 'SMART-S100',
    installDate: '2024-01-15',
    lastReading: 45.7,
    lastReadingTime: '2024-12-24 14:30:00'
  }
];