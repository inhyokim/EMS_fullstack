export const STATUS_COLORS = {
  active: 'default',
  inactive: 'secondary',
  maintenance: 'destructive',
  error: 'destructive',
  success: 'default',
  partial: 'secondary',
  failed: 'destructive',
  completed: 'default',
  running: 'secondary',
  pending: 'outline',
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
  OPEN: 'destructive',
  ACK: 'default',
  CLOSED: 'secondary'
} as const;

export const STATUS_TEXT = {
  active: '운영중',
  inactive: '비활성',
  maintenance: '정비중',
  error: '오류',
  success: '성공',
  partial: '부분 성공',
  failed: '실패',
  completed: '완료',
  running: '실행중',
  pending: '대기중',
  high: '높음',
  medium: '보통',
  low: '낮음',
  OPEN: '열림',
  ACK: '확인됨',
  CLOSED: '닫힘',
  threshold: '임계치',
  baseline: '기준선',
  peak: '피크',
  building: '건물',
  zone: '구역',
  meter: '계측기'
} as const;

export const METER_TYPES = [
  { value: '전력계', label: '전력계', color: 'bg-blue-100 text-blue-800' },
  { value: '가스계', label: '가스계', color: 'bg-orange-100 text-orange-800' },
  { value: '수도계', label: '수도계', color: 'bg-cyan-100 text-cyan-800' },
  { value: '온도계', label: '온도계', color: 'bg-green-100 text-green-800' },
  { value: '습도계', label: '습도계', color: 'bg-purple-100 text-purple-800' }
];

export const BUILDING_TYPES = [
  '사무용', '상업시설', '데이터센터', '연구시설', '물류시설', '제조시설', '기타'
];

export const UNITS = ['kWh', 'm³', 'L', '°C', '%'];

export const MOCK_BUILDINGS = [
  { id: 1, name: '본사 빌딩' },
  { id: 2, name: '데이터센터' },
  { id: 3, name: '연구소' },
  { id: 4, name: '물류창고' }
];

export const MOCK_ZONES = [
  { id: 1, name: '1층 로비', buildingId: 1 },
  { id: 2, name: '2층 사무실 A', buildingId: 1 },
  { id: 3, name: '서버실', buildingId: 2 },
  { id: 4, name: '연구실 101', buildingId: 3 }
];