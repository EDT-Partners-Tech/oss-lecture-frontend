import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/layout';
import { getUserData, updateUserData } from '../authentication/authService';
import { Group, UserData } from '../types';
import { showToast } from '../services/toastService';
import { uploadProfileLogo } from '../services/api';
import { useSettings } from '../contexts/useSettings';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { AuthContext } from '../authentication/authContext';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../services/i18n';

const Profile: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { setUser } = React.useContext(AuthContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProfilePictureChanged, setIsProfilePictureChanged] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<UserData>({
    user_id: '',
    locale: '',
    email: '',
    given_name: '',
    family_name: '',
    picture: settings.picture,
    'custom:avatar': settings.picture,
    role: '',
    group: {} as Group,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const { i18n, t } = useTranslation();

  const fetchUserData = async () => {
    const userData = await getUserData();
    setProfileData(userData);
  };

  const updateSettingsPicture = async () => {
    updateSettings({
      picture: profileData.picture,
    });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfileData({ ...profileData, [id]: value });
  };

  const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    setProfileData({ ...profileData, locale: newLocale });
    changeLanguage(newLocale);
  };

  const handleProfileImageChange = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('error', t('profile.only_image_files_allowed'));
      return;
    }

    // Validate file size (2MB = 2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) {
      showToast('error', t('profile.file_must_not_exceed_2mb'));
      return;
    }

    const formData = new FormData();
    formData.append('logo', file);
    try {
      const response = await uploadProfileLogo(formData);

      // Update the profile data
      const updatedData = {
        ...profileData,
        picture: response.presigned_url,
        'custom:avatar': response.logo_s3_uri,
      };

      // Update the state
      setProfileData(updatedData);

      setIsProfilePictureChanged(true);
    } catch (error) {
      console.error(t('profile.error_updating_logo'), error);
      showToast('error', t('profile.error_updating_logo'));
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) {
      handleProfileImageChange(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProfileImageChange(file);
    }
  };

  const handleSave = async () => {
    try {
      await updateUserData(profileData, isProfilePictureChanged);
      setIsProfilePictureChanged(false);
      
      // Fetch the updated user data
      const updatedUserData = await getUserData();
      setProfileData(updatedUserData);
      
      // Update the authentication context
      setUser(updatedUserData);
      
      // Update the settings picture
      updateSettingsPicture();

      // Actualizar i18n con el nuevo idioma después de guardar
      i18n.changeLanguage(profileData.locale.split('-')[0]);
    } catch (error) {
      showToast('error', t('profile.error_updating_profile_data'));
      console.error(t('profile.error_updating_profile_data'), error);
    }
  };

  return (
    <Layout title={t('profile.title')}>
      <div className="divide-y divide-gray-900/10">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base/7 font-semibold text-gray-900">{t('profile.title')}</h2>
          </div>

          <form className="bg-white shadow-xs ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div className="px-4 py-6 sm:p-8">
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="col-span-full">
                  <label htmlFor="photo" className="block text-sm/6 font-medium text-gray-900">
                    {t('profile.picture')}
                  </label>
                  <div className="mt-2 flex items-center gap-x-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div
                      className={`relative p-0 border-0 bg-transparent ${isDragging ? 'ring-2 ring-indigo-600' : ''}`}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleImageClick();
                        }
                      }}
                      aria-label="Drop zone for profile picture"
                    >
                      {profileData.picture ? (
                        <button
                          type="button"
                          onClick={handleImageClick}
                          className="p-0 border-0 bg-transparent"
                        >
                          <img
                            src={profileData.picture}
                            alt="Profile"
                            className="size-12 rounded-full object-cover hover:opacity-90 transition-opacity"
                          />
                        </button>
                      ) : (
                        <UserCircleIcon
                          aria-hidden="true"
                          className="size-12 text-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={handleImageClick}
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleImageClick}
                      className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                    >
                      {t('profile.change')}
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                    {t('profile.email')}
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      disabled
                      value={profileData.email}
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="given_name" className="block text-sm/6 font-medium text-gray-900">
                    {t('profile.name')}
                  </label>
                  <div className="mt-2 border border-gray-300 rounded-md grid grid-cols-1">
                    <input
                      id="given_name"
                      name="given_name"
                      type="text"
                      value={profileData.given_name}
                      onChange={handleInputChange}
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="family_name"
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    {t('profile.last_name')}
                  </label>
                  <div className="mt-2 border border-gray-300 rounded-md grid grid-cols-1">
                    <input
                      id="family_name"
                      name="family_name"
                      type="text"
                      value={profileData.family_name}
                      onChange={handleInputChange}
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="locale" className="block text-sm/6 font-medium text-gray-900">
                    {t('profile.language')}
                  </label>
                  <div className="mt-2 border border-gray-300 rounded-md grid grid-cols-1">
                    <select
                      id="locale"
                      name="locale"
                      value={profileData.locale}
                      onChange={handleLocaleChange}
                      className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    >
                      <option value="ar">العربية (Arabic)</option>
                      <option value="zh">中文 (Chinese Simplified)</option>
                      <option value="zh-TW">繁體中文 (Chinese Traditional)</option>
                      <option value="en-US">English</option>
                      <option value="fr">Français (French)</option>
                      <option value="fr-CA">Français (Canada)</option>
                      <option value="de">Deutsch (German)</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="it">Italiano (Italian)</option>
                      <option value="ja">日本語 (Japanese)</option>
                      <option value="ko">한국어 (Korean)</option>
                      <option value="pt">Português (Portuguese)</option>
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="ru">Русский (Russian)</option>
                      <option value="es">Español</option>
                      <option value="es-ES">Español (Spanish)</option>
                      <option value="es-MX">Español (México)</option>
                      <option value="tr">Türkçe (Turkish)</option>
                      <option value="ur">اردو (Urdu)</option>
                      <option value="vi">Tiếng Việt (Vietnamese)</option>
                    </select>
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
              <button
                type="button"
                onClick={handleSave}
                className="bg-green-200 hover:bg-green-400 shadow-[0_4px_14px_0_rgb(0,0,0,10%)] hover:shadow-[0_6px_20px_rgba(93,93,93,23%)] px-8 py-2 text-black rounded-sm font-light transition duration-200 ease-linear"
              >
                {t('profile.save')}
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base/7 font-semibold text-gray-900">{t('profile.additional_information')}</h2>
            <p className="mt-1 text-sm/6 text-gray-600">
              {t('profile.additional_information_description')}
            </p>
          </div>

          <div className="bg-white shadow-xs ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div className="px-4 py-6 sm:p-8">
              <div className="max-w-2xl space-y-10">
                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label htmlFor="role" className="block text-sm/6 font-medium text-gray-900">
                      {t('profile.role')}
                    </label>
                    <div className="mt-2">
                      <input
                        id="role"
                        name="role"
                        type="text"
                        disabled
                        value={profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label htmlFor="group" className="block text-sm/6 font-medium text-gray-900">
                      {t('profile.group')}
                    </label>
                    <div className="mt-2">
                      <input
                        id="group"
                        name="group"
                        type="text"
                        disabled
                        value={profileData.group?.name || ''}
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;