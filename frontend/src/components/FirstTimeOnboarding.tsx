import React, { useState } from 'react';
import { ModeSelectionModal } from '@/components/ModeSelectionModal';
import { PersonalDetailsForm } from '@/components/PersonalDetailsForm';
import { userApi } from '@/services/api';
import type { UserMode } from '@/context/ModeContext';

export interface FirstTimeOnboardingUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

/** Map app mode to backend role for routing (organisation vs volunteer) */
function modeToRole(mode: UserMode): 'volunteer' | 'restaurant' | 'ngo' {
  if (mode === 'restaurant') return 'restaurant';
  if (mode === 'ngo') return 'ngo';
  return 'volunteer';
}

interface FirstTimeOnboardingProps {
  user: FirstTimeOnboardingUser;
  darkMode: boolean;
  onComplete: () => void;
  onRoleUpdated?: (token: string, user: { id: number; name: string; email: string; role: string }) => void;
}

type Step = 'mode' | 'personal';

export function FirstTimeOnboarding({ user, darkMode, onComplete, onRoleUpdated }: FirstTimeOnboardingProps) {
  const [step, setStep] = useState<Step>('mode');

  const handleModeSelected = async (mode: UserMode) => {
    const role = modeToRole(mode);
    if (role === 'restaurant' || role === 'ngo') {
      try {
        const { data } = await userApi.updateMe({ role });
        const updated = data?.data;
        if (updated?.token && updated?.role && onRoleUpdated) {
          onRoleUpdated(updated.token, {
            id: updated.id,
            name: updated.name,
            email: updated.email,
            role: updated.role,
          });
        }
      } catch (_) {
        // Continue to personal details; role stays volunteer until they complete again or re-login
      }
    }
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
