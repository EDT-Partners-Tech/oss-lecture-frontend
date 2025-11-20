/*
 * Copyright 2025 EDT&Partners
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
