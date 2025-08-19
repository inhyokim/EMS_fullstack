import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, Edit, Gauge } from 'lucide-react';
import { mockMeters } from './metersData';
import { getMeterTypeBadge, getStatusBadge, formatLastReading, formatDateTime } from './metersHelpers';
import type { UserRole } from '../../App';

interface MeterDetailProps {
  userRole: UserRole;
}

export function MeterDetail({ userRole }: MeterDetailProps) {
  const { id } = useParams();
  const meter = mockMeters.find(m => m.id === Number(id));

  if (!meter) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">계측기를 찾을 수 없습니다</h3>
            <p className="text-gray-500">요청하신 계측기 정보가 존재하지 않습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/meters">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{meter.name}</h1>
            <p className="text-gray-600 mt-1">계측기 상세 정보</p>
          </div>
        </div>
        {userRole === 'admin' && (
          <Link to={`/meters/${id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              수정
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gauge className="h-5 w-5 mr-2" />
            계측기 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">계측기 번호</label>
                <p className="text-lg font-medium text-gray-900">{meter.meterNo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">건물</label>
                <p className="text-gray-900">{meter.building}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">구역</label>
                <p className="text-gray-900">{meter.zone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">위치</label>
                <p className="text-gray-900">{meter.location || 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">타입</label>
                <div className="mt-1">{getMeterTypeBadge(meter.type)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">상태</label>
                <div className="mt-1">{getStatusBadge(meter.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">모델</label>
                <p className="text-gray-900">{meter.model || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">설치일</label>
                <p className="text-gray-900">{meter.installDate ? new Date(meter.installDate).toLocaleDateString('ko-KR') : 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>최근 측정값</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">마지막 측정값</label>
              <p className="text-2xl font-bold text-blue-600">
                {formatLastReading(meter.lastReading, meter.unit)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">측정 시간</label>
              <p className="text-gray-900">{formatDateTime(meter.lastReadingTime)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}