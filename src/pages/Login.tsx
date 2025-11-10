import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp, handlePasswordChallenge } from '../authentication/authService';
import { showToast } from '../services/toastService';
import FloatingInput from '../components/ui/floatingInput';
import useAuth from '../hooks/useAuth';
import { parseJwt } from '../lib/utils';
import Checkbox from '../components/ui/checkbox';
import { Logo } from '../images/icons';
import { useTranslation } from 'react-i18next';
import { getLocalStorageItem } from '../lib/localStorage';
import GoogleSignInButton from '../components/GoogleSignInButton';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [locale, setLocale] = useState('');
  const [isPasswordChallenge, setIsPasswordChallenge] = useState(false);
  const [session, setSession] = useState('');
  const navigate = useNavigate();
  const { setTokenData } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const userLocale = navigator.language ?? 'en-US';
    setLocale(userLocale);
  }, []);

  useEffect(() => {
    const accessToken = getLocalStorageItem('accessToken');
    if (accessToken) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSignIn = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    try {
      const result = await signIn(email, password);

      // Handle password challenges
      if ('challengeName' in result) {
        if (result.challengeName === 'NEW_PASSWORD_REQUIRED') {
          setIsPasswordChallenge(true);
          setSession(result.session);
          showToast('info', t('please_set_new_password'));
          return;
        }
        if (result.challengeName === 'PASSWORD_RESET_REQUIRED') {
          // For password reset, redirect to the reset password page
          showToast('info', t('password_reset_required'));
          navigate('/reset-password', { state: { email } });
          return;
        }
      }

      // Normal login success
      if (result.AccessToken) {
        setTokenData(parseJwt(result.AccessToken));
        if (getLocalStorageItem('accessToken')) {
          window.location.href = '/dashboard';
        } else {
          console.error('Session token was not set properly.');
        }
      } else {
        console.error('SignIn session or AccessToken is undefined.');
      }
    } catch (error) {
      showToast('error', t('sign_in_failed', { error }));
    }
  };

  const handleNewPassword = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('info', t('passwords_do_not_match'));
      return;
    }

    try {
      const result = await handlePasswordChallenge(email, password, session);
      if (result.AccessToken) {
        setTokenData(parseJwt(result.AccessToken));
        if (getLocalStorageItem('accessToken')) {
          window.location.href = '/dashboard';
        } else {
          console.error('Session token was not set properly.');
        }
      }
    } catch (error) {
      showToast('error', t('password_challenge_failed', { error }));
    }
  };

  const handleSignUp = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('info', t('passwords_do_not_match'));
      return;
    }
    const role = 'teacher';
    const data = { email, password, givenName, familyName, locale, role };

    try {
      await signUp(data);
      navigate('/confirm', { state: { email } });
    } catch (error) {
      showToast('error', t('sign_up_failed', { error }));
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 max-h-[100vh]">
      <div className="hidden bg-muted lg:block max-h-[100vh] overflow-hidden">
        <img src="/images/login.jpg" alt="chairs" />
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2">
            <Logo className="text-center mx-auto mb-4" />
            <h1 className="text-3xl font-dm-serif">
              {isSignUp ? t('sign_up') : isPasswordChallenge ? t('set_new_password') : t('sign_in')}
            </h1>
            <p className="text-balance text-muted-foreground">
              {isSignUp
                ? t('create_an_account')
                : isPasswordChallenge
                  ? t('please_set_new_password')
                  : t('login_to_continue')}
            </p>
          </div>
          <form
            onSubmit={
              isSignUp ? handleSignUp : isPasswordChallenge ? handleNewPassword : handleSignIn
            }
            className="space-y-4"
          >
            {isSignUp && (
              <>
                <FloatingInput
                  id="given_name"
                  type="text"
                  value={givenName}
                  label={t('first_name')}
                  onChange={e => setGivenName(e.target.value)}
                  required
                />
                <FloatingInput
                  id="family_name"
                  type="text"
                  value={familyName}
                  label={t('last_name')}
                  onChange={e => setFamilyName(e.target.value)}
                  required
                />
                <input type="hidden" id="locale" value={locale} />
              </>
            )}
            {!isPasswordChallenge && (
              <FloatingInput
                id="email"
                type="email"
                value={email}
                label={t('email')}
                onChange={e => setEmail(e.target.value)}
                required
              />
            )}
            <FloatingInput
              id="password"
              type="password"
              value={password}
              label={isPasswordChallenge ? t('new_password') : t('password')}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {(isPasswordChallenge || isSignUp) && (
              <FloatingInput
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                label={t('confirm_new_password')}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            )}
            {!isSignUp && !isPasswordChallenge && (
              <Checkbox
                label={t('remember_me')}
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
            )}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              {isSignUp
                ? t('sign_up').toUpperCase()
                : isPasswordChallenge
                  ? t('set_password').toUpperCase()
                  : t('sign_in').toUpperCase()}
            </button>
            {!isSignUp && !isPasswordChallenge && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                </div>
                <GoogleSignInButton />
              </>
            )}
          </form>
          {!isSignUp && !isPasswordChallenge && (
            <>
              <button
                onClick={() => navigate('/reset-password')}
                className="text-blue-500 underline"
              >
                {t('forgot_password')}
              </button>
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-blue-500 underline">
                {isSignUp ? t('already_have_account') : t('create_account')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
