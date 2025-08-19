import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { CheckCircle, Circle, ArrowRight, Building2, MapPin, Gauge, Upload, Bell } from 'lucide-react';
import { useUserFlow } from './contexts/UserFlowContext';

const onboardingSteps = [
  {
    id: 0,
    title: '시스템 초기 설정 가이드',
    description: 'KT 스마트빌딩 EMS Lite 시스템을 시작하기 위한 필수 설정을 안내합니다.',
    icon: Building2,
    content: '관리자로서 시스템을 처음 사용하시는군요! 효율적인 에너지 관리를 위해 다음 단계들을 순서대로 진행해보세요.'
  },
  {
    id: 1,
    title: '건물 정보 등록',
    description: '관리할 건물들의 기본 정보를 등록합니다.',
    icon: Building2,
    content: '건물명, 주소, 면적 등 기본 정보를 입력하여 에너지 관리 대상 건물을 시스템에 등록하세요.',
    progressKey: 'buildings' as const
  },
  {
    id: 2,
    title: '구역 설정',
    description: '건물 내 에너지 관리 구역을 설정합니다.',
    icon: MapPin,
    content: '층별, 용도별로 구역을 나누어 더 세밀한 에너지 관리를 할 수 있습니다.',
    progressKey: 'zones' as const
  },
  {
    id: 3,
    title: '계측기 등록',
    description: '전력 데이터를 수집할 계측기를 등록합니다.',
    icon: Gauge,
    content: '각 구역에 설치된 전력 계측기 정보를 등록하여 실시간 데이터 수집을 시작하세요.',
    progressKey: 'meters' as const
  },
  {
    id: 4,
    title: '초기 데이터 업로드',
    description: '기존 전력 사용 데이터를 업로드합니다.',
    icon: Upload,
    content: 'CSV 파일을 통해 과거 전력 사용 데이터를 업로드하여 기준선을 설정할 수 있습니다.',
    progressKey: 'dataUpload' as const
  },
  {
    id: 5,
    title: '알람 규칙 설정',
    description: '전력 사용량 임계치 및 알람 규칙을 설정합니다.',
    icon: Bell,
    content: '비정상적인 전력 사용을 감지하기 위한 알람 규칙을 설정하여 효율적인 모니터링을 시작하세요.',
    progressKey: 'alertRules' as const
  }
];

export function OnboardingGuide() {
  const { state, setOnboardingStep, completeOnboarding } = useUserFlow();
  const { currentOnboardingStep, systemSetupProgress } = state;

  const currentStep = onboardingSteps[currentOnboardingStep];
  const totalSteps = onboardingSteps.length - 1; // 첫 번째는 소개 단계
  const completedSteps = Object.values(systemSetupProgress).filter(Boolean).length - 1; // completed 제외
  const progress = (completedSteps / totalSteps) * 100;

  const handleNext = () => {
    if (currentOnboardingStep < onboardingSteps.length - 1) {
      setOnboardingStep(currentOnboardingStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentOnboardingStep > 0) {
      setOnboardingStep(currentOnboardingStep - 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  if (!currentStep) return null;

  const Icon = currentStep.icon;
  const isCompleted = currentStep.progressKey ? systemSetupProgress[currentStep.progressKey] : false;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{currentStep.title}</CardTitle>
                <CardDescription>{currentStep.description}</CardDescription>
              </div>
            </div>
            {currentOnboardingStep > 0 && (
              <div className="flex items-center space-x-2">
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {currentOnboardingStep}/{totalSteps}
                </span>
              </div>
            )}
          </div>
          
          {currentOnboardingStep > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>설정 진행률</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              {currentStep.content}
            </p>

            {currentOnboardingStep === 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">설정 단계:</h4>
                <div className="space-y-2">
                  {onboardingSteps.slice(1).map((step, index) => {
                    const StepIcon = step.icon;
                    const stepCompleted = step.progressKey ? systemSetupProgress[step.progressKey] : false;
                    
                    return (
                      <div key={step.id} className="flex items-center space-x-3 p-2 rounded-lg border">
                        <StepIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="flex-1 text-sm">{step.title}</span>
                        {stepCompleted ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <div className="space-x-2">
                {currentOnboardingStep > 0 && (
                  <Button variant="outline" onClick={handlePrevious}>
                    이전
                  </Button>
                )}
                <Button variant="outline" onClick={handleSkip}>
                  건너뛰기
                </Button>
              </div>
              
              <Button onClick={handleNext} className="flex items-center space-x-2">
                <span>
                  {currentOnboardingStep === onboardingSteps.length - 1 ? '시작하기' : '다음'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}