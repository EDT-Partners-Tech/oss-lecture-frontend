import { useContext } from 'react';
import AuthContext, { AuthContextType } from '../authentication/authContext';

const useAuth = (): AuthContextType => {
  return useContext(AuthContext);
};

export default useAuth;
