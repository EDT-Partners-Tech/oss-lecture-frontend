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
import { FaSpinner, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { ChatbotList, ChatbotFile } from '../../types';
import DeleteButton from './DeleteButton';
import MaterialsButton from './MaterialsButton';

interface ChatbotCardProps {
  chatbot: ChatbotList;
  deleteLoading: string | null;
  onDelete: (id: string) => void;
  onShowMaterials: (e: React.MouseEvent, materials: ChatbotFile[]) => void;
  formatDate: (dateString: string) => string;
  t: (key: string) => string;
}

const ChatbotCard: React.FC<ChatbotCardProps> = ({ 
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

  const cardContent = (
    <div className="p-5 sm:p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3 flex-1">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
            {chatbot.chatbot_name}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isInProgress ? (
            <FaSpinner className="w-5 h-5 animate-spin text-blue-600" title={t('chatbot_dashboard.processing')} />
          ) : (
            <DeleteButton
              chatbotId={chatbot.chatbot_id}
              deleteLoading={deleteLoading}
              onDelete={onDelete}
              className="p-1.5"
            />
          )}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm sm:text-base text-gray-600 line-clamp-2">
          {isInProgress ? t('chatbot_dashboard.processing') : isError ? t('chatbot_dashboard.error_generating') : chatbot.chatbot_system_prompt}
        </p>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2 justify-between w-full">
          <div className="flex items-center gap-2">
            <FaClock className="w-4 h-4" />
            <span className="truncate">{formatDate(chatbot.updated_at)}</span>
          </div>
          {isError && <FaExclamationTriangle className="w-4 h-4 text-red-600" title={t('chatbot_dashboard.error_generating')} />}
        </div>
        {isCompleted && (
          <MaterialsButton
            materials={chatbot.materials || []}
            onShowMaterials={onShowMaterials}
            className="p-1.5"
          />
        )}
      </div>
    </div>
  );

  if (isCompleted) {
    return (
      <Link
        to={`/chatbot/${chatbot.chatbot_id}`}
        className="block bg-white/80 cursor-pointer backdrop-blur-sm rounded-sm shadow-lg overflow-hidden hover:shadow-xl hover:shadow-gray-500 transition-all duration-300 border border-gray-100"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className="block bg-white/80 backdrop-blur-sm rounded-sm shadow-lg overflow-hidden border border-gray-100">
      {cardContent}
    </div>
  );
};

export default ChatbotCard; 