// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React, { useState, useRef } from 'react';
import { transcribeMedia, getTranscriptionStatus, summarizeTranscript } from '../services/api';
import Layout from '../components/layout';
import FileUpload from '../components/file-upload';
import { Download } from '../images/icons';
import { createDownloadLink, removeExtension } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { showToast } from '../services/toastService';
import { Copy } from '../images/icons';
import { downloadDocx } from '../lib/utils';
import { t } from 'i18next';
import useAuth from '../hooks/useAuth';

const Transcriber: React.FC = () => {
  const navigate = useNavigate();
  const { isAppSyncSubscribed } = useAuth();
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [file, setFile] = useState<File | undefined>(undefined);
  const [language, setLanguage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const [response, setResponse] = useState<any>(null);
  const [summary, setSummary] = useState<any>('');
  const [summarizing, setSummarizing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const intervalId = useRef<NodeJS.Timeout | null>(null);

  const languages = [
    { label: 'English (Australia)', value: 'en-AU' },
    { label: 'English (United Kingdom)', value: 'en-GB' },
    { label: 'English (United States)', value: 'en-US' },
    { label: 'English (Ireland)', value: 'en-IE' },
    { label: 'English (India)', value: 'en-IN' },
    { label: 'English (New Zealand)', value: 'en-NZ' },
    { label: 'Arabic (Modern Standard)', value: 'ar-SA' },
    { label: 'Arabic (UAE)', value: 'ar-AE' },
    { label: 'Chinese (Mandarin)', value: 'zh-CN' },
    { label: 'Chinese (Hong Kong)', value: 'zh-HK' },
    { label: 'Chinese (Taiwan)', value: 'zh-TW' },
    { label: 'French (Canada)', value: 'fr-CA' },
    { label: 'French (France)', value: 'fr-FR' },
    { label: 'German (Germany)', value: 'de-DE' },
    { label: 'German (Switzerland)', value: 'de-CH' },
    { label: 'Hindi (India)', value: 'hi-IN' },
    { label: 'Italian (Italy)', value: 'it-IT' },
    { label: 'Japanese (Japan)', value: 'ja-JP' },
    { label: 'Korean (Korea)', value: 'ko-KR' },
    { label: 'Portuguese (Brazil)', value: 'pt-BR' },
    { label: 'Portuguese (Portugal)', value: 'pt-PT' },
    { label: 'Russian (Russia)', value: 'ru-RU' },
    { label: 'Spanish (Spain)', value: 'es-ES' },
    { label: 'Spanish (United States)', value: 'es-US' },
  ];

  const handleYoutubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFile(undefined);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    const formData = new FormData();
    if (youtubeUrl) {
      formData.append('youtube_url', youtubeUrl);
    }
    if (file) {
      formData.append('file', file);
    }
    if (!language) {
      setError(t('transcriber.please_select_a_language'));
      setLoading(false);
      return;
    }
    formData.append('language_code', language);

    try {
      setStatusText(t('transcriber.uploading'));
      setProgress(0);

      // Determine if async_processing should be used
      // If AppSync subscriptions are active, use async_processing = true
      const shouldUseAsyncProcessing = isAppSyncSubscribed;

      const result = await transcribeMedia(formData, shouldUseAsyncProcessing);

      // Check if the response status is in the 200-299 range
      if (result && result.status >= 200 && result.status < 300) {
        if (shouldUseAsyncProcessing) {
          // If using async processing, redirect to transcripts page
          setStatusText(t('transcriber.transcription_started'));
          showToast('success', t('transcriber.transcription_started'));
          navigate('/transcripts');
          return;
        }
      }

      const data = result.data;

      setStatusText(t('transcriber.analyzing'));
      setProgress(20);

      setTitle(data.title);
      pollTranscriptionStatus(data.job_name);
    } catch (err) {
      console.error('Error:', err);
      setError(t('transcriber.an_error_occurred_during_transcription'));
      setLoading(false);
    }
  };

  const pollTranscriptionStatus = (jobName: string) => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
    }
    intervalId.current = setInterval(async () => {
      try {
        const statusResponse = await getTranscriptionStatus(jobName);
        const status = statusResponse.status;

        if (status === 'COMPLETED') {
          setProgress(100);
          setStatusText('Completed');
          setResponse((prevResponse: any) => ({
            ...prevResponse,
            transcript: statusResponse.transcript,
            audioUrl: statusResponse.audioUrl,
            transcript_id: statusResponse.transcript_id,
          }));
          clearInterval(intervalId.current!);
          intervalId.current = null;
          setLoading(false);
        } else if (status === 'FAILED') {
          setProgress(0);
          setStatusText('Failed');
          clearInterval(intervalId.current!);
          intervalId.current = null;
          setLoading(false);
        } else {
          setProgress(prev => Math.min(prev + 15, 90));
          setStatusText(
            status === 'IN_PROGRESS' ? t('transcriber.transcribing') : t('transcriber.queued')
          );
        }
      } catch (error) {
        console.error(t('transcriber.error_polling_status'), error);
        clearInterval(intervalId.current!);
        intervalId.current = null;
        setLoading(false);
      }
    }, 6000);
  };

  const handleClear = () => {
    setActiveTab('file');
    setYoutubeUrl('');
    setFile(undefined);
    setLoading(false);
    setProgress(0);
    setStatusText('');
    setResponse(null);
    setError(null);
  };

  const handleSummarize = async () => {
    if (response.transcript && response.transcript_id && language) {
      setSummarizing(true);
      const summary = await summarizeTranscript(
        response.transcript_id,
        response.transcript,
        language
      );
      setSummary(summary.data);
      setSummarizing(false);
    } else {
      console.error(t('transcriber.transcript_or_its_id_is_undefined'));
    }
  };

  return (
    <Layout title={t('transcriber.title')}>
      <div className="flex justify-start">
        <button
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
          onClick={() => navigate('/transcripts')}
        >
          {t('transcriber.back')}
        </button>
      </div>
      <div className="space-y-6 bg-white p-6 rounded-md shadow-md mt-4">
        {response === null && (
          <>
            <div className="flex border-b border-gray-200 justify-between items-center">
              <button
                className={`py-2 px-4 text-sm font-medium ${
                  activeTab === 'file'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600'
                }`}
                onClick={() => setActiveTab('file')}
              >
                {t('transcriber.file_upload')}
              </button>
              <div className="flex items-center gap-4">
                <select
                  className="p-2 border border-gray-300 rounded-md"
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                >
                  <option value="">{t('transcriber.select')}</option>
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              {activeTab === 'file' && (
                <FileUpload
                  handleFileChange={handleFileChange}
                  file={file}
                  text={t('transcriber.upload_video')}
                  formats={['mp4', 'mov', 'mp3']}
                  clearFile={clearFile}
                  className="mb-4"
                />
              )}
              {activeTab === 'url' && (
                <input
                  type="text"
                  placeholder={t('transcriber.enter_youtube_url')}
                  value={youtubeUrl}
                  onChange={handleYoutubeUrlChange}
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                />
              )}
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !language || (!file && !youtubeUrl)}
                  className={`px-6 py-2 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                    loading || !language || (!file && !youtubeUrl) 
                      ? 'bg-gray-400' 
                      : 'bg-primary hover:bg-primary-foreground'
                  } transition duration-300`}
                >
                  {t('transcriber.generate')}
                </button>
              </div>
              
              {loading && (
                <div className="mt-6">
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-teal-600">
                        {t('transcriber.status')}:
                        <span className="animate-pulse px-2 py-1 bg-teal-200 rounded-full ml-2">
                          {statusText}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{progress}%</div>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full animate-progress-bar ${getProgressBarColor(progress)}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        {response?.transcript && (
          <>
            <div className="flex items-center">
              <h3 className="text-lg font-semibold">{removeExtension(title)}</h3>
              {response.transcript && (
                <div className="ml-auto flex items-center space-x-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(response.transcript);
                      showToast('success', t('transcriber.copied_to_clipboard'));
                    }}
                    className="flex items-center hover:underline"
                  >
                    <Copy className="w-4 text-gray-700" />
                  </button>
                  <button
                    onClick={async () => {
                      await downloadDocx(response.transcript, title);
                      showToast('success', t('transcriber.downloaded_as_docx'));
                    }}
                    className="flex flex-col items-center hover:underline"
                  >
                    <Download className="w-5 text-gray-700" />
                    <p className="text-[0.5rem]">DOCX</p>
                  </button>
                  <a
                    href={createDownloadLink(response.transcript)}
                    download={`transcribed_${removeExtension(title)}.txt`}
                    onClick={() => showToast('success', t('transcriber.downloaded_as_txt'))}
                    className="flex flex-col items-center hover:underline"
                  >
                    <Download className="w-5 text-gray-700" />
                    <p className="text-[0.5rem]">TXT</p>
                  </a>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-blue-100 border border-blue-400 rounded max-h-[75vh] overflow-y-scroll shadow-md">
              <p>{response.transcript}</p>
            </div>

            {summary && (
              <div>
                <h4 className="text-lg font-semibold">{t('transcriber.summary')}</h4>
                <div className="flex justify-end items-center space-x-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(summary);
                      showToast('success', t('transcriber.copied_to_clipboard'));
                    }}
                    className="flex items-center hover:underline"
                  >
                    <Copy className="w-4 text-gray-700" />
                  </button>
                  <button
                    onClick={async () => {
                      await downloadDocx(summary, 'Summary_' + title);
                      showToast('success', t('transcriber.downloaded_as_docx'));
                    }}
                    className="flex flex-col items-center hover:underline"
                  >
                    <Download className="w-4 text-gray-700" />
                    <p className="text-[0.5rem]">DOCX</p>
                  </button>
                  <a
                    href={createDownloadLink(summary)}
                    download={`summary_${removeExtension(title)}.txt`}
                    className="flex flex-col items-center hover:underline"
                    onClick={() => showToast('success', t('transcriber.downloaded_as_txt'))}
                  >
                    <Download className="w-4 text-gray-700" />
                    <p className="text-[0.5rem]">TXT</p>
                  </a>
                </div>
                <div className="mt-4 p-4 bg-blue-100 border border-blue-400 rounded max-h-[75vh] overflow-y-scroll shadow-md">
                  <ReactMarkdown className="markdown-content">{summary}</ReactMarkdown>
                </div>
              </div>
            )}

            {response?.audioUrl && (
              <div className="mt-4 bg-white p-4 border border-gray-300 rounded shadow-md">
                <audio controls className="w-full rounded-lg border border-gray-300 bg-gray-100">
                  <source src={response.audioUrl} type="audio/mp3" />
                  {t('transcriber.browser_not_supported')}
                </audio>
              </div>
            )}
            <div className="flex space-between">
              {!summary && (
                <button
                  onClick={handleSummarize}
                  className={`mt-4 px-4 py-2 text-white rounded-md  ${
                    summarizing
                      ? 'opacity-50 bg-gray-500 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-foreground '
                  }`}
                >
                  {summarizing ? t('transcriber.summarizing') : t('transcriber.summarize')}
                </button>
              )}
            </div>
            <button
              onClick={handleClear}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              {t('transcriber.clear')}
            </button>
          </>
        )}

        {error && <div className="text-red-500 mt-4">{error}</div>}
      </div>
    </Layout>
  );
};

const getProgressBarColor = (progress: number) => {
  if (progress === 0) return 'bg-gray-300';
  if (progress < 100) return 'bg-blue-500';
  return 'bg-green-500';
};

export default Transcriber;
