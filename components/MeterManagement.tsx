import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Activity, Plus, Edit, Trash2, Building2, MapPin, Zap, Loader2 } from 'lucide-react';
import { buildingsApi, zonesApi, metersApi, validateForm, handleApiError } from '../utils/api';

interface Building {
  id: string;
  name: string;
}

interface Zone {
  id: string;
  name: string;
  buildingId: string;
  floor: number;
}

interface Meter {
  id: string;
  zoneId: string;
  buildingId: string;
  name: string;
  meterNo: string;
  location: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface MeterFormData {
  zoneId: string;
  buildingId: string;
  name: string;
  meterNo: string;
  location: string;
  description: string;
}

const initialFormData: MeterFormData = {
  zoneId: '',
  buildingId: '',
  name: '',
  meterNo: '',
  location: '',
  description: ''
};

export function MeterManagement() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('all');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<MeterFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadMeters();
  }, [selectedBuildingId, selectedZoneId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [buildingsResult, zonesResult, metersResult] = await Promise.all([
        buildingsApi.list(),
        zonesApi.list(),
        metersApi.list()
      ]);
      
      if (buildingsResult.success) setBuildings(buildingsResult.data || []);
      if (zonesResult.success) setZones(zonesResult.data || []);
      if (metersResult.success) setMeters(metersResult.data || []);
    } catch (error) {
      handleApiError(error, '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadMeters = async () => {
    try {
      let result;
      if (selectedZoneId !== 'all') {
        result = await metersApi.list(selectedZoneId);
      } else {
        result = await metersApi.list();
      }
      
      if (result.success) {
        let filteredMeters = result.data || [];
        
        // 건물별 필터링
        if (selectedBuildingId !== 'all') {
          filteredMeters = filteredMeters.filter((meter: Meter) => 
            meter.buildingId === selectedBuildingId
          );
        }
        
        setMeters(filteredMeters);
      }
    } catch (error) {
      console.error('Error loading meters:', error);
    }
  };

  const validateMeterForm = (data: MeterFormData) => {
    try {
      validateForm.required(data.buildingId, '건물');
      validateForm.required(data.zoneId, '구역');
      validateForm.required(data.name, '계측기명');
      validateForm.required(data.meterNo, '계측기 번호');
      validateForm.required(data.location, '설치 위치');
      
      // 계측기 번호 형식 검증 (MT-XXX)
      if (!/^MT-\d{3}$/.test(data.meterNo)) {
        throw new Error('계측기 번호는 MT-001 형식이어야 합니다.');
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  };

  const handleCreateMeter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      validateMeterForm(formData);
      
      const result = await metersApi.create(formData);
      if (result.success) {
        setMeters(prev => [...prev, result.data]);
        setFormData(initialFormData);
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMeter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeter) return;

    setSubmitting(true);

    try {
      validateMeterForm(formData);
      
      const result = await metersApi.update(selectedMeter.id, formData);
      if (result.success) {
        setMeters(prev => 
          prev.map(meter => 
            meter.id === selectedMeter.id ? result.data : meter
          )
        );
        setSelectedMeter(result.data);
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeter = async (meterId: string) => {
    if (!confirm('정말로 이 계측기를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const result = await metersApi.delete(meterId);
      if (result.success) {
        setMeters(prev => prev.filter(meter => meter.id !== meterId));
        if (selectedMeter?.id === meterId) {
          setSelectedMeter(null);
        }
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleEditClick = (meter: Meter) => {
    setSelectedMeter(meter);
    setFormData({
      buildingId: meter.buildingId,
      zoneId: meter.zoneId,
      name: meter.name,
      meterNo: meter.meterNo,
      location: meter.location,
      description: meter.description || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (field: keyof MeterFormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // 건물 변경 시 구역 초기화
      if (field === 'buildingId') {
        updated.zoneId = '';
      }
      
      return updated;
    });
  };

  const getBuildingName = (buildingId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    return building?.name || '알 수 없는 건물';
  };

  const getZoneName = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    return zone?.name || '알 수 없는 구역';
  };

  const getZoneFloor = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    return zone?.floor || 0;
  };

  const getFilteredZones = () => {
    if (selectedBuildingId === 'all') return zones;
    return zones.filter(zone => zone.buildingId === selectedBuildingId);
  };

  const getFormFilteredZones = () => {
    if (!formData.buildingId) return [];
    return zones.filter(zone => zone.buildingId === formData.buildingId);
  };

  const MeterForm = ({ onSubmit, title, submitText }: {
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
        <Label htmlFor="zoneId">구역</Label>
        <Select 
          value={formData.zoneId} 
          onValueChange={(value) => handleInputChange('zoneId', value)}
          disabled={!formData.buildingId}
        >
          <SelectTrigger>
            <SelectValue placeholder="구역을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {getFormFilteredZones().map(zone => (
              <SelectItem key={zone.id} value={zone.id}>
                {zone.name} ({zone.floor}층)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="name">계측기명</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="계측기명을 입력하세요"
          required
        />
      </div>

      <div>
        <Label htmlFor="meterNo">계측기 번호</Label>
        <Input
          id="meterNo"
          value={formData.meterNo}
          onChange={(e) => handleInputChange('meterNo', e.target.value)}
          placeholder="MT-001"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">형식: MT-XXX (예: MT-001)</p>
      </div>

      <div>
        <Label htmlFor="location">설치 위치</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          placeholder="설치 위치를 입력하세요"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="계측기에 대한 추가 설명을 입력하세요 (선택사항)"
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
        <Button type="submit" disabled={submitting || !formData.buildingId || !formData.zoneId}>
          {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {submitText}
        </Button>
      </div>
    </form>
  );

  const filteredMeters = meters;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">계측기 관리</h1>
          <p className="text-muted-foreground">
            전력 데이터 수집을 위한 계측기를 등록하고 관리합니다.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData(initialFormData)} disabled={buildings.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              새 계측기 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>새 계측기 추가</DialogTitle>
              <DialogDescription>
                새로운 계측기의 정보를 입력해주세요.
              </DialogDescription>
            </DialogHeader>
            <MeterForm 
              onSubmit={handleCreateMeter}
              title="새 계측기 추가"
              submitText="계측기 추가"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* 필터 및 요약 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>필터</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>건물별 필터</Label>
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
            </div>
            
            <div>
              <Label>구역별 필터</Label>
              <Select value={selectedZoneId} onValueChange={setSelectedZoneId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 구역</SelectItem>
                  {getFilteredZones().map(zone => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name} ({zone.floor}층)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>계측기 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{filteredMeters.length}</div>
                  <div className="text-sm text-muted-foreground">계측기 수</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {new Set(filteredMeters.map(m => m.buildingId)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">연결 건물</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {new Set(filteredMeters.map(m => m.zoneId)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">연결 구역</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 계측기 목록 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>계측기 목록</CardTitle>
              <CardDescription>
                {selectedBuildingId === 'all' ? '전체' : getBuildingName(selectedBuildingId)} 계측기 목록
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">계측기 목록을 불러오는 중...</span>
                </div>
              ) : buildings.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">건물이 없습니다</h3>
                  <p className="text-muted-foreground">
                    먼저 건물과 구역을 등록한 후 계측기를 추가하세요.
                  </p>
                </div>
              ) : filteredMeters.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">등록된 계측기가 없습니다</h3>
                  <p className="text-muted-foreground mb-4">
                    새 계측기를 추가하여 전력 데이터 수집을 시작하세요.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMeters.map((meter) => (
                    <div 
                      key={meter.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedMeter?.id === meter.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedMeter(meter)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Activity className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{meter.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {getBuildingName(meter.buildingId)} • {getZoneName(meter.zoneId)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(meter);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMeter(meter.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span>{meter.meterNo}</span>
                          <span>{getZoneFloor(meter.zoneId)}층</span>
                          <span>{meter.location}</span>
                        </div>
                        <Badge variant="outline">
                          {new Date(meter.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 계측기 상세 정보 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>계측기 상세</CardTitle>
              <CardDescription>
                {selectedMeter ? '선택된 계측기의 상세 정보' : '계측기를 선택해주세요'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedMeter ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{selectedMeter.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {getBuildingName(selectedMeter.buildingId)} • {getZoneName(selectedMeter.zoneId)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">계측기 번호</span>
                      <span className="text-sm font-mono">{selectedMeter.meterNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">설치 위치</span>
                      <span className="text-sm">{selectedMeter.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">층수</span>
                      <span className="text-sm">{getZoneFloor(selectedMeter.zoneId)}층</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">등록일</span>
                      <span className="text-sm">{new Date(selectedMeter.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">수정일</span>
                      <span className="text-sm">{new Date(selectedMeter.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {selectedMeter.description && (
                    <div>
                      <h5 className="font-medium mb-1">설명</h5>
                      <p className="text-sm text-muted-foreground">{selectedMeter.description}</p>
                    </div>
                  )}

                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">연결 상태</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <Badge variant="secondary" className="mr-2">온라인</Badge>
                      마지막 데이터 수신: 5분 전
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditClick(selectedMeter)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      편집
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteMeter(selectedMeter.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      삭제
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>왼쪽에서 계측기를 선택하여<br />상세 정보를 확인하세요</p>
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
            <DialogTitle>계측기 정보 수정</DialogTitle>
            <DialogDescription>
              계측기의 정보를 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <MeterForm 
            onSubmit={handleUpdateMeter}
            title="계측기 정보 수정"
            submitText="수정 완료"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}