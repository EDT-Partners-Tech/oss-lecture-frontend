import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createFileFromMarkdown, fetchComparisonEngineData } from '../services/api';
import { showToast } from '../services/toastService';
import { useTranslation } from 'react-i18next';

const ComparisonEngineView: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id, type } = useParams<{ id: string; type: string }>();
  const [title, setTitle] = React.useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('docx');
  const [validFormat] = useState<{ code: string; name: string }[]>([
    { code: 'docx', name: 'docx' },
    { code: 'latex', name: 'latex' },
    { code: 'html', name: 'html' },
    { code: 'jira', name: 'jira' },
    { code: 'markdown', name: 'markdown' },
    { code: 'rst', name: 'rst' },
    { code: 'textile', name: 'textile' },
    { code: 'json', name: 'json' },
    { code: 'epub', name: 'epub' },
    { code: 'epub3', name: 'epub3' },
    { code: 'epub3-zip', name: 'epub3-zip' },
    { code: 'docbook', name: 'docbook' },
  ]);

  const setCapitalTitle = useCallback(() => {
    if (type) {
      // Set capitalized title based on type
      const capitalizedTitle = type.charAt(0).toUpperCase() + type.slice(1);
      setTitle(capitalizedTitle);
    }
  }, [type]);

  const fetchComparisonsData = useCallback(async () => {
    try {
      if (!id) {
        console.error('ID is required.');
        showToast('error', 'Invalid comparison ID');
        return;
      }

      const fetchData = async () => {
        try {
          const data = await fetchComparisonEngineData(id);
          if (!data) {
            showToast('error', 'No comparison data found');
            return false;
          }
          if (data.status !== 'SUCCESS') {
            return false;
          }
          if (!data.result) {
            showToast('error', 'Invalid comparison result');
            return false;
          }
          setComparisonData(data.result);
          setLoading(false);
          return true;
        } catch (error) {
          showToast('error', 'Failed to fetch comparison data');
          return false;
        }
      };

      let success = false;
      setLoading(true);
      let retryCount = 0;
      const maxRetries = 30;

      while (!success && retryCount < maxRetries) {
        success = await fetchData();
        if (!success) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      if (!success) {
        showToast('error', 'Comparison processing timed out');
        setLoading(false);
      }
    } catch (error) {
      showToast('error', 'An unexpected error occurred');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setCapitalTitle();
    fetchComparisonsData();
  }, [setCapitalTitle, fetchComparisonsData]);

  const exportToPDF = async () => {
    if (!comparisonData) {
      showToast('error', 'No comparison data available for export');
      return;
    }
    const inputData = document.getElementById('inputData');
    if (!inputData) {
      showToast('error', 'Export data not found');
      return;
    }
    if (!selectedFormat) {
      showToast('error', 'No export format selected');
      return;
    }

    try {
      const blobData = await createFileFromMarkdown(inputData.innerHTML, 'html', selectedFormat);
      if (!blobData) {
        showToast('error', 'Failed to create export file');
        return;
      }
      const url = URL.createObjectURL(blobData);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Comparison engine.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting file:', error);
      showToast('error', 'Failed to export file');
    }
  };

  const handleBack = () => {
    navigate(`/comparison-engine/${type}`);
  };

  return (
    <div>
      <Layout title={`${t('comparison_engine.title')} ${title} ${t('comparison_engine.view')}`}>
        <div className="">
          <div className="flex items-center justify-between mb-4">
            <button
              className="px-4 py-2 text-blue-500 border border-blue-500 rounded hover:bg-blue-50"
              onClick={handleBack}
            >
              {t('comparison_engine.back')}
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-md h-full w-full max-w-full p-4">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <span className="animate-spin text-5xl mr-4">
                  <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24">
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
                </span>
                <div className="animate-pulse text-1xl font-semibold text-gray-700">
                  Processing your request...
                </div>
              </div>
            ) : (
              comparisonData && (
                <div>
                  <div className="flex justify-end mb-4">
                    <div className="flex items-center space-x-2">
                      <select
                        className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                        onChange={e => {
                          const selectedFormat = e.target.value;
                          setSelectedFormat(selectedFormat);
                        }}
                      >
                        {validFormat.map(format => (
                          <option
                            key={format.code}
                            value={format.code}
                            className="bg-white text-gray-700 hover:bg-gray-100"
                          >
                            {format.name}
                          </option>
                        ))}
                      </select>
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        onClick={exportToPDF}
                      >
                        {t('comparison_engine.export')}
                      </button>
                    </div>
                  </div>
                  <div id="inputData">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose max-w-none">
                      {comparisonData.markdown_code}
                    </ReactMarkdown>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default ComparisonEngineView;
