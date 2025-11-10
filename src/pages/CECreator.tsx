import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout';
import FileUpload from '../components/file-upload';
import {
  uploadComparisonFiles,
  fetchComparisonEngineRulesData,
  createComparisonEngine,
} from '../services/api';
import { showToast } from '../services/toastService';
import { ComparisonEngineCreateRequest } from '../types';
import { languages } from '../data/countriesData';
import ModelSelector from '../components/model-selector';
import { useTranslation } from 'react-i18next';

const ComparisonEngineCreator: React.FC = () => {
  const { t } = useTranslation();
  const { type } = useParams<{ type: string }>();
  const [files, setFiles] = React.useState<File[]>([]);
  const [name, setName] = React.useState<string>('');
  const [title, setTitle] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [rules, setRules] = React.useState<any[]>([]);
  const [rule, setRule] = React.useState<any>({});
  const [language, setLanguage] = React.useState<string>('en');
  const [selectedModel, setSelectedModel] = useState<string>(
    'anthropic.claude-3-5-sonnet-20240620-v1:0'
  );
  const navigate = useNavigate();

  const setCapitalTitle = useCallback(() => {
    if (type) {
      // Set capitalized title based on type
      const capitalizedTitle = type.charAt(0).toUpperCase() + type.slice(1);
      setTitle(capitalizedTitle);
    }
  }, [type]);

  const fetchComparisonsRulesData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchComparisonEngineRulesData(type ?? 'resume');
      setRules(data);
    } catch (error) {
      console.error('Error fetching comparisons:', error);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    setCapitalTitle();
    fetchComparisonsRulesData();
  }, [setCapitalTitle, fetchComparisonsRulesData]);

  const handleBack = () => {
    navigate(`/comparison-engine/${type}`);
  };

  const getDate = () => {
    const now = new Date();
    const formattedDate = now
      .toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .replace(/,/g, '');
    return formattedDate;
  };

  const currentPathWithQuery = () => {
    // Get current path with all query parameters
    const currentPath = window.location.pathname;
    const currentSearchParams = new URLSearchParams(window.location.search);
    const currentQueryString = currentSearchParams.toString();
    const currentPathWithQuery = `${currentPath}?${currentQueryString}`;
    // Remove the last "?" if it exists
    if (currentPathWithQuery.endsWith('?')) {
      return currentPathWithQuery.slice(0, -1);
    }

    return `${decodeURIComponent(currentPathWithQuery)}`.replace('source=', 'pre_source=');
  };

  const handleFileChange = (e: any) => {
    if (!e) return;
    const uploadedFiles = Array.from(e.target.files || []);
    if (files.length + uploadedFiles.length > 2) {
      showToast('error', t('comparison_engine.you_can_only_upload_a_maximum_of_2_files'));
      return;
    }
    setFiles((uploadedFiles as File[]).concat(files));
    e.target.value = null; // Clear the input value
  };

  const clearFiles = (index?: number) => {
    if (index !== undefined) {
      setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
      return;
    }
    setFiles([]);
  };

  const handleRulesManager = () => {
    navigate(`/comparison-engine/rules?type=${type}&source=${currentPathWithQuery()}`);
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Normalize name and description
    const regex = /\s+/g;
    let normalizedName = name.replace(regex, ' ');
    let normalizedDescription = description.replace(regex, ' ');
    normalizedName = normalizedName.trim();
    normalizedDescription = normalizedDescription.trim();
    setName(normalizedName);
    setDescription(normalizedDescription);

    try {
      if (!files || files.length < 2) {
        showToast('error', t('comparison_engine.please_upload_2_files'));
        setLoading(false);
        return;
      }

      if (!normalizedName || normalizedName.length < 2) {
        showToast('error', t('comparison_engine.please_enter_a_name_2_characters_minimum'));
        setLoading(false);
        return;
      }
      if (!normalizedDescription || normalizedDescription.length < 2) {
        showToast('error', t('comparison_engine.please_enter_a_description_2_characters_minimum'));
        setLoading(false);
        return;
      }

      if (!language) {
        showToast('error', t('comparison_engine.please_select_a_language'));
        setLoading(false);
        return;
      }

      const formData = new FormData();
      files.forEach(file => {
        if (file) {
          formData.append('files', file);
        }
      });

      const preComparisonData = await uploadComparisonFiles(formData);

      if (
        !preComparisonData?.process_id ||
        !preComparisonData?.files?.length ||
        preComparisonData.files.length < 2
      ) {
        showToast('error', t('comparison_engine.failed_to_upload_files_please_try_again'));
        setLoading(false);
        return;
      }

      const comparisonEngineCreate: ComparisonEngineCreateRequest = {
        process_id: preComparisonData.process_id,
        name: normalizedName || `Comparison ${getDate()}`,
        description: normalizedDescription || getDate(),
        document1_id: preComparisonData.files[0]?.id || '',
        document2_id: preComparisonData.files[1]?.id || '',
        rules_ids: rule?.id ? [rule.id] : [],
        config_id: '',
        language: language,
        model: selectedModel || 'anthropic.claude-3-5-sonnet-20240620-v1:0',
      };

      const comparisonResponse = await createComparisonEngine(
        comparisonEngineCreate,
        type ?? 'resume'
      );

      if (!comparisonResponse) {
        showToast('error', t('comparison_engine.failed_to_create_comparison_please_try_again'));
        setLoading(false);
        return;
      }

      showToast('success', t('comparison_engine.comparison_created_successfully'));
      navigate(`/comparison-engine/${type}/view/${preComparisonData.process_id}`);
    } catch (error) {
      showToast('error', t('comparison_engine.an_unexpected_error_occurred_please_try_again'));
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return t('comparison_engine.comparing');
    if (!files.length) return t('comparison_engine.remaining_2_files');
    return files.length === 1 ? t('comparison_engine.remaining_1_file') : t('comparison_engine.compare');
  };

  return (
    <Layout title={`${t('comparison_engine.title')} ${title}`}>
      <div className="">
        <div className="flex items-center justify-between mb-4">
          <button
            className="px-4 py-2 text-blue-500 border border-blue-500 rounded hover:bg-blue-50"
            onClick={handleBack}
          >
            {t('comparison_engine.back')}
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors ml-auto"
            onClick={handleRulesManager}
          >
            {t('comparison_engine.rules_manager')}
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md h-full w-full max-w-full p-4">
          <div className="w-full flex justify-end mb-4">
            <ModelSelector
              value={selectedModel}
              onChange={modelId => setSelectedModel(modelId)}
              defaultModel="anthropic.claude-3-5-sonnet-20240620-v1:0"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              {t('comparison_engine.name')}:
            </label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder={t('comparison_engine.enter_comparison_name')}
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
              {t('comparison_engine.description')}:
            </label>
            <textarea
              id="description"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder={t('comparison_engine.enter_comparison_description')}
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <div className="mb-4">
              <label htmlFor="rule" className="block text-gray-700 text-sm font-bold mb-2">
                {t('comparison_engine.rule')}:
              </label>
              <select
                id="rule"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                onChange={e => {
                  const selectedRule = rules.find(rule => rule.id === e.target.value);
                  setRule(selectedRule || {});
                }}
                value={rule?.id || ''}
              >
                <option value="">{t('comparison_engine.select_a_rule')}</option>
                {rules.map(rule => (
                  <option key={rule.id} value={rule.id}>
                    {`${rule.name} - ${rule.description}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div className="mb-4">
              <label htmlFor="language" className="block text-gray-700 text-sm font-bold mb-2">
                    {t('comparison_engine.language')}:
              </label>
              <select
                id="language"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={language}
                onChange={e => setLanguage(e.target.value)}
              >
                {Object.entries(languages).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <FileUpload
            handleFileChange={handleFileChange}
            files={files}
            formats={['txt', 'docx', 'pdf']}
            text={t('comparison_engine.drag_and_drop_files_here_or_click_to_select_files')}
            clearFile={clearFiles}
            multiple
            className="mb-4"
            disabled={loading || files.length >= 2}
          />
          <div className="flex items-center w-full justify-end">
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center"
              disabled={loading || files.length !== 2}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {getButtonText()}
                </>
              ) : (
                getButtonText()
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ComparisonEngineCreator;
