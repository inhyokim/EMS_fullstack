import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Building2, Plus, Edit, Trash2, MapPin, Users, Loader2 } from 'lucide-react';
import { buildingsApi, seedApi } from '../utils/api';
import { toast } from "sonner@2.0.3";

interface Building {
  id: string;
  name: string;
  address: string;
  area: number;
  floors: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface BuildingFormData {
  name: string;
  address: string;
  area: number;
  floors: number;
  description: string;
}

const initialFormData: BuildingFormData = {
  name: '',
  address: '',
  area: 0,
  floors: 0,
  description: ''
};

export function BuildingManagement() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<BuildingFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    setLoading(true);
    try {
      const result = await buildingsApi.list();
      if (result.success) {
        setBuildings(result.data || []);
      }
    } catch (error) {
      console.error('Error loading buildings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await buildingsApi.create(formData);
      if (result.success) {
        setBuildings(prev => [...prev, result.data]);
        setFormData(initialFormData);
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating building:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuilding) return;

    setSubmitting(true);

    try {
      const result = await buildingsApi.update(selectedBuilding.id, formData);
      if (result.success) {
        setBuildings(prev => 
          prev.map(building => 
            building.id === selectedBuilding.id ? result.data : building
          )
        );
        setSelectedBuilding(result.data);
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Error updating building:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBuilding = async (buildingId: string) => {
    if (!confirm('정말로 이 건물을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const result = await buildingsApi.delete(buildingId);
      if (result.success) {
        setBuildings(prev => prev.filter(building => building.id !== buildingId));
        if (selectedBuilding?.id === buildingId) {
          setSelectedBuilding(null);
        }
      }
    } catch (error) {
      console.error('Error deleting building:', error);
    }
  };

  const handleEditClick = (building: Building) => {
    setSelectedBuilding(building);
    setFormData({
      name: building.name,
      address: building.address,
      area: building.area,
      floors: building.floors,
      description: building.description || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateSeedData = async () => {
    try {
      const result = await seedApi.create();
      if (result.success) {
        loadBuildings(); // 새로 생성된 데이터 로드
      }
    } catch (error) {
      console.error('Error creating seed data:', error);
    }
  };

  const handleInputChange = (field: keyof BuildingFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const BuildingForm = ({ onSubmit, title, submitText }: {
    onSubmit: (e: React.FormEvent) => void;
    title: string;
    submitText: string;
  }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">건물명</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="건물명을 입력하세요"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="address">주소</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="건물 주소를 입력하세요"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="area">면적 (㎡)</Label>
          <Input
            id="area"
            type="number"
            value={formData.area || ''}
            onChange={(e) => handleInputChange('area', parseInt(e.target.value) || 0)}
            placeholder="면적"
            min="0"
            required
          />
        </div>
        <div>
          <Label htmlFor="floors">층수</Label>
          <Input
            id="floors"
            type="number"
            value={formData.floors || ''}
            onChange={(e) => handleInputChange('floors', parseInt(e.target.value) || 0)}
            placeholder="층수"
            min="1"
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="건물에 대한 추가 설명을 입력하세요 (선택사항)"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setFormData(initialFormData);
          }}
          disabled={submitting}
        >
          취소
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {submitText}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">건물 관리</h1>
          <p className="text-muted-foreground">
            에너지 관리 대상 건물을 등록하고 관리합니다.
          </p>
        </div>
        <div className="flex space-x-2">
          {buildings.length === 0 && !loading && (
            <Button variant="outline" onClick={handleCreateSeedData}>
              <Building2 className="w-4 h-4 mr-2" />
              초기 데이터 생성
            </Button>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setFormData(initialFormData)}>
                <Plus className="w-4 h-4 mr-2" />
                새 건물 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>새 건물 추가</DialogTitle>
                <DialogDescription>
                  새로운 건물의 기본 정보를 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              <BuildingForm 
                onSubmit={handleCreateBuilding}
                title="새 건물 추가"
                submitText="건물 추가"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 요약 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>건물 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{buildings.length}</div>
                <div className="text-sm text-muted-foreground">등록된 건물</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {buildings.reduce((sum, building) => sum + building.area, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">총 면적 (㎡)</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">
                  {buildings.reduce((sum, building) => sum + building.floors, 0)}
                </div>
                <div className="text-sm text-muted-foreground">총 층수</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  {buildings.length > 0 ? Math.round(buildings.reduce((sum, building) => sum + building.area, 0) / buildings.length) : 0}
                </div>
                <div className="text-sm text-muted-foreground">평균 면적 (㎡)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 건물 목록 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>건물 목록</CardTitle>
              <CardDescription>
                등록된 건물들을 확인하고 관리할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">건물 목록을 불러오는 중...</span>
                </div>
              ) : buildings.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">등록된 건물이 없습니다</h3>
                  <p className="text-muted-foreground mb-4">
                    새 건물을 추가하여 에너지 관리를 시작하세요.
                  </p>
                  <Button onClick={handleCreateSeedData}>초기 데이터 생성</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {buildings.map((building) => (
                    <div 
                      key={building.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedBuilding?.id === building.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedBuilding(building)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Building2 className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{building.name}</h4>
                            <p className="text-sm text-muted-foreground">{building.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(building);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBuilding(building.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>면적: {building.area.toLocaleString()}㎡</span>
                        <span>층수: {building.floors}층</span>
                        <Badge variant="outline">
                          {new Date(building.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 건물 상세 정보 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>건물 상세</CardTitle>
              <CardDescription>
                {selectedBuilding ? '선택된 건물의 상세 정보' : '건물을 선택해주세요'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedBuilding ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{selectedBuilding.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedBuilding.address}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">면적</span>
                      <span className="text-sm">{selectedBuilding.area.toLocaleString()}㎡</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">층수</span>
                      <span className="text-sm">{selectedBuilding.floors}층</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">등록일</span>
                      <span className="text-sm">{new Date(selectedBuilding.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">수정일</span>
                      <span className="text-sm">{new Date(selectedBuilding.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {selectedBuilding.description && (
                    <div>
                      <h5 className="font-medium mb-1">설명</h5>
                      <p className="text-sm text-muted-foreground">{selectedBuilding.description}</p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditClick(selectedBuilding)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      편집
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteBuilding(selectedBuilding.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      삭제
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>왼쪽에서 건물을 선택하여<br />상세 정보를 확인하세요</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 편집 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>건물 정보 수정</DialogTitle>
            <DialogDescription>
              건물의 정보를 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <BuildingForm 
            onSubmit={handleUpdateBuilding}
            title="건물 정보 수정"
            submitText="수정 완료"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}