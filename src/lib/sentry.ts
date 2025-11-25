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

import * as Sentry from '@sentry/react';

let isSentryInitialized = false;

export const initializeSentry = (dsn: string, environment: string = 'development') => {
  if (!isSentryInitialized) {
    Sentry.init({
      dsn,
      environment,
      integrations: [],
      // Enable debug mode in development
      debug: environment === 'development',
    });
    isSentryInitialized = true;
  }
};

export const setSentryUser = (user: { id?: string; email?: string; username?: string } | null) => {
  if (isSentryInitialized) {
    Sentry.setUser(user);
  }
};

export const captureException = (error: Error, context?: Record<string, any>) => {
  if (isSentryInitialized) {
    Sentry.captureException(error, context);
  } else {
    console.error('Sentry not initialized. Error:', error, context);
  }
};
