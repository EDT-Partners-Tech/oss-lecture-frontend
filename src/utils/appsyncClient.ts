// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import { Amplify } from 'aws-amplify';
import { events } from 'aws-amplify/data';
import { handleAppSyncEvent } from './appsyncEvents';

let subscriptionRef: any = null;
let isConfigured = false;

export type AppSyncEventsConfig = {
  endpoint: string;
  region: string;
  defaultAuthMode: 'apiKey' | 'iam' | 'oidc' | 'userPool' | 'lambda';
  apiKey: string;
  userId: string;
};

export type AppSyncEventHandler = (payload: any) => void;

let currentHandler: AppSyncEventHandler | null = null;

export function configureAppSync(config: AppSyncEventsConfig) {
  if (!isConfigured) {
    Amplify.configure({
      API: {
        Events: {
          endpoint: config.endpoint,
          region: config.region,
          defaultAuthMode: config.defaultAuthMode,
          apiKey: config.apiKey,
        }
      }
    });
    isConfigured = true;
  }
}

export async function subscribeAppSync(userId: string, handler?: AppSyncEventHandler) {
  if (subscriptionRef) {
    subscriptionRef.unsubscribe();
    subscriptionRef = null;
  }
  currentHandler = handler || null;
  const path = `lecture-appsync-namespace/event/${userId}`;
  const channel = await events.connect(path);
  subscriptionRef = channel.subscribe({
    next: (payload: any) => {
      handleAppSyncEvent(payload);
      if (currentHandler) currentHandler(payload);
    },
    error: (err: any) => {
      console.error('Error en la suscripción AppSync:', err);
    },
  });
}

export function unsubscribeAppSync() {
  if (subscriptionRef) {
    subscriptionRef.unsubscribe();
    subscriptionRef = null;
  }
  currentHandler = null;
} 