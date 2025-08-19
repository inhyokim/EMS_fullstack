import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Zap, TrendingUp, AlertTriangle, Activity, RefreshCw } from 'lucide-react';

interface DashboardProps {
  userRole: 'admin' | 'operator';
}

export function Dashboard({ userRole }: DashboardProps) {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const kpiData = {
    todayUsage: 2847.5,
    peakLoad: 425.8,
    openAlerts: 3,
    efficiency: 92.3
  };

  const recentAlerts = [
    {
      id: 1,
      message: '본관 3층 공조기 전력 사용량 임계치 초과',
      severity: 'high' as const,
      timestamp: '2024-12-24 14:30:25',
      status: 'open' as const
    },
    {
      id: 2,
      message: '별관 1층 조명 시스템 이상 감지',
      severity: 'medium' as const,
      timestamp: '2024-12-24 13:15:42',
      status: 'acknowledged' as const
    }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const getSeverityBadge = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">높음</Badge>;
      case 'medium':
        return <Badge className="bg-orange-500 text-white">보통</Badge>;
      case 'low':
        return <Badge variant="secondary">낮음</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  const getStatusBadge = (status: 'open' | 'acknowledged' | 'closed') => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive">열림</Badge>;
      case 'acknowledged':
        return <Badge className="bg-yellow-500 text-white">확인됨</Badge>;
      case 'closed':
        return <Badge variant="secondary">닫힘</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>대시보드</h1>
          <p className="text-muted-foreground mt-1">실시간 에너지 모니터링 및 현황</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">오늘 사용량</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{kpiData.todayUsage.toLocaleString()} kWh</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+2.5%</span> 어제 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">피크 부하</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{kpiData.peakLoad} kW</div>
            <p className="text-xs text-muted-foreground mt-1">14:30 최고점 기록</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">활성 알람</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{kpiData.openAlerts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-red-600">2개</span> 높은 우선순위
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">에너지 효율</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{kpiData.efficiency}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+1.2%</span> 지난 주 대비
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            에너지 사용량 추이
          </CardTitle>
          <CardDescription>시간별 및 일별 전력 사용량 비교</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Activity className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <p className="text-muted-foreground">차트 데이터 로딩 중...</p>
              <p className="text-sm text-muted-foreground mt-2">실시간 에너지 사용량 데이터</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
            최근 알람
          </CardTitle>
          <CardDescription>최근 알람 이벤트</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {getSeverityBadge(alert.severity)}
                    {getStatusBadge(alert.status)}
                  </div>
                  <p>{alert.message}</p>
                  <p className="text-sm text-muted-foreground">{alert.timestamp}</p>
                </div>
                <Button variant="outline" size="sm">상세보기</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}