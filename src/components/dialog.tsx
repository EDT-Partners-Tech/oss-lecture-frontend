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

import React, { useState } from 'react';

interface DialogProps {
  title: string;
  description: string;
  onAccept?: () => void;
  onCancel?: () => void;
  onConfirm?: () => void;
  onDecline?: () => void;
  acceptText?: string;
  cancelText?: string;
  confirmText?: string;
  declineText?: string;
}

const Dialog: React.FC<DialogProps> = ({
  title,
  description,
  onAccept,
  onCancel,
  onConfirm,
  onDecline,
  acceptText = 'Accept',
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  declineText = 'Decline',
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const closeDialog = () => setIsOpen(false);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <button onClick={closeDialog} className="text-gray-500 hover:text-gray-700">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <p className="text-sm text-gray-500">{description}</p>
            <div className="flex justify-end space-x-2 mt-4">
              {onCancel && (
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  onClick={() => {
                    onCancel();
                    closeDialog();
                  }}
                >
                  {cancelText}
                </button>
              )}
              {onDecline && (
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                  onClick={() => {
                    onDecline();
                    closeDialog();
                  }}
                >
                  {declineText}
                </button>
              )}
              {onConfirm && (
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                  onClick={() => {
                    onConfirm();
                    closeDialog();
                  }}
                >
                  {confirmText}
                </button>
              )}
              {onAccept && (
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onClick={() => {
                    onAccept();
                    closeDialog();
                  }}
                >
                  {acceptText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dialog;
