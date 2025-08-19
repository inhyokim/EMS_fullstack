import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DataPoint, getMetricLabel, getMetricColor } from './dataHelpers';

interface DataChartProps {
  data: DataPoint[];
  chartType: 'line' | 'area' | 'bar';
  selectedMetric: string;
}

export function DataChart({ data, chartType, selectedMetric }: DataChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        표시할 데이터가 없습니다.
      </div>
    );
  }

  const color = getMetricColor(selectedMetric);

  const commonProps = {
    width: '100%',
    height: 400,
    data,
    margin: { top: 5, right: 30, left: 20, bottom: 5 }
  };

  const tooltipFormatter = (value: number) => [value.toLocaleString(), getMetricLabel(selectedMetric)];

  switch (chartType) {
    case 'area':
      return (
        <ResponsiveContainer {...commonProps}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip formatter={tooltipFormatter} />
            <Area 
              type="monotone" 
              dataKey={selectedMetric} 
              stroke={color} 
              fill={color}
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    case 'bar':
      return (
        <ResponsiveContainer {...commonProps}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip formatter={tooltipFormatter} />
            <Bar dataKey={selectedMetric} fill={color} />
          </BarChart>
        </ResponsiveContainer>
      );
    default:
      return (
        <ResponsiveContainer {...commonProps}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip formatter={tooltipFormatter} />
            <Line 
              type="monotone" 
              dataKey={selectedMetric} 
              stroke={color} 
              strokeWidth={2}
              dot={{ fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
  }
}