import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Gauge, Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { mockMeters } from './metersData';
import { getMeterTypeBadge, getStatusBadge } from './metersHelpers';
import type { UserRole } from '../../App';

interface MetersListProps {
  userRole: UserRole;
}

export function MetersList({ userRole }: MetersListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [meters, setMeters] = useState(mockMeters);

  const filteredMeters = meters.filter(meter =>
    meter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meter.meterNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number) => {
    if (confirm('정말로 이 계측기를 삭제하시겠습니까?')) {
      setMeters(prev => prev.filter(meter => meter.id !== id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">계측기 관리</h1>
          <p className="text-gray-600 mt-1">전력 계측기 목록 및 정보 관리</p>
        </div>
        {userRole === 'admin' && (
          <Link to="/meters/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              새 계측기 등록
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="계측기명 또는 번호로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-500">
              총 {filteredMeters.length}개 계측기
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMeters.map((meter) => (
          <Card key={meter.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <Gauge className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{meter.name}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  {getMeterTypeBadge(meter.type)}
                  {getStatusBadge(meter.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div><strong>계측기 번호:</strong> {meter.meterNo}</div>
                <div><strong>건물:</strong> {meter.building}</div>
                <div><strong>구역:</strong> {meter.zone}</div>
                <div><strong>단위:</strong> {meter.unit}</div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Link to={`/meters/${meter.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                {userRole === 'admin' && (
                  <>
                    <Link to={`/meters/${meter.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(meter.id)}
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

      {filteredMeters.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Gauge className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-500 mb-4">다른 검색어를 사용해보세요.</p>
            {userRole === 'admin' && (
              <Link to="/meters/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  새 계측기 등록
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}