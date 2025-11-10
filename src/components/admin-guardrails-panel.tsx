import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectableItemsTable } from './selectable-items-table';
import { Dialog, DialogTitle, DialogContent, Button, Typography } from '@mui/material';

interface AdminGuardrailsPanelProps {
  agentGuardrails: any[];
  guardrails: any[];
}

function AgentTable({ agentGuardrails, agentColumns, t }: any) {
  return (
    <>
      <SelectableItemsTable
        items={agentGuardrails}
        selectedItems={[]}
        onToggleItem={() => {}}
        columns={agentColumns}
        visibleRows={8}
        hideActivatedColumn={true}
      />
      {(agentGuardrails?.length === 0
      ) && (
        <div className="px-6 py-3 text-center text-gray-500">
          {t('admin_panel.guardrails_no_agents')}
        </div>
      )}
    </>
  );
}

function GuardrailTable({ guardrails, guardrailColumns, t}: any) {
  return (
    <>
      <SelectableItemsTable
        items={guardrails}
        selectedItems={[]}
        onToggleItem={() => {}}
        columns={guardrailColumns}
        visibleRows={8}
        hideActivatedColumn={true}
      />
      {guardrails?.length === 0 && (
        <div className="px-6 py-3 text-center text-gray-500">{t('admin_panel.no_guardrails_found')}</div>
      )}
    </>
  );
}

function GuardrailDetailsDialog({ selectedGuardrail, setSelectedGuardrail, t }: any) {
  const handleClose = () => {
    if (selectedGuardrail?.__lastTab) {
      setSelectedGuardrail(selectedGuardrail.__lastTab);
    } else {
      setSelectedGuardrail(null);
    }
  };
  const renderTable = (arr: any, label: any) => {
    // Verificar que arr sea un array antes de usar map
    if (!Array.isArray(arr) || arr.length === 0) {
      return (
        <>
          {label && <Typography variant="subtitle2">{label}</Typography>}
          <Typography variant="body2" color="textSecondary">
            {t('admin_panel.no_data')}
          </Typography>
        </>
      );
    }

    return (
      <>
        {label && <Typography variant="subtitle2">{label}</Typography>}
        <table className="min-w-full text-xs border mb-2">
          <thead>
            <tr>
              {Object.keys(arr[0] || {}).map((col) => (
                <th key={col} className="border px-2 py-1 bg-gray-200">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {arr.map((row: any, index: number) => {
              const rowKey = `${index}-${Object.values(row).map(v => (typeof v === 'string' ? v : JSON.stringify(v))).join('-')}`;
              return (
                <tr key={rowKey}>
                  {Object.entries(row ?? {}).map(([colName, val]) => (
                    <td key={`${colName}-${rowKey}`} className="border px-2 py-1">
                      {Array.isArray(val) ? val.join(', ') : String(val)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    );
  };
  const renderSectionTables = (sectionKey: string) => {
    const data = selectedGuardrail?.[sectionKey];
    if (!data || Object.keys(data ?? {}).length === 0) {
      return <Typography>{t('admin_panel.no_data')}</Typography>;
    }
    return (
      <>
        {Object.entries(data ?? {}).map(([label, arr]) => renderTable(arr, label))}
      </>
    );
  };
  return (
    <Dialog
      open={!!selectedGuardrail && selectedGuardrail.__windowSelect === false}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        {selectedGuardrail?.__noGuardrail || !selectedGuardrail?.name ? (
          <Typography variant="h6" color="textSecondary">
            {selectedGuardrail?.agentName ? `${selectedGuardrail.agentName}: ` : ''}
            {t('admin_panel.empty_guardrail')}
          </Typography>
        ) : (
          <>
            {selectedGuardrail.name} {selectedGuardrail.id ? `(ID: ${selectedGuardrail.id})` : ''}
          </>
        )}
        <Button onClick={handleClose} size="small" sx={{ minWidth: 0, ml: 2 }}>
          <span style={{ fontWeight: 'bold', fontSize: '1.2rem', lineHeight: 1 }}>&times;</span>
        </Button>
      </DialogTitle>
      <DialogContent dividers>
        {selectedGuardrail?.__noGuardrail || !selectedGuardrail?.name ? (
          <Typography variant="body1" color="textSecondary">
            {t('admin_panel.empty_guardrail')}
          </Typography>
        ) : (
          <>
            <Typography variant="subtitle1" gutterBottom>
              {t('admin_panel.guardrail_version')}: {selectedGuardrail.version || 'Unknown'}
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              {t('admin_panel.guardrail_state')}: {selectedGuardrail.status || 'Unknown'}
            </Typography>
            {[
              { key: 'topicPolicy', label: 'Topic Policy' },
              { key: 'wordPolicy', label: 'Word Policy' },
              { key: 'contentPolicy', label: 'Content Policy' },
              { key: 'sensitiveInformationPolicy', label: 'Sensitive Information Policy' },
              { key: 'regexMatchPolicy', label: 'Regex Match Policy' },
              { key: 'contextualGroundingPolicy', label: 'Contextual Grounding Policy' },
            ].map((section) => (
              <div key={section.key} className="mb-4">
                <Typography variant="h6">{section.label}</Typography>
                <div className="bg-gray-100 rounded p-2 overflow-x-auto">
                  {renderSectionTables(section.key)}
                </div>
              </div>
            ))}
            <Button onClick={handleClose} variant="contained" color="primary">
              {t('admin_panel.guardrails_close_button')}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

const AdminGuardrailsPanel: React.FC<AdminGuardrailsPanelProps> = ({ agentGuardrails, guardrails }) => {
  const { t } = useTranslation();
  const [selectedGuardrail, setSelectedGuardrail] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'agents' | 'guardrails'>('agents');

  const handleRowClick = (agent: any) => {
    if (agent.guardrailConfiguration?.id) {
      setSelectedGuardrail({ ...agent.guardrailConfiguration, __windowSelect: false, __lastTab: selectedGuardrail });
    } else {
      setSelectedGuardrail({
        name: null,
        __windowSelect: false,
        __lastTab: selectedGuardrail,
        __noGuardrail: true,
        agentName: agent.agentName
      });
    }
  };

  // Column definitions
  const agentColumns = [
    {
      key: 'agentName',
      header: t('admin_panel.guardrail_agent'),
      render: (agent: any) => <div className="font-medium text-gray-900">{agent.agentName}</div>
    },
    {
      key: 'agentId',
      header: t('admin_panel.guardrail_id'),
      render: (agent: any) => <div className="text-xs">{agent.agentId}</div>
    },
    {
      key: 'agentStatus',
      header: t('admin_panel.guardrail_state'),
      render: (agent: any) => (
        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${agent.agentStatus === "PREPARED" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-800"}`}>
          {agent.agentStatus}
        </span>
      )
    },
    {
      key: 'latestAgentVersion',
      header: t('admin_panel.guardrail_version'),
      render: (agent: any) => <div className="text-xs font-medium">{agent.latestAgentVersion}</div>
    },
    {
      key: 'updatedAt',
      header: t('admin_panel.guardrail_updated_at'),
      render: (agent: any) => (
        <div className="text-xs font-medium">
          {new Date(agent.updatedAt).toLocaleString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )
    },
    {
      key: 'guardrailConfiguration',
      header: t('admin_panel.guardrail_guardrail'),
      render: (agent: any) => (
        agent.guardrailConfiguration?.name ? (
          <div>
            <span className="font-medium text-gray-900">{agent.guardrailConfiguration.name} <span className="text-xs text-gray-500">(v.{agent.guardrailConfiguration.published_version})</span></span><br />
            <span className="text-xs text-gray-400">{agent.guardrailConfiguration.id}</span>
          </div>
        ) : (
          <span className="inline-block px-2 py-1 rounded bg-gray-200 text-gray-800 text-xs">{t("Sin guardrail")}</span>
        )
      )
    },
  ].map(col => ({
    header: col.header,
    render: (agent: any) => (
      <button
        style={{ cursor: 'pointer', width: '100%', height: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, margin: 0 }}
        onClick={() => handleRowClick(agent)}
      >
        {col.render ? col.render(agent) : agent[col.key]}
      </button>
    ),
  }));

  const guardrailColumns = [
    {
      key: 'name',
      header: t('admin_panel.guardrail_guardrail'),
      render: (guardrail: any) => <span className="font-medium text-gray-900">{guardrail.name}</span>
    },
    {
      key: 'id',
      header: t('admin_panel.guardrail_id'),
      render: (guardrail: any) => <span className="text-xs">{guardrail.id}</span>
    },
    {
      key: 'version',
      header: t('admin_panel.guardrail_version'),
      render: (guardrail: any) => <span className="text-xs font-medium">{guardrail.version}</span>
    },
    {
      key: 'status',
      header: t('admin_panel.guardrail_state'),
      render: (guardrail: any) => <span className="text-xs">{guardrail.status}</span>
    },
  ].map(col => ({
    header: col.header,
    render: (guardrail: any) => (
      <button
        style={{ cursor: 'pointer', width: '100%', height: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, margin: 0 }}
        onClick={() => setSelectedGuardrail({ ...guardrail, __windowSelect: false, __lastTab: selectedGuardrail })}
      >
        {col.render ? col.render(guardrail) : guardrail[col.key]}
      </button>
    ),
  }));

  return (
    <div className="bg-white p-4 rounded-md shadow-md mt-4">
      <span className="text-xl font-bold">{t('admin_panel.guardrails')}</span>
      <div className="text-sm mb-2 text-gray-700">{t('admin_panel.guardrails_description')}</div>
      {/* Tabs header */}
      <div className="mt-3">
        <button
          className={`px-4 py-2 inline-block h-10 rounded-t-lg ${activeTab === 'agents' ? 'text-primary bg-background active border-b border-b-2 border-primary dark:text-blue-500' : 'hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'}`}
          style={{ minWidth: 120 }}
          onClick={() => setActiveTab('agents')}
        >
          {t('admin_panel.agents_tab')}
        </button>
        <button
          className={`px-4 py-2 inline-block h-10 rounded-t-lg ${activeTab === 'guardrails' ? 'text-primary bg-background active border-b border-b-2 border-primary dark:text-blue-500' : 'hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'}`}
          style={{ minWidth: 120 }}
          onClick={() => setActiveTab('guardrails')}
        >
          {t('admin_panel.guardrails_tab')}
        </button>
      </div>
      {/* Tab content */}
      <div>
        {activeTab === 'agents' ? (
          <AgentTable agentGuardrails={agentGuardrails} selectedGuardrail={selectedGuardrail} agentColumns={agentColumns} t={t} />
        ) : (
          <GuardrailTable guardrails={guardrails} guardrailColumns={guardrailColumns} t={t} setSelectedGuardrail={setSelectedGuardrail} selectedGuardrail={selectedGuardrail} />
        )}
        <GuardrailDetailsDialog selectedGuardrail={selectedGuardrail} setSelectedGuardrail={setSelectedGuardrail} t={t} />
      </div>
    </div>
  );
}

export default AdminGuardrailsPanel;