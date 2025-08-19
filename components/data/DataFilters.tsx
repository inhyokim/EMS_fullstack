import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Filter, Calendar as CalendarIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { PERIOD_OPTIONS, CHART_TYPE_OPTIONS, AGGREGATION_LEVEL_OPTIONS } from './constants';

interface Building {
  id: string;
  name: string;
}

interface Meter {
  id: string;
  name: string;
  meterNo: string;
  buildingId: string;
}

interface DataFiltersProps {
  buildings: Building[];
  meters: Meter[];
  selectedBuilding: string;
  setSelectedBuilding: (value: string) => void;
  selectedMeter: string;
  setSelectedMeter: (value: string) => void;
  selectedMetric: string;
  setSelectedMetric: (value: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (value: string) => void;
  chartType: 'line' | 'area' | 'bar';
  setChartType: (value: 'line' | 'area' | 'bar') => void;
  dataType: 'raw' | 'aggregated';
  setDataType: (value: 'raw' | 'aggregated') => void;
  aggregationLevel: 'hourly' | 'daily';
  setAggregationLevel: (value: 'hourly' | 'daily') => void;
  dateFrom: Date;
  setDateFrom: (date: Date) => void;
  dateTo: Date;
  setDateTo: (date: Date) => void;
}

export function DataFilters({
  buildings,
  meters,
  selectedBuilding,
  setSelectedBuilding,
  selectedMeter,
  setSelectedMeter,
  selectedMetric,
  setSelectedMetric,
  selectedPeriod,
  setSelectedPeriod,
  chartType,
  setChartType,
  dataType,
  setDataType,
  aggregationLevel,
  setAggregationLevel,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo
}: DataFiltersProps) {

  const getFilteredMeters = () => {
    if (selectedBuilding === 'all') return meters;
    return meters.filter(meter => meter.buildingId === selectedBuilding);
  };

  return (
    <>
      {/* 데이터 타입 토글 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>데이터 유형</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">원시 데이터</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDataType(dataType === 'raw' ? 'aggregated' : 'raw')}
              >
                {dataType === 'raw' ? <ToggleLeft className="w-6 h-6" /> : <ToggleRight className="w-6 h-6" />}
              </Button>
              <span className="text-sm text-muted-foreground">집계 데이터</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {dataType === 'raw' 
              ? '실시간 측정 데이터를 직접 조회합니다. 상세한 분석이 가능하지만 대량 데이터 시 성능이 저하될 수 있습니다.'
              : '시간별/일별로 집계된 데이터를 조회합니다. 빠른 조회와 트렌드 분석에 적합합니다.'
            }
          </div>
        </CardContent>
      </Card>

      {/* 필터 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>데이터 필터</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div>
              <label className="text-sm font-medium mb-2 block">건물</label>
              <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 건물</SelectItem>
                  {buildings.map(building => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">계측기</label>
              <Select value={selectedMeter} onValueChange={setSelectedMeter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 계측기</SelectItem>
                  {getFilteredMeters().map(meter => (
                    <SelectItem key={meter.id} value={meter.id}>
                      {meter.name} ({meter.meterNo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">지표</label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consumption">전력 사용량</SelectItem>
                  <SelectItem value="peak">피크 전력</SelectItem>
                  <SelectItem value="efficiency">에너지 효율</SelectItem>
                  <SelectItem value="cost">전력 비용</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">기간</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {dataType === 'aggregated' && (
              <div>
                <label className="text-sm font-medium mb-2 block">집계 레벨</label>
                <Select value={aggregationLevel} onValueChange={setAggregationLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGGREGATION_LEVEL_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">차트 유형</label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHART_TYPE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedPeriod === 'custom' && (
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">시작 날짜</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom.toLocaleDateString('ko-KR')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={(date) => date && setDateFrom(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">종료 날짜</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo.toLocaleDateString('ko-KR')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={(date) => date && setDateTo(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}