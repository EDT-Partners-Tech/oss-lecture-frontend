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
import { fetchRubrics, deleteRubric } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout';
import { FaPlus, FaList, FaThLarge, FaSpinner } from 'react-icons/fa';
import Dialog from '../components/dialog';
import { showToast } from '../services/toastService';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import { subscribeToEvent, unsubscribeFromEvent } from '../utils/appsyncEvents';
import { RubricRow } from '../components/rubric';

const RubricsManagement: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAppSyncSubscribed } = useAuth();
  const [rubrics, setRubrics] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [selectedRubricId, setSelectedRubricId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const savedMode = localStorage.getItem('rubricViewMode');
    return (savedMode === 'list' || savedMode === 'grid') ? savedMode : 'list';
  });

  useEffect(() => {
    localStorage.setItem('rubricViewMode', viewMode);
  }, [viewMode]);

  const fetchRubricsData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchRubrics();
      setRubrics(data);
    } catch (error) {
      console.error('Error fetching rubrics:', error);
      showToast('error', t('rubrics_management.error_loading_rubrics'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRubricsData();
  }, [fetchRubricsData]);

  // Subscribe to rubric update event
  useEffect(() => {
    if (isAppSyncSubscribed) {
      const handleRubricUpdate = () => {
        fetchRubricsData();
      };

      subscribeToEvent('rubricUpdate', handleRubricUpdate);

      return () => {
        unsubscribeFromEvent('rubricUpdate', handleRubricUpdate);
      };
    }
  }, [isAppSyncSubscribed, fetchRubricsData]);

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoading(id.toString());
      await deleteRubric(id);
      setRubrics(rubrics.filter(rubric => rubric.id !== id));
      showToast('success', t('rubrics_management.rubric_deleted_successfully'));
    } catch (error) {
      console.error('Error deleting rubric:', error);
      showToast('error', t('rubrics_management.error_deleting_rubric'));
    } finally {
      setDeleteLoading(null);
      setSelectedRubricId(null);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/rubrics/edit/${id}`);
  };

  const handleCreate = () => {
    navigate('/rubrics/');
  };

  const handleView = (id: number) => {
    navigate(`/rubrics/${id}`);
  };

  const handleBack = () => {
    navigate('/evaluations');
  };

  const renderLoadingState = () => (
    <div className="flex justify-center items-center h-48 sm:h-64">
      <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8 text-center max-w-2xl mx-auto">
      <div className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4 flex items-center justify-center">
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
        {t('rubrics_management.no_rubrics_created')}
      </h2>
      <p className="text-sm sm:text-base text-gray-500 mb-6">
        {t('rubrics_management.create_your_first_rubric')}
      </p>
      <button
        onClick={handleCreate}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <FaPlus className="w-4 h-4" />
        <span>{t('rubrics_management.create_new_rubric')}</span>
      </button>
    </div>
  );

  const renderRubricList = () => {
    if (viewMode === 'list') {
      return (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('rubrics_management.name')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('rubrics_management.description')}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('rubrics_management.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rubrics.map(rubric => (
                <RubricRow
                  key={rubric.id}
                  rubric={rubric}
                  deleteLoading={deleteLoading}
                  onDelete={(id) => {
                    setShowDeleteDialog(true);
                    setSelectedRubricId(id);
                  }}
                  onEdit={handleEdit}
                  onView={handleView}
                  t={t}
                />
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Grid view
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rubrics.map(rubric => (
          <div
            key={rubric.id}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-200 transition-all duration-200 relative hover:bg-white/90 cursor-pointer flex flex-col h-full"
            onClick={() => handleView(rubric.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleView(rubric.id);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`${t('rubrics_management.view_rubric')}: ${rubric.name}`}
          >
            {/* Delete button in the top right corner */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
                setSelectedRubricId(rubric.id);
              }}
              disabled={deleteLoading === rubric.id.toString()}
              className="absolute top-2 right-2 text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed z-10 p-1 rounded hover:bg-red-50"
              title={t('rubrics_management.delete_rubric')}
            >
              {deleteLoading === rubric.id.toString() ? (
                <FaSpinner className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>

            {/* Rubric title */}
            <h2 className="text-xl font-semibold mb-3 overflow-hidden text-ellipsis line-clamp-2 pr-8">
              {!rubric.name && !rubric.description ? (
                <span className="text-blue-600">{t('rubrics_management.generating_rubric')}</span>
              ) : (
                rubric.name || t('rubrics_management.no_name')
              )}
            </h2>

            {/* Description */}
            <div className="mb-4 flex-grow">
              <p className="text-gray-600 text-sm line-clamp-3">
                {!rubric.name && !rubric.description ? (
                  <span></span>
                ) : (
                  rubric.description || t('rubrics_management.no_description')
                )}
              </p>
            </div>

            {/* Actions in the bottom */}
            <div className="flex items-center justify-end space-x-2 mt-auto">
              {!rubric.name && !rubric.description ? (
                <FaSpinner className="w-4 h-4 animate-spin text-blue-500" />
              ) : (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(rubric.id);
                    }}
                    className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-2 rounded hover:bg-blue-50"
                    title={t('rubrics_management.edit_rubric')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(rubric.id);
                    }}
                    className="text-green-600 hover:text-green-900 transition-colors duration-200 p-2 rounded hover:bg-green-50"
                    title={t('rubrics_management.view_rubric')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return renderLoadingState();
    }

    if (rubrics.length === 0) {
      return renderEmptyState();
    }

    return renderRubricList();
  };

  return (
    <Layout title={t('rubrics_management.title')}>
      <div className="flex justify-start">
        <button
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
          onClick={handleBack}
        >
          {t('rubrics_management.back')}
        </button>
      </div>
      <div className="relative min-h-[calc(95vh-10rem)]">
        {/* Blur background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#70828a56] to-[#06244d71] blur-3xl"></div>

        {/* Clear content */}
        <div className="relative mx-auto px-4 py-6 flex-1 w-full z-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 shadow-lg"
                title={viewMode === 'grid' ? t('rubrics_management.switch_to_list_view') : t('rubrics_management.switch_to_grid_view')}
              >
                {viewMode === 'grid' ? (
                  <FaList className="w-5 h-5 text-gray-600" />
                ) : (
                  <FaThLarge className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
            <button
              onClick={handleCreate}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-sm transition-all duration-200 min-w-[160px] shadow-lg hover:shadow-xl"
            >
              <FaPlus className="w-4 h-4" />
              <span>{t('rubrics_management.create_new_rubric')}</span>
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-16rem)] px-1 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-100 hover:scrollbar-thumb-blue-700">
            {renderContent()}
          </div>
        </div>
      </div>

      {showDeleteDialog && selectedRubricId && (
        <Dialog
          title={t('rubrics_management.delete_rubric')}
          description={t('rubrics_management.delete_rubric_description', { 
            name: rubrics.find(rubric => rubric.id === selectedRubricId)?.name || t('rubrics_management.this_rubric') 
          })}
          onConfirm={() => {
            handleDelete(selectedRubricId);
            setShowDeleteDialog(false);
          }}
          onCancel={() => {
            setShowDeleteDialog(false);
            setSelectedRubricId(null);
          }}
          confirmText={t('rubrics_management.delete')}
          cancelText={t('rubrics_management.cancel')}
        />
      )}
    </Layout>
  );
};

export default RubricsManagement;
