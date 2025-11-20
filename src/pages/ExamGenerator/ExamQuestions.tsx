/*
 * Copyright 2025 EDT&Partners
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
