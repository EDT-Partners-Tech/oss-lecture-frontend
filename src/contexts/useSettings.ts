import { useContext } from 'react';
import { SettingsContext } from './SettingsContextTypes';

export const useSettings = () => useContext(SettingsContext);
