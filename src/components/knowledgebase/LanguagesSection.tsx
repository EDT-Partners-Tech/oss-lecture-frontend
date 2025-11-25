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
import { PencilSquareIcon } from '@heroicons/react/20/solid';
import LanguageForm from '../shared/LanguageForm';
import { useTranslation } from 'react-i18next';

interface LanguagesSectionProps {
  isEditingLanguages: boolean;
  languages: string[];
  newLanguage: string;
  updateLoading: boolean;
  updateError: string | null;
  updateSuccess: boolean;
  course: any;
  onStartEditLanguages: () => void;
  onCancelEditLanguages: () => void;
  onAddLanguage: () => void;
  onRemoveLanguage: (index: number) => void;
  onSaveLanguages: () => void;
  onNewLanguageChange: (value: string) => void;
}

const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  isEditingLanguages,
  languages,
  newLanguage,
  updateLoading,
  updateError,
  updateSuccess,
  course,
  onStartEditLanguages,
  onCancelEditLanguages,
  onAddLanguage,
  onRemoveLanguage,
  onSaveLanguages,
  onNewLanguageChange,
}) => {
  const { t } = useTranslation();
  return (
    <div className="mb-8 bg-white p-4 rounded-md shadow-sm shadow-gray-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base/7 font-semibold text-gray-900">{t('knowledge_base_creator.supported_languages')}</h3>
        {!isEditingLanguages && (
          <button
            onClick={onStartEditLanguages}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <PencilSquareIcon className="size-4 mr-1" />
            {t('knowledge_base_creator.edit_languages')}
          </button>
        )}
      </div>

      {!isEditingLanguages ? (
        <div className="space-y-4">
          {!course?.settings?.languages || course.settings.languages.length === 0 ? (
            <p className="text-sm text-gray-500">{t('knowledge_base_creator.no_languages_defined')}</p>
          ) : (
            <div className="space-y-2">
              {languages.map(language => (
                <div
                  key={language}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <span className="text-sm text-gray-700">{language}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <LanguageForm
            languages={languages}
            newLanguage={newLanguage}
            onNewLanguageChange={onNewLanguageChange}
            onAddLanguage={onAddLanguage}
            onRemoveLanguage={onRemoveLanguage}
          />

          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button
              onClick={onSaveLanguages}
              disabled={updateLoading}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              {updateLoading ? t('knowledge_base_creator.saving') : t('knowledge_base_creator.save_changes')}
            </button>
            <button
              onClick={onCancelEditLanguages}
              disabled={updateLoading}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              {t('knowledge_base_creator.cancel')}
            </button>
          </div>

          {updateSuccess && (
            <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg">
              {t('knowledge_base_creator.operation_completed_successfully')}
            </div>
          )}

          {updateError && (
            <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg">{updateError}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default LanguagesSection;
