// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React, { useState } from 'react';
import Layout from '../../components/layout';
import FileUpload from '../../components/file-upload';
import FloatingInput from '../../components/ui/floatingInput';
import { ModelCategory, Question } from '../../types';
import { useNavigate } from 'react-router-dom';
import { generateExam } from '../../services/api';
import ListQuestions from '../../components/list-questions';
import ModelSelector from '../../components/model-selector';
import { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';
import { showToast } from '../../services/toastService';

const ExamGenerator: React.FC = () => {
  const { t } = useTranslation();
  const { isAppSyncSubscribed } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [numberTfq, setNumberTfq] = useState<number>(0);
  const [numberMcq, setNumberMcq] = useState<number>(0);
  const [numberOpen, setNumberOpen] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    setFile(file);
  };

  const clearFile = () => {
    setFile(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      setError(t('exam_generator.please_input_a_course_title'));
      return;
    }

    if (numberTfq + numberMcq + numberOpen === 0) {
      setError(t('exam_generator.please_set_the_number_of_questions_to_be_generated'));
      return;
    }

    if (!file) {
      setError(t('exam_generator.please_upload_a_file'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('number_tfq', numberTfq.toString());
      formData.append('number_mcq', numberMcq.toString());
      formData.append('number_open', numberOpen.toString());
      formData.append('custom_instructions', customInstructions);

      if (selectedModel) {
        formData.append('llm_id', selectedModel);
      }

      // Add async_processing parameter if AppSync is subscribed (for async processing)
      if (isAppSyncSubscribed) {
        formData.append('async_processing', 'true');
      }

      const response = await generateExam(formData);
      
      // Check if status code is between 200-299 (success)
      if (response && response.status >= 200 && response.status < 300) {
        if (isAppSyncSubscribed) {
          // If using AppSync, redirect to exam requests (for async processing)
          showToast('success', t('exam_generator.exam_generation_started'));
          navigate('/exam-requests');
        } else {
          // If not using AppSync, show questions immediately
          setQuestions(response.data.questions);
        }
      } else {
        setQuestions(response.data.questions);
      }
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.detail || t('exam_generator.an_error_occurred_while_generating_questions'));
      } else {
        setError((err as Error).message || t('exam_generator.an_error_occurred_while_generating_questions'));
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setQuestions([]);
    setTitle('');
    setNumberTfq(0);
    setNumberMcq(0);
    setNumberOpen(0);
    setCustomInstructions('');
    clearFile();
  };

  // Function to validate if the button should be enabled
  const isButtonEnabled = () => {
    // 1. The title must have more than 1 character after trim
    const trimmedTitle = title.trim();
    const isTitleValid = trimmedTitle.length > 1;
    
    // 2. At least 1 type of question must be greater than 0
    const hasQuestions = numberTfq > 0 || numberMcq > 0 || numberOpen > 0;
    
    // 3. There must be a file selected
    const hasFile = !!file;
    
    return isTitleValid && hasQuestions && hasFile && !loading;
  };

  return (
    <Layout title={t('exam_generator.title')}>
      <div className="flex justify-start">
        <button
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
          onClick={() => navigate('/dashboard')}
        >
          {t('exam_generator.back')}
        </button>
      </div>
      {questions.length === 0 ? (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-md shadow-md mt-4">
          <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0 items-center">
            <FloatingInput
              id="title"
              type="text"
              value={title}
              label={t('exam_generator.course_title')}
              background="white"
              onChange={e => setTitle(e.target.value)}
              required
            />
            <label htmlFor="numTfQuestions" className="flex items-center space-x-2">
              <span className="text-sm font-medium">{t('exam_generator.t_f_questions')}:</span>
              <input
                id="numTfQuestions"
                type="number"
                max="10"
                min="0"
                value={numberTfq}
                onChange={e => setNumberTfq(Number(e.target.value))}
                className="form-input border rounded-md px-2 py-1 w-16"
              />
            </label>
            <label htmlFor="numMcqQuestions" className="flex items-center space-x-2">
              <span className="text-sm font-medium">{t('exam_generator.mcq_questions')}:</span>
              <input
                id="numMcqQuestions"
                type="number"
                max="10"
                min="0"
                value={numberMcq}
                onChange={e => setNumberMcq(Number(e.target.value))}
                className="form-input border rounded-md px-2 py-1 w-16"
              />
            </label>
            <label htmlFor="numOpenQuestions" className="flex items-center space-x-2">
              <span className="text-sm font-medium">{t('exam_generator.open_questions')}:</span>
              <input
                id="numOpenQuestions"
                type="number"
                max="5"
                min="0"
                value={numberOpen}
                onChange={e => setNumberOpen(Number(e.target.value))}
                className="form-input border rounded-md px-2 py-1 w-16"
              />
            </label>
            <ModelSelector
              value={selectedModel}
              onChange={modelId => setSelectedModel(modelId)}
              category={ModelCategory.HighEnd}
              className="w-40"
            />
          </div>

          <FileUpload
            handleFileChange={handleFileChange}
            file={file}
            text={t('exam_generator.upload_course_content_or_material')}
            formats={['pdf']}
            clearFile={clearFile}
          />
          <label htmlFor="customInstructions" className="block text-sm font-medium">
            {t('exam_generator.custom_instructions')}:
          </label>
          <textarea
            id="customInstructions"
            value={customInstructions}
            onChange={e => setCustomInstructions(e.target.value)}
            placeholder={t('exam_generator.custom_instructions_placeholder')}
            className="form-input border rounded-md px-2 py-1 w-full h-20"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isButtonEnabled()}
            >
              {loading ? t('exam_generator.generating') : t('exam_generator.generate_questions')}
            </button>
          </div>
          {error && (
            <div>
              <p className="text-red-500">{error}</p>
            </div>
          )}
        </form>
      ) : (
        <ListQuestions isClearButton={true} onClear={reset} questions={questions} />
      )}
    </Layout>
  );
};

export default ExamGenerator;
