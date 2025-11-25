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
