import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { View } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        const loadTheme = async () => {
            const storedTheme = await AsyncStorage.getItem('appTheme');
            if (storedTheme === 'light' || storedTheme === 'dark') {
                setTheme(storedTheme);
            } else {
                const systemTheme = Appearance.getColorScheme();
                setTheme(systemTheme === 'dark' ? 'dark' : 'light');
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        await AsyncStorage.setItem('appTheme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {/* Root-level View with dynamic class */}
            <View className={theme === 'dark' ? 'dark flex-1' : 'flex-1'}>
                {children}
            </View>
        </ThemeContext.Provider>
    );
};
