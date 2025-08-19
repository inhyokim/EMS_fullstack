import React from 'react';
import { Badge } from './ui/badge';
import { useUserFlow } from './contexts/UserFlowContext';
import { 
  Home, 
  Building2, 
  MapPin, 
  Gauge, 
  Upload, 
  Cog, 
  Bell, 
  BarChart3, 
  FileText,
  Settings,
  CheckCircle
} from 'lucide-react';

type CurrentView = 'welcome' | 'setup' | 'dashboard' | 'buildings' | 'zones' | 'meters' | 
                   'upload' | 'jobs' | 'alertRules' | 'alerts' | 'explorer' | 'reports';

interface NavigationProps {
  userRole: 'admin' | 'operator';
  currentView: CurrentView | string;
  setCurrentView: (view: string) => void;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ElementType;
  adminOnly: boolean;
  badge?: string;
  setupStep?: boolean;
}

export function Navigation({ userRole, currentView, setCurrentView }: NavigationProps) {
  const { state } = useUserFlow();
  const { systemSetupProgress } = state;

  const menuItems: MenuItem[] = [
    { 
      key: 'welcome', 
      label: '홈', 
      icon: Home, 
      adminOnly: false 
    },
    ...(userRole === 'admin' && !systemSetupProgress.completed ? [
      { 
        key: 'setup', 
        label: '시스템 설정', 
        icon: Settings, 
        adminOnly: true,
        badge: !systemSetupProgress.completed ? '진행중' : undefined,
        setupStep: true
      }
    ] : []),
    { 
      key: 'dashboard', 
      label: '대시보드', 
      icon: BarChart3, 
      adminOnly: false 
    },
    { 
      key: 'buildings', 
      label: '건물 관리', 
      icon: Building2, 
      adminOnly: true,
      setupStep: true
    },
    { 
      key: 'zones', 
      label: '구역 관리', 
      icon: MapPin, 
      adminOnly: true,
      setupStep: true
    },
    { 
      key: 'meters', 
      label: '계측기 관리', 
      icon: Gauge, 
      adminOnly: true,
      setupStep: true
    },
    { 
      key: 'upload', 
      label: '데이터 업로드', 
      icon: Upload, 
      adminOnly: true,
      setupStep: true
    },
    { 
      key: 'jobs', 
      label: '집계 작업', 
      icon: Cog, 
      adminOnly: true 
    },
    { 
      key: 'alertRules', 
      label: '알람 규칙', 
      icon: Bell, 
      adminOnly: true,
      setupStep: true
    },
    { 
      key: 'alerts', 
      label: '알람 관리', 
      icon: Bell, 
      adminOnly: false,
      badge: '3'
    },
    { 
      key: 'explorer', 
      label: '데이터 탐색', 
      icon: BarChart3, 
      adminOnly: false 
    },
    { 
      key: 'reports', 
      label: '리포트', 
      icon: FileText, 
      adminOnly: false 
    },
  ];

  const getSetupStatus = (itemKey: string) => {
    const stepMapping: { [key: string]: keyof typeof systemSetupProgress } = {
      'buildings': 'buildings',
      'zones': 'zones',
      'meters': 'meters',
      'upload': 'dataUpload',
      'alertRules': 'alertRules'
    };
    
    return stepMapping[itemKey] ? systemSetupProgress[stepMapping[itemKey]] : false;
  };

  return (
    <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-73px)] border-r">
      <nav className="p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            if (item.adminOnly && userRole !== 'admin') {
              return null;
            }

            const Icon = item.icon;
            const isActive = currentView === item.key;
            const isSetupStep = item.setupStep;
            const isCompleted = isSetupStep ? getSetupStatus(item.key) : false;

            return (
              <button
                key={item.key}
                onClick={() => setCurrentView(item.key)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  {isSetupStep && isCompleted && (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  )}
                  {item.badge && (
                    <Badge 
                      variant={item.badge === '진행중' ? 'default' : 'secondary'} 
                      className="text-xs px-1 py-0"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {userRole === 'admin' && (
          <div className="mt-6 p-3 bg-muted/50 rounded-lg">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              시스템 설정 진행률
            </div>
            <div className="space-y-1">
              {Object.entries(systemSetupProgress)
                .filter(([key]) => key !== 'completed')
                .map(([key, completed]) => (
                  <div key={key} className="flex items-center space-x-2 text-xs">
                    {completed ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-muted-foreground" />
                    )}
                    <span className={completed ? 'text-green-700' : 'text-muted-foreground'}>
                      {key === 'buildings' && '건물 등록'}
                      {key === 'zones' && '구역 설정'}
                      {key === 'meters' && '계측기 등록'}
                      {key === 'dataUpload' && '데이터 업로드'}
                      {key === 'alertRules' && '알람 규칙'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}