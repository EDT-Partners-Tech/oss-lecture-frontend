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

import cardComparisonData from '../data/cardComparisonData';
import CardContainer from '../components/card-container';
import React from 'react';
import Layout from '../components/layout';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ComparisonEngine: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <Layout title={t('comparison_engine.title')}>
      <div className="flex justify-between items-center mb-4">
        <button
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
          onClick={handleBack}
        >
          {t('comparison_engine.back')}
        </button>
      </div>
      <CardContainer cardData={cardComparisonData} />
    </Layout>
  );
};

export default ComparisonEngine;
