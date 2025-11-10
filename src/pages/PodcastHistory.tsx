// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import { useState, useEffect, useCallback, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/layout';
import { PodcastDetailsItem, PodcastStatus } from '../types';
import { getPodcastUserHistory, deletePodcast } from '../services/api';
import { FaSpinner, FaPlus } from 'react-icons/fa';
import { invalidateCache } from '../utils/podcastHistoryCache';
import { useTranslation } from 'react-i18next';
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

const PodcastHistory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAppSyncSubscribed } = useAuth();
  const { user } = useContext(AuthContext) as any;
  const [podcasts, setPodcasts] = useState<PodcastDetailsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [selectedPodcastId, setSelectedPodcastId] = useState<string | null>(null);

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

  const formatDate = (dateString: string) => {
    try {
      // Get the user's locale or use English as fallback
      const userLocale = user?.locale || 'en-US';
      const dateFnsLocale = localeMap[userLocale] || enUS;
      
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
      // Get the user's locale or use English as fallback
      const userLocale = user?.locale || 'en-US';
      const dateFnsLocale = localeMap[userLocale] || enUS;
      
      // Format for different locales
      const date = new Date(dateString);
      
      // Use different format patterns based on locale
      if (userLocale.startsWith('es')) {
        return format(date, "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: dateFnsLocale });
      } else if (userLocale.startsWith('en')) {
        return format(date, "MMMM d, yyyy 'at' HH:mm", { locale: dateFnsLocale });
      } else if (userLocale.startsWith('fr')) {
        return format(date, "d MMMM yyyy 'à' HH:mm", { locale: dateFnsLocale });
      } else if (userLocale.startsWith('de')) {
        return format(date, "d. MMMM yyyy 'um' HH:mm", { locale: dateFnsLocale });
      } else if (userLocale.startsWith('pt')) {
        return format(date, "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: dateFnsLocale });
      } else {
        // Default format for other locales
        return format(date, "MMMM d, yyyy 'at' HH:mm", { locale: dateFnsLocale });
      }
    } catch {
      return dateString;
    }
  };

  const fetchPodcasts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getPodcastUserHistory();
      setPodcasts(response.data || []);
    } catch (err) {
      setError(t('podcast_history.error_loading_podcasts'));
    } finally {
      setLoading(false);
    }
  }, [t]);



  const handleDelete = async (id: string) => {
    setSelectedPodcastId(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPodcastId) return;

    try {
      await deletePodcast(selectedPodcastId);
      invalidateCache();
      fetchPodcasts();
    } catch (err) {
      setError(t('podcast_history.error_deleting_podcast'));
    } finally {
      setSelectedPodcastId(null);
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, [fetchPodcasts]);

  // Suscribirse al evento de actualización de podcasts
  useEffect(() => {
    if (isAppSyncSubscribed) {
      const handlePodcastUpdate = () => {
        fetchPodcasts();
      };

      subscribeToEvent('podcastUpdate', handlePodcastUpdate);

      return () => {
        unsubscribeFromEvent('podcastUpdate', handlePodcastUpdate);
      };
    }
  }, [isAppSyncSubscribed, fetchPodcasts]);

  const handleCardClick = (id: string) => {
    navigate(`/podcast/${id}`);
  };

  const renderEmptyState = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8 text-center max-w-2xl mx-auto">
      <div className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4 flex items-center justify-center">
        <span className="text-4xl">🎙️</span>
      </div>
      <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
        {t('podcast_history.no_podcast_created')}
      </h2>
      <p className="text-sm sm:text-base text-gray-500 mb-6">
        {t('podcast_history.create_your_first_podcast')}
      </p>
      <Link
        to="/podcast-generator"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <FaPlus className="w-4 h-4" />
        <span>{t('podcast_history.generate_new_podcast')}</span>
      </Link>
    </div>
  );

  return (
    <Layout title={t('podcast_history.title')}>
      <div className="space-y-4 p-6">
      <div className="flex w-full justify-between">
        <button
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
          onClick={() => navigate('/dashboard')}
        >
          {t('podcast_generator.back')}
        </button>
          <Link to="/podcast-generator">
            <button className="px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600 transition duration-300">
              {t('podcast_history.generate_new_podcast')}
            </button>
          </Link>
      </div>
        {}
        {loading ? (
          <p>{t('podcast_history.loading')}</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : podcasts && podcasts.length > 0 ? (
          <div className="space-y-4">
            {podcasts.map(podcast => {
              // Determine the status of the podcast
              const status = podcast.status || PodcastStatus.COMPLETED;
              
              return (
                <div
                  key={podcast.id}
                  className="bg-white p-4 rounded-lg shadow-md flex items-stretch border border-gray-200"
                >
                                      <div className="w-1/4">
                      {podcast.imageUrl && status === PodcastStatus.COMPLETED ? (
                        <img
                          src={podcast.imageUrl}
                          alt="Podcast Cover"
                          className="w-full h-auto rounded"
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center">
                          {(status === PodcastStatus.PROCESSING || status === PodcastStatus.AUDIO || status === PodcastStatus.IMAGE) && (
                            <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
                          )}
                          {status === PodcastStatus.ERROR && (
                            <span className="text-red-500 text-2xl">⚠️</span>
                          )}
                        </div>
                      )}
                    </div>
                  <div className="w-3/4 pl-4 flex flex-col justify-between">
                    <div className="flex mb-2 justify-between items-center">
                      <h2 className="text-xl font-semibold overflow-hidden text-ellipsis">
                        {podcast.title}
                      </h2>
                      {(status === PodcastStatus.COMPLETED || status === PodcastStatus.ERROR) && (
                        <button
                          onClick={() => handleDelete(podcast.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title={t('podcast_history.delete')}
                        >
                          <span className="text-xl">×</span>
                        </button>
                      )}
                    </div>
                    
                    {/* Content according to the status */}
                    {(status === PodcastStatus.PROCESSING || status === PodcastStatus.AUDIO || status === PodcastStatus.IMAGE) && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <FaSpinner className="w-4 h-4 animate-spin" />
                        <span>
                          {status === PodcastStatus.PROCESSING && t('podcast_history.processing_podcast')}
                          {status === PodcastStatus.AUDIO && t('podcast_history.generating_audio')}
                          {status === PodcastStatus.IMAGE && t('podcast_history.generating_image')}
                        </span>
                      </div>
                    )}
                    
                    {status === PodcastStatus.ERROR && (
                      <div className="text-red-600 mb-2">
                        <p>{t('podcast_history.podcast_creation_failed')}</p>
                      </div>
                    )}
                    
                    {status === PodcastStatus.COMPLETED && (
                      <>
                        <audio controls className="w-full">
                          <source src={podcast.audioUrl} type="audio/mp3" />
                          {t('podcast_history.your_browser_does_not_support_the_audio_element')}
                        </audio>
                        <div className="mt-4 flex items-center w-full justify-between">
                          <div className="flex space-x-2 gap-1">
                            <a
                              href={podcast.audioUrl}
                              download
                              className="px-4 py-2 bg-green-500 text-white rounded-md"
                            >
                              {t('podcast_history.download_audio')}
                            </a>
                            <button
                              onClick={() => handleCardClick(podcast.id)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-md"
                            >
                              {t('podcast_history.details')}
                            </button>
                          </div>
                          <Tooltip content={podcast.completed_at ? formatFullDate(podcast.completed_at) : ''} position="auto">
                            <span className="text-sm text-gray-500 ml-auto cursor-help">
                              {podcast.completed_at
                                ? formatDate(podcast.completed_at)
                                : ''}
                            </span>
                          </Tooltip>
                        </div>
                      </>
                    )}
                    
                    {/* Delete button for error states */}
                    {status === PodcastStatus.ERROR && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleDelete(podcast.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title={t('podcast_history.delete')}
                        >
                          <span className="text-xl">×</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          renderEmptyState()
        )}
      </div>

      {showDeleteDialog && selectedPodcastId && (
        <Dialog
          title={t('podcast_history.delete_podcast')}
          description={t('podcast_history.are_you_sure_you_want_to_delete_this_podcast')}
          onConfirm={() => {
            handleConfirmDelete();
            setShowDeleteDialog(false);
          }}
          onCancel={() => {
            setShowDeleteDialog(false);
            setSelectedPodcastId(null);
          }}
          confirmText={t('podcast_history.delete')}
          cancelText={t('podcast_history.cancel')}
        />
      )}
    </Layout>
  );
};

export default PodcastHistory;
