import React, { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { AIModel, Service, UserData } from '../types';
import {
  configureGroupModels,
  configureGroupServices,
  getGroupModels,
  getGroupServices,
  getModels,
  updateGroupName,
  thirdPartyIntegrationService,
  getGuardrailsByAgents,
  getGuardrails,
} from '../services/api';
import Layout from '../components/layout';
import { Edit } from '../images/icons';
import { showToast } from '../services/toastService';
import AdminConfigItemsPanel from '../components/admin-config-items-panel';
import LogoUploader from '../components/logo-uploader';
import LTIIntegrationsPanel from '../components/lti-integrations-panel';
import AgentGuardrailsPanel from '../components/admin-guardrails-panel';
import ThirdPartyIntegrationPanel from '../components/third-party-integration-panel';
import TopicsConfigurationPanel from '../components/topics-configuration-panel';
import ServiceTokensPanel from '../components/service-tokens-panel';
import { useTranslation } from 'react-i18next';

const AdminPanel: React.FC = () => {
  const { t } = useTranslation();
  const { user, availableServices, setUser } = useAuth();
  const [availableModelsByProvider, setAvailableModelsByProvider] = useState<
    Record<string, AIModel[]>
  >({});
  const [groupServices, setGroupServices] = useState<Service[]>([]);
  const [groupModels, setGroupModels] = useState<AIModel[]>([]);
  const [groupName, setGroupName] = useState<string>('');
  const [isEditingGroupName, setIsEditingGroupName] = useState<boolean>(false);
  const [isUpdatingGroupName, setIsUpdatingGroupName] = useState<boolean>(false);
  const [originalGroupName, setOriginalGroupName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availableIntegrations, setAvailableIntegrations] = useState<string[]>([]);
  const [globalIntegrations, setGlobalIntegrations] = useState<any[]>([]);
  const [agentGuardrails, setAgentGuardrails] = useState<any[]>([]);
  const [guardrails, setGuardrails] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async (userData: UserData) => {
      try {
        const groupServicesData = await getGroupServices(userData.group.id);
        if (isMounted) setGroupServices(groupServicesData);

        // Fetch third-party integrations
        const availableIntegrationsData = await thirdPartyIntegrationService.getAvailableServices();
        if (isMounted) setAvailableIntegrations(availableIntegrationsData);

        const globalIntegrationsData = await thirdPartyIntegrationService.getGlobalIntegrations();
        if (isMounted) setGlobalIntegrations(globalIntegrationsData);
        
        // Fetch agent guardrails
        const agentGuardrails = await getGuardrailsByAgents();
        if (isMounted) setAgentGuardrails(agentGuardrails);

        const guardrails = await getGuardrails();
        if (isMounted) setGuardrails(guardrails);

        // Fetch models data
        const groupModelsData = await getGroupModels(userData.group.id);
        if (isMounted) setGroupModels(groupModelsData);

        const allModelsData = await getModels({
          all_models: true,
        });

        if (isMounted) {
          const availableModelsByProviderData = allModelsData.models.reduce(
            (acc: Record<string, AIModel[]>, model) => {
              const key = model.provider;
              if (!acc[key]) {
                acc[key] = [];
              }
              acc[key].push(model);
              return acc;
            },
            {}
          );
          setAvailableModelsByProvider(availableModelsByProviderData);

          const groupName =
            userData.group.name !== '' ? userData.group.name : userData.group.domain;
          setGroupName(groupName);
          setOriginalGroupName(groupName);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(t('admin_panel.error_fetching_data'));
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchData(user as UserData);
    }

    return () => {
      isMounted = false;
    };
  }, [user, t]);

  if (!user) {
    return null;
  }

  const handleEditGroupName = () => {
    setIsEditingGroupName(true);
    setOriginalGroupName(groupName);
  };

  const handleGroupNameBlur = async () => {
    setIsEditingGroupName(false);

    if (groupName === originalGroupName) {
      return;
    }

    setIsUpdatingGroupName(true);
    try {
      await updateGroupName(user.group.id, groupName);
      showToast('success', t('admin_panel.group_name_updated_successfully'));
      setOriginalGroupName(groupName);
    } catch (err) {
      console.error(err);
      showToast('error', t('admin_panel.failed_to_update_group_name'));
      setGroupName(originalGroupName);
    } finally {
      setIsUpdatingGroupName(false);
    }
  };

  const handleGroupNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      setGroupName(originalGroupName);
      setIsEditingGroupName(false);
    }
  };

  const handleApplyGroupServices = async (chosenServices: Service[]) => {
    try {
      await configureGroupServices(user.group.id, chosenServices);
      showToast('success', t('admin_panel.services_configuration_applied_successfully'));
    } catch (err) {
      console.error(err);
      showToast('error', t('admin_panel.failed_to_apply_configuration') + err);
    }
  };

  const handleApplyGroupModels = async (chosenModels: AIModel[]) => {
    try {
      await configureGroupModels(user.group.id, chosenModels);
      showToast('success', t('admin_panel.models_configuration_applied_successfully'));
    } catch (err) {
      console.error(err);
      showToast('error', t('admin_panel.failed_to_apply_configuration') + err);
    }
  };

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <Layout title={t('admin_panel.title')}>
      <div className="p-4">
        <LogoUploader user={user} setUser={setUser} />
        <div className="mb-4 flex items-center">
          <label htmlFor="group-name-input" className="font-bold mr-2 text-lg">
            {t('admin_panel.managing_group')}:{' '}
          </label>
          {isEditingGroupName ? (
            <input
              id="group-name-input"
              type="text"
              className="border rounded px-2 py-1"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              onBlur={handleGroupNameBlur}
              onKeyDown={handleGroupNameKeyDown}
              disabled={isUpdatingGroupName}
              autoFocus
            />
          ) : (
            <>
              <span className="mr-2">{groupName}</span>
              {isUpdatingGroupName ? (
                <span className="text-gray-500 text-sm">{t('admin_panel.updating')}</span>
              ) : (
                <button onClick={handleEditGroupName} className="text-blue-600 hover:text-blue-800">
                  <Edit className="text-black" />
                </button>
              )}
            </>
          )}
        </div>
        <div className="my-3 border-t border-gray-300 w-full"></div>
        <div className="mb-4 flex items-center">
          <span className="font-bold mr-2 text-lg">{t('admin_panel.group_region')}:</span>
          {user.group.region.name}
        </div>

        {!loading && (
          <>
            <AdminConfigItemsPanel<Service>
              panelTitle={t('admin_panel.available_services')}
              panelDescription={t('admin_panel.choose_which_services_are_activated_or_deactivated_for_the_entire_group')}
              selectableItemsGroups={[
                availableServices.filter(s => !s.isknowledgebase),
                availableServices.filter(s => s.isknowledgebase),
              ]}
              selectableItemsGroupNames={['Main', 'Knowledge Base']}
              alreadyChosenItems={groupServices}
              columnDefinition={[
                { header: 'Name', render: item => item.name },
                { header: 'Description', render: item => item.description },
              ]}
              handleApply={handleApplyGroupServices}
            />
            <AdminConfigItemsPanel<AIModel>
              panelTitle={t('admin_panel.available_models')}
              panelDescription={t('admin_panel.choose_which_models_are_activated_or_deactivated_for_the_entire_group')}
              selectableItemsGroups={Object.values(availableModelsByProvider)}
              selectableItemsGroupNames={Object.keys(availableModelsByProvider)}
              alreadyChosenItems={groupModels}
              columnDefinition={[
                {
                  header: t('admin_panel.name'),
                  render: item => (
                    <a
                      href={`https://${item.region_name}.console.aws.amazon.com/bedrock/home?region=${item.region_name}#/model-catalog/serverless/${item.identifier}`}
                      className="text-blue-600 hover:text-blue-800"
                      target="_blank"
                    >
                      {item.name}
                    </a>
                  ),
                },
                { header: t('admin_panel.description'), render: item => item.description },
                { header: t('admin_panel.category'), render: item => item.category },
                {
                  header: t('admin_panel.knowledge_base_support'),
                  render: item => (item.supports_knowledge_base ? t('admin_panel.yes') : t('admin_panel.no')),
                },
              ]}
              handleApply={handleApplyGroupModels}
            />
            <div className="bg-white p-4 rounded-md shadow-md mt-4">
              <h2 className="text-xl font-bold mb-4">{t('admin_panel.third_party_integrations')}</h2>
              {loading ? (
                <div>{t('admin_panel.loading_integrations')}</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <div className="space-y-4">
                  {availableIntegrations.map(integrationName => {
                    const integration = globalIntegrations.find(
                      i => i.service_name === integrationName
                    );
                    return (
                      <ThirdPartyIntegrationPanel
                        key={integrationName}
                        service={{
                          id: integrationName,
                          name: integrationName,
                          description: t('admin_panel.configure_integration', { integrationName }),
                          code: integrationName.toLowerCase(),
                          isknowledgebase: false,
                        }}
                        initialConfig={integration?.service_value || {}}
                        onSave={async config => {
                          try {
                            if (integration?.id) {
                              await thirdPartyIntegrationService.updateIntegration(integration.id, {
                                service_value: config.config,
                                service_name: integrationName,
                              });
                            }
                          } catch (error) {
                            console.error(t('admin_panel.error_updating_integration'), error);
                          }
                        }}
                        groupId={user.group.id}
                      />
                    );
                  })}
                </div>
              )}
            </div>
            <LTIIntegrationsPanel />
            <ServiceTokensPanel />
            <TopicsConfigurationPanel />
            <AgentGuardrailsPanel agentGuardrails={agentGuardrails} guardrails={guardrails}/>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminPanel;
