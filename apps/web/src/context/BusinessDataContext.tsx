"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  loadSampleData, 
  uploadDataset, 
  getSectionExplanation,
  DashboardData,
  DEFAULT_DASHBOARD_DATA
} from '../api-client/api';

interface BusinessDataContextProps {
  data: DashboardData | null;
  setData: React.Dispatch<React.SetStateAction<DashboardData | null>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  loadSample: () => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  
  // Explanation Modal Context
  explainSection: string | null;
  setExplainSection: React.Dispatch<React.SetStateAction<string | null>>;
  explainText: string | null;
  setExplainText: React.Dispatch<React.SetStateAction<string | null>>;
  explainLoading: boolean;
  setExplainLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleExplain: (section: string) => Promise<void>;
}

const BusinessDataContext = createContext<BusinessDataContextProps | undefined>(undefined);

export const BusinessDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<DashboardData | null>(DEFAULT_DASHBOARD_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Explanation states
  const [explainSection, setExplainSection] = useState<string | null>(null);
  const [explainText, setExplainText] = useState<string | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);

  useEffect(() => {
    // Automatically load sample data on initial mount to populate context
    loadSample();
  }, []);

  const loadSample = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loadSampleData();
      setData(result);
    } catch (e: any) {
      setError(e.message || "Failed to load sample dataset. Verify your database connection.");
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const result = await uploadDataset(file);
      setData(result);
    } catch (e: any) {
      setError(e.message || "Failed to upload and analyze dataset.");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async (section: string) => {
    if (!data) return;
    setExplainSection(section);
    setExplainLoading(true);
    setExplainText(null);
    try {
      const explanation = await getSectionExplanation(section, data);
      setExplainText(explanation);
    } catch (e: any) {
      setExplainText("Failed to compile explanation: " + e.message);
    } finally {
      setExplainLoading(false);
    }
  };

  return (
    <BusinessDataContext.Provider value={{
      data,
      setData,
      loading,
      setLoading,
      error,
      setError,
      loadSample,
      uploadFile,
      
      explainSection,
      setExplainSection,
      explainText,
      setExplainText,
      explainLoading,
      setExplainLoading,
      handleExplain
    }}>
      {children}
    </BusinessDataContext.Provider>
  );
};

export const useBusinessData = () => {
  const context = useContext(BusinessDataContext);
  if (context === undefined) {
    throw new Error('useBusinessData must be used within a BusinessDataProvider');
  }
  return context;
};
