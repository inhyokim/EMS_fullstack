import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  MapPin, 
  Plus, 
  Search, 
  Building, 
  Gauge,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import type { UserRole } from '../../App';

interface ZonesListProps {
  userRole: UserRole;
}

interface Zone {
  id: number;
  name: string;
  buildingId: number;
  buildingName: string;
  floor: number;
  area: number;
  zoneType: string;
  meters: number;
  status: 'active' | 'inactive';
  description: string;
  createdAt: string;
}

// Mock data
const mockZones: Zone[] = [
  {
    id: 1,
    name: '본관 3층 사무실',
    buildingId: 1,
    buildingName: 'KT 본사',
    floor: 3,
    area: 450,
    zoneType: 'office',
    meters: 3,
    status: 'active',
    description: '일반 사무 공간',
    createdAt: '2024-01-20'
  },
  {
    id: 2,
    name: '본관 1층 로비',
    buildingId: 1,
    buildingName: 'KT 본사',
    floor: 1,
    area: 200,
    zoneType: 'lobby',
    meters: 2,
    status: 'active',
    description: '메인 로비 및 접수 공간',
    createdAt: '2024-01-20'
  },
  {
    id: 3,
    name: '지하 1층 주차장',
    buildingId: 1,
    buildingName: 'KT 본사',
    floor: -1,
    area: 800,
    zoneType: 'parking',
    meters: 4,
    status: 'active',
    description: '지하 주차 공간',
    createdAt: '2024-01-20'
  },
  {
    id: 4,
    name: '별관 연구실 A',
    buildingId: 2,
    buildingName: '연구개발센터',
    floor: 2,
    area: 300,
    zoneType: 'research',
    meters: 2,
    status: 'active',
    description: 'AI 연구 전용 공간',
    createdAt: '2024-02-25'
  },
  {
    id: 5,
    name: '옥상 설비실',
    buildingId: 1,
    buildingName: 'KT 본사',
    floor: 12,
    area: 150,
    zoneType: 'utility',
    meters: 5,
    status: 'inactive',
    description: '공조 및 전기 설비',
    createdAt: '2024-01-20'
  }
];

export function ZonesList({ userRole }: ZonesListProps) {
  const [zones, setZones] = useState<Zone[]>(mockZones);
  const [filteredZones, setFilteredZones] = useState<Zone[]>(mockZones);
  const [searchTerm, setSearchTerm] = useState('');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');

  useEffect(() => {
    let filtered = zones;

    if (searchTerm) {
      filtered = filtered.filter(zone =>
        zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.buildingName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (buildingFilter !== 'all') {
      filtered = filtered.filter(zone => zone.buildingId.toString() === buildingFilter);
    }

    setFilteredZones(filtered);
  }, [searchTerm, buildingFilter, zones]);

  const getZoneTypeBadge = (type: string) => {
    const types = {
      office: { label: '사무실', color: 'bg-blue-500' },
      lobby: { label: '로비', color: 'bg-green-500' },
      parking: { label: '주차장', color: 'bg-gray-500' },
      research: { label: '연구실', color: 'bg-purple-500' },
      utility: { label: '설비실', color: 'bg-orange-500' }
    };
    const typeInfo = types[type as keyof typeof types] || { label: type, color: 'bg-gray-500' };
    return <Badge className={typeInfo.color}>{typeInfo.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge variant="default" className="bg-green-500">활성</Badge>
      : <Badge variant="secondary">비활성</Badge>;
  };

  const handleDelete = (id: number) => {
    if (confirm('정말로 이 구역을 삭제하시겠습니까?')) {
      setZones(prev => prev.filter(zone => zone.id !== id));
    }
  };

  const buildings = Array.from(new Set(zones.map(zone => ({ id: zone.buildingId, name: zone.buildingName }))));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">구역 관리</h1>
          <p className="text-gray-600 mt-1">건물 내 구역 정보 관리</p>
        </div>
        {userRole === 'admin' && (
          <Link to="/zones/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              새 구역 등록
            </Button>
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="구역명 또는 건물명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={buildingFilter} onValueChange={setBuildingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="건물 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 건물</SelectItem>
                {buildings.map(building => (
                  <SelectItem key={building.id} value={building.id.toString()}>
                    {building.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-500 flex items-center">
              총 {filteredZones.length}개 구역
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredZones.map((zone) => (
          <Card key={zone.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{zone.name}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  {getZoneTypeBadge(zone.zoneType)}
                  {getStatusBadge(zone.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Building className="h-4 w-4 mr-2" />
                  {zone.buildingName}
                </div>
                <div className="text-gray-500">
                  {zone.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">층수</div>
                  <div className="font-medium">
                    {zone.floor > 0 ? `${zone.floor}층` : `지하 ${Math.abs(zone.floor)}층`}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">면적</div>
                  <div className="font-medium">{zone.area} m²</div>
                </div>
                <div>
                  <div className="text-gray-500">계측기</div>
                  <div className="font-medium">{zone.meters}개</div>
                </div>
                <div>
                  <div className="text-gray-500">등록일</div>
                  <div className="font-medium text-xs">
                    {new Date(zone.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                {userRole === 'admin' && (
                  <>
                    <Link to={`/zones/${zone.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(zone.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredZones.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-500 mb-4">다른 검색어를 사용해보세요.</p>
            {userRole === 'admin' && (
              <Link to="/zones/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  새 구역 등록
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}