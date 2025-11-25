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

import React, { useMemo } from 'react';
import CardContainer from '../components/card-container';
import Layout from '../components/layout';
import { ServiceUI } from '../types';
import { servicesData } from '../data/servicesData';
import useAuth from '../hooks/useAuth';
import CourseList from '../components/course-list';
import { useTranslation } from 'react-i18next';

const MainDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { availableServices } = useAuth();

  const mergedServicesData: ServiceUI[] = useMemo(() => {
    return servicesData
      .map(service => {
        const additionalInfo = availableServices.find(s => s.code === service.code);
        return additionalInfo ? { ...service, ...additionalInfo } : null;
      })
      .filter(service => service !== null) as ServiceUI[];
  }, [availableServices]);

  return (
    <Layout title={t('main_dashboard.dashboard')}>
      <h1 className="text-2xl font-bold mb-4">{t('main_dashboard.main_services')}</h1>
      <CardContainer cardData={mergedServicesData} />
      <div className="w-full border-t border-gray-300 my-6"></div>
      <CourseList />
    </Layout>
  );
};

export default MainDashboard;
