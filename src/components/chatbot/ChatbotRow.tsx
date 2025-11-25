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
import { Link } from 'react-router-dom';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { ChatbotList, ChatbotFile } from '../../types';
import DeleteButton from './DeleteButton';
import MaterialsButton from './MaterialsButton';

interface ChatbotRowProps {
  chatbot: ChatbotList;
  deleteLoading: string | null;
  onDelete: (id: string) => void;
  onShowMaterials: (e: React.MouseEvent, materials: ChatbotFile[]) => void;
  formatDate: (dateString: string) => string;
  t: (key: string) => string;
}

const ChatbotRow: React.FC<ChatbotRowProps> = ({ 
  chatbot, 
  deleteLoading, 
  onDelete, 
  onShowMaterials, 
  formatDate, 
  t 
}) => {
  const isCompleted = chatbot.status === 'COMPLETED';
  const isInProgress = chatbot.status === 'IN_PROGRESS';
  const isError = chatbot.status === 'ERROR';

  const nameCell = (
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center gap-2">
        {isCompleted ? (
          <Link to={`/chatbot/${chatbot.chatbot_id}`} className="text-sm font-medium text-gray-900">
            {chatbot.chatbot_name}
          </Link>
        ) : (
          <span className="text-sm font-medium text-gray-900">{chatbot.chatbot_name}</span>
        )}
      </div>
    </td>
  );

  return (
    <tr className="hover:bg-gray-50">
      {nameCell}
      <td className="px-6 py-4">
        <div className="text-sm text-gray-500 line-clamp-2">
          {isInProgress ? t('chatbot_dashboard.processing') : isError ? t('chatbot_dashboard.error_generating') : chatbot.chatbot_system_prompt}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500">
            {formatDate(chatbot.updated_at)}
          </div>
          {isError && <FaExclamationTriangle className="w-4 h-4 text-red-600" title="Error en la generación" />}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-4">
          {isCompleted && (
            <MaterialsButton
              materials={chatbot.materials || []}
              onShowMaterials={onShowMaterials}
            />
          )}
          {isInProgress ? (
            <FaSpinner className="w-5 h-5 animate-spin text-blue-600" title="Procesando..." />
          ) : (
            <DeleteButton
              chatbotId={chatbot.chatbot_id}
              deleteLoading={deleteLoading}
              onDelete={onDelete}
            />
          )}
        </div>
      </td>
    </tr>
  );
};

export default ChatbotRow; 