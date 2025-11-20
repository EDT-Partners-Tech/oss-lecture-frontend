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

interface DeleteButtonProps {
  chatbotId: string;
  deleteLoading: string | null;
  onDelete: (id: string) => void;
  className?: string;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ 
  chatbotId, 
  deleteLoading, 
  onDelete, 
  className = '' 
}) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      onDelete(chatbotId);
    }}
    disabled={deleteLoading === chatbotId}
    className={`text-gray-400 hover:text-red-500 transition-colors duration-200 ${className}`}
  >
    {deleteLoading === chatbotId ? (
      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-500"></div>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    )}
  </button>
);

export default DeleteButton; 