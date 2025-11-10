import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import Layout from '../../components/layout';
import { Material, ModelCategory, Question } from '../../types';
import { AgentExam, getMaterials } from '../../services/api';
import ListQuestions from '../../components/list-questions';
import FileUpload from '../../components/file-upload';
import MaterialsModal from '../../components/materials-modal';
import { FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import ModelSelector from '../../components/model-selector';
import { useTranslation } from 'react-i18next';

const AgentGenerator: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [numberTfq, setNumberTfq] = useState<number>(0);
  const [numberMcq, setNumberMcq] = useState<number>(0);
  const [numberOpen, setNumberOpen] = useState<number>(0);
  const [courseId, setCourseId] = useState('');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [titleLoading, setTitleLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [courseTitle, setCourseTitle] = useState<string>('');
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState<string>('');

  const [modalOpen, setModalOpen] = useState(false);

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    setCourseId(id ?? '');
  }, [id]);

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    setFile(file);
  };

  const clearFile = () => {
    setFile(undefined);
    setCourseId(id ?? '');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const fetchCourseData = async () => {
    if (!id) {
      return;
    }
    setTitleLoading(true);
    try {
      const response = await getMaterials(id);
      setMaterials(response.materials);
      setCourseTitle(response.title);
    } catch (err: any) {
      setError(err.message || 'Error fetching course data');
    } finally {
      setTitleLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (numberTfq + numberMcq + numberOpen === 0) {
      setError('Please set the number of questions to be generated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      if (selectedMaterials.length > 0) {
        formData.append('materials', selectedMaterials.join(','));
      }
      formData.append('course_id', courseId);
      formData.append('number_tfq', numberTfq.toString());
      formData.append('number_mcq', numberMcq.toString());
      formData.append('number_open', numberOpen.toString());
      formData.append('custom_instructions', customInstructions);

      if (selectedModel) {
        formData.append('llm_id', selectedModel);
      }

      const response = await AgentExam(formData);

      if (response.error) {
        setMessage(response.error);
        return;
      }

      setQuestions(response.questions);
    } catch (err) {
      setError((err as Error).message || 'An error occurred while generating questions.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setQuestions([]);
    setNumberTfq(0);
    setNumberMcq(0);
    setNumberOpen(0);
    setCourseId('');
    setCustomInstructions('');
    clearFile();
  };

  return (
    <Layout title={t('knowledgebase_generator.title')}>
      <div className="flex justify-between items-center mb-4">
        <button
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
          onClick={handleBack}
        >
          {t('knowledgebase_generator.back')}
        </button>
      </div>
      {questions.length === 0 ? (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-md shadow-md">
          {titleLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-4 w-1/3"></div>
          ) : (
            <div className="text-2xl font-bold mb-4">{courseTitle}</div>
          )}
          <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0 items-center">
            <label htmlFor="numTfQuestions" className="flex items-center space-x-2">
              <span className="text-sm font-medium">{t('knowledgebase_generator.t_f_questions')}:</span>
              <input
                id="numTfQuestions"
                type="number"
                max="5"
                min="0"
                value={numberTfq}
                onChange={e => setNumberTfq(Number(e.target.value))}
                className="form-input border rounded-md px-2 py-1 w-16"
              />
            </label>
            <label htmlFor="numMcqQuestions" className="flex items-center space-x-2">
              <span className="text-sm font-medium">{t('knowledgebase_generator.mcq_questions')}:</span>
              <input
                id="numMcqQuestions"
                type="number"
                max="5"
                min="0"
                value={numberMcq}
                onChange={e => setNumberMcq(Number(e.target.value))}
                className="form-input border rounded-md px-2 py-1 w-16"
              />
            </label>
            <label htmlFor="numOpenQuestions" className="flex items-center space-x-2">
              <span className="text-sm font-medium">{t('knowledgebase_generator.open_questions')}:</span>
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
              className="w-40"
              region="eu-central-1"
              category={ModelCategory.HighEnd}
              supportsKnowledgeBase={true}
            />
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{t('knowledgebase_generator.filter_materials')}:</span>
              <button
                onClick={e => {
                  e.preventDefault();
                  setModalOpen(true);
                }}
                className="p-2 rounded"
              >
                <FaFilter
                  className={`w-5 h-5 ${selectedMaterials.length > 0 ? 'text-blue-500' : ''}`}
                />
              </button>
            </div>

            {courseId && (
              <div className="ml-auto flex flex-auto justify-end">
                <Link to={`/${courseId}/question-bank`}>
                  <button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-foreground transition">
                    {t('knowledgebase_generator.question_bank')}
                  </button>
                </Link>
              </div>
            )}
          </div>
          <FileUpload
            handleFileChange={handleFileChange}
            file={file}
            text={t('knowledgebase_generator.upload_course_content_or_material')}
            formats={['pdf']}
            clearFile={clearFile}
          />
          <label htmlFor="customInstructions" className="block text-sm font-medium">
            {t('knowledgebase_generator.custom_instructions')}:
          </label>
          <textarea
            id="customInstructions"
            value={customInstructions}
            onChange={e => setCustomInstructions(e.target.value)}
            placeholder={t('knowledgebase_generator.custom_instructions_placeholder')}
            className="form-input border rounded-md px-2 py-1 w-full h-20"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-foreground disabled:opacity-50"
            disabled={loading}
          >
            {loading ? t('knowledgebase_generator.generating') : t('knowledgebase_generator.generate_questions')}
          </button>
          {error && (
            <div>
              <p className="text-red-500">{error}</p>
            </div>
          )}
          {message && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}
        </form>
      ) : (
        <ListQuestions isClearButton={true} onClear={reset} questions={questions} />
      )}

      <MaterialsModal
        materials={materials}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(materials: string[]) => {
          setSelectedMaterials(materials);
        }}
      />
    </Layout>
  );
};

export default AgentGenerator;
