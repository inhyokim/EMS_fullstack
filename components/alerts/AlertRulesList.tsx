import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AlertTriangle, Plus, Edit, Trash2 } from 'lucide-react';
import type { UserRole } from '../../App';

interface AlertRulesListProps {
  userRole: UserRole;
}

export function AlertRulesList({ userRole }: AlertRulesListProps) {
  const mockRules = [
    {
      id: 1,
      name: '전력 사용량 임계치 초과',
      condition: '사용량 > 400 kWh',
      severity: 'high',
      status: 'active'
    },
    {
      id: 2,
      name: '조명 시스템 이상',
      condition: '패턴 이상 감지',
      severity: 'medium',
      status: 'active'
    }
  ];

  if (userRole !== 'admin') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">접근 권한이 없습니다</h3>
            <p className="text-gray-500">관리자만 알람 규칙을 관리할 수 있습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">알람 규칙</h1>
          <p className="text-gray-600 mt-1">알람 규칙 관리 및 설정</p>
        </div>
        <Link to="/alert-rules/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            새 규칙 생성
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {mockRules.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{rule.name}</h3>
                  <p className="text-gray-600">{rule.condition}</p>
                  <div className="flex space-x-2 mt-2">
                    <Badge variant={rule.severity === 'high' ? 'destructive' : 'default'}>
                      {rule.severity === 'high' ? '높음' : '보통'}
                    </Badge>
                    <Badge variant="default" className="bg-green-500">활성</Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link to={`/alert-rules/${rule.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}