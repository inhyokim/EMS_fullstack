import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  AlertTriangle, 
  DollarSign,
  Leaf,
  Clock,
  Activity,
  Loader2
} from 'lucide-react';
import { dashboardApi, jobsApi } from '../utils/api';

interface DashboardData {
  summary: {
    totalBuildings: number;
    totalZones: number;
    totalMeters: number;
    activeAlerts: number;
  };
  kpis: {
    totalConsumptionToday: number;
    peakPowerToday: number;
    totalConsumptionMonth: number;
    avgEfficiency: number;
    energyCost: number;
    co2Emission: number;
  };
  timeSeriesData: Array<{
    time: string;
    consumption: number;
    peak: number;
    average: number;
  }>;
  buildingData: Array<{
    name: string;
    consumption: number;
    percentage: number;
  }>;
  recentAlerts: Array<{
    id: string;
    title: string;
    severity: string;
    building: string;
    timestamp: string;
    status: string;
  }>;
  trends: {
    consumptionTrend: number;
    peakTrend: number;
  };
}

interface DashboardProps {
  userRole: 'admin' | 'operator';
}

export function Dashboard({ userRole }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [aggregating, setAggregating] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000); // 5분마다 새로고침
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const result = await dashboardApi.getData();
      console.log('Dashboard API result:', result);
      
      if (result.success && result.data) {
        // 데이터 구조 검증 및 기본값 설정
        const safeData: DashboardData = {
          summary: {
            totalBuildings: result.data.summary?.totalBuildings || 0,
            totalZones: result.data.summary?.totalZones || 0,
            totalMeters: result.data.summary?.totalMeters || 0,
            activeAlerts: result.data.summary?.activeAlerts || 0,
          },
          kpis: {
            totalConsumptionToday: result.data.kpis?.totalConsumptionToday || 0,
            peakPowerToday: result.data.kpis?.peakPowerToday || 0,
            totalConsumptionMonth: result.data.kpis?.totalConsumptionMonth || 0,
            avgEfficiency: result.data.kpis?.avgEfficiency || 0,
            energyCost: result.data.kpis?.energyCost || 0,
            co2Emission: result.data.kpis?.co2Emission || 0,
          },
          timeSeriesData: result.data.timeSeriesData || [],
          buildingData: result.data.buildingData || [],
          recentAlerts: result.data.recentAlerts || [],
          trends: {
            consumptionTrend: result.data.trends?.consumptionTrend || 0,
            peakTrend: result.data.trends?.peakTrend || 0,
          }
        };
        
        setData(safeData);
        setLastUpdated(new Date());
      } else {
        console.error('Dashboard API returned unsuccessful result:', result);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAggregation = async (type: 'hourly' | 'daily') => {
    setAggregating(true);
    try {
      const result = await jobsApi.runAggregation(type);
      if (result.success) {
        // 집계 완료 후 대시보드 데이터 새로고침
        setTimeout(loadDashboardData, 1000);
      }
    } catch (error) {
      console.error('Error running aggregation:', error);
    } finally {
      setAggregating(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: 'destructive',
      high: 'default',
      medium: 'secondary',
      low: 'outline'
    } as const;

    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'outline'}>
        {severity}
      </Badge>
    );
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (trend < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    } else {
      return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendText = (trend: number) => {
    if (Math.abs(trend) < 0.1) return '변화없음';
    const direction = trend > 0 ? '증가' : '감소';
    return `${Math.abs(trend).toFixed(1)}% ${direction}`;
  };

  // 파이 차트 색상
  const pieColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">대시보드 데이터를 불러오는 중...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">데이터를 불러올 수 없습니다</h3>
        <p className="text-muted-foreground">잠시 후 다시 시도해주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">대시보드</h1>
          <p className="text-muted-foreground">
            실시간 에너지 모니터링 대시보드 (최근 업데이트: {lastUpdated.toLocaleTimeString()})
          </p>
        </div>
        {userRole === 'admin' && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleRunAggregation('hourly')}
              disabled={aggregating}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {aggregating ? <Loader2 className="w-4 h-4 animate-spin" /> : '시간별 집계'}
            </button>
            <button
              onClick={() => handleRunAggregation('daily')}
              disabled={aggregating}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {aggregating ? <Loader2 className="w-4 h-4 animate-spin" /> : '일별 집계'}
            </button>
          </div>
        )}
      </div>

      {/* 요약 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{data?.summary?.totalBuildings || 0}</div>
                <div className="text-sm text-muted-foreground">건물</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{data?.summary?.totalMeters || 0}</div>
                <div className="text-sm text-muted-foreground">계측기</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">{data?.summary?.activeAlerts || 0}</div>
                <div className="text-sm text-muted-foreground">활성 알람</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{data?.summary?.totalZones || 0}</div>
                <div className="text-sm text-muted-foreground">구역</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI 카드 */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="text-xl font-bold">{(data?.kpis?.totalConsumptionToday || 0).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">오늘 사용량(kWh)</div>
                <div className="flex items-center text-xs mt-1">
                  {getTrendIcon(data?.trends?.consumptionTrend || 0)}
                  <span className="ml-1">{getTrendText(data?.trends?.consumptionTrend || 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-red-500" />
              <div>
                <div className="text-xl font-bold">{(data?.kpis?.peakPowerToday || 0).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">오늘 피크(kW)</div>
                <div className="flex items-center text-xs mt-1">
                  {getTrendIcon(data?.trends?.peakTrend || 0)}
                  <span className="ml-1">{getTrendText(data?.trends?.peakTrend || 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-xl font-bold">{(data?.kpis?.totalConsumptionMonth || 0).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">월 사용량(kWh)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-xl font-bold">{Math.round(data?.kpis?.avgEfficiency || 0)}%</div>
                <div className="text-sm text-muted-foreground">평균 효율</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-xl font-bold">₩{(data?.kpis?.energyCost || 0).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">오늘 전력비</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Leaf className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="text-xl font-bold">{Math.round(data?.kpis?.co2Emission || 0)}kg</div>
                <div className="text-sm text-muted-foreground">CO₂ 배출</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 차트 영역 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* 시계열 차트 */}
        <Card>
          <CardHeader>
            <CardTitle>시간별 전력 사용량</CardTitle>
            <CardDescription>최근 24시간 전력 사용 추이</CardDescription>
          </CardHeader>
          <CardContent>
            {(data?.timeSeriesData && data.timeSeriesData.length > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="consumption" 
                    stroke="#8884d8" 
                    name="사용량(kWh)"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="peak" 
                    stroke="#82ca9d" 
                    name="피크(kW)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                시계열 데이터가 없습니다.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 건물별 사용량 파이 차트 */}
        <Card>
          <CardHeader>
            <CardTitle>건물별 전력 사용량</CardTitle>
            <CardDescription>오늘 건물별 사용량 분포</CardDescription>
          </CardHeader>
          <CardContent>
            {(data?.buildingData && data.buildingData.length > 0) ? (
              <div className="flex">
                <ResponsiveContainer width="60%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.buildingData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="consumption"
                    >
                      {data.buildingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value.toLocaleString()} kWh`, '사용량']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-40% pl-4 flex flex-col justify-center">
                  {data.buildingData.map((item, index) => (
                    <div key={item.name} className="flex items-center mb-2">
                      <div 
                        className="w-4 h-4 rounded mr-2" 
                        style={{ backgroundColor: pieColors[index % pieColors.length] }}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.consumption.toLocaleString()} kWh ({item.percentage}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                건물별 사용량 데이터가 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 최근 알람 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 알람</CardTitle>
          <CardDescription>발생한 알람 목록</CardDescription>
        </CardHeader>
        <CardContent>
          {(data?.recentAlerts && data.recentAlerts.length > 0) ? (
            <div className="space-y-3">
              {data.recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className={`w-4 h-4 ${getSeverityColor(alert.severity)}`} />
                    <div>
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {alert.building} • {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getSeverityBadge(alert.severity)}
                    <Badge variant={alert.status === 'active' ? 'destructive' : 'secondary'}>
                      {alert.status === 'active' ? '활성' : alert.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              최근 알람이 없습니다.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}