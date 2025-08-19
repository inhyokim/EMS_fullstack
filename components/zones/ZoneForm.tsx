import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import type { UserRole } from '../../App';

interface ZoneFormProps {
  userRole: UserRole;
}

export function ZoneForm({ userRole }: ZoneFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    navigate('/zones');
  };

  if (userRole !== 'admin') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">접근 권한이 없습니다</h3>
            <p className="text-gray-500">관리자만 구역 정보를 편집할 수 있습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/zones')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로 가기
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">새 구역 등록</h1>
          <p className="text-gray-600 mt-1">새로운 구역을 시스템에 등록합니다</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>구역 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">구역명 *</Label>
                <Input id="name" placeholder="예: 본관 3층 사무실" required />
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
                <Label htmlFor="floor">층수 *</Label>
                <Input id="floor" type="number" placeholder="예: 3" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">면적 (m²) *</Label>
                <Input id="area" type="number" placeholder="예: 450" required />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea id="description" placeholder="구역에 대한 설명을 입력하세요..." />
              </div>
            </div>
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => navigate('/zones')}>
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? '저장 중...' : '등록하기'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}