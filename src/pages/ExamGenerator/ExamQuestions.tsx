import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout';
import RequestQuestions from '../../components/request-questions';

const ExamQuestions: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/exam-requests');
  };

  return (
    <Layout title={t('exam_generator.request_history')}>
      <div className="flex justify-start mb-4">
        <button
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
          onClick={handleBack}
        >
          {t('exam_generator.back')}
        </button>
      </div>
      <RequestQuestions />
    </Layout>
  );
};

export default ExamQuestions;
