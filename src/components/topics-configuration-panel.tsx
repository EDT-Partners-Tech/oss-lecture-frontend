import React, { useState, useEffect, useCallback } from 'react';
import { 
  getTopicsConfiguration,
  createTopicsConfiguration,
  updateTopicsConfiguration,
  deleteTopicsConfiguration,
  triggerTopicsAnalysis
} from '../services/api';
import { TopicsConfiguration, TopicsConfigurationDB } from '../types';
import { useTranslation } from 'react-i18next';
import { showToast } from '../services/toastService';

const initialFormData: TopicsConfiguration = {
  overwrite: true,
  max_supertopics: 20,
};

function TopicsConfigurationPanel() {
  const { t } = useTranslation();
  const [configuration, setConfiguration] = useState<TopicsConfigurationDB | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<TopicsConfiguration>(initialFormData);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [triggeringAnalysis, setTriggeringAnalysis] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const fetchConfiguration = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTopicsConfiguration();
      setConfiguration(data);
    } catch (error: any) {
      console.error('Error fetching topics configuration:', error);
      const errorMessage = t('topics_configuration.errors.failed_to_load');
      setError(errorMessage);
      showToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchConfiguration();
  }, [fetchConfiguration]);

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

  const handleCreate = () => {
    setIsEditing(false);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    if (!configuration) return;
    setIsEditing(true);
    setFormData(configuration.configuration);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!configuration) return;
    
    if (window.confirm(t('topics_configuration.delete_confirmation'))) {
      try {
        await deleteTopicsConfiguration();
        await fetchConfiguration();
        showToast('success', t('topics_configuration.messages.deleted_successfully'));
      } catch (error) {
        console.error('Error deleting topics configuration:', error);
        const errorMessage = t('topics_configuration.errors.failed_to_delete');
        setError(errorMessage);
        showToast('error', errorMessage);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormData);
    setError(null);
    setValidationErrors({});
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value,
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

    if (formData.max_supertopics <= 0) {
      errors.max_supertopics = t('topics_configuration.errors.max_supertopics_positive');
    }

    if (formData.max_supertopics > 100) {
      errors.max_supertopics = t('topics_configuration.errors.max_supertopics_limit');
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
      if (isEditing) {
        await updateTopicsConfiguration(formData);
        showToast('success', t('topics_configuration.messages.updated_successfully'));
      } else {
        await createTopicsConfiguration(formData);
        showToast('success', t('topics_configuration.messages.created_successfully'));
      }
      await fetchConfiguration();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving topics configuration:', error);
      let errorMessage = t('topics_configuration.errors.failed_to_save');
      
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('already exists')) {
        errorMessage = t('topics_configuration.errors.configuration_exists');
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerAnalysis = async () => {
    if (!configuration) {
      setError(t('topics_configuration.errors.no_configuration_for_analysis'));
      return;
    }

    setTriggeringAnalysis(true);
    setError(null);
    try {
      const result = await triggerTopicsAnalysis();
      setError(null);
      showToast(
        'success', 
        `${t('topics_configuration.analysis_triggered_successfully')} (Task ID: ${result.etl_task_id})`
      );
    } catch (error: any) {
      console.error('Error triggering topics analysis:', error);
      let errorMessage = t('topics_configuration.errors.failed_to_trigger_analysis');
      
      if (error.response?.status === 400 && error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.status === 403) {
        errorMessage = t('topics_configuration.errors.not_authorized_analysis');
      }
      
      setError(errorMessage);
      showToast('error', errorMessage);
    } finally {
      setTriggeringAnalysis(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md mt-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-xl font-bold">{t('topics_configuration.title')}</span>
          <div className="text-sm text-gray-600">{t('topics_configuration.description')}</div>
        </div>
        
        {!loading && (
          <div className="flex space-x-2">
            {configuration && (
              <>
                <button
                  onClick={handleTriggerAnalysis}
                  disabled={triggeringAnalysis}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {triggeringAnalysis ? t('topics_configuration.triggering_analysis') : t('topics_configuration.trigger_analysis')}
                </button>
                <button
                  onClick={handleEdit}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {t('topics_configuration.edit_configuration')}
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  {t('topics_configuration.delete_configuration')}
                </button>
              </>
            )}
          </div>
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
      ) : configuration ? (
        <div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2">{t('topics_configuration.current_configuration')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">{t('topics_configuration.overwrite')}:</span>
                <span className="ml-2 font-semibold">
                  {configuration.configuration.overwrite ? t('topics_configuration.yes') : t('topics_configuration.no')}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('topics_configuration.max_supertopics')}:</span>
                <span className="ml-2 font-semibold">{configuration.configuration.max_supertopics}</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {t('topics_configuration.created_at')}: {new Date(configuration.created_at).toLocaleString()}
              {configuration.updated_at !== configuration.created_at && (
                <span className="ml-4">
                  {t('topics_configuration.updated_at')}: {new Date(configuration.updated_at).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500 mb-4">{t('topics_configuration.no_configuration')}</p>
          <button
            onClick={handleCreate}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {t('topics_configuration.create_first_configuration')}
          </button>
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
          <div className="bg-white rounded-lg shadow-lg p-6 z-10 max-w-lg w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? t('topics_configuration.edit_topics_configuration') : t('topics_configuration.create_topics_configuration')}
            </h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="overwrite"
                  name="overwrite"
                  checked={formData.overwrite}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="overwrite" className="ml-2 block text-sm text-gray-700">
                  {t('topics_configuration.overwrite_existing')}
                </label>
              </div>
              <div className="text-xs text-gray-500">
                {t('topics_configuration.overwrite_help')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('topics_configuration.max_supertopics')} *
                </label>
                <input
                  type="number"
                  name="max_supertopics"
                  value={formData.max_supertopics}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.max_supertopics
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  {t('topics_configuration.max_supertopics_help')}
                </div>
                {validationErrors.max_supertopics && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.max_supertopics}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                disabled={saving}
              >
                {t('topics_configuration.cancel')}
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? t('topics_configuration.saving') : isEditing ? t('topics_configuration.update') : t('topics_configuration.create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TopicsConfigurationPanel; 