import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Bell, 
  TrendingUp, 
  Zap, 
  AlertTriangle,
  Clock,
  Building2,
  MapPin,
  Loader2
} from 'lucide-react';
import { alertRulesApi, buildingsApi, zonesApi } from '../utils/api';

interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: 'consumption' | 'peak' | 'efficiency' | 'anomaly';
  condition: 'above' | 'below' | 'equals';
  threshold: number;
  unit: 'kWh' | 'kW' | '%';
  building?: string;
  zone?: string;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
}

interface Building {
  id: string;
  name: string;
}

interface Zone {
  id: string;
  name: string;
  buildingId: string;
}

interface AlertRuleFormData {
  name: string;
  description: string;
  type: 'consumption' | 'peak' | 'efficiency' | 'anomaly';
  condition: 'above' | 'below' | 'equals';
  threshold: number;
  unit: 'kWh' | 'kW' | '%';
  building: string;
  zone: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const initialFormData: AlertRuleFormData = {
  name: '',
  description: '',
  type: 'consumption',
  condition: 'above',
  threshold: 0,
  unit: 'kWh',
  building: '',
  zone: '',
  severity: 'medium'
};

export function AlertRules() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AlertRuleFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadRules(),
        loadBuildings(),
        loadZones()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadRules = async () => {
    try {
      const result = await alertRulesApi.list();
      if (result.success) {
        setRules(result.data || []);
      }
    } catch (error) {
      console.error('Error loading rules:', error);
    }
  };

  const loadBuildings = async () => {
    try {
      const result = await buildingsApi.list();
      if (result.success) {
        setBuildings(result.data || []);
      }
    } catch (error) {
      console.error('Error loading buildings:', error);
    }
  };

  const loadZones = async () => {
    try {
      const result = await zonesApi.list();
      if (result.success) {
        setZones(result.data || []);
      }
    } catch (error) {
      console.error('Error loading zones:', error);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const ruleData = {
        ...formData,
        building: formData.building || undefined,
        zone: formData.zone || undefined,
        enabled: true
      };

      const result = await alertRulesApi.create(ruleData);
      if (result.success) {
        setRules(prev => [...prev, result.data]);
        setFormData(initialFormData);
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating rule:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRule) return;

    setSubmitting(true);

    try {
      const ruleData = {
        ...formData,
        building: formData.building || undefined,
        zone: formData.zone || undefined,
      };

      const result = await alertRulesApi.update(selectedRule.id, ruleData);
      if (result.success) {
        setRules(prev => 
          prev.map(rule => 
            rule.id === selectedRule.id ? result.data : rule
          )
        );
        setSelectedRule(result.data);
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Error updating rule:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('정말로 이 알람 규칙을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const result = await alertRulesApi.delete(ruleId);
      if (result.success) {
        setRules(prev => prev.filter(rule => rule.id !== ruleId));
        if (selectedRule?.id === ruleId) {
          setSelectedRule(null);
        }
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const result = await alertRulesApi.update(ruleId, { enabled });
      if (result.success) {
        setRules(prev =>
          prev.map(rule =>
            rule.id === ruleId ? { ...rule, enabled } : rule
          )
        );
        if (selectedRule?.id === ruleId) {
          setSelectedRule(prev => prev ? { ...prev, enabled } : null);
        }
      }
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  const handleEditClick = (rule: AlertRule) => {
    setSelectedRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      type: rule.type,
      condition: rule.condition,
      threshold: rule.threshold,
      unit: rule.unit,
      building: rule.building || '',
      zone: rule.zone || '',
      severity: rule.severity
    });
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (field: keyof AlertRuleFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // 타입 변경 시 적절한 단위 설정
      if (field === 'type') {
        switch (value) {
          case 'consumption':
            updated.unit = 'kWh';
            break;
          case 'peak':
            updated.unit = 'kW';
            break;
          case 'efficiency':
          case 'anomaly':
            updated.unit = '%';
            break;
        }
      }
      
      return updated;
    });
  };

  const getTypeIcon = (type: AlertRule['type']) => {
    switch (type) {
      case 'consumption':
        return <Zap className="w-4 h-4" />;
      case 'peak':
        return <TrendingUp className="w-4 h-4" />;
      case 'efficiency':
        return <Bell className="w-4 h-4" />;
      case 'anomaly':
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: AlertRule['type']) => {
    const labels = {
      consumption: '사용량',
      peak: '피크',
      efficiency: '효율성',
      anomaly: '이상감지'
    };
    return labels[type];
  };

  const getSeverityBadge = (severity: AlertRule['severity']) => {
    const variants = {
      low: 'secondary',
      medium: 'outline',
      high: 'default',
      critical: 'destructive'
    } as const;

    const labels = {
      low: '낮음',
      medium: '보통',
      high: '높음',
      critical: '긴급'
    };

    return (
      <Badge variant={variants[severity]}>
        {labels[severity]}
      </Badge>
    );
  };

  const getBuildingName = (buildingName?: string) => {
    if (!buildingName) return '';
    return buildingName;
  };

  const getZoneName = (zoneName?: string) => {
    if (!zoneName) return '';
    return zoneName;
  };

  const getFilteredZones = () => {
    if (!formData.building) return [];
    const building = buildings.find(b => b.name === formData.building);
    if (!building) return [];
    return zones.filter(zone => zone.buildingId === building.id);
  };

  const AlertRuleForm = ({ onSubmit, title, submitText }: {
    onSubmit: (e: React.FormEvent) => void;
    title: string;
    submitText: string;
  }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">규칙 이름</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="알람 규칙 이름을 입력하세요"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="알람 규칙에 대한 설명을 입력하세요"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="type">알람 유형</Label>
          <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="consumption">사용량</SelectItem>
              <SelectItem value="peak">피크</SelectItem>
              <SelectItem value="efficiency">효율성</SelectItem>
              <SelectItem value="anomaly">이상감지</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="severity">심각도</Label>
          <Select value={formData.severity} onValueChange={(value) => handleInputChange('severity', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">낮음</SelectItem>
              <SelectItem value="medium">보통</SelectItem>
              <SelectItem value="high">높음</SelectItem>
              <SelectItem value="critical">긴급</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label htmlFor="condition">조건</Label>
          <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="above">초과</SelectItem>
              <SelectItem value="below">미만</SelectItem>
              <SelectItem value="equals">같음</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="threshold">임계치</Label>
          <Input
            id="threshold"
            type="number"
            value={formData.threshold || ''}
            onChange={(e) => handleInputChange('threshold', parseFloat(e.target.value) || 0)}
            placeholder="값"
            required
            min="0"
            step="0.1"
          />
        </div>
        <div>
          <Label htmlFor="unit">단위</Label>
          <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kWh">kWh</SelectItem>
              <SelectItem value="kW">kW</SelectItem>
              <SelectItem value="%">%</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="building">건물 (선택)</Label>
          <Select value={formData.building} onValueChange={(value) => handleInputChange('building', value)}>
            <SelectTrigger>
              <SelectValue placeholder="전체 건물" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체 건물</SelectItem>
              {buildings.map(building => (
                <SelectItem key={building.id} value={building.name}>
                  {building.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="zone">구역 (선택)</Label>
          <Select 
            value={formData.zone} 
            onValueChange={(value) => handleInputChange('zone', value)}
            disabled={!formData.building}
          >
            <SelectTrigger>
              <SelectValue placeholder="전체 구역" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체 구역</SelectItem>
              {getFilteredZones().map(zone => (
                <SelectItem key={zone.id} value={zone.name}>
                  {zone.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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

  const activeRules = rules.filter(rule => rule.enabled).length;
  const criticalRules = rules.filter(rule => rule.severity === 'critical').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">알람 규칙 관리</h1>
          <p className="text-muted-foreground">
            전력 사용량 모니터링을 위한 알람 규칙을 설정하고 관리합니다.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>새 규칙 추가</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>새 알람 규칙 추가</DialogTitle>
              <DialogDescription>
                새로운 알람 규칙의 상세 정보를 입력해주세요.
              </DialogDescription>
            </DialogHeader>
            <AlertRuleForm 
              onSubmit={handleCreateRule}
              title="새 알람 규칙 추가"
              submitText="규칙 추가"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* 요약 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">{activeRules}</div>
                <div className="text-sm text-muted-foreground">활성 규칙</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">{criticalRules}</div>
                <div className="text-sm text-muted-foreground">긴급 규칙</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{rules.length - activeRules}</div>
                <div className="text-sm text-muted-foreground">비활성 규칙</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{rules.length}</div>
                <div className="text-sm text-muted-foreground">전체 규칙</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 규칙 목록 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>알람 규칙 목록</CardTitle>
              <CardDescription>
                등록된 알람 규칙들을 확인하고 관리할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">알람 규칙을 불러오는 중...</span>
                </div>
              ) : rules.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">등록된 알람 규칙이 없습니다</h3>
                  <p className="text-muted-foreground mb-4">
                    새 알람 규칙을 추가하여 전력 사용량을 모니터링하세요.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rules.map((rule) => (
                    <div 
                      key={rule.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedRule?.id === rule.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedRule(rule)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(rule.type)}
                          <div>
                            <h4 className="font-medium">{rule.name}</h4>
                            <p className="text-sm text-muted-foreground">{rule.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={rule.enabled}
                            onCheckedChange={(enabled) => handleToggleRule(rule.id, enabled)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {getSeverityBadge(rule.severity)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          {rule.building && (
                            <div className="flex items-center space-x-1">
                              <Building2 className="w-3 h-3" />
                              <span>{getBuildingName(rule.building)}</span>
                            </div>
                          )}
                          {rule.zone && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{getZoneName(rule.zone)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 text-sm">
                        <span className="inline-block px-2 py-1 bg-muted rounded text-muted-foreground">
                          {getTypeLabel(rule.type)} {rule.condition === 'above' ? '>' : rule.condition === 'below' ? '<' : '='} {rule.threshold}{rule.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 규칙 상세 정보 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>규칙 상세</CardTitle>
              <CardDescription>
                {selectedRule ? '선택된 규칙의 상세 정보' : '규칙을 선택해주세요'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedRule ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{selectedRule.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedRule.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">유형</span>
                      <span className="text-sm">{getTypeLabel(selectedRule.type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">조건</span>
                      <span className="text-sm">
                        {selectedRule.threshold}{selectedRule.unit} {selectedRule.condition === 'above' ? '초과' : selectedRule.condition === 'below' ? '미만' : '동일'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">심각도</span>
                      {getSeverityBadge(selectedRule.severity)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">상태</span>
                      <Badge variant={selectedRule.enabled ? "secondary" : "outline"}>
                        {selectedRule.enabled ? '활성' : '비활성'}
                      </Badge>
                    </div>
                    {selectedRule.building && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">건물</span>
                        <span className="text-sm">{getBuildingName(selectedRule.building)}</span>
                      </div>
                    )}
                    {selectedRule.zone && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">구역</span>
                        <span className="text-sm">{getZoneName(selectedRule.zone)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">생성일</span>
                      <span className="text-sm">{new Date(selectedRule.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditClick(selectedRule)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      편집
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteRule(selectedRule.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      삭제
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>왼쪽에서 알람 규칙을 선택하여<br />상세 정보를 확인하세요</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 편집 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>알람 규칙 수정</DialogTitle>
            <DialogDescription>
              알람 규칙의 정보를 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <AlertRuleForm 
            onSubmit={handleUpdateRule}
            title="알람 규칙 수정"
            submitText="수정 완료"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}