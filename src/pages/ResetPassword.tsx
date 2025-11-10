// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { confirmForgotPassword, forgotPassword } from '../authentication/authService';
import FloatingInput from '../components/ui/floatingInput';
import { showToast } from '../services/toastService';
import { useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const navigate = useNavigate();

  const handleRequestResetCode = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      showToast('success', t('reset_code_sent'));
      setStep('reset');
    } catch (error) {
      showToast('error', t('reset_password_failed', { error }));
    }
  };

  const handlePasswordReset = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showToast('info', t('passwords_do_not_match'));
      return;
    }

    try {
      await confirmForgotPassword(email, confirmationCode, newPassword);
      showToast('success', t('password_reset_successful'));

      // Redirect to login page after password reset after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      showToast('error', t('reset_password_failed', { error }));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-[350px] p-4 bg-white shadow-lg rounded">
        <h1 className="text-2xl font-bold mb-4">
          {step === 'request' ? t('reset_password') : t('enter_new_password')}
        </h1>
        <form
          onSubmit={step === 'request' ? handleRequestResetCode : handlePasswordReset}
          className="space-y-4"
        >
          {step === 'request' ? (
            <>
              <FloatingInput
                id="email"
                type="email"
                value={email}
                label={t('email')}
                onChange={e => setEmail(e.target.value)}
                background="white"
                required={step === 'request'}
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                {t('send_reset_code')}
              </button>
            </>
          ) : (
            <>
              <FloatingInput
                id="confirmationCode"
                type="text"
                value={confirmationCode}
                label={t('confirmation_code')}
                onChange={e => setConfirmationCode(e.target.value)}
                background="white"
                required
              />
              <FloatingInput
                id="newPassword"
                type="password"
                value={newPassword}
                label={t('new_password')}
                onChange={e => setNewPassword(e.target.value)}
                background="white"
                required
              />
              <FloatingInput
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                label={t('confirm_new_password')}
                onChange={e => setConfirmNewPassword(e.target.value)}
                background="white"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                {t('reset_password')}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
