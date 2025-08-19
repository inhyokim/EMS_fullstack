import React from 'react';
import { Badge } from '../ui/badge';

export const getMeterTypeBadge = (type: string) => {
  const types = {
    hvac: { label: '공조기', color: 'bg-blue-500' },
    lighting: { label: '조명', color: 'bg-yellow-500' },
    power: { label: '전력', color: 'bg-green-500' },
    elevator: { label: '승강기', color: 'bg-purple-500' },
    security: { label: '보안', color: 'bg-red-500' }
  };
  const typeInfo = types[type as keyof typeof types] || { label: type, color: 'bg-gray-500' };
  return <Badge className={typeInfo.color}>{typeInfo.label}</Badge>;
};

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge variant="default" className="bg-green-500">활성</Badge>;
    case 'inactive':
      return <Badge variant="secondary">비활성</Badge>;
    case 'maintenance':
      return <Badge variant="default" className="bg-orange-500">점검중</Badge>;
    default:
      return <Badge variant="outline">알 수 없음</Badge>;
  }
};

export const formatLastReading = (reading: number | undefined, unit: string) => {
  if (reading === undefined) return 'N/A';
  return `${reading.toFixed(1)} ${unit}`;
};

export const formatDateTime = (dateTime: string | undefined) => {
  if (!dateTime) return 'N/A';
  return new Date(dateTime).toLocaleString('ko-KR');
};