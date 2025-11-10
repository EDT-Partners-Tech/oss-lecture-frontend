// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import { useContext } from 'react';
import AuthContext, { AuthContextType } from '../authentication/authContext';

const useAuth = (): AuthContextType => {
  return useContext(AuthContext);
};

export default useAuth;
