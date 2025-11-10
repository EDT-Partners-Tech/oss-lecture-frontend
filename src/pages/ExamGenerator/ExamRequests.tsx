// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import Layout from '../../components/layout';
import RequestList from '../../components/request-list';
import { useTranslation } from 'react-i18next';

const ExamRequests: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Layout title={t('exam_generator.request_history')}>
      <RequestList />
    </Layout>
  );
};
export default ExamRequests;
