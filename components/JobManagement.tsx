import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { 
  Play, 
  Square, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar as CalendarIcon,
  BarChart3,
  Settings,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { jobsApi, buildingsApi, zonesApi } from '../utils/api';

interface Job {
  id: string;
  type: 'hourly' | 'daily';
  status: 'running' | 'completed' | 'failed';
  targetDate: string;
  buildingId?: string;
  zoneId?: string;
  startTime: string;
  endTime?: string;
  results?: {
    aggregatesCount: number;
    alertsTriggered: number;
  };
  error?: string;
  createdAt: string;
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

export function JobManagement() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // 새 작업 설정
  const [jobType, setJobType] = useState<'hourly' | 'daily'>('hourly');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('all');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('all');
  const [targetDate, setTargetDate] = useState<Date>(new Date());

  useEffect(() => {
    loadData();
    const interval = setInterval(loadJobs, 30000); // 30초마다 작업 상태 업데이트
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadJobs(),
        loadBuildings(),
        loadZones()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const result = await jobsApi.list();
      if (result.success) {
        setJobs(result.data || []);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
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

  const handleRunJob = async () => {
    if (running) return;
    
    setRunning(true);
    try {
      const options: any = {
        targetDate: targetDate.toISOString()
      };
      
      if (selectedBuildingId !== 'all') {
        options.buildingId = selectedBuildingId;
      }
      
      if (selectedZoneId !== 'all') {
        options.zoneId = selectedZoneId;
      }

      const result = await jobsApi.runAggregation(jobType, options);
      if (result.success) {
        await loadJobs(); // 작업 목록 새로고침
      }
    } catch (error) {
      console.error('Error running job:', error);
    } finally {
      setRunning(false);
    }
  };

  const getStatusIcon = (status: Job['status']) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: Job['status']) => {
    const variants = {
      running: 'default',
      completed: 'secondary',
      failed: 'destructive'
    } as const;

    const labels = {
      running: '실행 중',
      completed: '완료',
      failed: '실패'
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getJobTypeLabel = (type: Job['type']) => {
    return type === 'hourly' ? '시간별 집계' : '일별 집계';
  };

  const getBuildingName = (buildingId?: string) => {
    if (!buildingId) return '';
    const building = buildings.find(b => b.id === buildingId);
    return building?.name || '알 수 없는 건물';
  };

  const getZoneName = (zoneId?: string) => {
    if (!zoneId) return '';
    const zone = zones.find(z => z.id === zoneId);
    return zone?.name || '알 수 없는 구역';
  };

  const getFilteredZones = () => {
    if (selectedBuildingId === 'all') return zones;
    return zones.filter(zone => zone.buildingId === selectedBuildingId);
  };

  const runningJobs = jobs.filter(job => job.status === 'running').length;
  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  const failedJobs = jobs.filter(job => job.status === 'failed').length;
  const totalAggregates = jobs
    .filter(job => job.status === 'completed' && job.results)
    .reduce((sum, job) => sum + (job.results?.aggregatesCount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">집계 작업 관리</h1>
          <p className="text-muted-foreground">
            데이터 집계 및 분석 작업의 실행 상태를 모니터링하고 관리합니다.
          </p>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{runningJobs}</div>
                <div className="text-sm text-muted-foreground">실행 중</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">{completedJobs}</div>
                <div className="text-sm text-muted-foreground">완료</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">{failedJobs}</div>
                <div className="text-sm text-muted-foreground">실패</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{totalAggregates}</div>
                <div className="text-sm text-muted-foreground">총 집계</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 새 작업 실행 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="w-5 h-5" />
            <span>새 집계 작업 실행</span>
          </CardTitle>
          <CardDescription>
            새로운 데이터 집계 작업을 설정하고 실행할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <label className="text-sm font-medium mb-2 block">집계 유형</label>
              <Select value={jobType} onValueChange={setJobType as any}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">시간별 집계</SelectItem>
                  <SelectItem value="daily">일별 집계</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">건물</label>
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
              <label className="text-sm font-medium mb-2 block">구역</label>
              <Select value={selectedZoneId} onValueChange={setSelectedZoneId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 구역</SelectItem>
                  {getFilteredZones().map(zone => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">대상 날짜</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {targetDate.toLocaleDateString('ko-KR')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={targetDate}
                    onSelect={(date) => date && setTargetDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleRunJob} 
                disabled={running}
                className="w-full flex items-center space-x-2"
              >
                {running ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>작업 실행</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 작업 목록 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>작업 목록</CardTitle>
              <CardDescription>
                최근 실행된 집계 작업들의 상태를 확인할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">작업 목록을 불러오는 중...</span>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">실행된 작업이 없습니다</h3>
                  <p className="text-muted-foreground">
                    새 집계 작업을 실행하여 데이터를 분석하세요.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div 
                      key={job.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedJob?.id === job.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedJob(job)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(job.status)}
                          <div>
                            <h4 className="font-medium">{getJobTypeLabel(job.type)}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(job.targetDate).toLocaleDateString('ko-KR')}
                              {job.buildingId && ` • ${getBuildingName(job.buildingId)}`}
                              {job.zoneId && ` • ${getZoneName(job.zoneId)}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(job.status)}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>시작: {new Date(job.startTime).toLocaleString('ko-KR')}</span>
                        {job.endTime && (
                          <span>종료: {new Date(job.endTime).toLocaleString('ko-KR')}</span>
                        )}
                      </div>

                      {job.results && (
                        <div className="mt-2 text-sm">
                          <span className="inline-block px-2 py-1 bg-muted rounded text-muted-foreground">
                            집계: {job.results.aggregatesCount}개 • 알람: {job.results.alertsTriggered}개
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 작업 상세 정보 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>작업 상세</CardTitle>
              <CardDescription>
                {selectedJob ? '선택된 작업의 상세 정보' : '작업을 선택해주세요'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedJob ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{getJobTypeLabel(selectedJob.type)}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedJob.targetDate).toLocaleDateString('ko-KR')} 데이터 집계
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">상태</span>
                      {getStatusBadge(selectedJob.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">유형</span>
                      <span className="text-sm">{getJobTypeLabel(selectedJob.type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">대상 날짜</span>
                      <span className="text-sm">{new Date(selectedJob.targetDate).toLocaleDateString('ko-KR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">시작 시간</span>
                      <span className="text-sm">{new Date(selectedJob.startTime).toLocaleString('ko-KR')}</span>
                    </div>
                    {selectedJob.endTime && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">종료 시간</span>
                        <span className="text-sm">{new Date(selectedJob.endTime).toLocaleString('ko-KR')}</span>
                      </div>
                    )}
                    {selectedJob.buildingId && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">건물</span>
                        <span className="text-sm">{getBuildingName(selectedJob.buildingId)}</span>
                      </div>
                    )}
                    {selectedJob.zoneId && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">구역</span>
                        <span className="text-sm">{getZoneName(selectedJob.zoneId)}</span>
                      </div>
                    )}
                  </div>

                  {selectedJob.results && (
                    <div>
                      <h5 className="font-medium mb-2">실행 결과</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">생성된 집계</span>
                          <span className="text-sm">{selectedJob.results.aggregatesCount}개</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">발생한 알람</span>
                          <span className="text-sm">{selectedJob.results.alertsTriggered}개</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedJob.error && (
                    <div>
                      <h5 className="font-medium mb-2 text-red-600">오류</h5>
                      <p className="text-sm text-red-600">{selectedJob.error}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>왼쪽에서 작업을 선택하여<br />상세 정보를 확인하세요</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}