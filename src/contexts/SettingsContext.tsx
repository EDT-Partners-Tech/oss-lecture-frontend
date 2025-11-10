import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../authentication/useAuth';
import { SettingsContext, Settings, defaultSettings } from './SettingsContextTypes';
import { getLocalStorageItem, setLocalStorageItem } from '../lib/localStorage';

const SETTINGS_STORAGE_KEY = 'app_settings';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const storedSettings = getLocalStorageItem(SETTINGS_STORAGE_KEY);
    return storedSettings ? JSON.parse(storedSettings) : defaultSettings;
  });

  const { user } = useAuth();

  useEffect(() => {
    if (user?.group?.logo_s3_uri) {
      setSettings(prev => ({
        ...prev,
        logo: user.group.logo_s3_uri,
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        logo: '',
      }));
    }
    if (user?.['custom:avatar']) {
      setSettings(prev => ({
        ...prev,
        picture: user['custom:avatar'],
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        picture: '',
      }));
    }
  }, [user]);

  useEffect(() => {
    setLocalStorageItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  };

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
    }),
    [settings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
