import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'operator' | null;

export interface SystemSetupProgress {
  buildings: boolean;
  zones: boolean;
  meters: boolean;
  dataUpload: boolean;
  alertRules: boolean;
  completed: boolean;
}

export interface UserFlowState {
  userRole: UserRole;
  isFirstLogin: boolean;
  systemSetupProgress: SystemSetupProgress;
  currentOnboardingStep: number;
  showOnboarding: boolean;
}

interface UserFlowContextType {
  state: UserFlowState;
  setUserRole: (role: UserRole) => void;
  updateSetupProgress: (step: keyof SystemSetupProgress, completed: boolean) => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  resetUserFlow: () => void;
}

const initialState: UserFlowState = {
  userRole: null,
  isFirstLogin: true,
  systemSetupProgress: {
    buildings: false,
    zones: false,
    meters: false,
    dataUpload: false,
    alertRules: false,
    completed: false
  },
  currentOnboardingStep: 0,
  showOnboarding: false
};

const UserFlowContext = createContext<UserFlowContextType | undefined>(undefined);

export function UserFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserFlowState>(initialState);

  const setUserRole = (role: UserRole) => {
    setState(prev => ({
      ...prev,
      userRole: role,
      showOnboarding: role === 'admin' && prev.isFirstLogin
    }));
  };

  const updateSetupProgress = (step: keyof SystemSetupProgress, completed: boolean) => {
    setState(prev => {
      const newProgress = { ...prev.systemSetupProgress, [step]: completed };
      const allStepsCompleted = Object.entries(newProgress)
        .filter(([key]) => key !== 'completed')
        .every(([, value]) => value === true);
      
      return {
        ...prev,
        systemSetupProgress: {
          ...newProgress,
          completed: allStepsCompleted
        }
      };
    });
  };

  const setOnboardingStep = (step: number) => {
    setState(prev => ({ ...prev, currentOnboardingStep: step }));
  };

  const completeOnboarding = () => {
    setState(prev => ({
      ...prev,
      showOnboarding: false,
      isFirstLogin: false
    }));
  };

  const resetUserFlow = () => {
    setState(initialState);
  };

  return (
    <UserFlowContext.Provider value={{
      state,
      setUserRole,
      updateSetupProgress,
      setOnboardingStep,
      completeOnboarding,
      resetUserFlow
    }}>
      {children}
    </UserFlowContext.Provider>
  );
}

export function useUserFlow() {
  const context = useContext(UserFlowContext);
  if (context === undefined) {
    throw new Error('useUserFlow must be used within a UserFlowProvider');
  }
  return context;
}