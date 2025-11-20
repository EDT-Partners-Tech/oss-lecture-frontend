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
