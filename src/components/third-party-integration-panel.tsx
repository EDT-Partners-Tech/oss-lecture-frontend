// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React, { useState, useEffect } from 'react';
import { showToast } from '../services/toastService';
import { thirdPartyIntegrationService } from '../services/api';
import { Edit, Delete, Save, Close } from '../images/icons';
import { toTitleCase } from '../lib/utils';
import { t } from 'i18next';

interface ServiceConfig {
  serviceId: string;
  config: Record<string, string>;
}

interface ServiceConfigPanelProps {
  service: {
    id: string;
    name: string;
    description?: string;
    code?: string;
    isknowledgebase?: boolean;
  };
  initialConfig: Record<string, string>;
  onSave: (config: ServiceConfig) => Promise<void>;
  groupId: string;
}

const ThirdPartyIntegrationPanel: React.FC<ServiceConfigPanelProps> = ({
  service,
  initialConfig,
  onSave,
  groupId,
}) => {
  const [config, setConfig] = useState<Record<string, string>>(initialConfig);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [integrationId, setIntegrationId] = useState<string | null>(null);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  useEffect(() => {
    let isMounted = true;
    const fetchIntegration = async () => {
      try {
        const integration = await thirdPartyIntegrationService.getIntegrationByService(service.id);
        if (isMounted && integration) {
          setIntegrationId(integration.id);
          setConfig(integration.service_value || {});
        }
      } catch (error) {
        console.error(t('admin_panel.error_fetching_integration'), error);
      }
    };

    fetchIntegration();
    return () => {
      isMounted = false;
    };
  }, [groupId, service.id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (integrationId) {
        await thirdPartyIntegrationService.updateIntegration(integrationId, {
          service_value: config,
          service_name: service.id,
        });
      }
      await onSave({ serviceId: service.id, config });
      showToast('success', t('admin_panel.configuration_saved_successfully'));
      setIsEditing(false);
    } catch (error) {
      showToast('error', t('admin_panel.failed_to_save_configuration'));
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!integrationId) return;

    try {
      await thirdPartyIntegrationService.deleteIntegration(integrationId);
      showToast('success', t('admin_panel.integration_deleted_successfully'));
      setConfig({});
      setIntegrationId(null);
    } catch (error) {
      showToast('error', t('admin_panel.failed_to_delete_integration'));
      console.error(error);
    }
  };

  // Get config fields from current config
  const configFields = Object.keys(config).map(key => ({
    key,
    label: key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    type: 'text',
  }));

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-800">{toTitleCase(service.name)}</h3>
          {!isEditing && (
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full ${
                  Object.values(config).every(v => v && v.trim() !== '')
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}
                title={
                  Object.values(config).every(v => v && v.trim() !== '')
                    ? t('admin_panel.configured')
                    : t('admin_panel.not_configured')
                }
              />
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-600 hover:text-blue-500 transition-colors rounded-full hover:bg-gray-100"
                title={t('admin_panel.edit_configuration')}
              >
                <Edit className="w-5 h-5" />
              </button>
              {integrationId && (
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-600 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100"
                  title={t('admin_panel.delete_integration')}
                >
                  <Delete className="w-5 h-5" />
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setConfig(initialConfig);
                }}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100"
                disabled={isSaving}
                title={t('admin_panel.cancel')}
              >
                <Close className="w-5 h-5" />
              </button>
              <button
                onClick={handleSave}
                className="p-2 text-gray-600 hover:text-green-500 transition-colors rounded-full hover:bg-gray-100"
                disabled={isSaving}
                title={t('admin_panel.save')}
              >
                <Save className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {configFields.map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                type={field.type}
                value={config[field.key] || ''}
                onChange={e => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {configFields.map(field => (
            <div key={field.key} className="flex justify-between items-center py-1">
              <span className="text-sm font-medium text-gray-600">{field.label}:</span>
              <span className="text-sm text-gray-500">
                {config[field.key] || t('admin_panel.not_configured')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThirdPartyIntegrationPanel;
