import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useOnboarding, type OnboardingStep } from '@/context/OnboardingContext';

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
  role: string;
  darkMode?: boolean;
}

export function OnboardingModal({ open, onClose, role, darkMode }: OnboardingModalProps) {
  const { getSteps, complete } = useOnboarding();
  const steps = getSteps(role);
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const isLast = stepIndex >= steps.length - 1;

  useEffect(() => {
    if (open) setStepIndex(0);
  }, [open]);

  const handleNext = () => {
    if (isLast) {
      complete();
      onClose();
    } else {
      setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    }
  };

  const handleSkip = () => {
    complete();
    onClose();
  };

  if (!step) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className={`max-w-md ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left">
            {step.icon && <span className="text-2xl">{step.icon}</span>}
            {step.title}
          </DialogTitle>
        </DialogHeader>
        <p className={`text-sm mt-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          {step.body}
        </p>
        <div className="flex items-center justify-between gap-2 mt-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className={darkMode ? 'text-slate-400 hover:text-white' : ''}
          >
            Skip tour
          </Button>
          <div className="flex items-center gap-2">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`inline-block w-2 h-2 rounded-full transition ${
                  i === stepIndex ? (darkMode ? 'bg-amber-400' : 'bg-amber-500') : darkMode ? 'bg-slate-600' : 'bg-slate-200'
                }`}
                aria-hidden
              />
            ))}
            <Button
              type="button"
              onClick={handleNext}
              className={darkMode ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}
            >
              {isLast ? 'Get started' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
