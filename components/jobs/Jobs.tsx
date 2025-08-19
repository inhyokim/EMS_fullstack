import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Play, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import type { UserRole } from '../../App';

interface JobsProps {
  userRole: UserRole;
}

const mockJobs = [
  {
    id: 1,
    name: '시간별 집계',
    type: 'hourly',
    status: 'completed',
    startTime: '2024-12-24 15:00:00',
    endTime: '2024-12-24 15:02:15',
    processedRows: 1440,
    description: '분 단위 데이터를 시간별로 집계'
  },
  {
    id: 2,
    name: '일별 집계',
    type: 'daily',
    status: 'running',
    startTime: '2024-12-24 15:05:00',
    processedRows: 720,
    description: '시간별 데이터를 일별로 집계'
  },
  {
    id: 3,
    name: '시간별 집계',
    type: 'hourly',
    status: 'failed',
    startTime: '2024-12-24 14:00:00',
    endTime: '2024-12-24 14:01:30',
    error: '데이터베이스 연결 오류',
    description: '분 단위 데이터를 시간별로 집계'
  }
];

export function Jobs({ userRole }: JobsProps) {
  const [jobs, setJobs] = useState(mockJobs);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunJob = async (type: 'hourly' | 'daily') => {
    setIsRunning(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newJob = {
      id: Date.now(),
      name: type === 'hourly' ? '시간별 집계' : '일별 집계',
      type,
      status: 'completed' as const,
      startTime: new Date().toLocaleString('ko-KR'),
      endTime: new Date(Date.now() + 120000).toLocaleString('ko-KR'),
      processedRows: Math.floor(Math.random() * 1000) + 500,
      description: type === 'hourly' ? '분 단위 데이터를 시간별로 집계' : '시간별 데이터를 일별로 집계'
    };
    
    setJobs(prev => [newJob, ...prev]);
    setIsRunning(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">완료</Badge>;
      case 'running':
        return <Badge variant="default" className="bg-blue-500">실행중</Badge>;
      case 'failed':
        return <Badge variant="destructive">실패</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (userRole !== 'admin') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">접근 권한이 없습니다</h3>
            <p className="text-gray-500">관리자만 집계 작업을 실행할 수 있습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">집계 작업</h1>
        <p className="text-gray-600 mt-1">데이터 집계 작업 실행 및 모니터링</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>시간별 집계</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">분 단위 데이터를 시간별로 집계합니다.</p>
            <Button 
              onClick={() => handleRunJob('hourly')} 
              disabled={isRunning}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              시간별 집계 실행
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>일별 집계</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">시간별 데이터를 일별로 집계합니다.</p>
            <Button 
              onClick={() => handleRunJob('daily')} 
              disabled={isRunning}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              일별 집계 실행
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 작업 이력</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(job.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{job.name}</h4>
                      {getStatusBadge(job.status)}
                    </div>
                    <p className="text-sm text-gray-600">{job.description}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      시작: {job.startTime}
                      {job.endTime && ` | 종료: ${job.endTime}`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {job.processedRows && (
                    <div className="text-sm font-medium">{job.processedRows.toLocaleString()}건 처리</div>
                  )}
                  {job.error && (
                    <div className="text-sm text-red-600">{job.error}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}