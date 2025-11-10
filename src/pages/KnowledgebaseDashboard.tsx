// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React, { useEffect, useState, useCallback, useContext } from 'react';
import { getCourses, deleteCourse } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import { Course } from '../types';
import Layout from '../components/layout';
import { TrashIcon } from '@heroicons/react/20/solid';
import Dialog from '../components/dialog';
import { useTranslation } from 'react-i18next';
import { Loader2, AlertCircle } from 'lucide-react';
import { subscribeToEvent, unsubscribeFromEvent } from '../utils/appsyncEvents';
import AuthContext from '../authentication/authContext';


const KnowledgebaseDashboard: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAppSyncSubscribed } = useContext(AuthContext);
  
  const formatDescription = (description: string | null) => {
    if (!description) return t('knowledge_base_dashboard.no_description');
    return description.length > 100 ? `${description.substring(0, 100)}...` : description;
  };
  
  const fetchCourses = useCallback(async () => {
      try {
          const fetchedCourses = await getCourses(true);
      setCourses(fetchedCourses);
    } catch (err) {
      console.error(t('knowledgebase_dashboard.failed_to_fetch_courses'), err);
      setError(t('knowledgebase_dashboard.failed_to_fetch_courses'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    // Subscribe to the update event
    subscribeToEvent('kbmUpdate', fetchCourses);

    // Clean up the subscription when unmounting
    return () => {
      unsubscribeFromEvent('kbmUpdate', fetchCourses);
    };
  }, [fetchCourses]);

  const handleDelete = async (courseId: string) => {
    setSelectedCourseId(courseId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCourseId) return;

    try {
      setDeletingId(selectedCourseId);
      
      if (isAppSyncSubscribed) {
        await deleteCourse(selectedCourseId, true);
      } else {
        await deleteCourse(selectedCourseId, false);
      }
      fetchCourses();
    } catch (err) {
      console.error(t('knowledgebase_dashboard.error_deleting_knowledge_base'), err);
      setError(t('knowledgebase_dashboard.error_deleting_knowledge_base'));
    } finally {
      setDeletingId(null);
      setSelectedCourseId(null);
    }
  };

  const renderActionButtons = (course: Course) => {
    switch (course.ingestion_status) {
      case 'IN_PROGRESS':
        return (
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span className="text-sm text-gray-500">{t('knowledge_base_dashboard.ingestion_status.in_progress')}</span>
          </div>
        );
      
      case 'ERROR':
        return (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <button
              onClick={() => handleDelete(course.id)}
              disabled={deletingId === course.id}
              className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingId === course.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              ) : (
                <TrashIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        );
      
      case 'COMPLETED':
        return (
          <div className="flex space-x-4">
            <Link
              to={`/knowledge-base/view/${course.id}`}
              className="text-blue-600 hover:text-blue-900"
            >
              {t('knowledge_base_dashboard.view')}
            </Link>
            <Link
              to={`/${course.id}/ask-agent`}
              className="text-green-600 hover:text-green-900"
              state={{ fromDashboard: true }}
            >
              {t('knowledge_base_dashboard.ask_kb')}
            </Link>
            <button
              onClick={() => handleDelete(course.id)}
              disabled={deletingId === course.id}
              className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingId === course.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              ) : (
                <TrashIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout title="Knowledge Base Dashboard">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Knowledge Base Dashboard">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Knowledge Base Dashboard">
      <div className="flex justify-between items-center mb-6">
        <button
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
          onClick={() => navigate('/dashboard')}
        >
          {t('knowledge_base_dashboard.back')}
        </button>
        <Link to="/knowledge-base/create">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300">
            {t('knowledge_base_dashboard.create_knowledge_base')}
          </button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-gray-500 text-lg">{t('knowledge_base_dashboard.no_knowledge_bases')}</p>
          <p className="text-gray-400 mt-2">{t('knowledge_base_dashboard.create_new_knowledge_base')}</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('knowledge_base_dashboard.title')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('knowledge_base_dashboard.description')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('knowledge_base_dashboard.creation_date')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('knowledge_base_dashboard.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map(course => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{course.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {formatDescription(course.description)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(course.created_at)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {renderActionButtons(course)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDeleteDialog && selectedCourseId && (
        <Dialog
          title={t('knowledge_base_dashboard.delete_knowledge_base')}
          description={t('knowledge_base_dashboard.delete_knowledge_base_confirmation')}
          onConfirm={() => {
            handleConfirmDelete();
            setShowDeleteDialog(false);
          }}
          onCancel={() => {
            setShowDeleteDialog(false);
            setSelectedCourseId(null);
          }}
          confirmText={t('knowledge_base_dashboard.delete')}
          cancelText={t('knowledge_base_dashboard.cancel')}
        />
      )}
    </Layout>
  );
};

export default KnowledgebaseDashboard;
