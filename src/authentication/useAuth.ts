// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import { useContext } from 'react';
import { AuthContext } from './authContext';

export const useAuth = () => useContext(AuthContext);
