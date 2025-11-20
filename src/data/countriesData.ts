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

type CountriesData = {
  [key: string]: string[];
};

export const languages = {
  ar: 'Arabic',
  zh: 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  en: 'English',
  fr: 'French',
  'fr-CA': 'French (Canada)',
  de: 'German',
  hi: 'Hindi',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  pt: 'Portuguese',
  'pt-BR': 'Portuguese (Brazil)',
  ru: 'Russian',
  es: 'Spanish',
  'es-MX': 'Spanish (Mexico)',
  tr: 'Turkish',
  ur: 'Urdu',
  vi: 'Vietnamese',
};

const countriesData: CountriesData = {
  English: [
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'New Zealand',
    'Ireland',
    'South Africa',
    'India',
    'Jamaica',
    'Nigeria',
  ],
  Spanish: [
    'Spain',
    'Mexico',
    'Colombia',
    'Argentina',
    'Chile',
    'Peru',
    'Venezuela',
    'Cuba',
    'Guatemala',
    'Ecuador',
  ],
  French: [
    'France',
    'Canada',
    'Belgium',
    'Switzerland',
    'Luxembourg',
    'Senegal',
    'Ivory Coast',
    'Haiti',
    'Madagascar',
    'Democratic Republic of the Congo',
  ],
  Arabic: [
    'Saudi Arabia',
    'Egypt',
    'United Arab Emirates',
    'Morocco',
    'Iraq',
    'Jordan',
    'Lebanon',
    'Algeria',
    'Sudan',
    'Yemen',
  ],
};
export default countriesData;
