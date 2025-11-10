import React from 'react';
import { PencilSquareIcon } from '@heroicons/react/20/solid';
import ApiEndpointForm from '../shared/ApiEndpointForm';
import { ApiEndpoint } from '../../types';
import { useTranslation } from 'react-i18next';

interface ApiEndpointsSectionProps {
  isEditingApi: boolean;
  apiEndpoints: ApiEndpoint[];
  newEndpoint: ApiEndpoint | null;
  newHeader: { key: string; value: string };
  updateLoading: boolean;
  updateError: string | null;
  updateSuccess: boolean;
  course: any;
  onStartEditApi: () => void;
  onCancelEditApi: () => void;
  onRemoveEndpoint: (endpoint: ApiEndpoint) => void;
  onSaveApiEndpoints: () => void;
  onAddHeader: () => void;
  onRemoveHeader: (headerKey: string) => void;
  onHeaderKeyChange: (key: string) => void;
  onHeaderValueChange: (value: string) => void;
  onEndpointChange: (endpoint: ApiEndpoint) => void;
  onStartEditEndpoint: (endpoint: ApiEndpoint) => void;
}

const getMethodColors = (method: string) => {
  switch (method) {
    case 'GET':
      return 'bg-green-100 text-green-800';
    case 'POST':
      return 'bg-blue-100 text-blue-800';
    case 'PUT':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-red-100 text-red-800';
  }
};

const ApiEndpointsSection: React.FC<ApiEndpointsSectionProps> = ({
  isEditingApi,
  apiEndpoints,
  newEndpoint,
  newHeader,
  updateLoading,
  updateError,
  updateSuccess,
  course,
  onStartEditApi,
  onCancelEditApi,
  onRemoveEndpoint,
  onSaveApiEndpoints,
  onAddHeader,
  onRemoveHeader,
  onHeaderKeyChange,
  onHeaderValueChange,
  onEndpointChange,
  onStartEditEndpoint,
}) => {
  const { t } = useTranslation();
  return (
    <div className="mb-8 bg-white p-4 rounded-md shadow-sm shadow-gray-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base/7 font-semibold text-gray-900">{t('knowledge_base_creator.api_endpoints')}</h3>
        {!isEditingApi && (
          <button
            onClick={onStartEditApi}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <PencilSquareIcon className="size-4 mr-1" />
            {t('knowledge_base_creator.edit_endpoints')}
          </button>
        )}
      </div>

      {!newEndpoint ? (
        <div className="space-y-4">
          {!course?.settings?.api_endpoints || course.settings.api_endpoints.length === 0 ? (
            <p className="text-sm text-gray-500">{t('knowledge_base_creator.no_endpoints_defined')}</p>
          ) : (
            <div className="space-y-4">
              {apiEndpoints.map(endpoint => (
                <div key={endpoint.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded text-sm ${getMethodColors(endpoint.method)}`}
                      >
                        {endpoint.method}
                      </span>
                      <span className="text-gray-600">
                        {endpoint.protocol}://{endpoint.domain}
                        {endpoint.path}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onStartEditEndpoint(endpoint)}
                        className="text-blue-600 hover:text-blue-800"
                        disabled={updateLoading}
                      >
                        {t('knowledge_base_creator.edit_endpoints')}
                      </button>
                      <button
                        onClick={() => onRemoveEndpoint(endpoint)}
                        className="text-red-600 hover:text-red-800"
                      >
                        {t('knowledge_base_creator.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <ApiEndpointForm
            endpoint={newEndpoint}
            onEndpointChange={onEndpointChange}
            onAddHeader={onAddHeader}
            onRemoveHeader={onRemoveHeader}
            headerKey={newHeader.key}
            headerValue={newHeader.value}
            onHeaderKeyChange={onHeaderKeyChange}
            onHeaderValueChange={onHeaderValueChange}
          />

          {updateSuccess && (
            <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg">
              {t('knowledge_base_creator.operation_completed_successfully')}
            </div>
          )}

          {updateError && (
            <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg">{updateError}</div>
          )}

          <div className="mt-4 flex justify-end space-x-4">
            <button
              onClick={onCancelEditApi}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={updateLoading}
            >
              {t('knowledge_base_creator.cancel')}
            </button>
            <button
              onClick={onSaveApiEndpoints}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={updateLoading}
            >
              {updateLoading ? t('knowledge_base_creator.saving') : t('knowledge_base_creator.save_changes')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiEndpointsSection;
