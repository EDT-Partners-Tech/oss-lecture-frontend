import { useState } from 'react';
import Layout from '../components/layout';
import { Copy, Download } from '../images/icons';
import mammoth from 'mammoth';
import { showToast } from '../services/toastService';
import FileUpload from '../components/file-upload';
import { translateFile, translateText } from '../services/api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const Translator = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [translatedText, setTranslatedText] = useState('');
  const [blobData, setBlobData] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [contentType, setContentType] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFileUpload, setIsFileUpload] = useState(false);
  const [file, setFile] = useState<File>();
  const [translationRequest, setTranslationRequest] = useState({
    text: '',
    source_lang: '',
    target_lang: '',
  });

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setTranslationRequest(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const languages = {
    ar: 'Arabic',
    zh: 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    en: 'English',
    fr: 'French',
    'fr-CA': 'French (Canada)',
    de: 'German',
    hi: 'Hindi',
    it: 'Italian',
    ja: 'Japanese',
    ko: 'Korean',
    pt: 'Portuguese',
    'pt-BR': 'Portuguese (Brazil)',
    ru: 'Russian',
    es: 'Spanish',
    'es-MX': 'Spanish (Mexico)',
    tr: 'Turkish',
    ur: 'Urdu',
    vi: 'Vietnamese',
  };
  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    setFile(file);
  };

  const handleValidation = (): boolean => {
    const validationErrors = [];

    if (isFileUpload && !file) {
      validationErrors.push(t('translator.no_file_selected'));
    }

    if (!isFileUpload && !translationRequest.text) {
      validationErrors.push(t('translator.please_input_text_to_translate'));
    }
    if (!translationRequest.source_lang) {
      validationErrors.push(t('translator.source_language_is_required'));
    }
    if (!translationRequest.target_lang) {
      validationErrors.push(t('translator.target_language_is_required'));
    }

    if (validationErrors.length > 0) {
      validationErrors.forEach((error: string) => {
        showToast('error', error);
      });
      return false;
    }

    return true;
  };

  const handleTranslate = async () => {
    const isValid = handleValidation();

    if (!isValid) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isFileUpload) {
        if (!file) {
          throw new Error(t('translator.no_file_selected'));
        }

        // Get file size
        const fileSize = file.size;

        // Get file extension
        const fileExtension = file.name.split('.').pop();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('source_lang', translationRequest.source_lang);
        formData.append('target_lang', translationRequest.target_lang);

        // If file size is smaller than 100KB and file extension is docx
        const willBeBlog = fileSize <= 102400 && fileExtension === 'docx';

        const response = await translateFile(formData, willBeBlog);
        // Obtain the filename from AxiosResponse
        let filename = response.headers['content-disposition'];
        filename = filename.split('filename=')[1];
        filename = filename.replace(/['"]+/g, '');
        filename = decodeURIComponent(filename);

        // Get the content type from the response headers
        const contentType = response.headers['content-type'];
        setContentType(contentType);

        // Check if content type is DOCX
        if (
          contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          const blob = new Blob([response.data], { type: contentType });
          const text = await convertDocxToText(blob);
          setTranslatedText(text);
          setBlobData(blob);
        } else {
          setBlobData(null);
          setTranslatedText(response.data);
        }

        setFileName(filename);
      } else {
        const requestBody = {
          text: translationRequest.text,
          source_lang: translationRequest.source_lang,
          target_lang: translationRequest.target_lang,
        };

        const data = await translateText(requestBody);
        setTranslatedText(data.translation);
      }
    } catch (error: any) {
      showToast('error', error.message || 'Failed to translate');
      setError(error.message || 'Failed to translate');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = (mode: string) => {
    if (mode === 'file') {
      setIsFileUpload(true);
    } else {
      setIsFileUpload(false);
    }
  };

  const clearFile = () => {
    setFile(undefined);
  };

  const convertDocxToText = async (blob: Blob): Promise<string> => {
    const arrayBuffer = await readFileAsArrayBuffer(blob);
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const readFileAsArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = event => {
        if (!event.target?.result) {
          reject(new Error('Failed to read file'));
          return;
        }
        resolve(event.target.result as ArrayBuffer);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  };

  const createDownloadLink = () => {
    // Check if blob data is available
    if (blobData) {
      const url = URL.createObjectURL(blobData);
      return url;
    }

    const blob = new Blob([translatedText], { type: contentType });
    return URL.createObjectURL(blob);
  };

  const renderTranslatedContent = () => {
    if (loading) {
      return <p className="text-gray-800">Loading...</p>;
    }
    if (error) {
      return <p className="text-red-600">{error}</p>;
    }
    return (
      <p className="text-gray-800" style={{ whiteSpace: 'pre-line' }}>
        {translatedText}
      </p>
    );
  };

  return (
    <Layout title={t('translator.title')}>
      {/* Back button */}
      <div className="flex justify-start">
        <button
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
          onClick={() => navigate('/dashboard')}
        >
          {t('translator.back')}
        </button>
      </div>
      <div className="w-full items-center bg-white p-4 rounded-lg shadow-lg mt-4 mx-auto px-8 pt-6 pb-8">
        <div className="mb-4">
          <div className="flex flex-wrap items-end -mx-3 mb-4">
            <div className="w-full md:w-1/4 px-3 mb-6 md:mb-0">
              <label htmlFor="source_lang" className="block text-sm font-medium text-gray-700 mb-2">
                {t('translator.source_language')}
              </label>
              <select
                id="source_lang"
                name="source_lang"
                value={translationRequest.source_lang}
                onChange={handleInputChange}
                className="w-full border border-gray-300 text-gray-800 py-2 px-3 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="">{t('translator.select')}</option>
                {Object.entries(languages).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-1/4 px-3 mb-6 md:mb-0">
              <label htmlFor="target_lang" className="block text-sm font-medium text-gray-700 mb-2">
                {t('translator.target_language')}
              </label>
              <select
                id="target_lang"
                name="target_lang"
                disabled={!translationRequest.source_lang}
                value={translationRequest.target_lang}
                onChange={handleInputChange}
                className="w-full border border-gray-300 text-gray-800 py-2 px-3 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="">{t('translator.select')}</option>
                {Object.entries(languages)
                  .filter(([key]) => {
                    if (translationRequest.source_lang === 'en') {
                      return key !== 'en';
                    } else {
                      return key === 'en';
                    }
                  })
                  .map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div>
            <div className="md:flex sm:block mb-4">
              <div className="md:w-1/2 sm:w-full pr-3">
                <div className="flex items-center">
                  <label
                    htmlFor="text"
                    className="block text-sm font-medium text-gray-700 mb-2 mr-4"
                  >
                    {t('translator.source')}
                  </label>
                  <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-gray-200 dark:border-gray-700 dark:text-gray-400 ml-auto">
                    <li className={!isFileUpload ? 'text' : ''}>
                      <button
                        onClick={() => handleToggleMode('text')}
                        className={`inline-block h-10 px-6 rounded-t-lg ${
                          !isFileUpload
                            ? 'text-primary bg-background active border-b-2 border-primary dark:text-blue-500'
                            : 'hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                        }`}
                      >
                        {t('translator.text')}
                      </button>
                    </li>
                    <li className={isFileUpload ? 'text' : 'file'}>
                      <button
                        onClick={() => handleToggleMode('file')}
                        className={`inline-block h-10 px-6 rounded-t-lg ${
                          isFileUpload
                            ? 'text-primary bg-background active border-b-2 border-primary dark:text-blue-500'
                            : 'hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                        }`}
                      >
                        {t('translator.file')}
                      </button>
                    </li>
                  </ul>
                </div>
                {isFileUpload ? (
                  <FileUpload
                    handleFileChange={handleFileChange}
                    file={file}
                    text={t('translator.upload_file_to_translate')}
                    // maxFileSize={102400}
                    formats={['txt', 'pdf', 'docx']}
                    clearFile={clearFile}
                  />
                ) : (
                  <textarea
                    id="text"
                    name="text"
                    value={translationRequest.text}
                    maxLength={10000}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 text-gray-800 py-2 px-3 focus:outline-none focus:border-blue-500 focus:bg-white min-h-64 rounded-lg shadow-sm"
                  />
                )}
              </div>
              <div className="md:w-1/2 sm:w-full flex flex-col">
                <div className="flex mt-2 items-center">
                  <span className="text-sm font-medium text-gray-700">{t('translator.target')}</span>
                  {translatedText && (
                    <div className="flex gap-4 ml-auto">
                      <div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(translatedText);
                            showToast('success', t('translator.copied_to_clipboard'));
                          }}
                          className="flex items-center hover:underline"
                        >
                          <Copy className="w-4 text-gray-700" />
                        </button>
                      </div>
                      <div>
                        <a
                          href={createDownloadLink()}
                          download={fileName}
                          className="flex items-center hover:underline"
                        >
                          <Download className="w-4 text-gray-700" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 bg-background p-4 rounded-lg shadow-md my-2 mt-3 min-h-64 max-h-64 overflow-y-auto">
                  {renderTranslatedContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleTranslate}
            className={`bg-primary hover:bg-primary-foreground text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              loading ? 'opacity-50 bg-primary-foreground cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {t('translator.translate')}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Translator;
