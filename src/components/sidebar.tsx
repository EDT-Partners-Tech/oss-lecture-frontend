// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React from 'react';
import useAuth from '../hooks/useAuth';
import { Dashboard, UserCircle, Close, SettingsPanel, Chart } from '../images/icons';
import { Link } from 'react-router-dom';
import { capitalize } from '../lib/utils';
import GroupLogo from './logo';
import { useSettings } from '../contexts/useSettings';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible, onClose }) => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { t } = useTranslation();
  if (!user) {
    return null;
  }

  const userGroupInfo = user.group.name !== '' ? user.group.name : user.group.domain;

  return (
    <div
      className={`w-64 bg-sidebar z-10 text-white p-4 fixed md:static ${
        isVisible ? 'h-full' : 'hidden'
      } md:block`}
    >
      <div className="p-4 flex items-center justify-between mt-8">
        <GroupLogo />
        <button onClick={onClose} className="md:hidden text-3xl">
          <Close className="w-8" />
        </button>
      </div>
      <Link to="/profile">
        <div className="p-4 border-t border-b border-gray-700 flex items-center">
          <div className="rounded-full overflow-hidden h-12 w-12 border-2 border-white flex items-center justify-center">
            {settings.picture ? (
              <img src={settings.picture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="text-4xl text-gray-500" />
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium">
              {user.given_name} {user.family_name}
            </div>
            <div className="text-xs">{capitalize(user.role)}</div>
            <div className="text-xs font-dm-serif">{userGroupInfo}</div>
          </div>
        </div>
      </Link>
      <ul className="pt-4">
        <Link to="/dashboard">
          <li className="p-4 hover:bg-primary cursor-pointer border-primary rounded flex items-center">
            <Dashboard className="mr-2" /> {t('sidebar.dashboard')}
          </li>
        </Link>
        {user.role == 'admin' && (
          <Link to="/admin">
            <div className="pt-4 pb-4 mt-4 border-t border-gray-700">
              <li className="p-4 hover:bg-primary cursor-pointer border-primary rounded flex items-center">
                <SettingsPanel className="mr-2" /> {t('sidebar.admin_panel')}
              </li>
            </div>
          </Link>
        )}
        <Link to="/analytics">
          <li className="p-4 hover:bg-primary cursor-pointer border-primary rounded flex items-center">
            <Chart className="mr-2" /> {t('sidebar.analytics')}
          </li>
        </Link>
      </ul>
    </div>
  );
};

export default Sidebar;
