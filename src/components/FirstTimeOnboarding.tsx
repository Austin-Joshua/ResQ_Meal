import React, { useState } from 'react';
import { ModeSelectionModal } from '@/components/ModeSelectionModal';
import { PersonalDetailsForm } from '@/components/PersonalDetailsForm';
import type { UserMode } from '@/context/ModeContext';

export interface FirstTimeOnboardingUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface FirstTimeOnboardingProps {
  user: FirstTimeOnboardingUser;
  darkMode: boolean;
  onComplete: () => void;
}

type Step = 'mode' | 'personal';

export function FirstTimeOnboarding({ user, darkMode, onComplete }: FirstTimeOnboardingProps) {
  const [step, setStep] = useState<Step>('mode');

  const handleModeSelected = (_mode: UserMode) => {
    setStep('personal');
  };

  if (step === 'mode') {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50">
        <ModeSelectionModal
          userName={user.name}
          userEmail={user.email}
          darkMode={darkMode}
          onModeSelected={handleModeSelected}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50">
      <PersonalDetailsForm
        darkMode={darkMode}
        onComplete={onComplete}
      />
    </div>
  );
}
