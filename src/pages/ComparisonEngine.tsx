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
