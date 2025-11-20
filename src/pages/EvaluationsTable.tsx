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
import { fetchEvaluations, deleteEvaluation, fetchRubrics } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout';
import { showToast } from '../services/toastService';
import { Delete, Eye } from '../images/icons';
import { t } from 'i18next';
import { FaSpinner } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import { subscribeToEvent, unsubscribeFromEvent } from '../utils/appsyncEvents';
import Dialog from '../components/dialog';

const EvaluationsTable: React.FC = () => {
  const navigate = useNavigate();
  const { isAppSyncSubscribed } = useAuth();
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [rubrics, setRubrics] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [highlightRubrics, setHighlightRubrics] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);

  // Function to check if evaluation is in progress
  const isEvaluationInProgress = (evaluation: any): boolean => {
    // Check if feedback is empty, criteria_evaluation is empty array, and overall_comments is empty
    const hasFeedback = evaluation.feedback && evaluation.feedback.trim() !== '';
    const hasCriteriaEvaluation = evaluation.criteria_evaluation && 
      (Array.isArray(evaluation.criteria_evaluation) ? evaluation.criteria_evaluation.length > 0 : 
       (typeof evaluation.criteria_evaluation === 'string' && evaluation.criteria_evaluation !== '[]'));
    const hasOverallComments = evaluation.overall_comments && evaluation.overall_comments.trim() !== '';
    
    return !hasFeedback && !hasCriteriaEvaluation && !hasOverallComments;
  };

  // Function to check if delete button should be shown (after 5 minutes)
  const shouldShowDeleteButton = (evaluation: any): boolean => {
    if (!isEvaluationInProgress(evaluation)) return true;
    
    const createdAt = new Date(evaluation.created_at);
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    return createdAt < fiveMinutesAgo;
  };

  const fetchEvaluationsData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEvaluations();
      setEvaluations(
        data.map((evaluation: any) => ({
          ...evaluation,
          criteria_evaluation: JSON.parse(evaluation.criteria_evaluation),
        }))
      );
    } catch (error) {
      console.error(t('evaluations_page.error_fetching_evaluations'), error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRubricsData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRubrics();
      setRubrics(data);
    } catch (error) {
      console.error(t('evaluations_page.error_fetching_rubrics'), error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvaluationsData();
    fetchRubricsData();
  }, [fetchEvaluationsData, fetchRubricsData]);

  // Subscribe to evaluation update event
  useEffect(() => {
    if (isAppSyncSubscribed) {
      const handleEvaluationUpdate = () => {
        fetchEvaluationsData();
      };

      subscribeToEvent('evaluationUpdate', handleEvaluationUpdate);

      return () => {
        unsubscribeFromEvent('evaluationUpdate', handleEvaluationUpdate);
      };
    }
  }, [isAppSyncSubscribed, fetchEvaluationsData]);

  const handleDelete = async (id: string) => {
    try {
      await deleteEvaluation(id);
      fetchEvaluationsData();
      showToast('success', t('evaluations_page.evaluation_deleted_successfully'));
    } catch (error) {
      console.error(t('evaluations_page.error_deleting_evaluation'), error);
      showToast('error', t('evaluations_page.error_deleting_evaluation'));
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleNewEvaluation = () => {
    if (rubrics.length === 0) {
      showToast('info', t('evaluations_page.you_need_to_create_a_rubric_first_before_creating_an_evaluation'));
      setHighlightRubrics(true);
      setTimeout(() => setHighlightRubrics(false), 5000);
      return;
    }
    navigate('/evaluations/create');
  };

  const handleViewEvaluation = (id: number) => {
    navigate(`/evaluations/view/${id}`);
  };

  const handleRubricsManagement = () => {
    navigate('/rubrics-management');
  };

  const ActionButton: React.FC<{
    onClick: () => void;
    icon: JSX.Element;
    tooltip: string;
  }> = ({ onClick, icon, tooltip }) => (
    <div className="group relative">
      <button onClick={onClick} className="p-2 rounded hover:bg-gray-100">
        {icon}
      </button>
      <span className="invisible group-hover:visible absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
        {tooltip}
      </span>
    </div>
  );

  return (
    <Layout title={t('evaluations_page.title')}>
      <div className="">
        <div className="flex justify-between items-center mb-4">
          <button
            className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
            onClick={handleBack}
          >
            {t('evaluations_page.back')}
          </button>
          <div className="flex gap-4 ml-auto">
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={handleNewEvaluation}
            >
              {t('evaluations_page.new_evaluation')}
            </button>
            <button
              className={`px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 ${
                highlightRubrics
                  ? 'animate-pulse shadow-lg shadow-yellow-300 border-2 border-yellow-600'
                  : ''
              }`}
              onClick={handleRubricsManagement}
            >
              {t('evaluations_page.rubrics_management')}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : evaluations.length > 0 ? (
          evaluations.map(evaluation => (
            <div
              key={evaluation.id}
              className="mb-4 bg-white rounded-lg shadow-md border border-gray-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="max-w-[70%]">
                    <h6 className="font-bold mb-2 text-lg">{t('evaluations_page.exam_description')}:</h6>
                    <p className="text-gray-700 mb-1 truncate">{evaluation.exam_description}</p>
                    <p className="text-sm text-gray-500">
                      <strong>{t('evaluations_page.course_name')}:</strong> {evaluation.course_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>{t('evaluations_page.student_name')}:</strong> {evaluation.student_name}{' '}
                      {evaluation.student_surname}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {isEvaluationInProgress(evaluation) ? (
                      <FaSpinner className="w-6 h-6 animate-spin text-blue-500" />
                    ) : (
                      <ActionButton
                        onClick={() => handleViewEvaluation(evaluation.id)}
                        icon={<Eye className="text-blue-500 w-6 h-6" />}
                        tooltip={t('evaluations_page.view_evaluation')}
                      />
                    )}
                                        {shouldShowDeleteButton(evaluation) && (
                    <ActionButton
                      onClick={() => {
                        setShowDeleteDialog(true);
                        setSelectedEvaluationId(evaluation.id);
                      }}
                      icon={<Delete className="text-red-500 w-6 h-6" />}
                      tooltip={t('evaluations_page.delete_evaluation')}
                    />
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <h6 className="font-bold text-blue-600 mb-2 text-lg">{t('evaluations_page.scores')}:</h6>
                  <div className="space-y-2">
                    {evaluation.criteria_evaluation.map((criteria: any, index: number) => (
                      <p key={index} className="text-gray-700 text-sm">
                        <strong>{criteria.name}:</strong>{' '}
                        <span className="text-blue-600">{criteria.score}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">{t('evaluations_page.no_evaluations_found')}</p>
        )}
      </div>

      {showDeleteDialog && selectedEvaluationId && (
        <Dialog
          title={t('evaluations_page.delete_evaluation')}
          description={t('evaluations_page.are_you_sure_you_want_to_delete_this_evaluation')}
          onConfirm={() => {
            handleDelete(selectedEvaluationId);
            setShowDeleteDialog(false);
            setSelectedEvaluationId(null);
          }}
          onCancel={() => {
            setShowDeleteDialog(false);
            setSelectedEvaluationId(null);
          }}
          confirmText={t('evaluations_page.delete')}
          cancelText={t('evaluations_page.cancel')}
        />
      )}
    </Layout>
  );
};

export default EvaluationsTable;
