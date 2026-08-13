"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type MaturityTier = 'beginner' | 'intermediate' | 'expert';

export interface OnboardingAnswers {
  trackingMethod?: 'notebook' | 'excel' | 'software';
  reviewFrequency?: 'rarely' | 'monthly' | 'weekly';
  primaryHelpNeed?: 'pricing' | 'cashflow' | 'demand';
}

interface OnboardingContextType {
  tier: MaturityTier;
  setTier: (tier: MaturityTier) => void;
  isOnboarded: boolean;
  answers: OnboardingAnswers;
  isWizardOpen: boolean;
  openWizard: () => void;
  closeWizard: () => void;
  completeOnboarding: (answers: OnboardingAnswers) => void;
  resetOnboarding: () => void;
}

const STORAGE_KEY = 'fincent_user_onboarding_profile';

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tier, setTierState] = useState<MaturityTier>('expert'); // Default to full expert access if unconfigured
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tier) setTierState(parsed.tier);
        if (typeof parsed.isOnboarded === 'boolean') setIsOnboarded(parsed.isOnboarded);
        if (parsed.answers) setAnswers(parsed.answers);
      } else {
        // Open wizard automatically for new first-time users
        setIsWizardOpen(true);
      }
    } catch (e) {
      console.error('Failed to load onboarding profile from localStorage:', e);
    }
  }, []);

  const saveProfile = (newTier: MaturityTier, onboardedStatus: boolean, newAnswers: OnboardingAnswers) => {
    setTierState(newTier);
    setIsOnboarded(onboardedStatus);
    setAnswers(newAnswers);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: newTier,
        isOnboarded: onboardedStatus,
        answers: newAnswers,
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {
      console.error('Failed to save onboarding profile:', e);
    }
  };

  const setTier = (newTier: MaturityTier) => {
    saveProfile(newTier, true, answers);
  };

  const completeOnboarding = (userAnswers: OnboardingAnswers) => {
    // Logic to calculate recommended starting tier from answers:
    // If notebook or rarely review -> beginner
    // If excel or monthly review -> intermediate
    // If software or weekly review + advanced needs -> expert
    let recommendedTier: MaturityTier = 'intermediate';

    if (userAnswers.trackingMethod === 'notebook' || userAnswers.reviewFrequency === 'rarely') {
      recommendedTier = 'beginner';
    } else if (userAnswers.trackingMethod === 'software' && userAnswers.reviewFrequency === 'weekly') {
      recommendedTier = 'expert';
    } else {
      recommendedTier = 'intermediate';
    }

    saveProfile(recommendedTier, true, userAnswers);
    setIsWizardOpen(false);
  };

  const openWizard = () => setIsWizardOpen(true);
  const closeWizard = () => setIsWizardOpen(false);

  const resetOnboarding = () => {
    saveProfile('beginner', false, {});
    setIsWizardOpen(true);
  };

  return (
    <OnboardingContext.Provider value={{
      tier,
      setTier,
      isOnboarded,
      answers,
      isWizardOpen,
      openWizard,
      closeWizard,
      completeOnboarding,
      resetOnboarding
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    return {
      tier: 'expert' as MaturityTier,
      setTier: () => {},
      isOnboarded: true,
      answers: {},
      isWizardOpen: false,
      openWizard: () => {},
      closeWizard: () => {},
      completeOnboarding: () => {},
      resetOnboarding: () => {}
    };
  }
  return context;
};
