import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import type { UserRole } from '../../App';

interface BuildingFormProps {
  userRole: UserRole;
}

interface BuildingFormData {
  name: string;
  location: string;
  address: string;
  totalArea: number;
  floors: number;
  buildingType: string;
  energyRating: string;
  status: string;
  description: string;
}

export function BuildingForm({ userRole }: BuildingFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<BuildingFormData>({
    name: '',
    location: '',
    address: '',
    totalArea: 0,
    floors: 0,
    buildingType: '',
    energyRating: '',
    status: 'active',
    description: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      // In real app, fetch building data by ID
      setFormData({
        name: 'KT 본사',
        location: '서울시 종로구',
        address: '서울특별시 종로구 종로 17',
        totalArea: 15420,
        floors: 12,
        buildingType: 'office',
        energyRating: 'A',
        status: 'active',
        description: 'KT 본사 건물입니다.'
      });
    }
  }, [isEdit, id]);

  const handleInputChange = (field: keyof BuildingFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Building data:', formData);
      navigate('/buildings');
    } catch (error) {
      console.error('Error saving building:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (userRole !== 'admin') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">접근 권한이 없습니다</h3>
            <p className="text-gray-500">관리자만 건물 정보를 편집할 수 있습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/buildings')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로 가기
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? '건물 정보 수정' : '새 건물 등록'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? '기존 건물 정보를 수정합니다' : '새로운 건물을 시스템에 등록합니다'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">건물명 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="예: KT 본사"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">위치 *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="예: 서울시 종로구"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">상세 주소 *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="예: 서울특별시 종로구 종로 17"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalArea">연면적 (m²) *</Label>
                <Input
                  id="totalArea"
                  type="number"
                  value={formData.totalArea}
                  onChange={(e) => handleInputChange('totalArea', Number(e.target.value))}
                  placeholder="예: 15420"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floors">층수 *</Label>
                <Input
                  id="floors"
                  type="number"
                  value={formData.floors}
                  onChange={(e) => handleInputChange('floors', Number(e.target.value))}
                  placeholder="예: 12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buildingType">건물 유형 *</Label>
                <Select
                  value={formData.buildingType}
                  onValueChange={(value) => handleInputChange('buildingType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="건물 유형을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office">사무용 건물</SelectItem>
                    <SelectItem value="commercial">상업용 건물</SelectItem>
                    <SelectItem value="industrial">산업용 건물</SelectItem>
                    <SelectItem value="residential">주거용 건물</SelectItem>
                    <SelectItem value="mixed">복합용도 건물</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="energyRating">에너지 등급</Label>
                <Select
                  value={formData.energyRating}
                  onValueChange={(value) => handleInputChange('energyRating', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="에너지 등급을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A등급 (최우수)</SelectItem>
                    <SelectItem value="B">B등급 (우수)</SelectItem>
                    <SelectItem value="C">C등급 (보통)</SelectItem>
                    <SelectItem value="D">D등급 (개선 필요)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">운영 상태 *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="운영 상태를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">운영중</SelectItem>
                    <SelectItem value="inactive">비활성</SelectItem>
                    <SelectItem value="maintenance">점검중</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="건물에 대한 추가 설명을 입력하세요..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/buildings')}
              >
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