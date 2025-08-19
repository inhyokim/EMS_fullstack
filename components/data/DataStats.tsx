import React from 'react';
import { Card, CardContent } from '../ui/card';
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity 
} from 'lucide-react';
import { getMetricUnit } from './dataHelpers';

interface DataStatsProps {
  stats: {
    current: number;
    max: number;
    min: number;
    avg: number;
    change: number;
  };
  selectedMetric: string;
}

export function DataStats({ stats, selectedMetric }: DataStatsProps) {
  const unit = getMetricUnit(selectedMetric);

  return (
    <div className="grid gap-4 md:grid-cols-5">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-sm text-muted-foreground">현재값</div>
              <div className="text-xl font-bold">
                {stats.current.toLocaleString()}{unit}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-sm text-muted-foreground">최대값</div>
              <div className="text-xl font-bold">
                {stats.max.toLocaleString()}{unit}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <div>
              <div className="text-sm text-muted-foreground">최소값</div>
              <div className="text-xl font-bold">
                {stats.min.toLocaleString()}{unit}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            <div>
              <div className="text-sm text-muted-foreground">평균값</div>
              <div className="text-xl font-bold">
                {Math.round(stats.avg).toLocaleString()}{unit}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            {stats.change >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
            <div>
              <div className="text-sm text-muted-foreground">변화율</div>
              <div className={`text-xl font-bold ${stats.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}