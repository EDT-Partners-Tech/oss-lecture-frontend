// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React from 'react';
import ServiceCard from './service-card';
import { ServiceUI } from '../types';
import { useTranslation } from 'react-i18next';

interface CardContainerProps {
  cardData: ServiceUI[];
  id?: string;
}

const CardContainer: React.FC<CardContainerProps> = ({ cardData, id }) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cardData.map((card, index) => (
        <ServiceCard
          key={index}
          icon={card.icon}
          title={t(`dashboard_card.${card.code}.title`)}
          description={t(`dashboard_card.${card.code}.description`)}
          bgColor={card.bgColor}
          url={id ? `/${id}${card.url}` : card.url}
        />
      ))}
    </div>
  );
};

export default CardContainer;
