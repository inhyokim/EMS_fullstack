import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Building, 
  Plus, 
  Search, 
  MapPin, 
  Users, 
  Gauge,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import type { UserRole } from '../../App';

interface BuildingsListProps {
  userRole: UserRole;
}

interface Building {
  id: number;
  name: string;
  location: string;
  address: string;
  totalArea: number;
  floors: number;
  zones: number;
  meters: number;
  status: 'active' | 'inactive' | 'maintenance';
  energyRating: 'A' | 'B' | 'C' | 'D';
  createdAt: string;
}

// Mock data
const mockBuildings: Building[] = [
  {
    id: 1,
    name: 'KT 본사',
    location: '서울시 종로구',
    address: '서울특별시 종로구 종로 17',
    totalArea: 15420,
    floors: 12,
    zones: 8,
    meters: 24,
    status: 'active',
    energyRating: 'A',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    name: '연구개발센터',
    location: '경기도 수원시',
    address: '경기도 수원시 영통구 월드컵로 206',
    totalArea: 8950,
    floors: 8,
    zones: 6,
    meters: 18,
    status: 'active',
    energyRating: 'B',
    createdAt: '2024-02-20'
  },
  {
    id: 3,
    name: '부산지사',
    location: '부산시 해운대구',
    address: '부산광역시 해운대구 센텀중앙로 79',
    totalArea: 5670,
    floors: 6,
    zones: 4,
    meters: 12,
    status: 'maintenance',
    energyRating: 'B',
    createdAt: '2024-03-10'
  },
  {
    id: 4,
    name: '대구지사',
    location: '대구시 중구',
    address: '대구광역시 중구 동성로 145',
    totalArea: 3250,
    floors: 4,
    zones: 3,
    meters: 8,
    status: 'active',
    energyRating: 'C',
    createdAt: '2024-04-05'
  }
];

export function BuildingsList({ userRole }: BuildingsListProps) {
  const [buildings, setBuildings] = useState<Building[]>(mockBuildings);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBuildings, setFilteredBuildings] = useState<Building[]>(mockBuildings);

  useEffect(() => {
    const filtered = buildings.filter(building =>
      building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      building.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBuildings(filtered);
  }, [searchTerm, buildings]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">운영중</Badge>;
      case 'inactive':
        return <Badge variant="secondary">비활성</Badge>;
      case 'maintenance':
        return <Badge variant="default" className="bg-orange-500">점검중</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  const getEnergyRatingBadge = (rating: string) => {
    const colors = {
      A: 'bg-green-500',
      B: 'bg-blue-500',
      C: 'bg-yellow-500',
      D: 'bg-red-500'
    };
    return <Badge className={colors[rating as keyof typeof colors] || 'bg-gray-500'}>등급 {rating}</Badge>;
  };

  const handleDelete = (id: number) => {
    if (confirm('정말로 이 건물을 삭제하시겠습니까?')) {
      setBuildings(prev => prev.filter(building => building.id !== id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">건물 관리</h1>
          <p className="text-gray-600 mt-1">등록된 건물 목록 및 정보 관리</p>
        </div>
        {userRole === 'admin' && (
          <Link to="/buildings/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              새 건물 등록
            </Button>
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="건물명 또는 위치로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-500">
              총 {filteredBuildings.length}개 건물
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buildings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuildings.map((building) => (
          <Card key={building.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{building.name}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  {getStatusBadge(building.status)}
                  {getEnergyRatingBadge(building.energyRating)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {building.location}
                </div>
                <div className="text-gray-500 text-xs">
                  {building.address}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">연면적</div>
                  <div className="font-medium">{building.totalArea.toLocaleString()} m²</div>
                </div>
                <div>
                  <div className="text-gray-500">층수</div>
                  <div className="font-medium">{building.floors}층</div>
                </div>
                <div>
                  <div className="text-gray-500">구역</div>
                  <div className="font-medium">{building.zones}개</div>
                </div>
                <div>
                  <div className="text-gray-500">계측기</div>
                  <div className="font-medium">{building.meters}개</div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-xs text-gray-500">
                  등록일: {new Date(building.createdAt).toLocaleDateString('ko-KR')}
                </div>
                <div className="flex space-x-2">
                  <Link to={`/buildings/${building.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {userRole === 'admin' && (
                    <>
                      <Link to={`/buildings/${building.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(building.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBuildings.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-500 mb-4">다른 검색어를 사용해보세요.</p>
            {userRole === 'admin' && (
              <Link to="/buildings/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  새 건물 등록
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}