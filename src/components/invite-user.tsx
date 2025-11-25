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
import { inviteUserToCourse } from '../services/api';
import { Invite } from '../types';

export interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose, courseId }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handleInvite = async () => {
    try {
      const invite: Invite = {
        email: email,
        course_id: courseId,
      };
      await inviteUserToCourse(invite);
      setStatus('Invitation sent successfully!');
      setEmail('');
    } catch (error) {
      setStatus('Error sending invitation.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Invite User</h2>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter email"
          className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleInvite}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
        >
          Send Invite
        </button>
        {status && <p className="mt-4 text-sm text-green-600">{status}</p>}
        <button
          onClick={onClose}
          className="w-full mt-4 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default InviteUserModal;
