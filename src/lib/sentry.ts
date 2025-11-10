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
