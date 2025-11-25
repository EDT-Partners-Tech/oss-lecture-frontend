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

import React from 'react';
import { ApiEndpoint } from '../../types';
import { useTranslation } from 'react-i18next';

interface ApiEndpointFormProps {
  endpoint: ApiEndpoint;
  onEndpointChange: (endpoint: ApiEndpoint) => void;
  onAddHeader: () => void;
  onRemoveHeader: (headerKey: string) => void;
  headerKey: string;
  headerValue: string;
  onHeaderKeyChange: (key: string) => void;
  onHeaderValueChange: (value: string) => void;
}

const ApiEndpointForm: React.FC<ApiEndpointFormProps> = ({
  endpoint,
  onEndpointChange,
  onAddHeader,
  onRemoveHeader,
  headerKey,
  headerValue,
  onHeaderKeyChange,
  onHeaderValueChange,
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">
            {t('knowledge_base_creator.method')}
          </label>
          <select
            id="method"
            value={endpoint.method}
            onChange={e => onEndpointChange({ ...endpoint, method: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {['GET'].map(method => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="protocol" className="block text-sm font-medium text-gray-700 mb-1">
            {t('knowledge_base_creator.protocol')}
          </label>
          <select
            id="protocol"
            value={endpoint.protocol}
            onChange={e => onEndpointChange({ ...endpoint, protocol: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {['http', 'https'].map(protocol => (
              <option key={protocol} value={protocol}>
                {protocol}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
          {t('knowledge_base_creator.domain')}
        </label>
        <input
          id="domain"
          type="text"
          value={endpoint.domain}
          onChange={e => onEndpointChange({ ...endpoint, domain: e.target.value })}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="api.example.com"
        />
      </div>

      <div>
        <label htmlFor="path" className="block text-sm font-medium text-gray-700 mb-1">
          {t('knowledge_base_creator.path')}
        </label>
        <input
          id="path"
          type="text"
          value={endpoint.path}
          onChange={e => onEndpointChange({ ...endpoint, path: e.target.value })}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="/v1/resources"
        />
      </div>

      <div>
        <label htmlFor="queryParams" className="block text-sm font-medium text-gray-700 mb-1">
          {t('knowledge_base_creator.query_parameters')}
        </label>
        <input
          id="queryParams"
          type="text"
          value={endpoint.query_params?.join('&') || ''}
          onChange={e =>
            onEndpointChange({
              ...endpoint,
              query_params: e.target.value ? e.target.value.split('&') : [],
            })
          }
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="param1=value1&param2=value2"
        />
      </div>

      <div>
        <label htmlFor="headerKey" className="block text-sm font-medium text-gray-700 mb-1">
          {t('knowledge_base_creator.headers')}
        </label>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <input
              id="headerKey"
              type="text"
              value={headerKey}
              onChange={e => onHeaderKeyChange(e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={t('knowledge_base_creator.header_name')}
            />
            <input
              type="text"
              value={headerValue}
              onChange={e => onHeaderValueChange(e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={t('knowledge_base_creator.header_value')}
            />
            <button
              onClick={onAddHeader}
              disabled={!headerKey || !headerValue}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              {t('knowledge_base_creator.add')}
            </button>
          </div>
          {Object.entries(endpoint.headers || {}).length > 0 && (
            <div className="mt-2">
              <h4 className="text-xs font-medium text-gray-500 mb-1">{t('knowledge_base_creator.current_headers')}</h4>
              <ul className="space-y-1">
                {Object.entries(endpoint.headers || {}).map(([key, value]) => (
                  <li
                    key={key}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-sm text-sm"
                  >
                    <span className="text-gray-700">
                      <span className="font-medium">{key}:</span> {value}
                    </span>
                    <button
                      onClick={() => onRemoveHeader(key)}
                      className="rounded-sm bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                    >
                      {t('knowledge_base_creator.delete')}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiEndpointForm;
