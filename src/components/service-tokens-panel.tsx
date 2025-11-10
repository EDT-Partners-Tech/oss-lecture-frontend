// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React, { useState, useEffect, useCallback } from 'react';
import Table from './table';
import { getServiceTokens, createServiceToken, revokeServiceToken } from '../services/api';
import { ServiceToken, ServiceTokenCreate, ServiceTokenWithSecret } from '../types';
import { useTranslation } from 'react-i18next';

interface TokenFormData {
  name: string;
  description: string;
  expires_in_days: number;
}

const initialFormData: TokenFormData = {
  name: '',
  description: '',
  expires_in_days: 30,
};

function ServiceTokensPanel() {
  const { t } = useTranslation();
  const [tokens, setTokens] = useState<ServiceToken[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<TokenFormData>(initialFormData);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [showTokenModal, setShowTokenModal] = useState(false);

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getServiceTokens();
      setTokens(data.tokens);
    } catch (error) {
      console.error('Error fetching service tokens:', error);
      setError(t('service_tokens.errors.failed_to_load'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  // Handle keyboard events for modal (document-level)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (isModalOpen || showTokenModal)) {
        handleCloseModal();
        handleCloseTokenModal();
      }
    };

    if (isModalOpen || showTokenModal) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, showTokenModal]);

  // Handle keyboard events for backdrop div (accessibility)
  const handleBackdropKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCloseModal();
    }
  };

  const handleAddNew = () => {
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleRevoke = async (token: ServiceToken) => {
    if (window.confirm(t('service_tokens.revoke_confirmation', { name: token.name }))) {
      try {
        await revokeServiceToken(token.id);
        await fetchTokens(); // Refresh the list
      } catch (error) {
        console.error('Error revoking service token:', error);
        setError(t('service_tokens.errors.failed_to_revoke'));
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormData);
    setError(null);
    setValidationErrors({});
  };

  const handleCloseTokenModal = () => {
    setShowTokenModal(false);
    setCreatedToken(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'expires_in_days' ? parseInt(value) || 0 : value,
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
    if (!formData.name.trim()) {
      errors.name = t('service_tokens.errors.name_required');
    }

    if (formData.expires_in_days <= 0) {
      errors.expires_in_days = t('service_tokens.errors.expires_in_days_invalid');
    }

    if (formData.expires_in_days > 365) {
      errors.expires_in_days = t('service_tokens.errors.expires_in_days_too_long');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    // Validate form before saving
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const tokenData: ServiceTokenCreate = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        expires_in_days: formData.expires_in_days,
      };

      const response: ServiceTokenWithSecret = await createServiceToken(tokenData);
      setCreatedToken(response.token);
      setShowTokenModal(true);
      await fetchTokens(); // Refresh the list
      handleCloseModal();
    } catch (error) {
      console.error('Error creating service token:', error);
      setError(t('service_tokens.errors.failed_to_create'));
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const copyTokenToClipboard = () => {
    if (createdToken) {
      navigator.clipboard.writeText(createdToken);
    }
  };

  const renderTokenRow = (token: ServiceToken) => (
    <tr key={token.id}>
      <td className="border px-4 py-2">{token.name}</td>
      <td className="border px-4 py-2">{token.description || '-'}</td>
      <td className="border px-4 py-2">{formatDate(token.created_at)}</td>
      <td className="border px-4 py-2">{formatDate(token.expires_at)}</td>
      <td className="border px-4 py-2">{token.last_used_at ? formatDate(token.last_used_at) : '-'}</td>
      <td className="border px-4 py-2">
        <span className={`px-2 py-1 rounded text-xs ${
          token.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {token.is_active ? t('service_tokens.active') : t('service_tokens.inactive')}
        </span>
      </td>
      <td className="border px-4 py-2">
        <button
          onClick={() => handleRevoke(token)}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
          disabled={!token.is_active}
        >
          {t('service_tokens.revoke')}
        </button>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md shadow-md mt-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-xl font-bold">{t('service_tokens.title')}</span>
          <div className="text-sm">{t('service_tokens.description')}</div>
        </div>
        {tokens.length > 0 && !loading && (
          <button
            onClick={handleAddNew}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {t('service_tokens.create_new_token')}
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
      ) : tokens.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">{t('service_tokens.no_tokens_configured')}</p>
          <button
            onClick={handleAddNew}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {t('service_tokens.create_your_first_token')}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table
            tableHead={[
              t('service_tokens.name'),
              t('service_tokens.description_field'),
              t('service_tokens.created_at'),
              t('service_tokens.expires_at'),
              t('service_tokens.last_used_at'),
              t('service_tokens.status'),
              t('service_tokens.actions')
            ]}
            data={tokens}
            renderRow={renderTokenRow}
            emptyStateMessage={t('service_tokens.no_tokens_found')}
          />
        </div>
      )}

      {/* Create Token Modal */}
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
          <div className="bg-white rounded-lg shadow-lg p-6 z-10 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">
              {t('service_tokens.create_new_service_token')}
            </h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('service_tokens.token_name')} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.name
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder={t('service_tokens.placeholders.name')}
                  required
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('service_tokens.token_description')}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('service_tokens.placeholders.description')}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('service_tokens.expires_in_days')} *
                </label>
                <input
                  type="number"
                  name="expires_in_days"
                  value={formData.expires_in_days}
                  onChange={handleInputChange}
                  min="1"
                  max="365"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.expires_in_days
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  required
                />
                {validationErrors.expires_in_days && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.expires_in_days}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  {t('service_tokens.expires_in_days_help')}
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                disabled={saving}
              >
                {t('service_tokens.cancel')}
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? t('service_tokens.creating') : t('service_tokens.create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show Token Modal */}
      {showTokenModal && createdToken && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50" />
          <div className="bg-white rounded-lg shadow-lg p-6 z-10 max-w-lg w-full mx-4">
            <h2 className="text-lg font-semibold mb-4 text-green-600">
              {t('service_tokens.token_created_successfully')}
            </h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    {t('service_tokens.important_notice')}
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>{t('service_tokens.token_warning')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('service_tokens.your_token')}
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={createdToken}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 font-mono text-sm"
                />
                <button
                  onClick={copyTokenToClipboard}
                  className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 text-sm"
                >
                  {t('service_tokens.copy')}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleCloseTokenModal}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                {t('service_tokens.understood')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceTokensPanel;
