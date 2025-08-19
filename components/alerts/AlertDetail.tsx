import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import type { UserRole } from '../../App';

interface AlertDetailProps {
  userRole: UserRole;
}

export function AlertDetail({ userRole }: AlertDetailProps) {
  const { id } = useParams();

  const mockAlert = {
    id: 1,
    message: '본관 3층 공조기 전력 사용량이 임계치를 초과했습니다',
    severity: 'high',
    status: 'open',
    building: 'KT 본사',
    meter: '본관 3층 공조기',
    value: 450.8,
    threshold: 400.0,
    timestamp: '2024-12-24 14:30:25'
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/alerts">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">알람 상세</h1>
          <p className="text-gray-600 mt-1">알람 #{id} 정보</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>알람 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">메시지</label>
              <p className="text-gray-900">{mockAlert.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">심각도</label>
                <div className="mt-1">
                  <Badge variant="destructive">높음</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">상태</label>
                <div className="mt-1">
                  <Badge variant="destructive">열림</Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">측정값</label>
                <p className="text-red-600 font-medium">{mockAlert.value} kWh</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">임계값</label>
                <p className="text-gray-900">{mockAlert.threshold} kWh</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">발생 시간</label>
              <p className="text-gray-900">{mockAlert.timestamp}</p>
            </div>
          </div>
          
          <div className="flex space-x-4 mt-6 pt-6 border-t">
            <Button className="bg-yellow-500 hover:bg-yellow-600">
              확인 처리
            </Button>
            <Button variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              댓글 추가
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}