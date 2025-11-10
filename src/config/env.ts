// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import { getConfig } from '../services/api';

export interface EnvConfig {
  COGNITO_REGION: string;
  COGNITO_APP_CLIENT_ID: string;
  GOOGLE_CLIENT_ID: string;
}

let envConfig: EnvConfig | null = null;

export const loadEnvConfig = async (): Promise<EnvConfig> => {
  if (envConfig) return envConfig;

  try {
    const response = await getConfig();

    envConfig = response as EnvConfig;
    return envConfig;
  } catch (error) {
    console.error('Error retrieving AWS config:', error);
    throw error;
  }
};

export const getEnvConfig = async (): Promise<EnvConfig> => {
  if (envConfig) {
    return envConfig;
  }
  return loadEnvConfig();
};
