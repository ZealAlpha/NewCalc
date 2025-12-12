import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SettingsContextType = {
  showRiskRewardSection: boolean;
  setShowRiskRewardSection: (value: boolean) => void;

  isAdvancedMode: boolean;
  setIsAdvancedMode: (value: boolean) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showRiskRewardSection, setShowRiskRewardSection] = useState(true);
  const [isAdvancedMode, setIsAdvancedMode] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const value = await AsyncStorage.getItem('showRiskRewardSection');
      if (value !== null) {
        setShowRiskRewardSection(JSON.parse(value));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateShowRiskRewardSection = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('showRiskRewardSection', JSON.stringify(value));
      setShowRiskRewardSection(value);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        showRiskRewardSection,
        setShowRiskRewardSection: updateShowRiskRewardSection,
        isAdvancedMode,
        setIsAdvancedMode,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};