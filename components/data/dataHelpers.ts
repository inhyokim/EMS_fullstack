import { METRIC_LABELS, METRIC_UNITS, CHART_COLORS } from './constants';

export interface DataPoint {
  time: string;
  consumption: number;
  peak: number;
  efficiency: number;
  cost: number;
  meterId?: string;
  buildingName?: string;
  zoneName?: string;
}

export const getMetricLabel = (metric: string) => {
  return METRIC_LABELS[metric as keyof typeof METRIC_LABELS] || metric;
};

export const getMetricUnit = (metric: string) => {
  return METRIC_UNITS[metric as keyof typeof METRIC_UNITS] || '';
};

export const getMetricColor = (metric: string) => {
  return CHART_COLORS[metric as keyof typeof CHART_COLORS] || '#8884d8';
};

export const processRawDataForChart = (rawData: any[]): DataPoint[] => {
  return rawData.map((item: any) => ({
    time: new Date(item.timestamp).toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    consumption: item.value,
    peak: item.value,
    efficiency: Math.round(Math.random() * 20 + 80), // 임시 효율성 데이터
    cost: Math.round(item.value * 120), // 120원/kWh
    meterId: item.meterId,
    buildingName: item.buildingName,
    zoneName: item.zoneName
  }));
};

export const processAggregatedDataForChart = (rawData: any[], aggregationLevel: 'hourly' | 'daily'): DataPoint[] => {
  return rawData.map((item: any) => ({
    time: aggregationLevel === 'hourly' 
      ? new Date(item.timestamp).toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      : new Date(item.timestamp).toLocaleDateString('ko-KR'),
    consumption: Math.round(item.sum),
    peak: Math.round(item.max),
    efficiency: Math.round(item.average),
    cost: Math.round(item.sum * 120),
    meterId: item.meterId,
    buildingName: item.buildingName,
    zoneName: item.zoneName
  }));
};

export const calculateStats = (data: DataPoint[], selectedMetric: string) => {
  if (data.length === 0) return { current: 0, max: 0, min: 0, avg: 0, change: 0 };
  
  const values = data.map(d => d[selectedMetric as keyof DataPoint] as number);
  
  const current = values[values.length - 1] || 0;
  const previous = values[values.length - 2] || 0;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const change = previous ? ((current - previous) / previous) * 100 : 0;

  return { current, max, min, avg, change };
};

export const exportDataToCSV = (data: DataPoint[], selectedMetric: string) => {
  if (data.length === 0) return;

  const csvContent = [
    ['시간', getMetricLabel(selectedMetric), '계측기', '건물', '구역'].join(','),
    ...data.map(row => [
      row.time,
      row[selectedMetric as keyof DataPoint],
      row.meterId || '',
      row.buildingName || '',
      row.zoneName || ''
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `power_data_${selectedMetric}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const getPeriodDateRange = (period: string, dateFrom: Date, dateTo: Date) => {
  const now = new Date();
  const options: any = {};

  if (period === 'custom') {
    options.from = dateFrom.toISOString();
    options.to = dateTo.toISOString();
  } else {
    switch (period) {
      case 'today':
        options.from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        options.to = now.toISOString();
        break;
      case 'week':
        options.from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        options.to = now.toISOString();
        break;
      case 'month':
        options.from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        options.to = now.toISOString();
        break;
    }
  }

  return options;
};