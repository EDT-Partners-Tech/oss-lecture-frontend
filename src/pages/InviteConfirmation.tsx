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

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { confirmInvite } from '../services/api';
import { signIn } from '../authentication/authService';
import FloatingInput from '../components/ui/floatingInput';
import { useTranslation } from 'react-i18next';
import { showToast } from '../services/toastService';

const InviteConfirmation: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [givenName, setGivenName] = useState<string>('');
  const [familyName, setFamilyName] = useState<string>('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const userLocale = navigator.language ?? 'en-US';

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleConfirmInvite = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const response = await confirmInvite({
        invite_code: inviteCode!,
        password,
        given_name: givenName,
        family_name: familyName,
        locale: userLocale,
      });

      showToast('info', response.message);
      await signIn(response.email, password);

      navigate('/dashboard');
    } catch (error) {
      setError('Failed to confirm the invitation.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Processing invite...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-background p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Set Your Password</h2>
        <FloatingInput
          id="given_name"
          type="text"
          value={givenName}
          label={t('first_name')}
          className="mb-4"
          onChange={e => setGivenName(e.target.value)}
          required
        />
        <FloatingInput
          id="family_name"
          type="text"
          value={familyName}
          label={t('last_name')}
          className="mb-4"
          onChange={e => setFamilyName(e.target.value)}
          required
        />
        <FloatingInput
          id="password"
          type="password"
          value={password}
          label={t('password')}
          className="mb-4"
          onChange={e => setPassword(e.target.value)}
          required
        />
        <FloatingInput
          id="confirmpassword"
          type="password"
          value={confirmPassword}
          label={t('confirm_password')}
          className="mb-4"
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <button
          onClick={handleConfirmInvite}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Join Course
        </button>
      </div>
    </div>
  );
};

export default InviteConfirmation;
