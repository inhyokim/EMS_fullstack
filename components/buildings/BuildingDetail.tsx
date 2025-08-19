import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowLeft, Edit, MapPin, Building, Users, Gauge } from 'lucide-react';
import type { UserRole } from '../../App';

interface BuildingDetailProps {
  userRole: UserRole;
}

export function BuildingDetail({ userRole }: BuildingDetailProps) {
  const { id } = useParams();

  // Mock data
  const building = {
    id: 1,
    name: 'KT 본사',
    location: '서울시 종로구',
    address: '서울특별시 종로구 종로 17',
    totalArea: 15420,
    floors: 12,
    status: 'active',
    energyRating: 'A',
    zones: 8,
    meters: 24,
    description: 'KT 본사 건물로 최신 에너지 관리 시스템이 도입된 친환경 건물입니다.'
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/buildings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{building.name}</h1>
            <p className="text-gray-600 mt-1">건물 상세 정보</p>
          </div>
        </div>
        {userRole === 'admin' && (
          <Link to={`/buildings/${id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              수정
            </Button>
          </Link>
        )}
      </div>

      {/* Building Info */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">건물명</label>
                <p className="text-lg font-medium text-gray-900">{building.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">위치</label>
                <p className="text-gray-900">{building.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">주소</label>
                <p className="text-gray-900">{building.address}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">연면적</label>
                <p className="text-gray-900">{building.totalArea.toLocaleString()} m²</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">층수</label>
                <p className="text-gray-900">{building.floors}층</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">상태</label>
                <div>
                  <Badge variant="default" className="bg-green-500">운영중</Badge>
                  <Badge className="bg-green-500 ml-2">등급 A</Badge>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">설명</label>
              <p className="text-gray-900 mt-1">{building.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">구역</p>
                <p className="text-2xl font-bold text-gray-900">{building.zones}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Gauge className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">계측기</p>
                <p className="text-2xl font-bold text-gray-900">{building.meters}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">층수</p>
                <p className="text-2xl font-bold text-gray-900">{building.floors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}