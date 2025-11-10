// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import { useEffect, useState, useContext } from 'react';
import { getTranscripts, deleteTranscript } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/layout';
import { t } from 'i18next';
import { FaPlus, FaFileAlt, FaList, FaThLarge } from 'react-icons/fa';
import { Loader2, AlertCircle, Trash2} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { subscribeToEvent, unsubscribeFromEvent } from '../utils/appsyncEvents';
import Dialog from '../components/dialog';
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
import { AuthContext } from '../authentication/authContext';
import Tooltip from '../components/ui/tooltip';
import { showToast } from '../services/toastService';

type TranscriptHistory = {
  id: number;
  title: string;
  transcription_text: string;
  status: string;
  completed_at: string | null;
  job_name: string;
};

// Componentes utilitarios para eliminar duplicación
const DeleteButton = ({ 
  transcriptId, 
  deletingId, 
  onDelete, 
  className = "text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed" 
}: {
  transcriptId: number;
  deletingId: number | null;
  onDelete: (id: number) => void;
  className?: string;
}) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onDelete(transcriptId);
    }}
    disabled={deletingId === transcriptId}
    className={className}
  >
    {deletingId === transcriptId ? (
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
    ) : (
      <Trash2 className="h-5 w-5" />
    )}
  </button>
);

const LoadingSpinner = ({ size = "default" }: { size?: "small" | "default" | "large" }) => {
  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-10 w-10 sm:h-12 sm:w-12",
    large: "h-16 w-16"
  };
  
  return (
    <div className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${sizeClasses[size]}`}></div>
  );
};

const TranscriptionHistory = () => {
  const [transcripts, setTranscripts] = useState<TranscriptHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAppSyncSubscribed } = useAuth();
  const { user } = useContext(AuthContext) as any;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const savedMode = localStorage.getItem('transcriptionViewMode');
    return (savedMode === 'list' || savedMode === 'grid') ? savedMode : 'grid';
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Mapping of application locales to date-fns locales
  const localeMap: { [key: string]: any } = {
    'es': es,
    'es-ES': es,
    'es-MX': es,
    'en': enUS,
    'en-US': enUS,
    'fr': fr,
    'fr-CA': fr,
    'de': de,
    'it': it,
    'pt': pt,
    'pt-BR': ptBR,
    'ru': ru,
    'ja': ja,
    'ko': ko,
    'zh': zhCN,
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    'ar': ar,
    'tr': tr,
    'vi': vi,
    'hi': hi,
    'ur': enUS,
    'nl': nl,
    'sv': sv,
    'pl': pl
  };

  // Función utilitaria para obtener el locale
  const getUserLocale = () => {
    const userLocale = user?.locale || 'en-US';
    return localeMap[userLocale] || enUS;
  };

  const formatDate = (dateString: string) => {
    try {
      const dateFnsLocale = getUserLocale();
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: dateFnsLocale 
      });
    } catch {
      return dateString;
    }
  };

  const formatFullDate = (dateString: string) => {
    try {
      const userLocale = user?.locale || 'en-US';
      const dateFnsLocale = getUserLocale();
      const date = new Date(dateString);
      
      // Format patterns by locale
      const formatPatterns: { [key: string]: string } = {
        'es': "d 'de' MMMM 'de' yyyy 'a las' HH:mm",
        'en': "MMMM d, yyyy 'at' HH:mm",
        'fr': "d MMMM yyyy 'à' HH:mm",
        'de': "d. MMMM yyyy 'um' HH:mm",
        'pt': "d 'de' MMMM 'de' yyyy 'às' HH:mm"
      };

      const pattern = formatPatterns[userLocale.split('-')[0]] || formatPatterns['en'];
      return format(date, pattern, { locale: dateFnsLocale });
    } catch {
      return dateString;
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getTranscripts();
      setTranscripts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Subscribe to the transcription update event
  useEffect(() => {
    if (isAppSyncSubscribed) {
      const handleTranscriptionUpdate = () => {
        fetchRequests();
      };

      subscribeToEvent('transcriptionUpdate', handleTranscriptionUpdate);

      return () => {
        unsubscribeFromEvent('transcriptionUpdate', handleTranscriptionUpdate);
      };
    }
  }, [isAppSyncSubscribed]);

  // Save the view mode in localStorage
  useEffect(() => {
    localStorage.setItem('transcriptionViewMode', viewMode);
  }, [viewMode]);

  const handleCardClick = (id: number) => {
    navigate(`/transcript/${id}`);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleDelete = (transcriptId: number) => {
    setSelectedTranscriptId(transcriptId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTranscriptId) return;

    try {
      setDeletingId(selectedTranscriptId);
      await deleteTranscript(selectedTranscriptId.toString());
      await fetchRequests();
      showToast('success', t('transcription_history.transcription_deleted_successfully'));
    } catch (error) {
      console.error('Error deleting transcript:', error);
      showToast('error', t('transcription_history.error_deleting_transcription'));
    } finally {
      setDeletingId(null);
      setSelectedTranscriptId(null);
    }
  };

  const renderLoadingState = () => (
    <div className="flex justify-center items-center h-48 sm:h-64">
      <LoadingSpinner size="large" />
    </div>
  );

  const renderEmptyState = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8 text-center max-w-2xl mx-auto">
      <FaFileAlt className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" />
      <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
        {t('transcription_history.no_transcriptions_created')}
      </h2>
      <p className="text-sm sm:text-base text-gray-500 mb-6">
        {t('transcription_history.create_your_first_transcription')}
      </p>
      <Link
        to="/transcriber"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <FaPlus className="w-4 h-4" />
        <span>{t('transcription_history.new_transcription')}</span>
      </Link>
    </div>
  );

  const renderTextByStatus = (transcript: TranscriptHistory, className = "text-sm") => {
    const statusConfig = {
      'COMPLETED': {
        className: `${className} text-gray-900 max-w-xs truncate`,
        content: transcript.transcription_text,
        title: transcript.transcription_text
      },
      'FAILED': {
        className: `${className} text-red-600`,
        content: t('transcription_history.error_occurred'),
        title: undefined
      },
      'IN_PROGRESS': {
        className: `${className} text-blue-600`,
        content: t('transcription_history.in_progress'),
        title: undefined
      }
    };

    const config = statusConfig[transcript.status as keyof typeof statusConfig] || {
      className: `${className} text-gray-500`,
      content: transcript.status,
      title: undefined
    };

    return (
      <div className={config.className} title={config.title}>
        {config.content}
      </div>
    );
  };

  const renderActionButtons = (transcript: TranscriptHistory) => {
    const actionConfig = {
      'IN_PROGRESS': (
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        </div>
      ),
      'FAILED': (
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <DeleteButton 
            transcriptId={transcript.id} 
            deletingId={deletingId} 
            onDelete={handleDelete} 
          />
        </div>
      ),
      'COMPLETED': (
        <div className="flex space-x-4">
          <Link
            to={`/transcript/${transcript.id}`}
            className="text-blue-600 hover:text-blue-900"
            onClick={(e) => e.stopPropagation()}
          >
            {t('transcription_history.view')}
          </Link>
          <DeleteButton 
            transcriptId={transcript.id} 
            deletingId={deletingId} 
            onDelete={handleDelete} 
          />
        </div>
      )
    };

    return actionConfig[transcript.status as keyof typeof actionConfig] || null;
  };

  const renderListView = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('transcription_history.title')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('transcription_history.text')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('transcription_history.completed_at')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('transcription_history.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transcripts.map(transcript => (
            <tr key={transcript.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleCardClick(transcript.id)}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{transcript.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {renderTextByStatus(transcript)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Tooltip content={transcript.completed_at ? formatFullDate(transcript.completed_at) : '-'}>
                  <div className="text-sm text-gray-500">
                    {transcript.completed_at ? formatDate(transcript.completed_at) : '-'}
                  </div>
                </Tooltip>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {renderActionButtons(transcript)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderGridCard = (transcript: TranscriptHistory) => (
    <div
      key={transcript.id}
      className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-200 cursor-pointer hover:bg-white/90 transition-all duration-200 relative"
      onClick={() => handleCardClick(transcript.id)}
    >
      <DeleteButton 
        transcriptId={transcript.id} 
        deletingId={deletingId} 
        onDelete={handleDelete}
        className="absolute top-2 right-2 text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed z-10"
      />

      <h2 className="text-xl font-semibold mb-2 overflow-hidden text-ellipsis line-clamp-2 pr-8">
        {transcript.title}
      </h2>
      
      <div className="mb-4">
        {transcript.completed_at ? (
          <Tooltip content={formatFullDate(transcript.completed_at)}>
            <p className="text-sm text-gray-500">
              {formatDate(transcript.completed_at)}
            </p>
          </Tooltip>
        ) : (
          <p className="text-sm text-gray-400">
            {t('transcription_history.in_progress')}
          </p>
        )}
      </div>

      {transcript.transcription_text && (
        <div className="bg-gray-100 p-3 rounded-lg overflow-y-auto mb-4">
          <div className="text-sm text-gray-800 line-clamp-2">
            {renderTextByStatus(transcript)}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Layout title={t('transcription_history.title')}>
      <div className="flex justify-between items-center mb-4">
        <button
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
          onClick={handleBack}
        >
          {t('transcription_history.back')}
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 shadow-lg"
            title={viewMode === 'grid' ? t('transcription_history.switch_to_list_view') : t('transcription_history.switch_to_grid_view')}
          >
            {viewMode === 'grid' ? (
              <FaList className="w-5 h-5 text-gray-600" />
            ) : (
              <FaThLarge className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <Link
            to="/transcriber"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-sm transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FaPlus className="w-4 h-4" />
            <span>{t('transcription_history.new_transcription')}</span>
          </Link>
        </div>
      </div>
      <div className="relative min-h-[calc(95vh-10rem)]">
        {/* Fondo con blur */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#70828a56] to-[#06244d71] blur-3xl"></div>

        {/* Contenido nítido */}
        <div className="relative mx-auto px-4 py-6 flex-1 w-full z-10">
          {loading ? (
            renderLoadingState()
          ) : transcripts && transcripts.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {transcripts.map(renderGridCard)}
              </div>
            ) : (
              renderListView()
            )
          ) : (
            renderEmptyState()
          )}
        </div>
      </div>

      {showDeleteDialog && selectedTranscriptId && (
        <Dialog
          title={t('transcription_history.delete_transcription')}
          description={t('transcription_history.delete_transcription_confirmation', { 
            name: transcripts.find(t => t.id === selectedTranscriptId)?.title 
          })}
          onConfirm={() => {
            handleConfirmDelete();
            setShowDeleteDialog(false);
          }}
          onCancel={() => {
            setShowDeleteDialog(false);
            setSelectedTranscriptId(null);
          }}
          confirmText={t('transcription_history.delete')}
          cancelText={t('transcription_history.cancel')}
        />
      )}
    </Layout>
  );
};

export default TranscriptionHistory;
