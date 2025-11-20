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
import { Upload, Delete } from '../images/icons';
import { showToast } from '../services/toastService';
import { UserData } from '../types';
import { removeGroupLogo, uploadGroupLogo } from '../services/api';
import { getUserData } from '../authentication/authService';
import Dialog from './dialog';
import GroupLogo from './logo';
import { t } from 'i18next';

interface LogoUploaderProps {
  user: UserData;
  setUser: (user: UserData) => void;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ user, setUser }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const handleDrag = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('error', t('admin_panel.only_image_files_allowed'));
      return;
    }

    // Validate file size (2MB = 2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) {
      showToast('error', t('admin_panel.file_must_not_exceed_2mb'));
      return;
    }

    const formData = new FormData();
    formData.append('logo', file);
    try {
      await uploadGroupLogo(formData, user.group.id);
      const updatedUserData = await getUserData();
      setUser(updatedUserData);
      showToast('success', t('admin_panel.logo_updated_successfully'));
    } catch (error) {
      console.error(t('admin_panel.error_updating_logo'), error);
      showToast('error', t('admin_panel.error_updating_logo'));
    }
  };

  const handleRemoveLogo = async () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await removeGroupLogo(user.group.id);
      const updatedUserData = await getUserData();
      setUser(updatedUserData);
      showToast('success', t('admin_panel.logo_removed_successfully'));
    } catch (error) {
      console.error(t('admin_panel.error_removing_logo'), error);
      showToast('error', t('admin_panel.error_removing_logo'));
    }
    setShowDeleteDialog(false);
  };

  return (
    <div className="mb-6">
      {showDeleteDialog && (
        <Dialog
          title={t('admin_panel.remove_group_logo')}
          description={t('admin_panel.are_you_sure_you_want_to_remove_the_group_logo')}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
          confirmText={t('admin_panel.remove')}
          cancelText={t('admin_panel.cancel')}
        />
      )}
      <label htmlFor="logo-container" className="font-bold mr-2 text-lg block mb-4">
        {t('admin_panel.group_logo')}
      </label>
      <div className="flex items-center space-x-6">
        <div
          id="logo-container"
          className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden flex items-center justify-center bg-gray-500"
        >
          <GroupLogo />
          <button
            onClick={handleRemoveLogo}
            className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1">
          <label
            htmlFor="logo-upload"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ease-in-out ${
              isDragging
                ? 'border-blue-500 bg-blue-50 scale-105 shadow-lg'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDrag}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload
                className={`w-8 h-8 mb-2 transition-colors duration-200 ${
                  isDragging ? 'text-blue-500' : 'text-gray-400'
                }`}
              />
              <p className="mb-2 text-sm text-gray-500 transition-all duration-200">
                {isDragging ? (
                  <span className="font-semibold text-blue-500 animate-pulse">
                    {t('admin_panel.drop_the_file_here_to_save_it')}
                  </span>
                ) : (
                  <>
                    <span className="font-semibold">{t('admin_panel.click_to_upload')}</span> {t('admin_panel.or_drag_and_drop')}
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500 transition-opacity duration-200">
                {isDragging ? (
                  <span className="text-blue-500">
                    {t('admin_panel.only_image_files_allowed')}
                  </span>
                ) : (
                  t('admin_panel.only_image_files_allowed')
                )}
              </p>
            </div>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default LogoUploader;
