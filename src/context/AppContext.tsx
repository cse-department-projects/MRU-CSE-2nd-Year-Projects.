import React, { createContext, useState } from 'react';

export interface AppContextType {
  medications: Record<number, string>; // id -> status
  toggleMedication: (id: number) => void;
  settings: Record<string, boolean>;
  toggleSetting: (key: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medications, setMedications] = useState<Record<number, string>>({
    1: 'taken',
    2: 'pending',
    3: 'pending'
  });

  const [settings, setSettings] = useState<Record<string, boolean>>({
    appointmentReminders: true,
    medicationAlerts: true,
    newTestResults: false,
    weeklySummary: true,
    anonymousData: false
  });

  const toggleMedication = (id: number) => {
    setMedications(prev => ({
      ...prev,
      [id]: prev[id] === 'taken' ? 'pending' : 'taken'
    }));
  };

  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <AppContext.Provider value={{ medications, toggleMedication, settings, toggleSetting }}>
      {children}
    </AppContext.Provider>
  );
};


