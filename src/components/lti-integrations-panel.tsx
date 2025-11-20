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

import React, { useState, useEffect, useCallback } from 'react';
import Table from './table';
import { getLTIPlatforms, createLTIPlatform, updateLTIPlatform, deleteLTIPlatform } from '../services/api';
import { LTIPlatform } from '../types';
import { useTranslation } from 'react-i18next';

interface LTIFormData {
  client_id: string;
  issuer: string;
  platform_type: string;
  auth_login_url: string;
  auth_token_url: string;
  key_set_url: string;
  deployment_ids: string;
}

const initialFormData: LTIFormData = {
  client_id: '',
  issuer: '',
  platform_type: 'moodle',
  auth_login_url: '',
  auth_token_url: '',
  key_set_url: '',
  deployment_ids: '',
};

function LTIIntegrationsPanel() {
  const { t } = useTranslation();
  const [integrations, setIntegrations] = useState<LTIPlatform[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<LTIPlatform | null>(null);
  const [formData, setFormData] = useState<LTIFormData>(initialFormData);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const fetchIntegrations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLTIPlatforms();
      setIntegrations(data);
    } catch (error) {
      console.error('Error fetching LTI platforms:', error);
      setError(t('lti_integrations.errors.failed_to_load'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  // Handle keyboard events for modal (document-level)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  // Handle keyboard events for backdrop div (accessibility)
  const handleBackdropKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCloseModal();
    }
  };

  const handleAddNew = () => {
    setEditingIntegration(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleEdit = (integration: LTIPlatform) => {
    setEditingIntegration(integration);
    setFormData({
      client_id: integration.client_id,
      issuer: integration.issuer,
      platform_type: integration.platform_type,
      auth_login_url: integration.auth_login_url,
      auth_token_url: integration.auth_token_url,
      key_set_url: integration.key_set_url,
      deployment_ids: integration.deployment_ids.join(', '),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (integration: LTIPlatform) => {
    if (window.confirm(t('lti_integrations.delete_confirmation', { issuer: integration.issuer }))) {
      try {
        await deleteLTIPlatform(integration.client_id);
        await fetchIntegrations(); // Refresh the list
      } catch (error) {
        console.error('Error deleting LTI platform:', error);
        setError(t('lti_integrations.errors.failed_to_delete'));
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIntegration(null);
    setFormData(initialFormData);
    setError(null);
    setValidationErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Required field validation
    if (!formData.client_id.trim()) {
      errors.client_id = t('lti_integrations.errors.client_id_required');
    }

    if (!formData.issuer.trim()) {
      errors.issuer = t('lti_integrations.errors.issuer_required');
    }

    if (!formData.platform_type.trim()) {
      errors.platform_type = t('lti_integrations.errors.platform_type_required');
    }

    if (!formData.auth_login_url.trim()) {
      errors.auth_login_url = t('lti_integrations.errors.auth_login_url_required');
    } else if (!isValidURL(formData.auth_login_url)) {
      errors.auth_login_url = t('lti_integrations.errors.invalid_url');
    }

    if (!formData.auth_token_url.trim()) {
      errors.auth_token_url = t('lti_integrations.errors.auth_token_url_required');
    } else if (!isValidURL(formData.auth_token_url)) {
      errors.auth_token_url = t('lti_integrations.errors.invalid_url');
    }

    if (!formData.key_set_url.trim()) {
      errors.key_set_url = t('lti_integrations.errors.key_set_url_required');
    } else if (!isValidURL(formData.key_set_url)) {
      errors.key_set_url = t('lti_integrations.errors.invalid_url');
    }

    if (!formData.deployment_ids.trim()) {
      errors.deployment_ids = t('lti_integrations.errors.deployment_ids_required');
    } else {
      const deploymentIds = formData.deployment_ids
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);
      
      if (deploymentIds.length === 0) {
        errors.deployment_ids = t('lti_integrations.errors.deployment_ids_required');
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidURL = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    // Validate form before saving
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // Convert form data to the proper format
      const deploymentIds = formData.deployment_ids
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);

      if (editingIntegration) {
        // Update existing integration - only send updatable fields
        const updateData = {
          auth_login_url: formData.auth_login_url,
          auth_token_url: formData.auth_token_url,
          key_set_url: formData.key_set_url,
          deployment_ids: deploymentIds,
        };
        await updateLTIPlatform(editingIntegration.client_id, updateData);
      } else {
        // Add new integration - send all fields
        const platformData: LTIPlatform = {
          client_id: formData.client_id,
          issuer: formData.issuer,
          platform_type: formData.platform_type,
          auth_login_url: formData.auth_login_url,
          auth_token_url: formData.auth_token_url,
          key_set_url: formData.key_set_url,
          deployment_ids: deploymentIds,
        };
        await createLTIPlatform(platformData);
      }
      await fetchIntegrations(); // Refresh the list
      handleCloseModal();
    } catch (error) {
      console.error('Error saving LTI platform:', error);
      setError(t('lti_integrations.errors.failed_to_save'));
    } finally {
      setSaving(false);
    }
  };

  const renderIntegrationRow = (integration: LTIPlatform) => (
    <tr key={integration.client_id}>
      <td className="border px-4 py-2">{integration.issuer}</td>
      <td className="border px-4 py-2 capitalize">{integration.platform_type}</td>
      <td className="border px-4 py-2">{integration.client_id}</td>
      <td className="border px-4 py-2">{integration.deployment_ids.join(', ')}</td>
      <td className="border px-4 py-2">
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(integration)}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
          >
            {t('lti_integrations.edit')}
          </button>
          <button
            onClick={() => handleDelete(integration)}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
          >
            {t('lti_integrations.delete')}
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md shadow-md mt-4">
      <div className="flex justify-between items-center mb-4">
        <div>
            <span className="text-xl font-bold">{t('lti_integrations.title')}</span>
            <div className="text-sm">{t('lti_integrations.description')}</div>
        </div>
        {integrations.length > 0 && !loading && (
          <button
            onClick={handleAddNew}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {t('lti_integrations.add_new_integration')}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right font-bold cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : integrations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">{t('lti_integrations.no_integrations_configured')}</p>
          <button
            onClick={handleAddNew}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {t('lti_integrations.add_your_first_integration')}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table
            tableHead={['Issuer', 'Type', 'Client ID', 'Deployment IDs', 'Actions']}
            data={integrations}
            renderRow={renderIntegrationRow}
            emptyStateMessage={t('lti_integrations.no_integrations_found')}
          />
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div 
            className="fixed inset-0 bg-black opacity-50" 
            onClick={handleCloseModal} 
            onKeyDown={handleBackdropKeyDown}
            tabIndex={0}
            role="button"
            aria-label="Close modal"
          />
          <div className="bg-white rounded-lg shadow-lg p-6 z-10 max-w-2xl w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">
              {editingIntegration ? t('lti_integrations.edit_lti_integration') : t('lti_integrations.add_new_lti_integration')}
            </h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('lti_integrations.client_id')} *
                </label>
                <input
                  type="text"
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.client_id
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  } ${editingIntegration ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder={t('lti_integrations.placeholders.client_id')}
                  disabled={!!editingIntegration}
                  required
                />
                {validationErrors.client_id && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.client_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('lti_integrations.issuer')} *
                </label>
                <input
                  type="text"
                  name="issuer"
                  value={formData.issuer}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.issuer
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  } ${editingIntegration ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder={t('lti_integrations.placeholders.issuer')}
                  disabled={!!editingIntegration}
                  required
                />
                {validationErrors.issuer && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.issuer}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('lti_integrations.platform_type')} *
                </label>
                <select
                  name="platform_type"
                  value={formData.platform_type}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.platform_type
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  } ${editingIntegration ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={!!editingIntegration}
                  required
                >
                  <option value="moodle">Moodle</option>
                  <option value="canvas">Canvas</option>
                  <option value="blackboard">Blackboard</option>
                </select>
                {validationErrors.platform_type && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.platform_type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('lti_integrations.auth_login_url')} *
                </label>
                <input
                  type="url"
                  name="auth_login_url"
                  value={formData.auth_login_url}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.auth_login_url
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder={t('lti_integrations.placeholders.auth_login_url')}
                  required
                />
                {validationErrors.auth_login_url && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.auth_login_url}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('lti_integrations.auth_token_url')} *
                </label>
                <input
                  type="url"
                  name="auth_token_url"
                  value={formData.auth_token_url}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.auth_token_url
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder={t('lti_integrations.placeholders.auth_token_url')}
                  required
                />
                {validationErrors.auth_token_url && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.auth_token_url}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('lti_integrations.key_set_url')} *
                </label>
                <input
                  type="url"
                  name="key_set_url"
                  value={formData.key_set_url}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.key_set_url
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder={t('lti_integrations.placeholders.key_set_url')}
                  required
                />
                {validationErrors.key_set_url && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.key_set_url}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('lti_integrations.deployment_ids')} *
                </label>
                <input
                  type="text"
                  name="deployment_ids"
                  value={formData.deployment_ids}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.deployment_ids
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder={t('lti_integrations.placeholders.deployment_ids')}
                  required
                />
                {validationErrors.deployment_ids && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.deployment_ids}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                disabled={saving}
              >
                {t('lti_integrations.cancel')}
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? t('lti_integrations.saving') : editingIntegration ? t('lti_integrations.update') : t('lti_integrations.add')} Integration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LTIIntegrationsPanel;