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
import { servicesData, knowledgebaseServicesData } from '../data/servicesData';
import useAuth from '../hooks/useAuth';

interface ServicesDashboardProps {
  knowledgeBase?: boolean;
}

const ServicesDashboard: React.FC<ServicesDashboardProps> = ({ knowledgeBase = false }) => {
  const { availableServices } = useAuth();

  const servicesUIData = knowledgeBase ? knowledgebaseServicesData : servicesData;

  const mergedServicesData: ServiceUI[] = useMemo(() => {
    return servicesUIData
      .map(service => {
        const additionalInfo = availableServices.find(s => s.code === service.code);
        return additionalInfo ? { ...service, ...additionalInfo } : null;
      })
      .filter(service => service !== null) as ServiceUI[];
  }, [availableServices, servicesUIData]);

  return (
    <Layout title="Dashboard">
      <CardContainer cardData={mergedServicesData} />
    </Layout>
  );
};

export default ServicesDashboard;
