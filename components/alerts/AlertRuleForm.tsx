import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import type { UserRole } from '../../App';

interface AlertRuleFormProps {
  userRole: UserRole;
}

export function AlertRuleForm({ userRole }: AlertRuleFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    navigate('/alert-rules');
  };

  if (userRole !== 'admin') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">접근 권한이 없습니다</h3>
            <p className="text-gray-500">관리자만 알람 규칙을 편집할 수 있습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/alert-rules')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로 가기
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">새 알람 규칙</h1>
          <p className="text-gray-600 mt-1">알람 규칙을 생성합니다</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>규칙 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">규칙명 *</Label>
              <Input id="name" placeholder="예: 전력 사용량 임계치 초과" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">임계값 *</Label>
              <Input id="threshold" type="number" placeholder="예: 400" required />
            </div>
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => navigate('/alert-rules')}>
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? '저장 중...' : '생성하기'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}