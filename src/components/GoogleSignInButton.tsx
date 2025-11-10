// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React, { useEffect, useState } from 'react';
import { authService, thirdPartyIntegrationService } from '../services/api';
import { setLocalStorageItem } from '../lib/localStorage';
import { useTranslation } from 'react-i18next';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface ServiceValueResponse {
  id: string;
  service_value: Record<string, string>;
}

interface GoogleSignInButtonProps {
  onError?: (error: string) => void;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onError }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializationAttempted, setInitializationAttempted] = useState(false);
  const [integration, setIntegration] = useState<ServiceValueResponse | null>(null);
  const { t } = useTranslation();

  // Fetch Google integration configuration
  useEffect(() => {
    const fetchGoogleIntegration = async () => {
      try {
        const result = (await thirdPartyIntegrationService.getPublicIntegrationByService(
          'google'
        )) as ServiceValueResponse;
        setIntegration(result);
      } catch (error) {
        console.error('Failed to get Google integration:', error);
        setError('Failed to get Google integration');
        onError?.('Failed to get Google integration');
      }
    };
    fetchGoogleIntegration();
  }, [onError]);

  // Load Google script if we have client ID
  useEffect(() => {
    if (!integration?.service_value?.client_id) return;

    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setIsScriptLoaded(true);
      document.body.appendChild(script);
    };

    loadGoogleScript();
  }, [integration]);

  // Initialize Google Sign-In if script is loaded
  useEffect(() => {
    if (!isScriptLoaded || initializationAttempted || !integration?.service_value?.client_id)
      return;

    const initializeGoogleSignIn = () => {
      setInitializationAttempted(true);
      try {
        window.google.accounts.id.initialize({
          client_id: integration.service_value.client_id,
          callback: async (response: any) => {
            try {
              const result = await authService.signInWithGoogle(response.credential);
              if (result?.idToken && result?.accessToken && result?.refreshToken) {
                setLocalStorageItem('idToken', result.idToken);
                setLocalStorageItem('accessToken', result.accessToken);
                setLocalStorageItem('refreshToken', result.refreshToken);
                window.location.href = '/dashboard';
              } else {
                setError('Failed to get authentication tokens');
                onError?.('Failed to get authentication tokens');
              }
            } catch (error) {
              console.error('Sign in error:', error);
              setError('Failed to sign in with Google');
              onError?.('Failed to sign in with Google');
            }
          },
        });

        window.google.accounts.id.renderButton(document.getElementById('googleSignInButton')!, {
          theme: 'outline',
          size: 'large',
          width: '100%',
        });
      } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
        setError('Failed to initialize Google Sign-In');
        onError?.('Failed to initialize Google Sign-In');
      }
    };

    initializeGoogleSignIn();
  }, [isScriptLoaded, initializationAttempted, integration, onError]);

  if (!integration?.service_value?.client_id) {
    return null;
  }

  return (
    <div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 my-2 text-gray-500">{t('or')}</span>
      </div>
      <div id="googleSignInButton"></div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default GoogleSignInButton;
