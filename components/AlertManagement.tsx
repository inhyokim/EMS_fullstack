import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter,
  Building2,
  MapPin,
  Calendar,
  Zap,
  TrendingUp
} from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'consumption' | 'peak' | 'efficiency' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  building: string;
  zone?: string;
  meter?: string;
  value: number;
  threshold: number;
  unit: string;
  timestamp: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    title: '일일 전력 사용량 초과',
    description: '본관 사무실 구역의 일일 전력 사용량이 설정된 임계치를 초과했습니다.',
    type: 'consumption',
    severity: 'high',
    status: 'active',
    building: '본관',
    zone: '사무실 구역',
    meter: 'MT-001',
    value: 1250,
    threshold: 1000,
    unit: 'kWh',
    timestamp: '2024-01-15 14:30:00'
  },
  {
    id: '2',
    title: '피크 전력 경고',
    description: '순간 최대 전력이 계약 전력의 95%에 도달했습니다.',
    type: 'peak',
    severity: 'critical',
    status: 'acknowledged',
    building: '본관',
    meter: 'MT-002',
    value: 950,
    threshold: 900,
    unit: 'kW',
    timestamp: '2024-01-15 13:45:00',
    acknowledgedBy: '김운영',
    acknowledgedAt: '2024-01-15 13:50:00'
  },
  {
    id: '3',
    title: '에너지 효율 저하',
    description: '별관 연구실 구역의 에너지 효율이 기준값 이하로 떨어졌습니다.',
    type: 'efficiency',
    severity: 'medium',
    status: 'resolved',
    building: '별관',
    zone: '연구실 구역',
    meter: 'MT-003',
    value: 70,
    threshold: 75,
    unit: '%',
    timestamp: '2024-01-15 11:20:00',
    acknowledgedBy: '이관리',
    acknowledgedAt: '2024-01-15 11:25:00',
    resolvedAt: '2024-01-15 12:15:00'
  },
  {
    id: '4',
    title: '사용량 이상 패턴 감지',
    description: '평소 사용 패턴과 다른 비정상적인 전력 사용이 감지되었습니다.',
    type: 'anomaly',
    severity: 'medium',
    status: 'active',
    building: '본관',
    zone: '지하 주차장',
    meter: 'MT-004',
    value: 180,
    threshold: 150,
    unit: '%',
    timestamp: '2024-01-15 12:10:00'
  },
  {
    id: '5',
    title: '냉난방 시스템 과부하',
    description: '냉난방 시스템의 전력 사용량이 급격히 증가했습니다.',
    type: 'consumption',
    severity: 'low',
    status: 'acknowledged',
    building: '별관',
    zone: '회의실 구역',
    meter: 'MT-005',
    value: 320,
    threshold: 300,
    unit: 'kWh',
    timestamp: '2024-01-15 10:15:00',
    acknowledgedBy: '박기술',
    acknowledgedAt: '2024-01-15 10:20:00'
  }
];

interface AlertManagementProps {
  userRole: 'admin' | 'operator';
}

export function AlertManagement({ userRole }: AlertManagementProps) {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'consumption':
        return <Zap className="w-4 h-4" />;
      case 'peak':
        return <TrendingUp className="w-4 h-4" />;
      case 'efficiency':
        return <Bell className="w-4 h-4" />;
      case 'anomaly':
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSeverityBadge = (severity: Alert['severity']) => {
    const variants = {
      low: 'secondary',
      medium: 'outline',
      high: 'default',
      critical: 'destructive'
    } as const;

    const labels = {
      low: '낮음',
      medium: '보통',
      high: '높음',
      critical: '긴급'
    };

    return (
      <Badge variant={variants[severity]}>
        {labels[severity]}
      </Badge>
    );
  };

  const getStatusBadge = (status: Alert['status']) => {
    const variants = {
      active: 'destructive',
      acknowledged: 'default',
      resolved: 'secondary'
    } as const;

    const labels = {
      active: '활성',
      acknowledged: '확인됨',
      resolved: '해결됨'
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId
          ? {
              ...alert,
              status: 'acknowledged' as const,
              acknowledgedBy: userRole === 'admin' ? '관리자' : '운영자',
              acknowledgedAt: new Date().toLocaleString('ko-KR')
            }
          : alert
      )
    );
  };

  const handleResolve = (alertId: string) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId
          ? {
              ...alert,
              status: 'resolved' as const,
              resolvedAt: new Date().toLocaleString('ko-KR')
            }
          : alert
      )
    );
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const activeAlerts = alerts.filter(alert => alert.status === 'active').length;
  const acknowledgedAlerts = alerts.filter(alert => alert.status === 'acknowledged').length;
  const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved').length;
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">알람 관리</h1>
          <p className="text-muted-foreground">
            발생한 알람을 확인하고 처리 상태를 관리합니다.
          </p>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">{activeAlerts}</div>
                <div className="text-sm text-muted-foreground">활성 알람</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold text-orange-600">{acknowledgedAlerts}</div>
                <div className="text-sm text-muted-foreground">확인됨</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">{resolvedAlerts}</div>
                <div className="text-sm text-muted-foreground">해결됨</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{criticalAlerts}</div>
                <div className="text-sm text-muted-foreground">긴급</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>필터 및 검색</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="알람 제목 또는 설명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="심각도" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 심각도</SelectItem>
                <SelectItem value="critical">긴급</SelectItem>
                <SelectItem value="high">높음</SelectItem>
                <SelectItem value="medium">보통</SelectItem>
                <SelectItem value="low">낮음</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="acknowledged">확인됨</SelectItem>
                <SelectItem value="resolved">해결됨</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 알람 목록 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>알람 목록</CardTitle>
              <CardDescription>
                총 {filteredAlerts.length}개의 알람이 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAlert?.id === alert.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(alert.type)}
                        <div>
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getSeverityBadge(alert.severity)}
                        {getStatusBadge(alert.status)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Building2 className="w-3 h-3" />
                          <span>{alert.building}</span>
                        </div>
                        {alert.zone && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{alert.zone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{alert.timestamp}</span>
                        </div>
                      </div>
                      <div className="text-sm">
                        {alert.value}{alert.unit} / {alert.threshold}{alert.unit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 알람 상세 정보 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>알람 상세</CardTitle>
              <CardDescription>
                {selectedAlert ? '선택된 알람의 상세 정보' : '알람을 선택해주세요'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedAlert ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{selectedAlert.title}</h4>
                    <p className="text-sm text-muted-foreground">{selectedAlert.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">상태</span>
                      {getStatusBadge(selectedAlert.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">심각도</span>
                      {getSeverityBadge(selectedAlert.severity)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">발생 시간</span>
                      <span className="text-sm">{selectedAlert.timestamp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">측정값</span>
                      <span className="text-sm font-medium">
                        {selectedAlert.value}{selectedAlert.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">임계값</span>
                      <span className="text-sm">{selectedAlert.threshold}{selectedAlert.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">건물</span>
                      <span className="text-sm">{selectedAlert.building}</span>
                    </div>
                    {selectedAlert.zone && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">구역</span>
                        <span className="text-sm">{selectedAlert.zone}</span>
                      </div>
                    )}
                    {selectedAlert.acknowledgedBy && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">확인자</span>
                        <span className="text-sm">{selectedAlert.acknowledgedBy}</span>
                      </div>
                    )}
                    {selectedAlert.acknowledgedAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">확인 시간</span>
                        <span className="text-sm">{selectedAlert.acknowledgedAt}</span>
                      </div>
                    )}
                    {selectedAlert.resolvedAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">해결 시간</span>
                        <span className="text-sm">{selectedAlert.resolvedAt}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    {selectedAlert.status === 'active' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleAcknowledge(selectedAlert.id)}
                        className="w-full"
                      >
                        알람 확인
                      </Button>
                    )}
                    {selectedAlert.status === 'acknowledged' && userRole === 'admin' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleResolve(selectedAlert.id)}
                        className="w-full"
                      >
                        해결 완료
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>왼쪽에서 알람을 선택하여<br />상세 정보를 확인하세요</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}