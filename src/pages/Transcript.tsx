import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getTranscriptById, summarizeTranscript } from '../services/api';
import Layout from '../components/layout';
import { createDownloadLink, removeExtension } from '../lib/utils';
import { ArrowBack, Download, Copy } from '../images/icons';
import ReactMarkdown from 'react-markdown';
import { downloadDocx } from '../lib/utils';
import { showToast } from '../services/toastService';

type Transcript = {
  id: number;
  title: string;
  transcription_text: string;
  status: string;
  completed_at: string | null;
  job_name: string;
  audioUrl: string | null;
  summary: string | null;
  language_code?: string;
};

const TranscriptPage = () => {
  const { id } = useParams<{ id: string }>();
  const [transcript, setTranscript] = useState<Transcript>();
  const [error, setError] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState<boolean>(false);

  useEffect(() => {
    if (!id) {
      setError('ID is required.');
      return;
    }

    const fetchTranscript = async () => {
      try {
        const data = await getTranscriptById(id);
        setTranscript(data);
      } catch (error) {
        console.error('Error fetching transcript:', error);
        setError('Failed to fetch transcript.');
      }
    };

    fetchTranscript();
  }, [id]);

  const handleSummarize = async () => {
    if (transcript?.transcription_text && transcript.id) {
      setSummarizing(true);

      try {
        const summary = await summarizeTranscript(
          transcript.id,
          transcript.transcription_text,
          transcript.language_code ?? 'en-US'
        );

        setTranscript(prevTranscript => {
          if (!prevTranscript) return prevTranscript;

          return {
            ...prevTranscript,
            summary: summary.data,
          };
        });
      } catch (error) {
        console.error('Error summarizing transcript:', error);
      } finally {
        setSummarizing(false);
      }
    } else {
      console.error('Transcript or its id is undefined');
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!transcript) {
    return <div>Loading...</div>;
  }

  return (
    <Layout title="Transcript Details">
      <Link to="/transcripts" className="inline-block">
        <ArrowBack className="w-6" />
      </Link>
      <div className="flex items-center">
        <h3 className="text-lg font-semibold">{removeExtension(transcript.title)}</h3>
        {transcript && (
          <div className="ml-auto">
            <div className="ml-auto flex items-center space-x-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(transcript.transcription_text);
                  showToast('success', 'Copied to clipboard');
                }}
                className="flex items-center hover:underline"
              >
                <Copy className="w-4 text-gray-700" />
              </button>
              <button
                onClick={async () => {
                  await downloadDocx(transcript.transcription_text, transcript.title);
                  showToast('success', 'Downloaded as docx');
                }}
                className="flex flex-col items-center hover:underline"
              >
                <Download className="w-5 text-gray-700" />
                <p className="text-[0.5rem]">DOCX</p>
              </button>
              <a
                href={createDownloadLink(transcript.transcription_text)}
                download={`transcribed_${removeExtension(transcript.title)}.txt`}
                onClick={() => showToast('success', 'Downloaded as txt')}
                className="flex flex-col items-center hover:underline"
              >
                <Download className="w-5 text-gray-700" />
                <p className="text-[0.5rem]">TXT</p>
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 p-4 bg-blue-100 border border-blue-400 rounded max-h-[60vh] overflow-y-scroll shadow-md">
        <ReactMarkdown className="markdown-content">{transcript.transcription_text}</ReactMarkdown>
      </div>

      {transcript.summary && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold">Summary</h4>
          <div className="flex justify-end items-center space-x-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(transcript.summary || '');
                showToast('success', 'Copied to clipboard');
              }}
              className="flex items-center hover:underline"
            >
              <Copy className="w-4 text-gray-700" />
            </button>
            <button
              onClick={async () => {
                await downloadDocx(transcript.summary || '', 'Summary_' + transcript.title);
                showToast('success', 'Downloaded as docx');
              }}
              className="flex flex-col items-center hover:underline"
            >
              <Download className="w-4 text-gray-700" />
              <p className="text-[0.5rem]">DOCX</p>
            </button>
            <a
              href={createDownloadLink(transcript.summary)}
              download={`summary_${removeExtension(transcript.title)}.txt`}
              className="flex flex-col items-center hover:underline"
              onClick={() => showToast('success', 'Downloaded as txt')}
            >
              <Download className="w-4 text-gray-700" />
              <p className="text-[0.5rem]">TXT</p>
            </a>
          </div>
          <div className="mt-4 p-4 bg-blue-100 border border-blue-400 rounded max-h-[75vh] overflow-y-scroll shadow-md">
            <ReactMarkdown className="markdown-content">{transcript.summary}</ReactMarkdown>
          </div>
        </div>
      )}

      {transcript.audioUrl && (
        <div className="mt-4 bg-white p-4 border border-gray-300 rounded shadow-md">
          <audio controls className="w-full rounded-lg border border-gray-300 bg-gray-100">
            <source src={transcript.audioUrl} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
      <div className="flex space-between">
        {!transcript.summary && (
          <button
            onClick={handleSummarize}
            className={`mt-4 px-4 py-2 text-white rounded-md  ${
              summarizing
                ? 'opacity-50 bg-gray-500 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-foreground '
            }`}
          >
            {summarizing ? 'Summarizing...' : 'Summarize'}
          </button>
        )}
      </div>
    </Layout>
  );
};

export default TranscriptPage;
