// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import i18n from './services/i18n';
import '@fontsource/dm-serif-display';
import '@fontsource-variable/montserrat';
import './globals.css';
import { AuthProvider } from './authentication/authContext.tsx';
import { I18nextProvider } from 'react-i18next';
import { ToastContainer } from 'react-toastify';
import ErrorBoundary from './components/error-boundary.tsx';
import { SettingsProvider } from './contexts/SettingsContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <SettingsProvider>
            <App />
            <ToastContainer />
          </SettingsProvider>
        </AuthProvider>
      </I18nextProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
