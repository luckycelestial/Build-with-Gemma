'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BusinessProfileStep, { BusinessProfile } from '../../components/onboarding/BusinessProfileStep';
import CalibrationChatStep from '../../components/onboarding/CalibrationChatStep';
import OnboardingSuccessStep from '../../components/onboarding/OnboardingSuccessStep';
import { Cpu } from 'lucide-react';

type OnboardingStep = 'profile' | 'calibration' | 'success';

function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read current step from URL query params (default to 'profile')
  const step = (searchParams.get('step') as OnboardingStep) || 'profile';

  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [priorities, setPriorities] = useState<any>(null);

  // Hydrate profile state from localStorage on load if exists
  useEffect(() => {
    const saved = localStorage.getItem('sme_onboarding_profile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleProfileComplete = (data: BusinessProfile) => {
    setProfile(data);
    localStorage.setItem('sme_onboarding_profile', JSON.stringify(data));
    localStorage.setItem('sme_maturity_tier', data.suggestedTier);
    router.push(`/dashboard?tier=${data.suggestedTier}&tab=import`);
  };

  const handleCalibrationComplete = (calibratedPriorities: any) => {
    setPriorities({
      ...calibratedPriorities,
      suggestedTier: profile?.suggestedTier || 'beginner'
    });
    router.push('?step=success');
  };

  const handleBackToProfile = () => {
    // Navigate back to profile at final substep (5)
    router.push('?step=profile&substep=2');
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-4xl mx-auto w-full">
      {step === 'profile' && (
        <BusinessProfileStep onNext={handleProfileComplete} />
      )}
      
      {step === 'calibration' && profile && (
        <CalibrationChatStep 
          businessName={profile.companyName} 
          category={profile.category}
          onComplete={handleCalibrationComplete} 
          onBack={handleBackToProfile}
        />
      )}

      {step === 'success' && priorities && profile && (
        <OnboardingSuccessStep priorities={priorities} profile={profile} />
      )}
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      {/* Branding Header */}
      <header className="px-6 py-4 bg-surface border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-surface shadow-tactile">
            <Cpu className="h-5 w-5" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">
            Gemma SME <span className="text-primary">Orchestrator</span>
          </span>
        </div>
        <div className="text-xs text-text-muted">
          Peenya Cluster Node v1.0
        </div>
      </header>

      {/* Main Container wrapped in Suspense for searchParams hydration */}
      <Suspense fallback={
        <main className="flex-1 flex items-center justify-center p-6 text-sm text-text-muted">
          Loading onboarding calibrator...
        </main>
      }>
        <OnboardingWizard />
      </Suspense>

      {/* Footer bar */}
      <footer className="py-4 text-center text-xs text-text-muted border-t border-border-subtle bg-surface/50">
        Designed for owner-operators in Peenya Industrial Area • Local Gemma reasoning core • Secure Offline First
      </footer>
    </div>
  );
}
