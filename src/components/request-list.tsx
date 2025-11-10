// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Request } from '../types';
import { getExams, deleteExam } from '../services/api';

import { useTranslation } from 'react-i18next';
import { FaPlus, FaFileAlt, FaList, FaThLarge } from 'react-icons/fa';
import { Trash2, Loader2, AlertCircle } from 'lucide-react';
import Dialog from './dialog';
import { showToast } from '../services/toastService';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  es, 
  enUS, 
  fr, 
  de, 
  it, 
  pt, 
  ptBR, 
  ru, 
  ja, 
  ko, 
  zhCN, 
  zhTW, 
  ar, 
  tr, 
  vi, 
  hi, 
  nl, 
  sv, 
  pl 
} from 'date-fns/locale';
import { useContext } from 'react';
import { AuthContext } from '../authentication/authContext';
import Tooltip from './ui/tooltip';
import { subscribeToEvent, unsubscribeFromEvent } from '../utils/appsyncEvents';
import useAuth from '../hooks/useAuth';

// Constantes y tipos
const LOCALE_MAP: { [key: string]: any } = {
  'es': es, 'es-ES': es, 'es-MX': es,
  'en': enUS, 'en-US': enUS,
  'fr': fr, 'fr-CA': fr,
  'de': de, 'it': it, 'pt': pt, 'pt-BR': ptBR,
  'ru': ru, 'ja': ja, 'ko': ko,
  'zh': zhCN, 'zh-CN': zhCN, 'zh-TW': zhTW,
  'ar': ar, 'tr': tr, 'vi': vi, 'hi': hi,
  'ur': enUS, 'nl': nl, 'sv': sv, 'pl': pl
};

const FORMAT_PATTERNS: { [key: string]: string } = {
  'es': "d 'de' MMMM 'de' yyyy 'a las' HH:mm",
  'en': "MMMM d, yyyy 'at' HH:mm",
  'fr': "d MMMM yyyy 'à' HH:mm",
  'de': "d. MMMM yyyy 'um' HH:mm",
  'pt': "d 'de' MMMM 'de' yyyy 'às' HH:mm"
};

const FIVE_MINUTES_MS = 5 * 60 * 1000;

// Functions to format dates (must be before the components that use them)
const getUserLocale = (userLocale?: string) => {
  const locale = userLocale || 'en-US';
  return LOCALE_MAP[locale] || enUS;
};

const formatDateRelative = (dateString: string, userLocale?: string) => {
  try {
    const dateFnsLocale = getUserLocale(userLocale);
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: dateFnsLocale 
    });
  } catch {
    return dateString;
  }
};

const formatFullDate = (dateString: string, userLocale?: string) => {
  try {
    const locale = userLocale || 'en-US';
    const dateFnsLocale = getUserLocale(locale);
    const date = new Date(dateString);
    
    const pattern = FORMAT_PATTERNS[locale.split('-')[0]] || FORMAT_PATTERNS['en'];
    return format(date, pattern, { locale: dateFnsLocale });
  } catch {
    return dateString;
  }
};

// Utility components
const LoadingSpinner: React.FC<{ size?: string; color?: string }> = ({ 
  size = "h-16 w-16", 
  color = "border-blue-500" 
}) => (
  <div className={`animate-spin rounded-full border-t-2 border-b-2 ${color} ${size}`}></div>
);

const ProgressIndicator: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center gap-2 text-blue-600">
    <Loader2 className="w-4 h-4 animate-spin" />
    <span className="text-sm font-medium">{text}</span>
  </div>
);

const ErrorIndicator: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center gap-2 text-red-600">
    <AlertCircle className="w-4 h-4" />
    <span className="text-sm font-medium">{text}</span>
  </div>
);

const DeleteButton: React.FC<{
  requestId: string;
  deletingId: string | null;
  onDelete: (id: string) => void;
  className?: string;
}> = ({ requestId, deletingId, onDelete, className = "text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed" }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onDelete(requestId);
    }}
    disabled={deletingId === requestId}
    className={className}
  >
    {deletingId === requestId ? (
      <LoadingSpinner size="h-4 w-4" color="border-red-600" />
    ) : (
      <Trash2 className="h-5 w-5" />
    )}
  </button>
);

const QuestionsSummary: React.FC<{ request: Request; className?: string }> = ({ request, className = "" }) => (
  <div className={`text-sm text-gray-600 ${className}`}>
    <span className="font-semibold">MCQs:</span> {request.mcq_count} | 
    <span className="font-semibold"> TFQs:</span> {request.tfq_count} | 
    <span className="font-semibold"> Open:</span> {request.open_count}
  </div>
);

const DateDisplay: React.FC<{ date: string; className?: string; userLocale?: string }> = ({ 
  date, 
  className = "text-sm text-gray-500",
  userLocale 
}) => (
  <Tooltip content={formatFullDate(date, userLocale)}>
    <div className={className}>
      {formatDateRelative(date, userLocale)}
    </div>
  </Tooltip>
);

const RequestList: React.FC = () => {
  const { t } = useTranslation();
  const { isAppSyncSubscribed } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext) as any;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const savedMode = localStorage.getItem('examRequestViewMode');
    return (savedMode === 'list' || savedMode === 'grid') ? savedMode : 'grid';
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);



  const isOlderThan5Minutes = (createdAt: string) => {
    const createdTime = new Date(createdAt).getTime();
    const currentTime = new Date().getTime();
    return currentTime - createdTime > FIVE_MINUTES_MS;
  };

  const isRequestClickable = (request: Request) => {
    return request.status === 'COMPLETED' || !request.status;
  };

  // Event handling functions
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getExams();
      const sortedRequests = data.sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRequests(sortedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate('/dashboard');

  const handleCardClick = (request: Request) => {
    if (isRequestClickable(request)) {
      navigate(`/request/${request.id}`);
    }
  };

  const handleDelete = (requestId: string) => {
    setSelectedRequestId(requestId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRequestId) return;

    try {
      setDeletingId(selectedRequestId);
      await deleteExam(selectedRequestId);
      await fetchRequests();
      showToast('success', t('exam_generator.exam_deleted_successfully'));
    } catch (error) {
      console.error('Error deleting exam:', error);
      showToast('error', t('exam_generator.error_deleting_exam'));
    } finally {
      setDeletingId(null);
      setSelectedRequestId(null);
    }
  };

  // Rendering functions
  const renderStatusIndicator = (status?: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <ProgressIndicator text={t('exam_generator.in_progress')} />;
      case 'ERROR':
        return <ErrorIndicator text={t('exam_generator.error')} />;
      default:
        return null;
    }
  };

  const renderActions = (request: Request) => {
    if (request.status === 'IN_PROGRESS') {
      const isOlder = isOlderThan5Minutes(request.created_at);
      
      if (isOlder) {
        return (
          <div className="flex space-x-4">
            <ProgressIndicator text={t('exam_generator.in_progress')} />
            <DeleteButton 
              requestId={request.id} 
              deletingId={deletingId} 
              onDelete={handleDelete 
            } />
          </div>
        );
      } else {
        return <ProgressIndicator text={t('exam_generator.in_progress')} />;
      }
    } else {
      return (
        <div className="flex space-x-4">
          <Link
            to={`/request/${request.id}`}
            className="text-blue-600 hover:text-blue-900"
            onClick={(e) => e.stopPropagation()}
          >
            {t('exam_generator.view')}
          </Link>
          <DeleteButton 
            requestId={request.id} 
            deletingId={deletingId} 
            onDelete={handleDelete 
          } />
        </div>
      );
    }
  };

  const renderLoadingState = () => (
    <div className="flex justify-center items-center h-48 sm:h-64">
      <LoadingSpinner />
    </div>
  );

  const renderEmptyState = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8 text-center max-w-2xl mx-auto">
      <FaFileAlt className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" />
      <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
        {t('exam_generator.no_exams_created')}
      </h2>
      <p className="text-sm sm:text-base text-gray-500 mb-6">
        {t('exam_generator.create_your_first_exam')}
      </p>
      <Link
        to="/exam-generator"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <FaPlus className="w-4 h-4" />
        <span>{t('exam_generator.new_exam')}</span>
      </Link>
    </div>
  );

  const renderListView = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('exam_generator.title')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('exam_generator.questions')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('exam_generator.created_at')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('exam_generator.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map(request => (
            <tr 
              key={request.id} 
              className={`hover:bg-gray-50 ${
                isRequestClickable(request) ? 'cursor-pointer' : 'cursor-not-allowed'
              }`} 
              onClick={() => handleCardClick(request)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{request.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <QuestionsSummary request={request} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <DateDisplay date={request.created_at} userLocale={user?.locale} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {renderActions(request)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderGridCard = (request: Request) => {
    const shouldShowDeleteButton = request.status !== 'IN_PROGRESS' || isOlderThan5Minutes(request.created_at);
    
    return (
      <div
        key={request.id}
        className={`bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-200 transition-all duration-200 relative ${
          isRequestClickable(request) ? 'cursor-pointer hover:bg-white/90' : 'cursor-not-allowed opacity-75'
        }`}
        onClick={() => handleCardClick(request)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick(request);
          }
        }}
        tabIndex={isRequestClickable(request) ? 0 : -1}
        role="button"
        aria-label={`${t('exam_generator.view_exam')}: ${request.title}`}
      >
        {shouldShowDeleteButton && (
          <DeleteButton 
            requestId={request.id} 
            deletingId={deletingId} 
            onDelete={handleDelete}
            className="absolute top-2 right-2 text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed z-10"
          />
        )}

        <h2 className={`text-xl font-semibold mb-2 overflow-hidden text-ellipsis line-clamp-2 ${shouldShowDeleteButton ? 'pr-8' : ''}`}>
          {request.title}
        </h2>
      
      <div className="mb-4">
        {renderStatusIndicator(request.status)}
        <DateDisplay date={request.created_at} userLocale={user?.locale} />
      </div>

      <div className="bg-gray-100 p-3 rounded-lg mb-4">
        <div className="text-sm text-gray-800">
          <div className="flex justify-between">
            <span className="font-semibold">MCQs:</span> {request.mcq_count}
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">TFQs:</span> {request.tfq_count}
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Open:</span> {request.open_count}
          </div>
        </div>
      </div>
    </div>
    );
  };

  // Effects (useEffect)
  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (isAppSyncSubscribed) {
      const handleExamUpdate = () => {
        fetchRequests();
      };

      subscribeToEvent('examUpdate', handleExamUpdate);
      return () => {
        unsubscribeFromEvent('examUpdate', handleExamUpdate);
      };
    }
  }, [isAppSyncSubscribed]);

  useEffect(() => {
    localStorage.setItem('examRequestViewMode', viewMode);
  }, [viewMode]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
          onClick={handleBack}
        >
          {t('exam_generator.back')}
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 shadow-lg"
            title={viewMode === 'grid' ? t('exam_generator.switch_to_list_view') : t('exam_generator.switch_to_grid_view')}
          >
            {viewMode === 'grid' ? (
              <FaList className="w-5 h-5 text-gray-600" />
            ) : (
              <FaThLarge className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <Link
            to="/exam-generator"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-sm transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FaPlus className="w-4 h-4" />
            <span>{t('exam_generator.new_exam')}</span>
          </Link>
        </div>
      </div>
      <div className="relative min-h-[calc(95vh-10rem)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#70828a56] to-[#06244d71] blur-3xl"></div>
        <div className="relative mx-auto px-4 py-6 flex-1 w-full z-10">
          {loading ? (
            renderLoadingState()
          ) : requests && requests.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map(renderGridCard)}
              </div>
            ) : (
              renderListView()
            )
          ) : (
            renderEmptyState()
          )}
        </div>
      </div>

      {showDeleteDialog && selectedRequestId && (
        <Dialog
          title={t('exam_generator.delete_exam')}
          description={t('exam_generator.delete_exam_confirmation', { 
            name: requests.find(r => r.id === selectedRequestId)?.title 
          })}
          onConfirm={() => {
            handleConfirmDelete();
            setShowDeleteDialog(false);
          }}
          onCancel={() => {
            setShowDeleteDialog(false);
            setSelectedRequestId(null);
          }}
          confirmText={t('exam_generator.delete')}
          cancelText={t('exam_generator.cancel')}
        />
      )}
    </div>
  );
};

export default RequestList;
