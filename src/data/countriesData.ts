// © [2025] EDT&Partners. Licensed under CC BY 4.0.
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
