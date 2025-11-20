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
