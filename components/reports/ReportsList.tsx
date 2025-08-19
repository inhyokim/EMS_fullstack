import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FileText, Download, Eye } from 'lucide-react';
import type { UserRole } from '../../App';

interface ReportsListProps {
  userRole: UserRole;
}

export function ReportsList({ userRole }: ReportsListProps) {
  const mockReports = [
    {
      id: 1,
      name: '12월 주간 에너지 리포트',
      type: 'weekly',
      period: '2024-12-16 ~ 2024-12-22',
      status: 'completed',
      createdAt: '2024-12-23',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: '11월 월간 에너지 리포트',
      type: 'monthly',
      period: '2024-11-01 ~ 2024-11-30',
      status: 'completed',
      createdAt: '2024-12-01',
      size: '8.7 MB'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">리포트</h1>
        <p className="text-gray-600 mt-1">에너지 사용량 리포트 조회 및 다운로드</p>
      </div>

      <div className="space-y-4">
        {mockReports.map((report) => (
          <Card key={report.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <FileText className="h-8 w-8 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-medium">{report.name}</h3>
                    <p className="text-gray-600">{report.period}</p>
                    <div className="flex space-x-2 mt-2">
                      <Badge variant="default" className="bg-green-500">완료</Badge>
                      <Badge variant="outline">{report.type === 'weekly' ? '주간' : '월간'}</Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      생성일: {report.createdAt} | 크기: {report.size}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link to={`/reports/${report.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      보기
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    다운로드
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}