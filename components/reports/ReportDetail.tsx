import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import type { UserRole } from '../../App';

interface ReportDetailProps {
  userRole: UserRole;
}

export function ReportDetail({ userRole }: ReportDetailProps) {
  const { id } = useParams();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/reports">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">12월 주간 에너지 리포트</h1>
            <p className="text-gray-600 mt-1">2024-12-16 ~ 2024-12-22</p>
          </div>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          PDF 다운로드
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>리포트 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">15,247 kWh</div>
              <div className="text-sm text-blue-700">총 사용량</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">₹2,287,050</div>
              <div className="text-sm text-green-700">총 전력비</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">92.3%</div>
              <div className="text-sm text-orange-700">에너지 효율</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>주요 인사이트</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-700">
            <li>• 전주 대비 전력 사용량 2.5% 증가</li>
            <li>• 공조 시스템이 전체 사용량의 45% 차지</li>
            <li>• 조명 시스템 효율성 1.2% 개선</li>
            <li>• 피크 시간대 전력 사용량 최적화 필요</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}