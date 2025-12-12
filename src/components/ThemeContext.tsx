import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { View } from 'react-native';

type Theme = 'light' | 'dark';
type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme; // The actual theme being applied
  themePreference: ThemePreference; // User's preference (light/dark/system)
  setThemePreference: (preference: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  themePreference: 'system',
  setThemePreference: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');

  // Get the system theme
  const getSystemTheme = (): Theme => {
    const systemTheme = Appearance.getColorScheme();
    return systemTheme === 'dark' ? 'dark' : 'light';
  };

  // Update the actual theme based on preference
  const updateTheme = (preference: ThemePreference) => {
    if (preference === 'system') {
      const systemTheme = getSystemTheme();
      console.log('Updating to system theme:', systemTheme);
      setTheme(systemTheme);
    } else {
      console.log('Updating to fixed theme:', preference);
      setTheme(preference);
    }
  };

  // Load saved theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Try new key first
        let storedPreference = await AsyncStorage.getItem('themePreference');

        // Migrate from old key if needed
        if (!storedPreference) {
          const oldTheme = await AsyncStorage.getItem('appTheme');
          if (oldTheme === 'light' || oldTheme === 'dark') {
            storedPreference = oldTheme;
            await AsyncStorage.setItem('themePreference', oldTheme);
            await AsyncStorage.removeItem('appTheme');
          }
        }

        if (storedPreference === 'light' || storedPreference === 'dark' || storedPreference === 'system') {
          console.log('Loading theme preference:', storedPreference);
          setThemePreferenceState(storedPreference);
          updateTheme(storedPreference);
        } else {
          // Default to system
          console.log('No preference found, defaulting to system');
          setThemePreferenceState('system');
          updateTheme('system');
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };
    loadTheme();
  }, []);

  // Listen to system theme changes when preference is 'system'
  useEffect(() => {
    if (themePreference !== 'system') return;

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme === 'dark' ? 'dark' : 'light');
    });

    return () => subscription.remove();
  }, [themePreference]);

  // Function to change theme preference
  const setThemePreference = async (preference: ThemePreference) => {
    try {
      console.log('ThemeContext: Setting preference to', preference);
      setThemePreferenceState(preference);
      updateTheme(preference);
      await AsyncStorage.setItem('themePreference', preference);
      console.log('ThemeContext: Preference saved and theme updated');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themePreference, setThemePreference }}>
      <View className={theme === 'dark' ? 'dark flex-1' : 'flex-1'}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
};