import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout';
import { Delete, Eye } from '../images/icons';
import { deleteComparison, fetchComparisonsEngineData } from '../services/api';
import Table from '../components/table';
import Dialog from '../components/dialog';
import { showToast } from '../services/toastService';
import { useTranslation } from 'react-i18next';

const ComparisonEngineDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const [title, setTitle] = React.useState<string>('');
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [removeDialogOpen, setRemoveDialogOpen] = useState<boolean>(false);
  const [selectedComparison, setSelectedComparison] = useState<any>(null);

  const setCapitalTitle = useCallback(() => {
    if (type) {
      // Set capitalized title based on type
      const capitalizedTitle = type.charAt(0).toUpperCase() + type.slice(1);
      setTitle(capitalizedTitle);
    }
  }, [type]);

  const fetchComparisonsData = useCallback(async () => {
    if (!type) {
      console.error('Type is required.');
      return;
    }
    setLoading(true);
    try {
      const data = await fetchComparisonsEngineData(type);
      setComparisons(data);
    } catch (error) {
      console.error('Error fetching comparisons:', error);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    setCapitalTitle();
    fetchComparisonsData();
  }, [setCapitalTitle, fetchComparisonsData]);

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
    return `"${decodeURIComponent(currentPathWithQuery)}"`;
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteComparison(id);
      fetchComparisonsData();
      setRemoveDialogOpen(false);
      setSelectedComparison(null);
      showToast('success', t('comparison_engine.comparison_deleted_successfully'));
    } catch (error) {
      console.error('Error deleting rubric:', error);
    }
  };

  const handleCreate = () => {
    navigate(`/comparison-engine/${type}/create?source=${currentPathWithQuery()}`);
  };

  const handleView = (id: number) => {
    navigate(`/comparison-engine/${type}/view/${id}`);
  };

  const handleBack = () => {
    navigate('/comparison-engine');
  };

  const TABLE_HEAD = [t('comparison_engine.name'), t('comparison_engine.description'), t('comparison_engine.actions')];
  const emptyStateMessage = t('comparison_engine.no_comparison_found');

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
            onClick={handleCreate}
          >
            {t('comparison_engine.create_new_comparison')}
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md h-full w-full max-w-full p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <Table
              tableHead={TABLE_HEAD}
              data={comparisons}
              renderRow={(comparison, index) => (
                <tr
                  key={comparison.id}
                  className={`${index % 2 === 0 ? 'bg-gray-50' : ''} hover:bg-gray-100`}
                >
                  <td className="p-4 w-3/12">
                    <span className="text-sm text-gray-700">{comparison.name}</span>
                  </td>
                  <td className="p-4 w-7/12">
                    <span className="text-sm text-gray-700 line-clamp-1">
                      {comparison.description}
                    </span>
                  </td>
                  <td className="p-4 w-2/12">
                    <div className="md:flex items-center gap-10">
                      <div className="group relative">
                        <button
                          className="text-green-500 p-2 rounded hover:text-green-600 transition-colors"
                          onClick={() => handleView(comparison.id)}
                        >
                          <Eye className="w-6 h-6" />
                        </button>
                        <span className="invisible group-hover:visible absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {t('comparison_engine.view_comparison')}
                        </span>
                      </div>
                      <div className="group relative">
                        <button
                          className="text-red-500 p-2 rounded hover:text-red-600 transition-colors"
                          onClick={() => {
                            setSelectedComparison(comparison.id);
                            setRemoveDialogOpen(true);
                          }}
                        >
                          <Delete className="w-6 h-6" />
                        </button>
                        <span className="invisible group-hover:visible absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {t('comparison_engine.delete_comparison')}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              emptyStateMessage={emptyStateMessage}
            />
          )}
        </div>
      </div>
      {removeDialogOpen && selectedComparison && (
        <Dialog
          title={t('comparison_engine.delete_comparison')}
          description={t('comparison_engine.delete_comparison_description')}
          onConfirm={() => handleDelete(selectedComparison)}
          onCancel={() => {
            setSelectedComparison(null);
            setRemoveDialogOpen(false);
          }}
          confirmText={t('comparison_engine.delete')}
          cancelText={t('comparison_engine.cancel')}
        />
      )}
    </Layout>
  );
};

export default ComparisonEngineDashboard;
