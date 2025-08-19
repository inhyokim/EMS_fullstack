import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { 
  Search, 
  Calendar, 
  Download, 
  BarChart3,
  Table,
  TrendingUp,
  Filter
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { UserRole } from '../../App';

interface DataExplorerProps {
  userRole: UserRole;
}

// Mock data
const chartData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i.toString().padStart(2, '0')}:00`,
  meter1: Math.floor(Math.random() * 100) + 150,
  meter2: Math.floor(Math.random() * 80) + 120,
  meter3: Math.floor(Math.random() * 60) + 90
}));

const tableData = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  timestamp: `2024-12-24 ${(Math.floor(i / 2) + 10).toString().padStart(2, '0')}:${(i % 2 * 30).toString().padStart(2, '0')}:00`,
  meterName: `계측기 ${(i % 5) + 1}`,
  building: `${['KT 본사', '연구개발센터', '부산지사'][i % 3]}`,
  value: (Math.random() * 300 + 100).toFixed(1),
  unit: 'kWh'
}));

export function DataExplorer({ userRole }: DataExplorerProps) {
  const [dateFrom, setDateFrom] = useState('2024-12-24');
  const [dateTo, setDateTo] = useState('2024-12-24');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [selectedMeter, setSelectedMeter] = useState('all');
  const [viewType, setViewType] = useState<'chart' | 'table'>('chart');

  const handleExportData = () => {
    // Mock CSV export
    const csvContent = `timestamp,meter_name,building,value,unit\n` +
      tableData.slice(0, 10).map(row => 
        `${row.timestamp},${row.meterName},${row.building},${row.value},${row.unit}`
      ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'energy_data_export.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">데이터 탐색</h1>
          <p className="text-gray-600 mt-1">전력 사용량 데이터 조회 및 분석</p>
        </div>
        <Button onClick={handleExportData}>
          <Download className="h-4 w-4 mr-2" />
          데이터 내보내기
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            검색 조건
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">시작 날짜</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateTo">종료 날짜</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>건물</Label>
              <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                <SelectTrigger>
                  <SelectValue placeholder="건물 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 건물</SelectItem>
                  <SelectItem value="1">KT 본사</SelectItem>
                  <SelectItem value="2">연구개발센터</SelectItem>
                  <SelectItem value="3">부산지사</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>계측기</Label>
              <Select value={selectedMeter} onValueChange={setSelectedMeter}>
                <SelectTrigger>
                  <SelectValue placeholder="계측기 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 계측기</SelectItem>
                  <SelectItem value="1">본관 3층 공조기</SelectItem>
                  <SelectItem value="2">본관 1층 조명</SelectItem>
                  <SelectItem value="3">지하 주차장 환기팬</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-2">
              <Badge variant="outline">
                기간: {dateFrom} ~ {dateTo}
              </Badge>
              <Badge variant="outline">
                총 {tableData.length}건 데이터
              </Badge>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant={viewType === 'chart' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewType('chart')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                차트
              </Button>
              <Button
                variant={viewType === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewType('table')}
              >
                <Table className="h-4 w-4 mr-2" />
                테이블
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            데이터 시각화
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewType === 'chart' ? (
            <Tabs defaultValue="line" className="space-y-4">
              <TabsList>
                <TabsTrigger value="line">선형 차트</TabsTrigger>
                <TabsTrigger value="bar">막대 차트</TabsTrigger>
              </TabsList>
              
              <TabsContent value="line" className="space-y-4">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="meter1" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="본관 3층 공조기"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="meter2" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="본관 1층 조명"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="meter3" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      name="지하 주차장 환기팬"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="bar" className="space-y-4">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="meter1" fill="#3B82F6" name="본관 3층 공조기" />
                    <Bar dataKey="meter2" fill="#10B981" name="본관 1층 조명" />
                    <Bar dataKey="meter3" fill="#F59E0B" name="지하 주차장 환기팬" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        시간
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        계측기
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        건물
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        사용량
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        단위
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tableData.slice(0, 20).map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row.timestamp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row.meterName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row.building}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.value}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {row.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  20개 결과 표시 (총 {tableData.length}개)
                </div>
                <Button variant="outline" size="sm">
                  더 보기
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">총 사용량</p>
                <p className="text-2xl font-bold text-gray-900">4,567 kWh</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">평균 사용량</p>
                <p className="text-2xl font-bold text-gray-900">190.3 kWh</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">최대 사용량</p>
                <p className="text-2xl font-bold text-gray-900">425.8 kWh</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">데이터 포인트</p>
                <p className="text-2xl font-bold text-gray-900">{tableData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}