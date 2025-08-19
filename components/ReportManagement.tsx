import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  FileText, 
  Download, 
  Eye, 
  Filter,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Loader2
} from 'lucide-react';
import { reportsApi, buildingsApi } from '../utils/api';

interface Report {
  id: string;
  title: string;
  description: string;
  type: string;
  period: string;
  building: string;
  startDate: string;
  endDate: string;
  summary: {
    totalConsumption: number;
    avgConsumption: number;
    peakPower: number;
    avgEfficiency: number;
    energyCost: number;
    co2Emission: number;
    dataPoints: number;
  };
  alertStats: {
    total: number;
    critical: number;
    high: number;
    resolved: number;
  };
  generatedAt: string;
  fileSize: string;
  format: string;
}

interface Building {
  id: string;
  name: string;
}

export function ReportManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  
  // 새 리포트 생성 폼
  const [generateType, setGenerateType] = useState('consumption');
  const [generatePeriod, setGeneratePeriod] = useState('weekly');
  const [generateBuilding, setGenerateBuilding] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadReports();
  }, [typeFilter, periodFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsResult, buildingsResult] = await Promise.all([
        reportsApi.list(),
        buildingsApi.list()
      ]);
      
      if (reportsResult.success) {
        setReports(reportsResult.data || []);
      }
      
      if (buildingsResult.success) {
        setBuildings(buildingsResult.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const options: any = {};
      if (typeFilter !== 'all') options.type = typeFilter;
      if (periodFilter !== 'all') options.period = periodFilter;
      
      const result = await reportsApi.list(options);
      if (result.success) {
        setReports(result.data || []);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const data: any = {
        type: generateType,
        period: generatePeriod
      };
      
      if (generateBuilding !== 'all') {
        data.building = generateBuilding;
      }
      
      const result = await reportsApi.generate(data);
      if (result.success) {
        setReports(prev => [result.data, ...prev]);
        setIsGenerateDialogOpen(false);
        setGenerateType('consumption');
        setGeneratePeriod('weekly');
        setGenerateBuilding('all');
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      consumption: '전력 사용량',
      efficiency: '에너지 효율성',
      cost: '전력 비용',
      summary: '종합'
    };
    return labels[type] || '종합';
  };

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      daily: '일일',
      weekly: '주간',
      monthly: '월간'
    };
    return labels[period] || '주간';
  };

  const getCategoryColor = (type: string) => {
    const colors: Record<string, string> = {
      consumption: 'blue',
      efficiency: 'green',
      cost: 'orange',
      summary: 'purple'
    };
    return colors[type] || 'blue';
  };

  const getBuildingName = (buildingName: string) => {
    if (buildingName === 'all') return '전체 건물';
    return buildingName;
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const completedReports = reports.length;
  const totalSize = reports.reduce((sum, r) => sum + parseFloat(r.fileSize), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">리포트 관리</h1>
          <p className="text-muted-foreground">
            생성된 리포트를 확인하고 새로운 리포트를 요청할 수 있습니다.
          </p>
        </div>
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>새 리포트 생성</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>새 리포트 생성</DialogTitle>
              <DialogDescription>
                생성할 리포트의 유형과 조건을 선택해주세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">리포트 유형</label>
                <Select value={generateType} onValueChange={setGenerateType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consumption">전력 사용량</SelectItem>
                    <SelectItem value="efficiency">에너지 효율성</SelectItem>
                    <SelectItem value="cost">전력 비용</SelectItem>
                    <SelectItem value="summary">종합</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">기간</label>
                <Select value={generatePeriod} onValueChange={setGeneratePeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">일일</SelectItem>
                    <SelectItem value="weekly">주간</SelectItem>
                    <SelectItem value="monthly">월간</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">건물</label>
                <Select value={generateBuilding} onValueChange={setGenerateBuilding}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 건물</SelectItem>
                    {buildings.map(building => (
                      <SelectItem key={building.id} value={building.name}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsGenerateDialogOpen(false)}
                  disabled={generating}
                >
                  취소
                </Button>
                <Button onClick={handleGenerateReport} disabled={generating}>
                  {generating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  리포트 생성
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 요약 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">{completedReports}</div>
                <div className="text-sm text-muted-foreground">생성된 리포트</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{totalSize.toFixed(1)} MB</div>
                <div className="text-sm text-muted-foreground">총 파일 크기</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {reports.filter(r => {
                    const today = new Date().toISOString().split('T')[0];
                    return r.generatedAt.startsWith(today);
                  }).length}
                </div>
                <div className="text-sm text-muted-foreground">오늘 생성</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>필터 및 검색</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="리포트 제목으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 유형</SelectItem>
                <SelectItem value="consumption">전력 사용량</SelectItem>
                <SelectItem value="efficiency">에너지 효율성</SelectItem>
                <SelectItem value="cost">전력 비용</SelectItem>
                <SelectItem value="summary">종합</SelectItem>
              </SelectContent>
            </Select>

            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="기간" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 기간</SelectItem>
                <SelectItem value="daily">일일</SelectItem>
                <SelectItem value="weekly">주간</SelectItem>
                <SelectItem value="monthly">월간</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 리포트 목록 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>리포트 목록</CardTitle>
              <CardDescription>
                총 {filteredReports.length}개의 리포트가 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">리포트를 불러오는 중...</span>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">리포트가 없습니다</h3>
                  <p className="text-muted-foreground mb-4">
                    새 리포트를 생성하여 데이터 분석을 시작하세요.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <div 
                      key={report.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedReport?.id === report.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{report.title}</h4>
                            <p className="text-sm text-muted-foreground">{report.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="outline" 
                            style={{ 
                              borderColor: getCategoryColor(report.type), 
                              color: getCategoryColor(report.type) 
                            }}
                          >
                            {getTypeLabel(report.type)}
                          </Badge>
                          <Badge variant="secondary">완료</Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span>{getPeriodLabel(report.period)}</span>
                          <span>{getBuildingName(report.building)}</span>
                          <span>{new Date(report.generatedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span>{report.fileSize}</span>
                          <span>{report.format}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Preview report:', report.id);
                          }}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>미리보기</span>
                        </Button>
                        <Button 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Download report:', report.id);
                          }}
                          className="flex items-center space-x-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>다운로드</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 리포트 상세 정보 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>리포트 상세</CardTitle>
              <CardDescription>
                {selectedReport ? '선택된 리포트의 상세 정보' : '리포트를 선택해주세요'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedReport ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{selectedReport.title}</h4>
                    <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">유형</span>
                      <span className="text-sm">{getTypeLabel(selectedReport.type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">기간</span>
                      <span className="text-sm">{getPeriodLabel(selectedReport.period)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">건물</span>
                      <span className="text-sm">{getBuildingName(selectedReport.building)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">생성 시간</span>
                      <span className="text-sm">{new Date(selectedReport.generatedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">파일 형식</span>
                      <span className="text-sm">{selectedReport.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">파일 크기</span>
                      <span className="text-sm">{selectedReport.fileSize}</span>
                    </div>
                  </div>

                  {selectedReport.summary && (
                    <div>
                      <h5 className="font-medium mb-2">요약 정보</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">총 사용량</span>
                          <span>{selectedReport.summary.totalConsumption.toLocaleString()} kWh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">피크 전력</span>
                          <span>{selectedReport.summary.peakPower.toLocaleString()} kW</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">전력 비용</span>
                          <span>₩{selectedReport.summary.energyCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">데이터 포인트</span>
                          <span>{selectedReport.summary.dataPoints.toLocaleString()}개</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col space-y-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => console.log('Preview report:', selectedReport.id)}
                      className="w-full flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>미리보기</span>
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => console.log('Download report:', selectedReport.id)}
                      className="w-full flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>다운로드</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>왼쪽에서 리포트를 선택하여<br />상세 정보를 확인하세요</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}