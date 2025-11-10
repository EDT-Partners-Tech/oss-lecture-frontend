import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout';
import FileUpload from '../components/file-upload';
import { generatePodcast, getPodcastDetails, getPodcastStatus } from '../services/api';
import { PodcastDialogItem, PodcastStatus } from '../types';
import { invalidateCache } from '../utils/podcastHistoryCache';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { showToast } from '../services/toastService';
import { FaInfoCircle } from 'react-icons/fa';
import Tooltip from '../components/ui/tooltip';

const PodcastGenerator = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAppSyncSubscribed } = useAuth();
  const [file, setFile] = useState(undefined);
  const [language, setLanguage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [podcastTranscript, setPodcastTranscript] = useState<PodcastDialogItem[] | null>(null);
  const [podcastTitle, setPodcastTitle] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [podcastGenerated, setPodcastGenerated] = useState(false);
  const [pollingStatus, setPollingStatus] = useState<string>('');

  const { podcastId } = useParams<{ podcastId?: string }>();

  useEffect(() => {
    if (podcastId) {
      const loadPodcastDetails = async (id: string) => {
        setLoading(true);
        try {
          const response = await getPodcastDetails(id);
          if (response) {
            setAudioUrl(response.audioUrl);
            setImageUrl(response.imageUrl);
            setPodcastTitle(response.title);
            setPodcastTranscript(response.dialog);
            setPodcastGenerated(true);
          } else {
            setError(t('podcast_generator.podcast_not_found'));
          }
        } catch (err) {
          console.log(t('podcast_generator.error_fetching_podcast_details'), err);
          setError(t('podcast_generator.error_fetching_podcast_details'));
        } finally {
          setLoading(false);
        }
      };
      loadPodcastDetails(podcastId);
    }
  }, [podcastId, t]);

  const languages = [
    { label: 'English (United States)', value: 'english' },
    { label: 'Spanish (Spain)', value: 'spanish' },
  ];

  // Handler for file change (file upload)
  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  const clearFile = () => {
    setFile(undefined);
  };

  // Polling function: polls until podcast is completed
  const pollPodcastStatus = async (podcastId: string) => {
    const poll = async () => {
      try {
        const statusResponse = await getPodcastStatus(podcastId);
        if (statusResponse.status === PodcastStatus.COMPLETED) {
          setPollingStatus(t('podcast_generator.podcast_generation_completed'));
          const details = await getPodcastDetails(podcastId);
          // Update state with details
          setAudioUrl(details.audioUrl);
          setImageUrl(details.imageUrl);
          setPodcastTitle(details.title);
          setPodcastTranscript(details.dialog);
          setPodcastGenerated(true);
          setLoading(false);
          setPollingStatus('');
          // Invalidate cache to refresh podcast history
          invalidateCache();
        } else if (statusResponse.status === PodcastStatus.PROCESSING) {
          setPollingStatus(t('podcast_generator.podcast_is_being_processed'));
          setTimeout(poll, 5000);
        } else if (statusResponse.status === PodcastStatus.AUDIO) {
          setPollingStatus(t('podcast_generator.podcast_dialogue_generated_synthesizing_audio'));
          setTimeout(poll, 5000);
        } else if (statusResponse.status === PodcastStatus.IMAGE) {
          setPollingStatus(t('podcast_generator.podcast_audio_generated_generating_cover_image'));
          setTimeout(poll, 5000);
        } else if (statusResponse.status === PodcastStatus.ERROR) {
          setError(t('podcast_generator.podcast_generation_failed'));
          setLoading(false);
          setPollingStatus('');
        } else {
          setPollingStatus(t('podcast_generator.unknown_status'));
          setTimeout(poll, 5000);
        }
      } catch (err) {
        console.error(t('podcast_generator.error_polling_podcast_status'), err);
        setError(t('podcast_generator.error_polling_podcast_status'));
        setLoading(false);
        setPollingStatus('');
      }
    };
    poll();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (!language) {
      setError(t('podcast_generator.please_select_a_language'));
      setLoading(false);
      return;
    }

    if (!file) {
      setError(t('podcast_generator.a_file_is_required_to_generate_a_podcast'));
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);

    try {
      // Determine if extra_processing should be used
      // If subscriptions are active, use extra_processing = true
      const shouldUseExtraProcessing = isAppSyncSubscribed;
      
      // Call generatePodcast which returns a PodcastStatusResponse containing podcastId
      const response = await generatePodcast(formData, shouldUseExtraProcessing);
      
      if (response?.podcast_id) {
        // If extra_processing is true, redirect to podcast history
        if (shouldUseExtraProcessing) {
          setPollingStatus(t('podcast_generator.podcast_generation_started'));
          showToast('success', t('podcast_generator.podcast_generation_started'));
          // Invalidate cache to force update of the list
          invalidateCache();
          navigate('/podcasts');
        } else {
          setPollingStatus(t('podcast_generator.podcast_generation_started'));
          // Start polling using the returned podcastId
          pollPodcastStatus(response.podcast_id);
        }
      } else {
        setError(t('podcast_generator.empty_response_from_server'));
        setLoading(false);
      }
    } catch (error) {
      console.log('Error generating podcast: ', error);
      setError(t('podcast_generator.error_generating_podcast'));
      setLoading(false);
    }
  };

  return (
    <Layout title={t('podcast_generator.title')}>
      <div className="flex justify-start">
        <button
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
          onClick={() => navigate('/podcasts')}
        >
          {t('podcast_generator.back')}
        </button>
      </div>
      <div className="mx-auto p-4">
        {!podcastGenerated ? (
          <>
            <div className="flex flex-col mb-4">
              <div className="flex border-b border-gray-200 w-full justify-between">
                <button className="py-2 px-4 text-sm font-medium border-b-2 border-blue-500 text-blue-600">
                  {t('podcast_generator.file_upload')}
                </button>
                <div className="flex items-center gap-2">
                  <select
                    className="ml-4 p-2 mb-2 border border-gray-300 rounded-md"
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">{t('podcast_generator.select')}</option>
                    {languages.map(lang => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                  <Tooltip content={t('podcast_generator.language_info')} position="left">
                    <FaInfoCircle className="text-gray-400 hover:text-gray-600 cursor-help" />
                  </Tooltip>
                </div>
              </div>

              <div className="mt-4">
                <FileUpload
                  handleFileChange={handleFileChange}
                  file={file}
                  text={t('podcast_generator.upload_file')}
                  formats={['pdf']}
                  clearFile={clearFile}
                  className="mb-4"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 items-center mt-4">
              <button
                onClick={handleSubmit}
                disabled={loading || !file || !language}
                className={`px-4 py-2 rounded-md text-white disabled:opacity-50 ${
                  loading || !file || !language ? 'bg-gray-400' : 'bg-primary hover:bg-primary-foreground'
                } transition duration-300`}
              >
                {loading ? t('podcast_generator.processing') : t('podcast_generator.generate')}
              </button>
              {pollingStatus && (
                <div className="text-sm text-gray-700">
                  <span className="shadow-animation">{pollingStatus}</span>
                </div>
              )}
            </div>
          </>
        ) : (
            <div></div>
         )}

        {podcastTitle && (
          <div className="mt-4">
            <h2 className="font-semibold text-xl mb-2">{podcastTitle}</h2>
            {imageUrl && (
              <div className="w-full max-w-md mx-auto mt-4">
                <img
                  src={imageUrl}
                  alt="Podcast Cover"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
        )}

        {/* Show transcript and audio after submission */}
        {podcastTranscript && (
          <div className="mt-4">
            <h2 className="font-semibold text-xl mb-2">Transcript</h2>
            <div className="w-full p-2 border border-gray-300 rounded mb-4 bg-white h-64 overflow-y-auto">
              {podcastTranscript.map((item, index) => (
                <div key={index}>
                  <strong>{item.speaker}</strong>: {item.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {audioUrl && (
          <div className="mt-4">
            <h2 className="font-semibold text-xl mb-2">Audio</h2>
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/mp3" />
              {t('podcast_generator.your_browser_does_not_support_the_audio_element')}
            </audio>
          </div>
        )}

        {audioUrl && (
          <div className="mt-4">
            <a href={audioUrl} download className="px-4 py-2 bg-green-500 text-white rounded-md">
              {t('podcast_generator.download_audio')}
            </a>
          </div>
        )}
        {error && <div className="text-red-500 mt-4">{error}</div>}
      </div>
    </Layout>
  );
};

export default PodcastGenerator;
