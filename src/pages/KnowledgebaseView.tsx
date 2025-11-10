import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getKnowledgebaseData,
  getMaterials,
  updateSettings,
  updateConversationAccessToken,
  uploadMaterial,
  preprocessMaterials,
  startIngestion,
  getIngestionStatus,
  updateCourse,
} from '../services/api';
import { Material, Course, ApiEndpoint } from '../types';
import Layout from '../components/layout';
import StructureSection from '../components/knowledgebase/StructureSection';
import ApiEndpointsSection from '../components/knowledgebase/ApiEndpointsSection';
import LanguagesSection from '../components/knowledgebase/LanguagesSection';
import ConversationAccessSection from '../components/knowledgebase/ConversationAccessSection';
import MaterialsList from '../components/knowledgebase/MaterialsList';
import StatusMessage from '../components/shared/StatusMessage';
import { DocumentIcon } from '@heroicons/react/24/outline';
import SystemPromptSection from '../components/knowledgebase/SystemPromptSection';
import AuthContext from '../authentication/authContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

// Interface to represent a node in the hierarchical structure
interface FileNode {
  name: string;
  children: { [key: string]: FileNode };
  materials: Material[];
  isLeaf: boolean;
}

const KnowledgebaseView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAppSyncSubscribed } = useContext(AuthContext);
  const { t } = useTranslation();
  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [structureItems, setStructureItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [fileTree, setFileTree] = useState<FileNode | null>(null);
  const [isEditingApi, setIsEditingApi] = useState(false);
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
  const [newEndpoint, setNewEndpoint] = useState<ApiEndpoint | null>(null);
  const [newHeader, setNewHeader] = useState({ key: '', value: '' });
  const [isConversationEnabled, setIsConversationEnabled] = useState<boolean>(false);
  const [conversationToken, setConversationToken] = useState<string>('');
  const [isUpdatingAccess, setIsUpdatingAccess] = useState<boolean>(false);
  const [isEditingLanguages, setIsEditingLanguages] = useState(false);
  const [languages, setLanguages] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingSystemPrompt, setIsEditingSystemPrompt] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');

  useEffect(() => {
    const fetchKnowledgebaseData = async () => {
      try {
        if (!id) return;
        const data = await getKnowledgebaseData(id);
        const materials = await getMaterials(id);
        data.settings ??= {
          knowledge_base_filter_structure: [],
          knowledge_base_filter_structure_mandatory: [],
          api_endpoints: [],
          languages: [],
          system_prompt: '',
        };
        setCourse(data);
        setMaterials(materials.materials);
        setConversationToken(data.conversation_access_token ?? '');
        setIsConversationEnabled(!!data.conversation_access_token);
        setSystemPrompt(data.settings?.system_prompt ?? '');
        setLoading(false);
      } catch (err) {
        setError(t('knowledge_base_view.error_loading_knowledge_base'));
        setLoading(false);
        console.error(err);
      }
    };

    fetchKnowledgebaseData();
  }, [id, t]);

  useEffect(() => {
    if (course?.settings?.knowledge_base_filter_structure) {
      const tree = buildFileTree(materials, course.settings.knowledge_base_filter_structure);
      setFileTree(tree);
    } else {
      setFileTree(null);
    }
  }, [materials, course?.settings?.knowledge_base_filter_structure]);

  useEffect(() => {
    if (course?.settings?.api_endpoints) {
      setApiEndpoints(
        course.settings.api_endpoints.map(endpoint => ({
          ...endpoint,
          id: crypto.randomUUID(),
        }))
      );
    }
  }, [course?.settings?.api_endpoints]);

  useEffect(() => {
    if (course?.settings?.languages) {
      setLanguages([...course.settings.languages]);
    }
  }, [course?.settings?.languages]);

  const buildFileTree = (materials: Material[], structure: string[]): FileNode => {
    const root: FileNode = {
      name: 'root',
      children: {},
      materials: [],
      isLeaf: false,
    };

    if (structure.length === 0) {
      root.materials = materials;
      return root;
    }

    materials.forEach(material => {
      const fileName = material.title.toLowerCase();
      let currentNode = root;
      const parts = fileName.split('_');

      for (let i = 0; i < structure.length && i < parts.length; i++) {
        const currentPart = parts[i];

        if (!currentNode.children[currentPart]) {
          currentNode.children[currentPart] = {
            name: currentPart,
            children: {},
            materials: [],
            isLeaf: i === structure.length - 1,
          };
        }

        if (i === structure.length - 1) {
          currentNode.children[currentPart].materials.push(material);
        }

        currentNode = currentNode.children[currentPart];
      }
    });

    return root;
  };

  const renderTreeNode = (node: FileNode, level: number = 0, structureLevel: string = '') => {
    const hasChildren = Object.keys(node.children).length > 0;
    const hasMaterials = node.materials.length > 0;

    if (node.name === 'root') {
      return (
        <div className="divide-y divide-gray-100">
          {Object.values(node.children).map(child => (
            <div key={child.name} className="px-4 py-6 sm:px-0">
              {renderTreeNode(child, level + 1, structure[level])}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm/6 font-medium text-gray-900 capitalize">
          {structureLevel}: {node.name}
        </dt>
        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
          {hasChildren ? (
            <div className="space-y-6">
              {Object.values(node.children).map(child => (
                <div key={child.name}>{renderTreeNode(child, level + 1, structure[level])}</div>
              ))}
            </div>
          ) : null}
          {!hasChildren && hasMaterials ? (
            <MaterialsList 
              materials={node.materials} 
              courseId={id!} 
              onMaterialsDeleted={async () => {
                const materials = await getMaterials(id!);
                setMaterials(materials.materials);
              }}
            />
          ) : null}
        </dd>
      </div>
    );
  };

  const handleCreateStructure = () => {
    setStructureItems([]);
    setNewItem('');
    setIsEditing(true);
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleAddItem = () => {
    if (newItem.trim() !== '') {
      setStructureItems([...structureItems, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...structureItems];
    updatedItems.splice(index, 1);
    setStructureItems(updatedItems);
  };

  const handleSaveStructure = async () => {
    if (!id || !course?.settings) return;

    try {
      setUpdateLoading(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      await updateSettings(
        id,
        structureItems,
        course.settings?.api_endpoints || [],
        course.settings?.languages || [],
        course.settings?.knowledge_base_filter_structure_mandatory || []
      );

      if (course) {
        setCourse({
          ...course,
          settings: {
            knowledge_base_filter_structure: structureItems,
            api_endpoints: course.settings?.api_endpoints || [],
            languages: course.settings?.languages || [],
            knowledge_base_filter_structure_mandatory:
              course.settings?.knowledge_base_filter_structure_mandatory || [],
          },
        });
      }

      setIsEditing(false);
      setUpdateSuccess(true);
    } catch (err) {
      setUpdateError(t('knowledge_base_view.error_updating_structure'));
      console.error(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleStartEditApi = () => {
    setNewEndpoint({
      id: '',
      method: 'GET',
      headers: {},
      protocol: 'https',
      domain: '',
      path: '',
      query_params: [],
    });
    setIsEditingApi(true);
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleCancelEditApi = () => {
    setIsEditingApi(false);
    setUpdateError(null);
    setUpdateSuccess(false);
    setNewEndpoint(null);
  };

  const handleRemoveEndpoint = async (endpoint: ApiEndpoint) => {
    const updatedEndpoints = [...apiEndpoints];
    updatedEndpoints.splice(
      updatedEndpoints.findIndex(e => e.id === endpoint.id),
      1
    );
    setApiEndpoints(updatedEndpoints);
    if (id && course?.settings) {
      await updateSettings(
        id,
        course.settings.knowledge_base_filter_structure || [],
        updatedEndpoints,
        course.settings.languages || [],
        course.settings.knowledge_base_filter_structure_mandatory || []
      );
    }
  };

  const handleSaveApiEndpoints = async () => {
    if (!id || !course?.settings || !newEndpoint?.domain || !newEndpoint?.path) return;

    try {
      setUpdateLoading(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      if (newEndpoint.id === '') {
        course.settings.api_endpoints = [...apiEndpoints, ...(newEndpoint ? [newEndpoint] : [])];
      } else {
        course.settings.api_endpoints =
          apiEndpoints?.map(endpoint =>
            endpoint.id === newEndpoint.id ? newEndpoint : endpoint
          ) || [];
      }

      await updateSettings(
        id,
        course.settings.knowledge_base_filter_structure || [],
        course.settings.api_endpoints || [],
        languages,
        course.settings.knowledge_base_filter_structure_mandatory || []
      );

      if (course) {
        setCourse({
          ...course,
          settings: {
            ...course.settings,
            api_endpoints: course.settings.api_endpoints.map((endpoint: ApiEndpoint) => ({
              ...endpoint,
              id: endpoint.id ?? crypto.randomUUID(),
            })),
          },
        });
      }

      setNewEndpoint(null);
      setIsEditingApi(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 2000);
    } catch (err) {
      setUpdateError(t('knowledge_base_view.error_updating_api_endpoints'));
      console.error(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleAddHeader = () => {
    if (newEndpoint && newHeader.key && newHeader.value) {
      setNewEndpoint({
        ...newEndpoint,
        headers: {
          ...newEndpoint.headers,
          [newHeader.key]: newHeader.value,
        },
      });
      setNewHeader({ key: '', value: '' });
    }
  };

  const handleRemoveHeader = (headerKey: string) => {
    if (newEndpoint) {
      const updatedHeaders = { ...newEndpoint.headers };
      delete updatedHeaders[headerKey];
      setNewEndpoint({
        ...newEndpoint,
        headers: updatedHeaders,
      });
    }
  };

  const handleStartEditEndpoint = (endpoint: ApiEndpoint) => {
    setNewEndpoint(endpoint);
    setIsEditingApi(true);
  };

  const generateSecureToken = () => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const handleToggleConversationAccess = async () => {
    try {
      setIsUpdatingAccess(true);
      const newToken = isConversationEnabled ? '' : generateSecureToken();
      await updateConversationAccessToken(id!, newToken);
      setConversationToken(newToken);
      setIsConversationEnabled(!isConversationEnabled);
      if (course) {
        setCourse({
          ...course,
          conversation_access_token: newToken,
        });
      }
    } catch (err) {
      console.error('Error updating conversation access:', err);
      setError(t('knowledge_base_view.error_updating_conversation_access'));
    } finally {
      setIsUpdatingAccess(false);
    }
  };

  const handleStartEditLanguages = () => {
    if (course?.settings?.languages) {
      setLanguages([...course.settings.languages]);
    }
    setIsEditingLanguages(true);
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleCancelEditLanguages = () => {
    setIsEditingLanguages(false);
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim() !== '') {
      setLanguages([...languages, newLanguage.trim()]);
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (index: number) => {
    const updatedLanguages = [...languages];
    updatedLanguages.splice(index, 1);
    setLanguages(updatedLanguages);
  };

  const handleSaveLanguages = async () => {
    if (!id || !course?.settings) return;

    try {
      setUpdateLoading(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      await updateSettings(
        id,
        course.settings.knowledge_base_filter_structure || [],
        course.settings.api_endpoints || [],
        languages,
        course.settings.knowledge_base_filter_structure_mandatory || []
      );

      if (course) {
        setCourse({
          ...course,
          settings: {
            ...course.settings,
            languages: languages,
          },
        });
      }

      setIsEditingLanguages(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 2000);
    } catch (err) {
      setUpdateError(t('knowledge_base_view.error_updating_languages'));
      console.error(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const clearFiles = (index?: number) => {
    if (index !== undefined) {
      setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    } else {
      setFiles([]);
    }
  };

  const handleStructureMandatory = async () => {
    return new Promise(resolve => {
      const structureMandatory: { key: string; values: string[] }[] = [];

      // For each level of the structure
      for (
        let level = 0;
        level < (course?.settings?.knowledge_base_filter_structure || []).length;
        level++
      ) {
        const item = course?.settings?.knowledge_base_filter_structure[level] ?? '';
        const values = new Set<string>();

        // Process existing materials
        for (const material of materials) {
          const parts = material.title.toLowerCase().split('_');
          if (parts.length > level) {
            values.add(parts[level]);
          }
        }

        // Process new files
        for (const file of files) {
          const parts = file.name.toLowerCase().split('_');
          if (parts.length > level) {
            values.add(parts[level]);
          }
        }

        structureMandatory.push({
          key: item,
          values: Array.from(values),
        });
      }

      resolve(structureMandatory);
    });
  };

  const handleUpload = async () => {
    if (!id || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // Update the settings with the new mandatory structure
      const structure_mandatory = await handleStructureMandatory();

      // Keep the original values of all configurations
      const originalSettings = course?.settings || {
        knowledge_base_filter_structure: [],
        api_endpoints: [],
        languages: [],
        knowledge_base_filter_structure_mandatory: [],
      };

      await updateSettings(
        id,
        originalSettings.knowledge_base_filter_structure,
        originalSettings.api_endpoints,
        originalSettings.languages,
        structure_mandatory as { key: string; values: string[] }[]
      );

      // Check if subscribed to AppSync
      if (isAppSyncSubscribed) {
        // Use the new endpoint /update-course
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('extra_processing', 'true');
        
        const response = await updateCourse(id, formData);
        
        // If the status is in the range 200-299, then it is successful
        if (response?.status >= 200 && response?.status < 300) {
          toast.success(t('kbm_generation.processing'));
          navigate('/knowledge-base');
          return;
        } else {
          setUploadError(t('kbm_generation.error'));
          setIsUploading(false);
          return;
        }
      }

      // --- NORMAL FLOW IF NOT SUBSCRIBED ---
      // Upload files
      await uploadMaterial(id, files, true);

      // Preprocess materials
      await preprocessMaterials(id);

      // Start ingestion
      await startIngestion(id);

      // Wait for ingestion to complete
      let ingestionCompleted = false;
      while (!ingestionCompleted) {
        const ingestionStatus = await getIngestionStatus(id);
        if (['COMPLETED', 'COMPLETE'].includes(ingestionStatus.status)) {
          ingestionCompleted = true;
        } else if (ingestionStatus.status === 'FAILED') {
          throw new Error('Ingestion failed');
        } else {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      // Refresh materials list
      const materials = await getMaterials(id);
      setMaterials(materials.materials);

      setUploadSuccess(true);
      setFiles([]);
    } catch (err) {
      setUploadError(t('knowledge_base_view.error_uploading_documents'));
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files) {
      const newFiles = Array.from(event.dataTransfer.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const handleStartEditSystemPrompt = () => {
    setIsEditingSystemPrompt(true);
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleCancelEditSystemPrompt = () => {
    setIsEditingSystemPrompt(false);
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleSaveSystemPrompt = async () => {
    if (!id || !course?.settings) return;

    try {
      setUpdateLoading(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      await updateSettings(
        id,
        course.settings.knowledge_base_filter_structure || [],
        course.settings.api_endpoints || [],
        course.settings.languages || [],
        course.settings.knowledge_base_filter_structure_mandatory || [],
        systemPrompt
      );

      if (course) {
        setCourse({
          ...course,
          settings: {
            ...course.settings,
            system_prompt: systemPrompt,
          },
        });
      }

      setIsEditingSystemPrompt(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 2000);
    } catch (err) {
      setUpdateError('Error updating the system prompt');
      console.error(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title={course?.title ?? ''}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Ver Base de Conocimiento">
        <StatusMessage type="error" message={error} />
      </Layout>
    );
  }

  const structure = course?.settings?.knowledge_base_filter_structure || [];

  return (
    <Layout title={course?.title ?? ''}>
      <div>
        <StructureSection
          isEditing={isEditing}
          structureItems={structureItems}
          newItem={newItem}
          updateLoading={updateLoading}
          updateError={updateError}
          updateSuccess={updateSuccess}
          course={course}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onSaveStructure={handleSaveStructure}
          onCancelEdit={handleCancelEdit}
          onCreateStructure={handleCreateStructure}
          onNewItemChange={setNewItem}
        />

        <ApiEndpointsSection
          isEditingApi={isEditingApi}
          apiEndpoints={apiEndpoints}
          newEndpoint={newEndpoint}
          newHeader={newHeader}
          updateLoading={updateLoading}
          updateError={updateError}
          updateSuccess={updateSuccess}
          course={course}
          onStartEditApi={handleStartEditApi}
          onCancelEditApi={handleCancelEditApi}
          onRemoveEndpoint={handleRemoveEndpoint}
          onSaveApiEndpoints={handleSaveApiEndpoints}
          onAddHeader={handleAddHeader}
          onRemoveHeader={handleRemoveHeader}
          onHeaderKeyChange={key => setNewHeader({ ...newHeader, key })}
          onHeaderValueChange={value => setNewHeader({ ...newHeader, value })}
          onEndpointChange={endpoint => setNewEndpoint(endpoint)}
          onStartEditEndpoint={handleStartEditEndpoint}
        />

        <LanguagesSection
          isEditingLanguages={isEditingLanguages}
          languages={languages}
          newLanguage={newLanguage}
          updateLoading={updateLoading}
          updateError={updateError}
          updateSuccess={updateSuccess}
          course={course}
          onStartEditLanguages={handleStartEditLanguages}
          onCancelEditLanguages={handleCancelEditLanguages}
          onAddLanguage={handleAddLanguage}
          onRemoveLanguage={handleRemoveLanguage}
          onSaveLanguages={handleSaveLanguages}
          onNewLanguageChange={setNewLanguage}
        />

        <SystemPromptSection
          isEditing={isEditingSystemPrompt}
          systemPrompt={systemPrompt}
          updateLoading={updateLoading}
          updateError={updateError}
          updateSuccess={updateSuccess}
          course={course}
          onStartEdit={handleStartEditSystemPrompt}
          onCancelEdit={handleCancelEditSystemPrompt}
          onSave={handleSaveSystemPrompt}
          onSystemPromptChange={setSystemPrompt}
        />

        <ConversationAccessSection
          isConversationEnabled={isConversationEnabled}
          isUpdatingAccess={isUpdatingAccess}
          conversationToken={conversationToken}
          id={id}
          onToggleConversationAccess={handleToggleConversationAccess}
        />

        {course?.settings?.knowledge_base_filter_structure &&
        course.settings.knowledge_base_filter_structure.length > 0 ? (
          <div className="mt-6 p-4 rounded-md bg-white shadow-sm shadow-gray-500">
            <dl className="divide-y divide-gray-100">{fileTree && renderTreeNode(fileTree)}</dl>
          </div>
        ) : (
          <div className="mt-6 p-4 rounded-md bg-white shadow-sm shadow-gray-500">
            <dl className="divide-y divide-gray-100">
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm/6 font-medium text-gray-900">{t('knowledge_base_view.materials')}</dt>
                <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {materials.length > 0 ? (
                    <MaterialsList 
                      materials={materials} 
                      courseId={id!} 
                      onMaterialsDeleted={async () => {
                        const materials = await getMaterials(id!);
                        setMaterials(materials.materials);
                      }}
                    />
                  ) : (
                    <p className="text-sm text-gray-500">{t('knowledge_base_view.no_materials_available')}</p>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        )}

        <div className="bg-white mt-6 p-4 rounded-md shadow-sm shadow-gray-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base/7 font-semibold text-gray-900">{t('knowledge_base_view.new_files')}</h3>
          </div>

          <button
            type="button"
            className={`w-full border-2 border-dashed rounded-lg p-6 text-center ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
            aria-label="Drop files here or click to select"
          >
            <div className="flex flex-col items-center">
              <DocumentIcon className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-2">{t('knowledge_base_view.drop_files_here_or_click_to_select')}</p>
              <span className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50">
                {t('knowledge_base_view.select_files')}
              </span>
              <input
                id="file-input"
                type="file"
                className="hidden"
                multiple
                accept=".pdf"
                onChange={handleFileChange}
              />
              <p className="text-xs text-gray-500 mt-2">PDF</p>
            </div>
          </button>

          {files.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">{t('knowledge_base_view.selected_files')}</h4>
              <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
                {files.map((file, index) => (
                  <li
                    key={file.name}
                    className="flex items-center justify-between py-4 pr-5 pl-4 text-sm/6"
                  >
                    <div className="flex w-0 flex-1 items-center">
                      <DocumentIcon className="size-5 shrink-0 text-gray-400" aria-hidden="true" />
                      <div className="ml-4 flex min-w-0 flex-1 gap-2">
                        <span className="truncate font-medium">{file.name}</span>
                        <span className="shrink-0 text-gray-400">{file.type}</span>
                      </div>
                    </div>
                    <div className="ml-4 shrink-0">
                      <button
                        onClick={() => clearFiles(index)}
                        className="font-medium text-red-600 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={handleUpload}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              disabled={isUploading || files.length === 0}
            >
              {isUploading ? t('knowledge_base_view.uploading') : t('knowledge_base_view.upload_documents')}
            </button>
          </div>

          {uploadError && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{uploadError}</div>
          )}

          {uploadSuccess && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
              {t('knowledge_base_view.documents_uploaded_successfully')}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default KnowledgebaseView;
