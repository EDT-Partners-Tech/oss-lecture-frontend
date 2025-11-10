import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout';
import { Delete, Eye } from '../images/icons';
import Dialog from '../components/dialog';
import { deleteComparisonRule, fetchComparisonEngineRulesData } from '../services/api';
import { showToast } from '../services/toastService';
import { useTranslation } from 'react-i18next';

const ComparisonEngineRulesDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const type = searchParams.get('type');
  const source = searchParams.get('source') || '/comparison-engine';
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [removeDialogOpen, setRemoveDialogOpen] = useState<boolean>(false);
  const [selectedComparison, setSelectedComparison] = useState<any>(null);

  const fetchComparisonsRulesData = useCallback(async () => {
    if (!type) {
      showToast('error', 'Invalid comparison type');
      return;
    }
    setLoading(true);
    try {
      const data = await fetchComparisonEngineRulesData(type);
      if (!data) {
        showToast('error', 'No rules data found');
        return;
      }
      setRules(data);
    } catch (error) {
      showToast('error', 'Failed to fetch comparison rules');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchComparisonsRulesData();
  }, [fetchComparisonsRulesData]);

  const handleDelete = async (id: string) => {
    if (!id) {
      showToast('error', 'Invalid rule ID');
      return;
    }
    try {
      await deleteComparisonRule(id);
      await fetchComparisonsRulesData();
      setRemoveDialogOpen(false);
      setSelectedComparison(null);
      showToast('success', 'Rule deleted successfully');
    } catch (error) {
      showToast('error', 'Failed to delete rule');
    }
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
    return `${encodeURIComponent(currentPathWithQuery)}`.replace('source=', 'pre_source=');
  };

  const handleCreate = () => {
    navigate(`/comparison-engine/rule/create?type=${type}&source=${currentPathWithQuery()}`);
  };

  const handleView = (id: number) => {
    if (!id) {
      showToast('error', 'Invalid rule ID');
      return;
    }
    navigate(`/comparison-engine/rule/view/${id}?type=${type}&source=${currentPathWithQuery()}`);
  };

  const handleBack = () => {
    navigate(source.replace('pre_source', 'source'));
  };

  const TABLE_HEAD = [t('comparison_engine.name'), t('comparison_engine.description'), t('comparison_engine.actions')];
  const emptyStateMessage = t('comparison_engine.no_rules_found');

  return (
    <Layout title={t('comparison_engine.rules_manager')}>
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
            {t('comparison_engine.create_new_rule')}
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md h-full w-full max-w-full p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <table className="w-full table-auto text-left">
              <thead>
                <tr>
                  {TABLE_HEAD.map(head => (
                    <th key={head} className="border-b border-blue-gray-100 bg-gray-50 p-4">
                      <span className="text-sm font-bold text-gray-700">{head}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rules.length > 0 ? (
                  rules.map((rule, index) => (
                    <tr
                      key={rule.id}
                      className={`${index % 2 === 0 ? 'bg-gray-50' : ''} hover:bg-gray-100`}
                    >
                      <td className="p-4 w-3/12">
                        <span className="text-sm text-gray-700">{rule.name}</span>
                      </td>
                      <td className="p-4 w-7/12">
                        <span className="text-sm text-gray-700 line-clamp-1">
                          {rule.description}
                        </span>
                      </td>
                      <td className="p-4 w-2/12">
                        <div className="md:flex items-center gap-10">
                          <div className="group relative">
                            <button
                              className="text-green-500 p-2 rounded hover:text-green-600 transition-colors"
                              onClick={() => handleView(rule.id)}
                            >
                              <Eye className="w-6 h-6" />
                            </button>
                            <span className="invisible group-hover:visible absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              View Rule
                            </span>
                          </div>
                          <div className="group relative">
                            <button
                              className="text-red-500 p-2 rounded hover:text-red-600 transition-colors"
                              onClick={() => {
                                setSelectedComparison(rule.id);
                                setRemoveDialogOpen(true);
                              }}
                            >
                              <Delete className="w-6 h-6" />
                            </button>
                            <span className="invisible group-hover:visible absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              Delete Rule
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={TABLE_HEAD.length} className="p-4 text-center text-gray-500">
                      {emptyStateMessage}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {removeDialogOpen && selectedComparison && (
        <Dialog
          title="Delete Comparison"
          description="Are you sure you want to delete this comparison?"
          onConfirm={() => handleDelete(selectedComparison)}
          onCancel={() => {
            setSelectedComparison(null);
            setRemoveDialogOpen(false);
          }}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </Layout>
  );
};

export default ComparisonEngineRulesDashboard;
