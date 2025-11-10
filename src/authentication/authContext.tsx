import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { parseJwt } from '../lib/utils';
import {
  refreshToken as refreshAuthToken,
  signIn,
  handlePasswordChallenge,
} from '../authentication/authService';
import { Service, TokenData, UserData } from '../types';
import { getLocalStorageItem, removeLocalStorageItem } from '../lib/localStorage';
import { getCurrentUserDetails, getCurrentUserServices } from '../services/api';
import { setLogoutHandler } from '../services/client';
import { setSentryUser } from '../lib/sentry';
import { configureAppSync, subscribeAppSync, unsubscribeAppSync } from '../utils/appsyncClient';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../services/i18n';

export interface AuthContextType {
  tokenData: TokenData | null;
  setTokenData: React.Dispatch<React.SetStateAction<TokenData | null>>;
  isAuthenticated: boolean;
  user: UserData | null;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
  loading: boolean;
  logout: () => void;
  availableServices: Service[];
  appSyncMessages: any[];
  isAppSyncSubscribed: boolean;
  removeAppSyncMessage: (idx: number) => void;
  handleLogin: (
    username: string,
    password: string
  ) => Promise<{ challengeName?: string; session?: string; username?: string }>;
  handleNewPassword: (username: string, newPassword: string, session: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  tokenData: null,
  setTokenData: () => {},
  isAuthenticated: false,
  user: null,
  setUser: () => {},
  loading: true,
  logout: () => {},
  availableServices: [],
  appSyncMessages: [],
  isAppSyncSubscribed: false,
  removeAppSyncMessage: () => {},
  handleLogin: async () => ({}),
  handleNewPassword: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [appSyncMessages, setAppSyncMessages] = useState<any[]>([]);
  const [isAppSyncSubscribed, setIsAppSyncSubscribed] = useState(false);
  const { t } = useTranslation();

  const logout = useCallback(() => {
    removeLocalStorageItem('idToken');
    removeLocalStorageItem('accessToken');
    removeLocalStorageItem('refreshToken');
    setTokenData(null);
    setUser(null);
    setSentryUser(null);
    // Only redirect if not already on login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    setLogoutHandler(logout);
  }, [logout]);

  const checkTokenExpiration = useCallback(async () => {
    if (tokenData) {
      const { idToken, refreshToken } = tokenData;
      const { exp } = parseJwt(idToken);
      const currentTime = Math.floor(Date.now() / 1000);

      if (exp - currentTime < 60) {
        try {
          const newTokenData = await refreshAuthToken();
          setTokenData({
            idToken: newTokenData?.IdToken ?? '',
            accessToken: newTokenData?.AccessToken ?? '',
            refreshToken,
          });
        } catch (error: any) {
          console.error('Error refreshing token:', error);
          if (
            error.name === 'NotAuthorizedException' &&
            error.message.includes('Refresh Token has expired')
          ) {
            console.warn('Refresh token has expired. Logging out...');
            logout();
          }
        }
      }
    }
  }, [tokenData, logout]);

  useEffect(() => {
    const fetchUserData = async () => {
      const idToken = getLocalStorageItem('idToken');
      const accessToken = getLocalStorageItem('accessToken');
      const refreshToken = getLocalStorageItem('refreshToken');

      if (idToken && accessToken && refreshToken) {
        setTokenData({ idToken, accessToken, refreshToken });

        const userData = parseJwt(idToken);
        const userDetails = await getCurrentUserDetails();

        const userLocale = userData.locale ?? 'en-US';
        changeLanguage(userLocale);

        setUser({
          user_id: userDetails.user_id,
          email: userData.email,
          given_name: userData.given_name,
          family_name: userData.family_name,
          locale: userLocale,
          picture: userDetails.picture,
          'custom:avatar': userDetails['custom:avatar'],
          role: userDetails.role,
          group: userDetails.group,
          app_sync_settings: userDetails.app_sync_settings,
        });

        setSentryUser({
          id: userData.sub,
          email: userData.email,
          username: userData.given_name + ' ' + userData.family_name,
        });
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      if (user) {
        const services = await getCurrentUserServices();
        setAvailableServices(services);
      }
    };

    fetchServices();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(checkTokenExpiration, 5000);
    return () => clearInterval(interval);
  }, [checkTokenExpiration]);

  useEffect(() => {
    if (user?.app_sync_settings && user.user_id) {
      const eventsConfig = user.app_sync_settings.API?.Events;
      if (!eventsConfig) {
        setIsAppSyncSubscribed(false);
        return;
      }
      // Configure AppSync
      configureAppSync({
        endpoint: eventsConfig.endpoint,
        region: eventsConfig.region,
        defaultAuthMode: eventsConfig.defaultAuthMode as 'apiKey' | 'iam' | 'oidc' | 'userPool' | 'lambda',
        apiKey: eventsConfig.apiKey,
        userId: user.user_id,
      });
      // Subscribe to events
      const handler = (payload: any) => {
        setAppSyncMessages(prev => [payload, ...prev]);
      };
      const subscribe = async () => {
        try {
          await subscribeAppSync(user.user_id, handler);
          setIsAppSyncSubscribed(true);
          console.log(t('notifications.subscription_to_events_started_correctly'));
        } catch (err) {
          setIsAppSyncSubscribed(false);
          console.error(t('notifications.error_subscribing_to_appsync'), err);
        }
      };
      if (Notification.permission !== 'granted') {
        Notification.requestPermission().then(subscribe);
      } else {
        subscribe();
      }
    } else {
      setIsAppSyncSubscribed(false);
      console.log(t('notifications.no_have_the_necessary_data_to_subscribe_to_appsync'));
    }
    // Cleanup
    return () => {
      unsubscribeAppSync();
    };
  }, [user?.app_sync_settings, user?.user_id, t]);

  const isAuthenticated = !!tokenData?.accessToken;

  const handleLogin = useCallback(async (username: string, password: string) => {
    try {
      const result = await signIn(username, password);

      // If it's a password challenge, return the challenge info
      if ('challengeName' in result) {
        return result;
      }

      // Normal login success - fetch user data
      const userData = parseJwt(result.IdToken ?? '');
      const userDetails = await getCurrentUserDetails();

      const userLocale = userData.locale ?? 'en-US';
      changeLanguage(userLocale);

      setUser({
        user_id: userDetails.user_id,
        email: userData.email,
        given_name: userData.given_name,
        family_name: userData.family_name,
        locale: userLocale,
        picture: userDetails.picture,
        'custom:avatar': userDetails['custom:avatar'],
        role: userDetails.role,
        group: userDetails.group,
        app_sync_settings: userDetails.app_sync_settings,
      });

      setTokenData({
        idToken: result.IdToken ?? '',
        accessToken: result.AccessToken ?? '',
        refreshToken: result.RefreshToken ?? '',
      });

      setSentryUser({
        id: userData.sub,
        email: userData.email,
        username: userData.given_name + ' ' + userData.family_name,
      });

      return {};
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const handleNewPassword = useCallback(
    async (username: string, newPassword: string, session: string) => {
      try {
        const result = await handlePasswordChallenge(username, newPassword, session);

        // Update user data after successful password change
        const userData = parseJwt(result.IdToken ?? '');
        const userDetails = await getCurrentUserDetails();

        setUser({
          user_id: userData.sub,
          email: userData.email,
          given_name: userData.given_name,
          family_name: userData.family_name,
          locale: userData.locale,
          picture: userDetails.picture,
          'custom:avatar': userDetails['custom:avatar'],
          role: userDetails.role,
          group: userDetails.group,
          app_sync_settings: userDetails.app_sync_settings,
        });

        setTokenData({
          idToken: result.IdToken ?? '',
          accessToken: result.AccessToken ?? '',
          refreshToken: result.RefreshToken ?? '',
        });

        setSentryUser({
          id: userData.sub,
          email: userData.email,
          username: userData.given_name + ' ' + userData.family_name,
        });
      } catch (error: any) {
        console.error('Password challenge failed:', error);
        throw error;
      }
    },
    []
  );

  const removeAppSyncMessage = useCallback((idx: number) => {
    setAppSyncMessages(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const value = useMemo(
    () => ({
      tokenData,
      setTokenData,
      isAuthenticated,
      user,
      setUser,
      loading,
      logout,
      availableServices,
      appSyncMessages,
      isAppSyncSubscribed,
      removeAppSyncMessage,
      handleLogin,
      handleNewPassword,
    }),
    [
      tokenData,
      setTokenData,
      isAuthenticated,
      user,
      setUser,
      loading,
      logout,
      availableServices,
      appSyncMessages,
      isAppSyncSubscribed,
      removeAppSyncMessage,
      handleLogin,
      handleNewPassword,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
