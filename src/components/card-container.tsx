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
