import React, { useState, useEffect } from 'react';
import { UserFlowProvider, useUserFlow } from './components/contexts/UserFlowContext';
import { RoleSelect } from './components/SimpleRoleSelect';
import { OnboardingGuide } from './components/OnboardingGuide';
import { SystemSetupDashboard } from './components/SystemSetupDashboard';
import { RoleBasedWelcome } from './components/RoleBasedWelcome';
import { Dashboard } from './components/SimpleDashboard';
import { BuildingManagement } from './components/BuildingManagement';
import { ZoneManagement } from './components/ZoneManagement';
import { MeterManagement } from './components/MeterManagement';
import { DataUpload } from './components/DataUpload';
import { JobManagement } from './components/JobManagement';
import { AlertRules } from './components/AlertRules';
import { AlertManagement } from './components/AlertManagement';
import { DataExplorer } from './components/DataExplorer';
import { ReportManagement } from './components/ReportManagement';
import { Navigation } from './components/Navigation';
import { Toaster } from './components/ui/sonner';
import { debugApi } from './utils/api';

type CurrentView = 'welcome' | 'setup' | 'dashboard' | 'buildings' | 'zones' | 'meters' | 
                   'upload' | 'jobs' | 'alertRules' | 'alerts' | 'explorer' | 'reports';

function AppContent() {
  const { state, setUserRole, resetUserFlow, updateSetupProgress } = useUserFlow();
  const [currentView, setCurrentView] = useState<CurrentView>('welcome');

  // Debug API connection on mount
  useEffect(() => {
    debugApi().then(result => {
      console.log('API Debug result:', result);
    });
  }, []);

  const handleRoleSelect = (role: 'admin' | 'operator' | null) => {
    setUserRole(role);
    setCurrentView('welcome');
  };

  const handleLogout = () => {
    resetUserFlow();
    setCurrentView('welcome');
  };

  const handleNavigation = (view: string) => {
    setCurrentView(view as CurrentView);
    
    // 페이지 방문 시 해당 설정 단계를 완료로 표시 (데모용)
    switch (view) {
      case 'buildings':
        updateSetupProgress('buildings', true);
        break;
      case 'zones':
        updateSetupProgress('zones', true);
        break;
      case 'meters':
        updateSetupProgress('meters', true);
        break;
      case 'upload':
        updateSetupProgress('dataUpload', true);
        break;
      case 'alertRules':
        updateSetupProgress('alertRules', true);
        break;
    }
  };

  // 역할이 선택되지 않았으면 역할 선택 화면
  if (!state.userRole) {
    return (
      <>
        <RoleSelect onRoleSelect={handleRoleSelect} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 온보딩 가이드 오버레이 */}
      {state.showOnboarding && <OnboardingGuide />}

      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl">KT 스마트빌딩 EMS Lite</h1>
              <span className="text-sm text-muted-foreground">에너지 관리 시스템</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {state.userRole === 'admin' ? '관리자' : '운영자'}
              </span>
              <button 
                onClick={handleLogout}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 사이드 네비게이션 */}
        <Navigation 
          userRole={state.userRole} 
          currentView={currentView} 
          setCurrentView={handleNavigation}
        />

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-6">
          {currentView === 'welcome' && (
            <RoleBasedWelcome onNavigate={handleNavigation} />
          )}
          {currentView === 'setup' && (
            <SystemSetupDashboard onNavigate={handleNavigation} />
          )}
          {currentView === 'dashboard' && (
            <Dashboard userRole={state.userRole} />
          )}
          {currentView === 'buildings' && <BuildingManagement />}
          {currentView === 'zones' && <ZoneManagement />}
          {currentView === 'meters' && <MeterManagement />}
          {currentView === 'upload' && <DataUpload />}
          {currentView === 'jobs' && <JobManagement />}
          {currentView === 'alertRules' && <AlertRules />}
          {currentView === 'alerts' && (
            <AlertManagement userRole={state.userRole} />
          )}
          {currentView === 'explorer' && <DataExplorer />}
          {currentView === 'reports' && <ReportManagement />}
        </main>
      </div>

      {/* 토스트 알림 */}
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <UserFlowProvider>
      <AppContent />
    </UserFlowProvider>
  );
}

export default App;