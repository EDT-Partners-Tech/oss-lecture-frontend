// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React from 'react';
import { Off, Search, Burger } from '../images/icons';
import useAuth from '../hooks/useAuth';
import { signOut } from '../authentication/authService';
import { getLocalStorageItem } from '../lib/localStorage';
import { unsubscribeAppSync } from '../utils/appsyncClient';
import { useTranslation } from 'react-i18next';
import NotificationButton from './NotificationButton';

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, title }) => {
  const { logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = async () => {
    const accessToken = getLocalStorageItem('accessToken') ?? '';

    try {
      await signOut(accessToken);
    } catch (error) {
      console.error(t('topbar.error_during_sign_out'), error);
    } finally {
      unsubscribeAppSync();
      logout();
    }
  };

  return (
    <div className="bg-white p-4 px-6 shadow rounded-lg flex items-center justify-between mb-4">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="md:hidden text-2xl mr-4">
          <Burger />
        </button>
        <h1 className="text-2xl font-dm-serif">{title}</h1>
      </div>
      <div className="flex items-right ml-auto mr-4">
        <form className="max-w-md mx-auto">
          <label
            htmlFor="default-search"
            className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
          >
            {t('topbar.search')}
          </label>
          <div className="relative hidden sm:block">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <Search />
            </div>
            <input
              type="search"
              id="default-search"
              className="block w-32 lg:w-96 sm:w-32 xs:w-16 p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:ring-transparent"
              placeholder={t('topbar.search')}
              required
            />
          </div>
        </form>
      </div>
      <div className="flex items-center space-x-4">
        <NotificationButton />
        <button
          onClick={handleLogout}
          className="text-xl text-red-500 px-4 py-2 rounded-lg hover:text-red-700 transition duration-300"
        >
          <Off />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
