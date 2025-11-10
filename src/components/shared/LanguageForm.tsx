import React from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageFormProps {
  languages: string[];
  newLanguage: string;
  onNewLanguageChange: (value: string) => void;
  onAddLanguage: () => void;
  onRemoveLanguage: (index: number) => void;
}

const LanguageForm: React.FC<LanguageFormProps> = ({
  languages,
  newLanguage,
  onNewLanguageChange,
  onAddLanguage,
  onRemoveLanguage,
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="newLanguage" className="block text-sm font-medium text-gray-700 mb-1">
          {t('knowledge_base_creator.add_new_language')}
        </label>
        <div className="flex space-x-2">
          <input
            id="newLanguage"
            type="text"
            value={newLanguage}
            onChange={e => onNewLanguageChange(e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={t('knowledge_base_creator.add_new_language_placeholder')}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAddLanguage();
              }
            }}
          />
          <button
            onClick={onAddLanguage}
            disabled={!newLanguage.trim()}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
          >
            {t('knowledge_base_creator.add')}
          </button>
        </div>
      </div>

      {languages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Current languages</h4>
          <ul className="space-y-2">
            {languages.map((language, index) => (
              <li
                key={language}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <span className="text-sm text-gray-700">{language}</span>
                <button
                  onClick={() => onRemoveLanguage(index)}
                  className="rounded-sm bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageForm;
