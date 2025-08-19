import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import type { UserRole } from '../../App';

interface MeterFormProps {
  userRole: UserRole;
}

export function MeterForm({ userRole }: MeterFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    navigate('/meters');
  };

  if (userRole !== 'admin') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">접근 권한이 없습니다</h3>
            <p className="text-gray-500">관리자만 계측기 정보를 편집할 수 있습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/meters')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로 가기
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? '계측기 수정' : '새 계측기 등록'}
          </h1>
          <p className="text-gray-600 mt-1">계측기 정보를 입력하세요</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>계측기 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">계측기명 *</Label>
                <Input id="name" placeholder="예: 본관 3층 공조기" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meterNo">계측기 번호 *</Label>
                <Input id="meterNo" placeholder="예: METER_001" required />
              </div>
              <div className="space-y-2">
                <Label>건물 *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="건물을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">KT 본사</SelectItem>
                    <SelectItem value="2">연구개발센터</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>구역 *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="구역을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">본관 3층 사무실</SelectItem>
                    <SelectItem value="2">본관 1층 로비</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>계측기 타입 *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="타입을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hvac">공조기</SelectItem>
                    <SelectItem value="lighting">조명</SelectItem>
                    <SelectItem value="power">전력</SelectItem>
                    <SelectItem value="elevator">승강기</SelectItem>
                    <SelectItem value="security">보안</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">단위 *</Label>
                <Input id="unit" placeholder="예: kWh" required />
              </div>
            </div>
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => navigate('/meters')}>
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? '저장 중...' : (isEdit ? '수정하기' : '등록하기')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}