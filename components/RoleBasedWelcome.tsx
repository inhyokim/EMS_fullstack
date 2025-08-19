import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Shield, 
  Eye, 
  Building2, 
  BarChart3, 
  Bell, 
  FileText, 
  Settings, 
  TrendingUp,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { useUserFlow } from './contexts/UserFlowContext';

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  badge?: string;
  variant?: 'default' | 'warning' | 'success';
}

function QuickAction({ title, description, icon: Icon, onClick, badge, variant = 'default' }: QuickActionProps) {
  const cardVariants = {
    default: 'hover:shadow-md',
    warning: 'border-orange-200 bg-orange-50/30',
    success: 'border-green-200 bg-green-50/30'
  };

  const iconVariants = {
    default: 'bg-primary/10 text-primary',
    warning: 'bg-orange-100 text-orange-600',
    success: 'bg-green-100 text-green-600'
  };

  return (
    <Card className={`cursor-pointer transition-all ${cardVariants[variant]}`} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${iconVariants[variant]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-sm">{title}</h4>
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface RoleBasedWelcomeProps {
  onNavigate: (view: string) => void;
}

export function RoleBasedWelcome({ onNavigate }: RoleBasedWelcomeProps) {
  const { state } = useUserFlow();
  const { userRole, systemSetupProgress, isFirstLogin } = state;

  if (!userRole) return null;

  const isAdmin = userRole === 'admin';
  const isOperator = userRole === 'operator';

  const adminActions = [
    {
      title: '건물 관리',
      description: '새 건물 등록 및 기존 건물 정보 수정',
      icon: Building2,
      onClick: () => onNavigate('buildings'),
      badge: systemSetupProgress.buildings ? undefined : '설정 필요'
    },
    {
      title: '시스템 설정',
      description: '계측기 등록 및 구역 설정',
      icon: Settings,
      onClick: () => onNavigate('meters'),
      badge: !systemSetupProgress.completed ? '진행 중' : undefined
    },
    {
      title: '알람 규칙 관리',
      description: '임계치 설정 및 알람 규칙 관리',
      icon: Bell,
      onClick: () => onNavigate('alertRules'),
      badge: systemSetupProgress.alertRules ? undefined : '설정 필요'
    },
    {
      title: '데이터 업로드',
      description: 'CSV 파일을 통한 전력 데이터 업로드',
      icon: FileText,
      onClick: () => onNavigate('upload')
    }
  ];

  const operatorActions = [
    {
      title: '실시간 모니터링',
      description: '전력 사용량 실시간 확인',
      icon: TrendingUp,
      onClick: () => onNavigate('dashboard'),
      variant: 'success' as const
    },
    {
      title: '알람 확인',
      description: '발생한 알람 및 이상 상황 확인',
      icon: AlertTriangle,
      onClick: () => onNavigate('alerts'),
      badge: '3건',
      variant: 'warning' as const
    },
    {
      title: '데이터 분석',
      description: '전력 사용 패턴 및 트렌드 분석',
      icon: BarChart3,
      onClick: () => onNavigate('explorer')
    },
    {
      title: '리포트 조회',
      description: '일/월별 전력 사용 리포트 확인',
      icon: Calendar,
      onClick: () => onNavigate('reports')
    }
  ];

  const currentActions = isAdmin ? adminActions : operatorActions;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${isAdmin ? 'bg-blue-100' : 'bg-green-100'}`}>
              {isAdmin ? (
                <Shield className={`w-6 h-6 text-blue-600`} />
              ) : (
                <Eye className={`w-6 h-6 text-green-600`} />
              )}
            </div>
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>환영합니다!</span>
                <Badge variant={isAdmin ? "default" : "secondary"}>
                  {isAdmin ? '관리자' : '운영자'}
                </Badge>
              </CardTitle>
              <CardDescription>
                {isAdmin 
                  ? 'KT 스마트빌딩 EMS Lite 관리자 페이지입니다.'
                  : 'KT 스마트빌딩 EMS Lite 운영자 페이지입니다.'
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {isAdmin ? (
              isFirstLogin ? (
                '시스템을 처음 사용하시는군요! 아래 필수 설정들을 완료하여 에너지 관리 시스템을 구축하세요.'
              ) : (
                '시스템 관리 및 설정을 통해 효율적인 에너지 운영 환경을 구축하고 관리하세요.'
              )
            ) : (
              '실시간 에너지 데이터를 모니터링하고 효율적인 에너지 사용을 위한 인사이트를 확인하세요.'
            )}
          </p>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-medium mb-4">
          {isAdmin ? '관리 작업' : '주요 기능'}
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {currentActions.map((action, index) => (
            <QuickAction
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              onClick={action.onClick}
              badge={action.badge}
              variant={action.variant}
            />
          ))}
        </div>
      </div>

      {isAdmin && !systemSetupProgress.completed && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">초기 설정이 필요합니다</h4>
                <p className="text-blue-700 text-sm mb-3">
                  효율적인 에너지 관리를 위해 시스템 설정을 완료해주세요.
                </p>
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => onNavigate('setup')}
                >
                  설정 가이드 보기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}