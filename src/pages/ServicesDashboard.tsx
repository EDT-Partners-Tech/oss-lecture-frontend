// © [2025] EDT&Partners. Licensed under CC BY 4.0.
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
