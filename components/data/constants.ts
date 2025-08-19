export const CHART_COLORS = {
  consumption: '#8884d8',
  peak: '#82ca9d',
  efficiency: '#ffc658',
  cost: '#ff7c7c'
} as const;

export const METRIC_LABELS = {
  consumption: '전력 사용량',
  peak: '피크 전력',
  efficiency: '에너지 효율',
  cost: '전력 비용'
} as const;

export const METRIC_UNITS = {
  consumption: 'kWh',
  peak: 'kW',
  efficiency: '%',
  cost: '원'
} as const;

export const PERIOD_OPTIONS = [
  { value: 'today', label: '오늘' },
  { value: 'week', label: '이번 주' },
  { value: 'month', label: '이번 달' },
  { value: 'custom', label: '사용자 정의' }
] as const;

export const CHART_TYPE_OPTIONS = [
  { value: 'line', label: '라인 차트' },
  { value: 'area', label: '영역 차트' },
  { value: 'bar', label: '바 차트' }
] as const;

export const AGGREGATION_LEVEL_OPTIONS = [
  { value: 'hourly', label: '시간별' },
  { value: 'daily', label: '일별' }
] as const;