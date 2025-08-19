import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Download, BarChart3, Loader2 } from 'lucide-react';
import { readingsApi, aggregatesApi, buildingsApi, metersApi } from '../utils/api';
import { DataFilters } from './data/DataFilters';
import { DataChart } from './data/DataChart';
import { DataStats } from './data/DataStats';
import { 
  DataPoint,
  processRawDataForChart,
  processAggregatedDataForChart,
  calculateStats,
  exportDataToCSV,
  getPeriodDateRange,
  getMetricLabel
} from './data/dataHelpers';

interface Building {
  id: string;
  name: string;
}

interface Meter {
  id: string;
  name: string;
  meterNo: string;
  buildingId: string;
  zoneId: string;
}

export function DataExplorer() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedMeter, setSelectedMeter] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<string>('consumption');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('today');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [dateFrom, setDateFrom] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [dataType, setDataType] = useState<'raw' | 'aggregated'>('aggregated');
  const [aggregationLevel, setAggregationLevel] = useState<'hourly' | 'daily'>('hourly');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (buildings.length > 0 || meters.length > 0) {
      loadData();
    }
  }, [selectedBuilding, selectedMeter, selectedPeriod, dataType, aggregationLevel, dateFrom, dateTo]);

  const loadInitialData = async () => {
    try {
      const [buildingsResult, metersResult] = await Promise.all([
        buildingsApi.list(),
        metersApi.list()
      ]);
      
      if (buildingsResult.success) {
        setBuildings(buildingsResult.data || []);
      }
      
      if (metersResult.success) {
        setMeters(metersResult.data || []);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      let result;
      const options: any = getPeriodDateRange(selectedPeriod, dateFrom, dateTo);

      // 계측기 필터
      if (selectedMeter !== 'all') {
        options.meterId = selectedMeter;
      }

      // 건물 필터
      if (selectedBuilding !== 'all') {
        const building = buildings.find(b => b.id === selectedBuilding);
        if (building) {
          options.buildingName = building.name;
        }
      }

      // 데이터 타입에 따른 API 호출
      if (dataType === 'raw') {
        if (selectedMeter !== 'all') {
          options.meterId = selectedMeter;
        }
        options.limit = 1000;
        result = await readingsApi.list(options);
      } else {
        if (aggregationLevel === 'hourly') {
          result = await aggregatesApi.getHourly(options);
        } else {
          result = await aggregatesApi.getDaily(options);
        }
      }

      if (result.success) {
        const processedData = dataType === 'raw' 
          ? processRawDataForChart(result.data || [])
          : processAggregatedDataForChart(result.data || [], aggregationLevel);
        setData(processedData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    exportDataToCSV(data, selectedMetric);
  };

  const stats = calculateStats(data, selectedMetric);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">데이터 탐색</h1>
          <p className="text-muted-foreground">
            전력 사용 데이터를 시각화하고 분석할 수 있습니다.
          </p>
        </div>
        <Button onClick={handleExportData} disabled={data.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          데이터 내보내기
        </Button>
      </div>

      <DataFilters
        buildings={buildings}
        meters={meters}
        selectedBuilding={selectedBuilding}
        setSelectedBuilding={setSelectedBuilding}
        selectedMeter={selectedMeter}
        setSelectedMeter={setSelectedMeter}
        selectedMetric={selectedMetric}
        setSelectedMetric={setSelectedMetric}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        chartType={chartType}
        setChartType={setChartType}
        dataType={dataType}
        setDataType={setDataType}
        aggregationLevel={aggregationLevel}
        setAggregationLevel={setAggregationLevel}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
      />

      {/* 통계 요약 */}
      <DataStats stats={stats} selectedMetric={selectedMetric} />

      {/* 차트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>{getMetricLabel(selectedMetric)} 추이</span>
            </div>
            <div className="flex items-center space-x-2">
              {selectedBuilding !== 'all' && (
                <Badge variant="outline">
                  {buildings.find(b => b.id === selectedBuilding)?.name}
                </Badge>
              )}
              {dataType === 'aggregated' && (
                <Badge variant="secondary">
                  {aggregationLevel === 'hourly' ? '시간별' : '일별'} 집계
                </Badge>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            {dataType === 'raw' ? '원시 데이터' : '집계 데이터'}를 {chartType === 'line' ? '라인' : chartType === 'area' ? '영역' : '바'} 차트로 표시합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">데이터를 불러오는 중...</span>
            </div>
          ) : (
            <DataChart 
              data={data} 
              chartType={chartType} 
              selectedMetric={selectedMetric} 
            />
          )}
        </CardContent>
      </Card>

      {/* 상세 데이터 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>상세 데이터</CardTitle>
          <CardDescription>
            선택된 조건의 상세 데이터를 확인할 수 있습니다. (최대 50개 표시)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">시간</th>
                  <th className="text-right p-2">전력 사용량 (kWh)</th>
                  <th className="text-right p-2">피크 전력 (kW)</th>
                  <th className="text-right p-2">에너지 효율 (%)</th>
                  <th className="text-right p-2">전력 비용 (원)</th>
                  {dataType === 'raw' && <th className="text-left p-2">계측기</th>}
                  <th className="text-left p-2">건물</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 50).map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{row.time}</td>
                    <td className="text-right p-2">{row.consumption.toLocaleString()}</td>
                    <td className="text-right p-2">{row.peak.toLocaleString()}</td>
                    <td className="text-right p-2">{row.efficiency}</td>
                    <td className="text-right p-2">{row.cost.toLocaleString()}</td>
                    {dataType === 'raw' && <td className="p-2">{row.meterId || '-'}</td>}
                    <td className="p-2">{row.buildingName || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 50 && (
              <div className="text-center text-muted-foreground py-4">
                ... 외 {data.length - 50}개의 데이터가 더 있습니다.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}