"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BusinessEventBus, BusinessEvent } from '@/lib/events/BusinessEventBus';

interface ExecutiveContextProps {
  events: BusinessEvent[];
  addEvent: (event: BusinessEvent) => void;
  isWhatsAppModalOpen: boolean;
  setWhatsAppModalOpen: (open: boolean) => void;
}

const ExecutiveContext = createContext<ExecutiveContextProps | undefined>(undefined);

export const ExecutiveContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [isWhatsAppModalOpen, setWhatsAppModalOpen] = useState(false);

  useEffect(() => {
    // Sync initial events
    setEvents(BusinessEventBus.getEvents());

    // Subscribe to real-time events
    const unsubscribe = BusinessEventBus.subscribe((newEvent) => {
      setEvents((prev) => [newEvent, ...prev]);
    });

    return () => unsubscribe();
  }, []);

  const addEvent = (event: BusinessEvent) => {
    BusinessEventBus.publish(event);
  };

  return (
    <ExecutiveContext.Provider value={{
      events,
      addEvent,
      isWhatsAppModalOpen,
      setWhatsAppModalOpen
    }}>
      {children}
    </ExecutiveContext.Provider>
  );
};

export const useExecutiveContext = () => {
  const context = useContext(ExecutiveContext);
  if (!context) {
    throw new Error('useExecutiveContext must be used within ExecutiveContextProvider');
  }
  return context;
};
