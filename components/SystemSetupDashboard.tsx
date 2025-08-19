import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  CheckCircle, 
  Circle, 
  Building2, 
  MapPin, 
  Gauge, 
  Upload, 
  Bell, 
  ArrowRight,
  Play
} from 'lucide-react';
import { useUserFlow } from './contexts/UserFlowContext';

interface SetupStepProps {
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  onStart: () => void;
}

function SetupStep({ title, description, icon: Icon, completed, onStart }: SetupStepProps) {
  return (
    <Card className={`transition-all ${completed ? 'border-green-200 bg-green-50/30' : 'hover:shadow-md'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${completed ? 'bg-green-100' : 'bg-primary/10'}`}>
              <Icon className={`w-5 h-5 ${completed ? 'text-green-600' : 'text-primary'}`} />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-sm">{description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {completed ? (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                완료
              </Badge>
            ) : (
              <Badge variant="outline">대기</Badge>
            )}
            {completed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-end">
          <Button
            size="sm"
            variant={completed ? "outline" : "default"}
            onClick={onStart}
            className="flex items-center space-x-2"
          >
            {completed ? (
              <>
                <span>다시 설정</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>시작</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface SystemSetupDashboardProps {
  onNavigate: (view: string) => void;
}

export function SystemSetupDashboard({ onNavigate }: SystemSetupDashboardProps) {
  const { state } = useUserFlow();
  const { systemSetupProgress } = state;

  const setupSteps = [
    {
      key: 'buildings',
      title: '건물 정보 등록',
      description: '관리할 건물들의 기본 정보를 등록합니다.',
      icon: Building2,
      view: 'buildings'
    },
    {
      key: 'zones',
      title: '구역 설정',
      description: '건물 내 에너지 관리 구역을 설정합니다.',
      icon: MapPin,
      view: 'zones'
    },
    {
      key: 'meters',
      title: '계측기 등록',
      description: '전력 데이터를 수집할 계측기를 등록합니다.',
      icon: Gauge,
      view: 'meters'
    },
    {
      key: 'dataUpload',
      title: '초기 데이터 업로드',
      description: '기존 전력 사용 데이터를 업로드합니다.',
      icon: Upload,
      view: 'upload'
    },
    {
      key: 'alertRules',
      title: '알람 규칙 설정',
      description: '전력 사용량 임계치 및 알람 규칙을 설정합니다.',
      icon: Bell,
      view: 'alertRules'
    }
  ];

  const completedSteps = setupSteps.filter(step => 
    systemSetupProgress[step.key as keyof typeof systemSetupProgress]
  ).length;
  const totalSteps = setupSteps.length;
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl">시스템 초기 설정</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          효율적인 에너지 관리를 위해 아래 단계들을 완료해주세요. 
          모든 설정이 완료되면 실시간 모니터링을 시작할 수 있습니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>전체 진행률</CardTitle>
              <CardDescription>
                {completedSteps}/{totalSteps} 단계 완료
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {Math.round(progress)}%
              </div>
              <div className="text-sm text-muted-foreground">완료</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        {setupSteps.map((step) => (
          <SetupStep
            key={step.key}
            title={step.title}
            description={step.description}
            icon={step.icon}
            completed={systemSetupProgress[step.key as keyof typeof systemSetupProgress]}
            onStart={() => onNavigate(step.view)}
          />
        ))}
      </div>

      {systemSetupProgress.completed && (
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-green-900">초기 설정 완료!</h3>
                <p className="text-green-700 mt-1">
                  모든 필수 설정이 완료되었습니다. 이제 실시간 에너지 모니터링을 시작할 수 있습니다.
                </p>
              </div>
              <Button onClick={() => onNavigate('dashboard')} className="bg-green-600 hover:bg-green-700">
                대시보드로 이동
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}