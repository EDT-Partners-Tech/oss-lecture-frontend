// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React from 'react';
import { PencilSquareIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';

interface SystemPromptSectionProps {
  isEditing: boolean;
  systemPrompt: string;
  updateLoading: boolean;
  updateError: string | null;
  updateSuccess: boolean;
  course: any;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onSystemPromptChange: (value: string) => void;
}

const SystemPromptSection: React.FC<SystemPromptSectionProps> = ({
  isEditing,
  systemPrompt,
  updateLoading,
  updateError,
  updateSuccess,
  course,
  onStartEdit,
  onCancelEdit,
  onSave,
  onSystemPromptChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-8 bg-white p-4 rounded-md shadow-sm shadow-gray-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base/7 font-semibold text-gray-900">{t('knowledge_base_creator.system_prompt')}</h3>
        {!isEditing && (
          <button
            onClick={onStartEdit}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <PencilSquareIcon className="size-4 mr-1" />
            {t('knowledge_base_creator.edit_system_prompt')}
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-4">
          {!course?.settings?.system_prompt ? (
            <p className="text-sm text-gray-500">{t('knowledge_base_creator.no_system_prompt_defined')}</p>
          ) : (
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{systemPrompt}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="system-prompt" className="block text-sm font-medium text-gray-700 mb-1">
              {t('knowledge_base_creator.system_prompt')}
            </label>
            <textarea
              id="system-prompt"
              rows={6}
              value={systemPrompt}
              onChange={e => onSystemPromptChange(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={t('knowledge_base_creator.enter_system_prompt')}
            />
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button
              onClick={onSave}
              disabled={updateLoading}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              {updateLoading ? t('knowledge_base_creator.saving') : t('knowledge_base_creator.save_changes')}
            </button>
            <button
              onClick={onCancelEdit}
              disabled={updateLoading}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              {t('knowledge_base_creator.cancel')}
            </button>
          </div>

          {updateError && (
            <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg">{updateError}</div>
          )}

          {updateSuccess && (
            <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg">
              {t('knowledge_base_creator.operation_completed_successfully')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SystemPromptSection; 