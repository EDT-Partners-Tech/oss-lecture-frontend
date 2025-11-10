import React, { useState } from 'react';
import Layout from '../components/layout';
import FileUpload from '../components/file-upload';
import { uploadPdf, uploadUrl } from '../services/api';
import ChatUI from '../components/chat-ui';
import { useTranslation } from 'react-i18next';

const ContentChat: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [url, setUrl] = useState<string>('');
  const [file, setFile] = useState<File | undefined>(undefined);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : undefined;
    setFile(file);
  };

  const clearFile = () => {
    setFile(undefined);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (activeTab === 'url') {
        const result = await uploadUrl(url);
        setResponse(result);
      } else if (activeTab === 'file' && file) {
        const result = await uploadPdf(file);
        setResponse(result);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={t('content_chat.title')}>
      <div className="space-y-6 bg-white p-5 rounded-md shadow-md">
        {!response && (
          <div>
            <div className="flex border-b border-gray-200">
              <button
                className={`py-2 px-4 text-sm font-medium ${
                  activeTab === 'file'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600'
                }`}
                onClick={() => setActiveTab('file')}
              >
                {t('content_chat.file_upload')}
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium ${
                  activeTab === 'url' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
                }`}
                onClick={() => setActiveTab('url')}
              >
                {t('content_chat.url_input')}
              </button>
            </div>
            <div className="mt-4">
              {activeTab === 'file' && (
                <div>
                  <FileUpload
                    handleFileChange={handleFileChange}
                    file={file}
                    text={t('content_chat.upload_course_content_or_material')}
                    formats={['pdf']}
                    clearFile={clearFile}
                  />
                </div>
              )}
              {activeTab === 'url' && (
                <div>
                  <input
                    type="text"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder={t('content_chat.enter_url')}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
              >
                {loading ? t('content_chat.submitting') : t('content_chat.submit')}
              </button>
            </div>
          </div>
        )}
        {response && (
          <div className="mt-4">
            <ChatUI initialResponse={response.summary} docId={response.doc_id} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ContentChat;
