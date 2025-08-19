import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { MapPin, Plus, Edit, Trash2, Building2, Layers, Loader2 } from 'lucide-react';
import { buildingsApi, zonesApi } from '../utils/api';

interface Building {
  id: string;
  name: string;
  address: string;
  area: number;
  floors: number;
  createdAt: string;
  updatedAt: string;
}

interface Zone {
  id: string;
  buildingId: string;
  name: string;
  floor: number;
  area: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface ZoneFormData {
  buildingId: string;
  name: string;
  floor: number;
  area: number;
  description: string;
}

const initialFormData: ZoneFormData = {
  buildingId: '',
  name: '',
  floor: 1,
  area: 0,
  description: ''
};

export function ZoneManagement() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ZoneFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadZones();
  }, [selectedBuildingId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const buildingsResult = await buildingsApi.list();
      if (buildingsResult.success) {
        setBuildings(buildingsResult.data || []);
      }
      
      const zonesResult = await zonesApi.list();
      if (zonesResult.success) {
        setZones(zonesResult.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadZones = async () => {
    try {
      const result = await zonesApi.list(selectedBuildingId === 'all' ? undefined : selectedBuildingId);
      if (result.success) {
        setZones(result.data || []);
      }
    } catch (error) {
      console.error('Error loading zones:', error);
    }
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await zonesApi.create(formData);
      if (result.success) {
        setZones(prev => [...prev, result.data]);
        setFormData(initialFormData);
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating zone:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZone) return;

    setSubmitting(true);

    try {
      const result = await zonesApi.update(selectedZone.id, formData);
      if (result.success) {
        setZones(prev => 
          prev.map(zone => 
            zone.id === selectedZone.id ? result.data : zone
          )
        );
        setSelectedZone(result.data);
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Error updating zone:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm('정말로 이 구역을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const result = await zonesApi.delete(zoneId);
      if (result.success) {
        setZones(prev => prev.filter(zone => zone.id !== zoneId));
        if (selectedZone?.id === zoneId) {
          setSelectedZone(null);
        }
      }
    } catch (error) {
      console.error('Error deleting zone:', error);
    }
  };

  const handleEditClick = (zone: Zone) => {
    setSelectedZone(zone);
    setFormData({
      buildingId: zone.buildingId,
      name: zone.name,
      floor: zone.floor,
      area: zone.area,
      description: zone.description || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (field: keyof ZoneFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getBuildingName = (buildingId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    return building?.name || '알 수 없는 건물';
  };

  const getFilteredZones = () => {
    return selectedBuildingId === 'all' 
      ? zones 
      : zones.filter(zone => zone.buildingId === selectedBuildingId);
  };

  const ZoneForm = ({ onSubmit, title, submitText }: {
    onSubmit: (e: React.FormEvent) => void;
    title: string;
    submitText: string;
  }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="buildingId">건물</Label>
        <Select 
          value={formData.buildingId} 
          onValueChange={(value) => handleInputChange('buildingId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="건물을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {buildings.map(building => (
              <SelectItem key={building.id} value={building.id}>
                {building.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="name">구역명</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="구역명을 입력하세요"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="floor">층수</Label>
          <Input
            id="floor"
            type="number"
            value={formData.floor || ''}
            onChange={(e) => handleInputChange('floor', parseInt(e.target.value) || 1)}
            placeholder="층수"
            min="1"
            required
          />
        </div>
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
      </div>
      
      <div>
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="구역에 대한 추가 설명을 입력하세요 (선택사항)"
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
        <Button type="submit" disabled={submitting || !formData.buildingId}>
          {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {submitText}
        </Button>
      </div>
    </form>
  );

  const filteredZones = getFilteredZones();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">구역 관리</h1>
          <p className="text-muted-foreground">
            건물 내 에너지 관리 구역을 설정하고 관리합니다.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData(initialFormData)} disabled={buildings.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              새 구역 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>새 구역 추가</DialogTitle>
              <DialogDescription>
                새로운 구역의 정보를 입력해주세요.
              </DialogDescription>
            </DialogHeader>
            <ZoneForm 
              onSubmit={handleCreateZone}
              title="새 구역 추가"
              submitText="구역 추가"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* 필터 및 요약 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>건물별 필터</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedBuildingId} onValueChange={setSelectedBuildingId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 건물</SelectItem>
                {buildings.map(building => (
                  <SelectItem key={building.id} value={building.id}>
                    {building.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>구역 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{filteredZones.length}</div>
                  <div className="text-sm text-muted-foreground">구역 수</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {filteredZones.reduce((sum, zone) => sum + zone.area, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">총 면적</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {selectedBuildingId === 'all' ? buildings.length : 1}
                  </div>
                  <div className="text-sm text-muted-foreground">건물 수</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 구역 목록 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>구역 목록</CardTitle>
              <CardDescription>
                {selectedBuildingId === 'all' ? '전체' : getBuildingName(selectedBuildingId)} 구역 목록
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">구역 목록을 불러오는 중...</span>
                </div>
              ) : buildings.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">건물이 없습니다</h3>
                  <p className="text-muted-foreground">
                    먼저 건물을 등록한 후 구역을 추가하세요.
                  </p>
                </div>
              ) : filteredZones.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">등록된 구역이 없습니다</h3>
                  <p className="text-muted-foreground mb-4">
                    새 구역을 추가하여 에너지 관리를 세분화하세요.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredZones.map((zone) => (
                    <div 
                      key={zone.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedZone?.id === zone.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedZone(zone)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{zone.name}</h4>
                            <p className="text-sm text-muted-foreground">{getBuildingName(zone.buildingId)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(zone);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteZone(zone.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{zone.floor}층</span>
                        <span>면적: {zone.area.toLocaleString()}㎡</span>
                        <Badge variant="outline">
                          {new Date(zone.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 구역 상세 정보 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>구역 상세</CardTitle>
              <CardDescription>
                {selectedZone ? '선택된 구역의 상세 정보' : '구역을 선택해주세요'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedZone ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{selectedZone.name}</h4>
                    <p className="text-sm text-muted-foreground">{getBuildingName(selectedZone.buildingId)}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">층수</span>
                      <span className="text-sm">{selectedZone.floor}층</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">면적</span>
                      <span className="text-sm">{selectedZone.area.toLocaleString()}㎡</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">등록일</span>
                      <span className="text-sm">{new Date(selectedZone.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">수정일</span>
                      <span className="text-sm">{new Date(selectedZone.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {selectedZone.description && (
                    <div>
                      <h5 className="font-medium mb-1">설명</h5>
                      <p className="text-sm text-muted-foreground">{selectedZone.description}</p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditClick(selectedZone)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      편집
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteZone(selectedZone.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      삭제
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>왼쪽에서 구역을 선택하여<br />상세 정보를 확인하세요</p>
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
            <DialogTitle>구역 정보 수정</DialogTitle>
            <DialogDescription>
              구역의 정보를 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <ZoneForm 
            onSubmit={handleUpdateZone}
            title="구역 정보 수정"
            submitText="수정 완료"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}