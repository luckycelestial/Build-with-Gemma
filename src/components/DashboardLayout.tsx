"use client";

import React, { useState } from 'react';
import { 
  Upload, 
  Loader2, 
  X,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { AIAnalystChat } from '@/components/AIAnalystChat';
import { OnboardingWizardModal } from '@/components/onboarding/OnboardingWizardModal';
import { BeginnerHome } from '@/components/beginner/BeginnerHome';
import { WhatsAppSimulatorModal } from '@/components/cto/WhatsAppSimulatorModal';
import { useBusinessData } from '@/context/BusinessDataContext';
import { useOnboarding } from '@/context/OnboardingContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeRoute: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeRoute }) => {
  const { 
    data, 
    loading, 
    error, 
    setError, 
    loadSample, 
    uploadFile,
    explainSection,
    setExplainSection,
    explainText,
    explainLoading
  } = useBusinessData();
  
  const { tier } = useOnboarding();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await uploadFile(file);
    } catch (e: any) {
      // Error handled via context
    }
  };

  const triggerFileUpload = () => {
    const input = document.getElementById('file-upload-input');
    if (input) input.click();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans theme-transition flex flex-col md:flex-row">
      {/* Hidden File Input */}
      <input 
        id="file-upload-input"
        type="file" 
        accept=".csv,.xlsx" 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      {/* 1. Left Sidebar (Fixed on Desktop, Drawer on Mobile) */}
      <Sidebar 
        data={data}
        activeSection={activeRoute}
        onOpenChat={() => setIsChatOpen(true)}
        onTriggerUpload={triggerFileUpload}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Workspace (Properly offset for left fixed sidebar on md+) */}
      <div className="flex-1 md:pl-[80px] flex flex-col min-w-0 min-h-screen">
        
        {/* Unified Top Navigation Bar */}
        <TopHeader 
          businessName={data?.summary.business_name}
          industry={data?.summary.industry}
          location={data?.summary.location}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onLoadSample={loadSample}
          onTriggerUpload={triggerFileUpload}
          loading={loading}
        />

        {/* Page Main Content Area */}
        <main className="p-4 md:p-6 lg:p-8 flex-1 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Global Alert Notification */}
          {error && (
            <div className="p-4 bg-[var(--primary-subtle)] border border-[var(--primary)]/20 text-[var(--primary)] text-xs rounded-2xl flex items-center justify-between font-bold shadow-xs">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[var(--primary)] animate-pulse" />
                <span>{error}</span>
              </div>
              <button 
                onClick={() => setError(null)}
                className="p-1 hover:bg-[var(--primary)]/10 rounded-full transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Main Content Render */}
          <div className="animate-fade-in pb-12">
            {tier === 'beginner' && (activeRoute === 'dashboard' || activeRoute === '/') ? (
              <BeginnerHome 
                data={data} 
                onOpenChat={() => setIsChatOpen(true)} 
                onTriggerUpload={triggerFileUpload} 
              />
            ) : (
              children
            )}
          </div>
        </main>
      </div>

      {/* 3. Floating AI Analyst Chat Drawer */}
      {data && (
        <AIAnalystChat 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          data={data}
        />
      )}

      {/* 4. Explain Insight Modal */}
      {explainSection && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] w-full max-w-2xl shadow-2xl rounded-3xl p-6 relative overflow-hidden animate-scale-up max-h-[85vh] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-[var(--primary)]" />
                  <h3 className="font-black text-sm text-[var(--text-primary)] font-display capitalize">
                    AI Analysis Insight &mdash; {explainSection.replace('_', ' ')}
                  </h3>
                </div>
                <button 
                  onClick={() => setExplainSection(null)}
                  className="p-1 hover:bg-[var(--bg-subtle)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[55vh] pr-1 scrollbar-thin">
                {explainLoading ? (
                  <div className="h-40 flex flex-col items-center justify-center gap-2">
                    <Loader2 size={24} className="text-[var(--primary)] animate-spin" />
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider animate-pulse">Consulting Gemma Model...</p>
                  </div>
                ) : (
                  <div className="text-xs text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap font-sans bg-[var(--bg-subtle)] p-4 rounded-2xl border border-[var(--border-subtle)]">
                    {explainText}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-[var(--border-subtle)] pt-4 mt-4 flex justify-end">
              <button 
                onClick={() => setExplainSection(null)}
                className="px-5 py-2 bg-[var(--text-primary)] hover:opacity-90 text-[var(--text-inverse)] rounded-full text-xs font-bold transition-colors cursor-pointer"
              >
                Close Insight
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Wizard Modal & WhatsApp Simulator Modal */}
      <OnboardingWizardModal />
      <WhatsAppSimulatorModal />
    </div>
  );
};

export default DashboardLayout;
