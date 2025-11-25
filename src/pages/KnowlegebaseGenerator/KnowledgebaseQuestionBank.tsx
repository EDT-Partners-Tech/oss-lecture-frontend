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

import { useState, useEffect } from 'react';
import Layout from '../../components/layout';
import ListQuestions from '../../components/list-questions';
import { getQuestionBank } from '../../services/api';
import { Question } from '../../types';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const KnowledgebaseQuestionBank: React.FC = () => {
  const { t } = useTranslation();
  const [courseId, setCourseId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const { id } = useParams<{ id: string }>();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setCourseId(id ?? '');
  });

  useEffect(() => {
    const getQuestions = async () => {
      try {
        const data = await getQuestionBank(courseId);
        setQuestions(data.data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };

    if (courseId) {
      getQuestions();
    }
  }, [courseId]);

  return (
    <Layout title={t('knowledgebase_generator.question_bank')}>
      <ListQuestions
        linkTo={`/${courseId}/exam-generator`}
        title={t('knowledgebase_generator.question_bank')}
        questions={questions}
      />
    </Layout>
  );
};
export default KnowledgebaseQuestionBank;
