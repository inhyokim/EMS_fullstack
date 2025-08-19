import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  MessageCircle,
  Building,
  Gauge
} from 'lucide-react';
import type { UserRole } from '../../App';

interface AlertsListProps {
  userRole: UserRole;
}

interface Alert {
  id: number;
  ruleId: number;
  ruleName: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  status: 'open' | 'acknowledged' | 'closed';
  buildingName: string;
  meterName: string;
  value: number;
  threshold: number;
  timestamp: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  closedBy?: string;
  closedAt?: string;
  comments: number;
}

// Mock data
const mockAlerts: Alert[] = [
  {
    id: 1,
    ruleId: 1,
    ruleName: '전력 사용량 임계치 초과',
    message: '본관 3층 공조기 전력 사용량이 임계치를 초과했습니다',
    severity: 'high',
    status: 'open',
    buildingName: 'KT 본사',
    meterName: '본관 3층 공조기',
    value: 450.8,
    threshold: 400.0,
    timestamp: '2024-12-24 14:30:25',
    comments: 2
  },
  {
    id: 2,
    ruleId: 2,
    ruleName: '조명 시스템 이상',
    message: '별관 1층 조명 전력 패턴 이상이 감지되었습니다',
    severity: 'medium',
    status: 'acknowledged',
    buildingName: '연구개발센터',
    meterName: '별관 1층 조명',
    value: 85.2,
    threshold: 100.0,
    timestamp: '2024-12-24 13:15:42',
    acknowledgedBy: '김운영',
    acknowledgedAt: '2024-12-24 13:45:12',
    comments: 1
  },
  {
    id: 3,
    ruleId: 3,
    ruleName: '환기팬 효율성 저하',
    message: '주차장 환기팬의 전력 효율성이 기준치 이하로 떨어졌습니다',
    severity: 'low',
    status: 'open',
    buildingName: 'KT 본사',
    meterName: '지하 주차장 환기팬',
    value: 125.5,
    threshold: 150.0,
    timestamp: '2024-12-24 11:45:18',
    comments: 0
  },
  {
    id: 4,
    ruleId: 4,
    ruleName: '태양광 발전량 감소',
    message: '옥상 태양광 패널의 발전량이 예상치보다 낮습니다',
    severity: 'medium',
    status: 'closed',
    buildingName: '부산지사',
    meterName: '옥상 태양광',
    value: 85.3,
    threshold: 120.0,
    timestamp: '2024-12-24 10:20:05',
    acknowledgedBy: '이관리',
    acknowledgedAt: '2024-12-24 10:30:15',
    closedBy: '이관리',
    closedAt: '2024-12-24 11:15:30',
    comments: 3
  },
  {
    id: 5,
    ruleId: 5,
    ruleName: '펌프실 전력 스파이크',
    message: '지하 펌프실에서 비정상적인 전력 스파이크가 발생했습니다',
    severity: 'high',
    status: 'acknowledged',
    buildingName: 'KT 본사',
    meterName: '지하 1층 펌프실',
    value: 680.9,
    threshold: 500.0,
    timestamp: '2024-12-24 09:35:12',
    acknowledgedBy: '박기술',
    acknowledgedAt: '2024-12-24 09:50:25',
    comments: 4
  }
];

export function AlertsList({ userRole }: AlertsListProps) {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(mockAlerts);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  useEffect(() => {
    let filtered = alerts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.buildingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.meterName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(alert => alert.status === statusFilter);
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }

    setFilteredAlerts(filtered);
  }, [searchTerm, statusFilter, severityFilter, alerts]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">높음</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-orange-500">보통</Badge>;
      case 'low':
        return <Badge variant="secondary">낮음</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive">열림</Badge>;
      case 'acknowledged':
        return <Badge variant="default" className="bg-yellow-500">확인됨</Badge>;
      case 'closed':
        return <Badge variant="secondary">닫힘</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'acknowledged':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const handleQuickAcknowledge = (alertId: number) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? {
            ...alert,
            status: 'acknowledged' as const,
            acknowledgedBy: userRole === 'admin' ? '관리자' : '운영자',
            acknowledgedAt: new Date().toLocaleString('ko-KR')
          }
        : alert
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">알람 목록</h1>
          <p className="text-gray-600 mt-1">시스템에서 발생한 알람 관리 및 모니터링</p>
        </div>
        <div className="flex space-x-2">
          <Badge variant="destructive" className="px-3 py-1">
            {filteredAlerts.filter(a => a.status === 'open').length} 열림
          </Badge>
          <Badge variant="default" className="bg-yellow-500 px-3 py-1">
            {filteredAlerts.filter(a => a.status === 'acknowledged').length} 확인됨
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            {filteredAlerts.filter(a => a.status === 'closed').length} 닫힘
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="알람 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="open">열림</SelectItem>
                <SelectItem value="acknowledged">확인됨</SelectItem>
                <SelectItem value="closed">닫힘</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="심각도 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 심각도</SelectItem>
                <SelectItem value="high">높음</SelectItem>
                <SelectItem value="medium">보통</SelectItem>
                <SelectItem value="low">낮음</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-500 flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              총 {filteredAlerts.length}개 알람
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <Card key={alert.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(alert.status)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2 flex-wrap">
                      {getSeverityBadge(alert.severity)}
                      {getStatusBadge(alert.status)}
                      <Badge variant="outline" className="text-xs">
                        #{alert.id}
                      </Badge>
                    </div>
                    
                    <h3 className="font-medium text-gray-900">{alert.message}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4" />
                        <span>{alert.buildingName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Gauge className="h-4 w-4" />
                        <span>{alert.meterName}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>측정값: <span className="font-medium text-red-600">{alert.value}</span></span>
                      <span>임계값: <span className="font-medium">{alert.threshold}</span></span>
                      <span>발생시간: {alert.timestamp}</span>
                    </div>

                    {/* Status Details */}
                    {alert.status === 'acknowledged' && alert.acknowledgedBy && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-yellow-600">확인됨:</span> {alert.acknowledgedBy} ({alert.acknowledgedAt})
                      </div>
                    )}
                    
                    {alert.status === 'closed' && alert.closedBy && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-green-600">완료됨:</span> {alert.closedBy} ({alert.closedAt})
                      </div>
                    )}

                    {alert.comments > 0 && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {alert.comments}개 댓글
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <Link to={`/alerts/${alert.id}`}>
                    <Button variant="outline" size="sm">
                      상세보기
                    </Button>
                  </Link>
                  
                  {alert.status === 'open' && (
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600"
                      onClick={() => handleQuickAcknowledge(alert.id)}
                    >
                      확인
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' || severityFilter !== 'all' 
                ? '검색 결과가 없습니다' 
                : '현재 알람이 없습니다'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || severityFilter !== 'all'
                ? '다른 검색 조건을 사용해보세요.'
                : '시스템이 정상적으로 운영되고 있습니다.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}