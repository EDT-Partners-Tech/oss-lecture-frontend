import axios from 'axios';
import { showToast } from './toastService';
import { getLocalStorageItem } from '../lib/localStorage';
import { t } from 'i18next';

export const getBackendUrl = () => {
  const currentDomain = window.location.hostname;
  const domainParts = currentDomain.split('.');
  if (domainParts.length >= 2) {
    const rootDomain = domainParts.slice(-2).join('.'); // edt-technology.com
    return `https://lecture-backend.${rootDomain}`;
  }

  // Fallback for localhost or unusual domains
  return import.meta.env.VITE_BACKEND_SERVER_URL;
};

const serverUrl = getBackendUrl();

let logoutHandler: (() => void) | null = null;

export const setLogoutHandler = (handler: () => void) => {
  logoutHandler = handler;
};

const client = axios.create({
  baseURL: serverUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  config => {
    const token = getLocalStorageItem('idToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(new Error(error.message || t('error.request_error')));
  }
);

client.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    let errorMessage = t('error.unexpected_error');

    if (error.response) {
      switch (error.response.status) {
        case 204:
          errorMessage = t('error.no_content_available');
          showToast('info', errorMessage);
          break;
        case 400:
          showToast('warning', error.response.data?.detail || t('error.error'));
          break;
        case 401:
          errorMessage = t('error.unauthorized_access');
          if (logoutHandler) logoutHandler();
          showToast('error', errorMessage);
          break;
        case 404:
          errorMessage = t('error.resource_not_found');
          console.error('Resource not found:', error.response.config.url);
          showToast('info', errorMessage);
          break;
        case 429:
          errorMessage = t('error.too_many_requests');
          showToast('error', errorMessage);
          break;
        case 500:
          if (error.response.data?.detail?.includes('Invalid email domain')) {
            errorMessage = t('error.invalid_email_domain');
          } else {
            errorMessage = t('error.server_error');
          }
          showToast('error', errorMessage);
          break;
        default:
          errorMessage =
            error.response.data?.message || error.response.data?.detail || errorMessage;
          showToast('error', errorMessage);
          break;
      }
    } else {
      showToast('error', t('error.network_error'));
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export default client;
