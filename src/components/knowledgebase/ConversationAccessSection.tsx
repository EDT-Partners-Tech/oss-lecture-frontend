// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React from 'react';
import { getBackendUrl } from '../../services/client';
import { useTranslation } from 'react-i18next';

interface ConversationAccessSectionProps {
  isConversationEnabled: boolean;
  isUpdatingAccess: boolean;
  conversationToken: string;
  id: string | undefined;
  onToggleConversationAccess: () => void;
}

const ConversationAccessSection: React.FC<ConversationAccessSectionProps> = ({
  isConversationEnabled,
  isUpdatingAccess,
  conversationToken,
  id,
  onToggleConversationAccess,
}) => {
  const { t } = useTranslation();
  const baseUrl = getBackendUrl();
  const endpoint = `${baseUrl}/chatbot/conversation-access`;

  return (
    <div className="mt-6 bg-white p-4 rounded-md shadow-sm shadow-gray-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base/7 font-semibold text-gray-900">{t('knowledge_base_creator.conversation_access')}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {isConversationEnabled
              ? t('knowledge_base_creator.conversation_active_and_accessible')
              : t('knowledge_base_creator.conversation_disabled')}
          </p>
        </div>
        <button
          onClick={onToggleConversationAccess}
          disabled={isUpdatingAccess}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            isConversationEnabled
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isUpdatingAccess ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              {t('knowledge_base_creator.processing')}
            </div>
          ) : null}
          {!isUpdatingAccess && isConversationEnabled ? t('knowledge_base_creator.disable_access') : t('knowledge_base_creator.enable_access')}
        </button>
      </div>

      {isConversationEnabled && conversationToken && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600 mb-2">{t('knowledge_base_creator.access_token')}:</p>
          <div className="flex flex-col items-start">
            <p className="flex-1 p-2 text-sm font-mono">
              {t('knowledge_base_creator.endpoint')}: {endpoint}
            </p>
            <p className="flex-1 p-2 text-sm font-mono">
              {t('knowledge_base_creator.id')}: {id}
              <button onClick={() => navigator.clipboard.writeText(id ?? '')} className="px-3">
                {t('knowledge_base_creator.copy')}
              </button>
            </p>
            <p className="flex-1 p-2 text-sm font-mono">
              Token: {conversationToken}
              <button
                onClick={() => navigator.clipboard.writeText(conversationToken)}
                className="px-3"
              >
                {t('knowledge_base_creator.copy')}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationAccessSection;
