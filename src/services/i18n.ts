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

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from '../locales/en/translation.json';
import translationES from '../locales/es/translation.json';
import translationAR from '../locales/ar/translation.json';
import translationZH from '../locales/zh/translation.json';
import translationZHTW from '../locales/zh-TW/translation.json';
import translationFR from '../locales/fr/translation.json';
import translationFRCA from '../locales/fr-CA/translation.json';
import translationDE from '../locales/de/translation.json';
import translationHI from '../locales/hi/translation.json';
import translationIT from '../locales/it/translation.json';
import translationJA from '../locales/ja/translation.json';
import translationKO from '../locales/ko/translation.json';
import translationPT from '../locales/pt/translation.json';
import translationPTBR from '../locales/pt-BR/translation.json';
import translationRU from '../locales/ru/translation.json';
import translationESMX from '../locales/es-MX/translation.json';
import translationTR from '../locales/tr/translation.json';
import translationUR from '../locales/ur/translation.json';
import translationVI from '../locales/vi/translation.json';
import { getLocalStorageItem } from '../lib/localStorage';
import { parseJwt } from '../lib/utils';

const resources = {
  en: {
    translation: translationEN,
  },
  es: {
    translation: translationES,
  },
  ar: {
    translation: translationAR,
  },
  zh: {
    translation: translationZH,
  },
  'zh-TW': {
    translation: translationZHTW,
  },
  fr: {
    translation: translationFR,
  },
  'fr-CA': {
    translation: translationFRCA,
  },
  de: {
    translation: translationDE,
  },
  hi: {
    translation: translationHI,
  },
  it: {
    translation: translationIT,
  },
  ja: {
    translation: translationJA,
  },
  ko: {
    translation: translationKO,
  },
  pt: {
    translation: translationPT,
  },
  'pt-BR': {
    translation: translationPTBR,
  },
  ru: {
    translation: translationRU,
  },
  'es-MX': {
    translation: translationESMX,
  },
  tr: {
    translation: translationTR,
  },
  ur: {
    translation: translationUR,
  },
  vi: {
    translation: translationVI,
  },
};

// Function to get the language from Cognito attributes
const getCognitoLanguage = () => {
  const idToken = getLocalStorageItem('idToken');
  if (idToken) {
    try {
      const decodedToken = parseJwt(idToken);
      // Search for locale attribute in Cognito attributes
      const locale = decodedToken['custom:locale'] ?? decodedToken.locale;
      if (locale) {
        return locale; // Return the complete locale (e.g. 'fr-CA' instead of just 'fr')
      }
    } catch (e) {
      console.error('Error parsing JWT:', e);
    }
  }
  return 'en-US';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getCognitoLanguage(),
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    supportedLngs: Object.keys(resources),
    nonExplicitSupportedLngs: true,
  });

// Function to change the language and update the text direction
export const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
};

export default i18n;
