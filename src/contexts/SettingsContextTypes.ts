import { createContext } from 'react';

export interface Settings {
  logo: string;
  picture: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
}

export interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

export const defaultSettings: Settings = {
  logo: '',
  picture: '',
  theme: {
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
};

export const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
});
