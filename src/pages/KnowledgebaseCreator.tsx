// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createCourse,
  uploadMaterial,
  pollStateMachine,
  createKnowledgeBase,
  preprocessMaterials,
  startIngestion,
  getIngestionStatus,
  analyzeKnowledgeBase,
  updateSettings,
} from '../services/api';
import { ApiEndpoint, Material } from '../types';
import Layout from '../components/layout';
import { FolderIcon, PencilSquareIcon, DocumentIcon } from '@heroicons/react/20/solid';
import { STATE_DURATIONS, STATE_MESSAGES } from '../constants/stateMachine';
import ApiEndpointForm from '../components/shared/ApiEndpointForm';
import LanguageForm from '../components/shared/LanguageForm';
import SystemPromptSection from '../components/knowledgebase/SystemPromptSection';
import AuthContext from '../authentication/authContext';
import client from '../services/client';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

// Interface to represent a node in the hierarchical structure
interface FileNode {
  name: string;
  children: { [key: string]: FileNode };
  materials: Material[];
  isLeaf: boolean;
}

const KnowledgebaseCreator: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  // Main form state
  const [title, setTitle] = useState('');

  // Structure state
  const [isEditingStructure, setIsEditingStructure] = useState(false);
  const [structureItems, setStructureItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');

  // API endpoints state
  const [isEditingApi, setIsEditingApi] = useState(false);
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [newEndpoint, setNewEndpoint] = useState<ApiEndpoint>({
    method: 'GET',
    headers: {},
    protocol: 'https',
    domain: '',
    path: '',
    query_params: [],
  });
  const [newHeader, setNewHeader] = useState({ key: '', value: '' });

  // Files upload state
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileTree, setFileTree] = useState<FileNode | null>(null);

  // New state for the state machine
  const [state, setState] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const activeStateRef = useRef<string>('');
  const animationFrameRef = useRef<number | null>(null);

  // New state for language management
  const [isEditingLanguages, setIsEditingLanguages] = useState(false);
  const [newLanguage, setNewLanguage] = useState('');

  // New state for system prompt
  const [isEditingSystemPrompt, setIsEditingSystemPrompt] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');

  const { isAppSyncSubscribed } = useContext(AuthContext);

  const TOTAL_TIME = Object.values(STATE_DURATIONS).reduce(
    (sum: number, duration: number) => sum + duration,
    0
  );

  const updateProgress = useCallback(
    (currentState: string) => {
      if (activeStateRef.current === currentState) return;
      activeStateRef.current = currentState;

      const stateIndex = Object.keys(STATE_DURATIONS).indexOf(currentState);
      if (stateIndex === -1) return;

      const previousDuration = Object.entries(STATE_DURATIONS)
        .slice(0, stateIndex)
        .reduce((sum: number, [, duration]: [string, number]) => sum + duration, 0);

      const currentStateDuration = STATE_DURATIONS[currentState];
      const startProgress = (previousDuration / TOTAL_TIME) * 100;
      const endProgress = ((previousDuration + currentStateDuration) / TOTAL_TIME) * 100;

      let progressValue = startProgress;
      const step = (endProgress - startProgress) / (currentStateDuration * 1000);

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      const animate = () => {
        progressValue = Math.min(progressValue + step * 16.7, endProgress);
        setProgress(progressValue);

        if (progressValue < endProgress) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [TOTAL_TIME]
  );

  const pollStateMachineStatus = useCallback(
    async (courseId: string, executionArn: string): Promise<boolean> => {
      try {
        const response = await pollStateMachine(courseId, executionArn);
        const newState = response.current_state;
        const currentStatus = response.state_status;

        if (newState !== state) {
          setState(newState);
          updateProgress(newState);
        }

        if (currentStatus === 'SUCCEEDED') {
          // Preprocess materials
          setState('PreprocessMaterials');
          updateProgress('PreprocessMaterials');
          await preprocessMaterials(courseId);
          await new Promise(resolve =>
            setTimeout(resolve, STATE_DURATIONS['PreprocessMaterials'] * 1000)
          );

          // Start ingestion
          setState('StartIngestion');
          updateProgress('StartIngestion');
          await startIngestion(courseId);
          await new Promise(resolve =>
            setTimeout(resolve, STATE_DURATIONS['StartIngestion'] * 1000)
          );

          // Wait for the ingestion to be completed
          setState('WaitForIngestion');
          updateProgress('WaitForIngestion');
          let ingestionCompleted = false;
          while (!ingestionCompleted) {
            const ingestionStatus = await getIngestionStatus(courseId);
            if (['COMPLETED', 'COMPLETE'].includes(ingestionStatus.status)) {
              ingestionCompleted = true;
            } else if (ingestionStatus.status === 'FAILED') {
              throw new Error('Ingestion failed');
            } else {
              await new Promise(resolve => setTimeout(resolve, 5000));
            }
          }
          await new Promise(resolve =>
            setTimeout(resolve, STATE_DURATIONS['WaitForIngestion'] * 1000)
          );

          // Analyze the knowledge base
          setState('AnalyzeKnowledgeBase');
          updateProgress('AnalyzeKnowledgeBase');
          await analyzeKnowledgeBase(courseId);
          await new Promise(resolve =>
            setTimeout(resolve, STATE_DURATIONS['AnalyzeKnowledgeBase'] * 1000)
          );

          setState('AggregateResults');
          updateProgress('AggregateResults');
          await new Promise(resolve =>
            setTimeout(resolve, STATE_DURATIONS['AggregateResults'] * 1000)
          );

          setState('DataAnalysis');
          updateProgress('DataAnalysis');
          await new Promise(resolve => setTimeout(resolve, STATE_DURATIONS['DataAnalysis'] * 1000));

          setState('GenerateCourseAssests');
          updateProgress('GenerateCourseAssests');
          await new Promise(resolve =>
            setTimeout(resolve, STATE_DURATIONS['GenerateCourseAssests'] * 1000)
          );

          return true;
        }

        if (currentStatus === 'FAILED') {
          throw new Error('State machine execution failed');
        }

        return false;
      } catch (error) {
        console.error('Error polling state machine:', error);
        throw error;
      }
    },
    [state, updateProgress]
  );

  // Function to build the file tree
  const buildFileTree = (files: File[], structure: string[]): FileNode => {
    const root: FileNode = {
      name: 'root',
      children: {},
      materials: [],
      isLeaf: false,
    };

    // If there is no structure, all files go to the root
    if (structure.length === 0) {
      // Convert files to Material format to maintain consistency
      const materials = files.map(file => ({
        id: file.name,
        title: file.name,
        type: file.type || 'application/octet-stream',
        s3_uri: URL.createObjectURL(file),
        status: null,
        uploaded_at: new Date().toISOString(),
      }));
      root.materials = materials;
      return root;
    }

    // Process each file
    files.forEach(file => {
      const fileName = file.name.toLowerCase();
      let currentNode = root;

      // Split the file name into parts
      const parts = fileName.split('_');

      // Iterate through each level of the structure
      for (let i = 0; i < structure.length && i < parts.length; i++) {
        const currentPart = parts[i];

        // Create the node for this level if it doesn't exist
        if (!currentNode.children[currentPart]) {
          currentNode.children[currentPart] = {
            name: currentPart,
            children: {},
            materials: [],
            isLeaf: i === structure.length - 1,
          };
        }

        // If it is the last level, add the material
        if (i === structure.length - 1) {
          currentNode.children[currentPart].materials.push({
            id: file.name,
            title: file.name,
            type: file.type || 'application/octet-stream',
            s3_uri: URL.createObjectURL(file),
            status: null,
            uploaded_at: new Date().toISOString(),
          });
        }

        // Move to the next level
        currentNode = currentNode.children[currentPart];
      }
    });

    return root;
  };

  // Update the file tree when files or structure change
  useEffect(() => {
    if (files.length > 0) {
      const tree = buildFileTree(files, structureItems);
      setFileTree(tree);
    } else {
      setFileTree(null);
    }
  }, [files, structureItems]);

  const handleDeleteMaterial = (material: Material) => {
    const index = files.findIndex(f => f.name === material.title);
    if (index !== -1) {
      handleRemoveFile(index);
    }
  };

  // Function to render the materials list
  const renderMaterialsList = (materials: Material[]) => {
    return (
      <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
        {materials.map(material => (
          <li
            key={material.id}
            className="flex items-center justify-between py-4 pr-5 pl-4 text-sm/6"
          >
            <div className="flex w-0 flex-1 items-center">
              <DocumentIcon className="size-5 shrink-0 text-gray-400" aria-hidden="true" />
              <div className="ml-4 flex min-w-0 flex-1 gap-2">
                <span className="truncate font-medium">{material.title}</span>
                <span className="shrink-0 text-gray-400">{material.type}</span>
              </div>
            </div>
            <div className="ml-4 shrink-0">
              <button
                onClick={() => handleDeleteMaterial(material)}
                className="font-medium text-red-600 hover:text-red-500"
              >
                {t('knowledge_base_creator.materials.delete')}
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  // Function to render a tree node
  const renderTreeNode = (node: FileNode, level: number = 0, structureLevel: string = '') => {
    const hasChildren = Object.keys(node.children).length > 0;
    const hasMaterials = node.materials.length > 0;

    if (node.name === 'root') {
      return (
        <div className="divide-y divide-gray-100">
          {Object.values(node.children).map(child => (
            <div key={child.name}>{renderTreeNode(child, level + 1, structureItems[level])}</div>
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
                <div key={child.name}>
                  {renderTreeNode(child, level + 1, structureItems[level])}
                </div>
              ))}
            </div>
          ) : null}
          {!hasChildren && hasMaterials ? renderMaterialsList(node.materials) : null}
        </dd>
      </div>
    );
  };

  // Functions to handle the structure
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

  // Functions to handle the endpoints
  const handleAddEndpoint = () => {
    if (newEndpoint.domain && newEndpoint.path) {
      setApiEndpoints([...apiEndpoints, { ...newEndpoint }]);
      setNewEndpoint({
        method: 'GET',
        headers: {},
        protocol: 'https',
        domain: '',
        path: '',
        query_params: [],
      });
    }
  };

  const handleRemoveEndpoint = (index: number) => {
    const updatedEndpoints = [...apiEndpoints];
    updatedEndpoints.splice(index, 1);
    setApiEndpoints(updatedEndpoints);
  };

  const handleAddHeader = () => {
    if (newHeader.key && newHeader.value) {
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
    const updatedHeaders = { ...newEndpoint.headers };
    delete updatedHeaders[headerKey];
    setNewEndpoint({
      ...newEndpoint,
      headers: updatedHeaders,
    });
  };

  // Functions to handle the files upload
  const handleDragOver = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  }, []);

  const handleStructureMandatory = async () => {
    return new Promise(resolve => {
      const structureMandatory: { key: string; values: string[] }[] = [];

      // For each level of the structure
      for (let level = 0; level < structureItems.length; level++) {
        const item = structureItems[level];
        const values = new Set<string>();

        // Process each file
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

  const handleStartEditLanguages = () => {
    setIsEditingLanguages(true);
  };

  const handleCancelEditLanguages = () => {
    setIsEditingLanguages(false);
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

  const handleStartEditApi = () => {
    setIsEditingApi(true);
  };

  const handleCancelEditApi = () => {
    setIsEditingApi(false);
  };

  const handleSaveLanguages = () => {
    // Implement the logic to save the language changes
  };

  const getMethodColor = (method: string) => {
    if (method === 'GET') return 'bg-green-100 text-green-800';
    if (method === 'POST') return 'bg-blue-100 text-blue-800';
    if (method === 'PUT') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const renderStructureContent = () => {
    if (structureItems.length === 0) {
      return (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500 mb-4">{t('knowledge_base_creator.no_structure_defined')}</p>
        </div>
      );
    }
    return (
      <>
        <nav aria-label="Structure" className="flex">
          <ol className="flex space-x-4 rounded-md bg-white px-6 shadow-sm py-3">
            <li className="flex">
              <div className="flex items-center">
                <span className="text-gray-400">
                  <FolderIcon className="size-5 shrink-0" aria-hidden="true" />
                </span>
              </div>
            </li>
            {structureItems.map(item => (
              <li key={`structure-breadcrumb-${item}`} className="flex">
                <div className="flex items-center">
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 44"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    className="h-full w-6 shrink-0 text-gray-200"
                  >
                    <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-500 capitalize">{item}</span>
                </div>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">{getStructureDescription(structureItems)}</p>
        </div>
      </>
    );
  };

  const renderFilesContent = () => {
    if (structureItems.length === 0) {
      return (
        <div className="mt-2">
          <h4 className="text-sm font-medium text-gray-900 mb-2">{t('knowledge_base_creator.files_without_structure')}</h4>
          {renderMaterialsList(
            files.map(file => ({
              id: file.name,
              title: file.name,
              type: file.type || 'application/octet-stream',
              s3_uri: URL.createObjectURL(file),
              status: null,
              uploaded_at: new Date().toISOString(),
            }))
          )}
        </div>
      );
    }
    return (
      <div className="mt-6">
        <dl className="divide-y divide-gray-100">{fileTree && renderTreeNode(fileTree)}</dl>
      </div>
    );
  };

  const renderApiEndpoints = () => {
    return (
      <div className="mb-8 bg-white p-4 rounded-md shadow-sm shadow-gray-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base/7 font-semibold text-gray-900">{t('knowledge_base_creator.api_endpoints')}</h3>
          {!isEditingApi && (
            <button
              onClick={handleStartEditApi}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <PencilSquareIcon className="size-4 mr-1" />
              {t('knowledge_base_creator.edit_endpoints')}
            </button>
          )}
        </div>

        {!isEditingApi ? (
          <div className="space-y-4">
            {apiEndpoints.length === 0 ? (
              <p className="text-sm text-gray-500">No endpoints defined.</p>
            ) : (
              <div className="space-y-4">
                {apiEndpoints.map(endpoint => (
                  <div
                    key={`${endpoint.method}-${endpoint.protocol}-${endpoint.domain}-${endpoint.path}`}
                    className="bg-white p-4 rounded-lg shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded text-sm ${getMethodColor(endpoint.method)}`}
                        >
                          {endpoint.method}
                        </span>
                        <span className="text-gray-600">
                          {endpoint.protocol}://{endpoint.domain}
                          {endpoint.path}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveEndpoint(apiEndpoints.indexOf(endpoint))}
                        className="text-red-600 hover:text-red-800"
                      >
                        {t('knowledge_base_creator.delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <ApiEndpointForm
              endpoint={newEndpoint}
              onEndpointChange={endpoint => setNewEndpoint(endpoint)}
              onAddHeader={handleAddHeader}
              onRemoveHeader={handleRemoveHeader}
              headerKey={newHeader.key}
              headerValue={newHeader.value}
              onHeaderKeyChange={key => setNewHeader({ ...newHeader, key })}
              onHeaderValueChange={value => setNewHeader({ ...newHeader, value })}
            />

            <div className="flex space-x-3 pt-4 border-t border-gray-100">
              <button
                onClick={handleCancelEditApi}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                {t('knowledge_base_creator.cancel')}
              </button>
              <button
                onClick={handleAddEndpoint}
                disabled={!newEndpoint.domain || !newEndpoint.path}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('knowledge_base_creator.add_endpoint')}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLanguagesSection = () => {
    return (
      <div className="mb-8 bg-white p-4 rounded-md shadow-sm shadow-gray-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base/7 font-semibold text-gray-900">{t('knowledge_base_creator.supported_languages')}</h3>
          {!isEditingLanguages && (
            <button
              onClick={handleStartEditLanguages}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <PencilSquareIcon className="size-4 mr-1" />
              {t('knowledge_base_creator.edit_languages')}
            </button>
          )}
        </div>

        {!isEditingLanguages ? (
          <div className="space-y-4">
            {languages.length === 0 ? (
              <p className="text-sm text-gray-500">{t('knowledge_base_creator.no_languages_defined')}</p>
            ) : (
              <div className="space-y-2">
                {languages.map(language => (
                  <div
                    key={language}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <span className="text-sm text-gray-700">{language}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <LanguageForm
              languages={languages}
              newLanguage={newLanguage}
              onNewLanguageChange={setNewLanguage}
              onAddLanguage={handleAddLanguage}
              onRemoveLanguage={handleRemoveLanguage}
            />

            <div className="flex space-x-3 pt-4 border-t border-gray-100">
              <button
                onClick={handleSaveLanguages}
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                {t('knowledge_base_creator.save_changes')}
              </button>
              <button
                onClick={handleCancelEditLanguages}
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                {t('knowledge_base_creator.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleStartEditSystemPrompt = () => {
    setIsEditingSystemPrompt(true);
  };

  const handleCancelEditSystemPrompt = () => {
    setIsEditingSystemPrompt(false);
  };

  const handleSaveSystemPrompt = () => {
    setIsEditingSystemPrompt(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create the knowledge base
    //   const newCourse = await createCourse({
    //     title,
    //   });

      // Wait for the state update to complete
      const structure_mandatory = await handleStructureMandatory();

      // Update the structure and endpoints
    //   await updateSettings(
    //     newCourse.id,
    //     structureItems,
    //     apiEndpoints,
    //     languages,
    //     structure_mandatory as { key: string; values: string[] }[],
    //     systemPrompt
    //   );

      // Check if the user is subscribed to AppSync
      if (isAppSyncSubscribed) {
        // Use the new endpoint /generate-course
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('extra_processing', 'true');
        
        // Add all the settings data to FormData as a single JSON object
        const settings = {
          knowledge_base_filter_structure: structureItems,
          api_endpoints: apiEndpoints,
          languages: languages,
          knowledge_base_filter_structure_mandatory: structure_mandatory,
          system_prompt: systemPrompt,
        };
        formData.append('settings', JSON.stringify(settings));
        // Add title to FormData
        formData.append('title', title);
        // Add extra_processing to FormData
        formData.append('extra_processing', 'true');
        
        const response = await client.post(`/courses/generate-course/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        // If the status is in the range 200-299, then it is successful
        if (response.status >= 200 && response.status < 300) {
          toast.success(t('kbm_generation.processing'));
          navigate('/knowledge-base');
          return;
        } else {
          setError(t('kbm_generation.error'));
          setLoading(false);
          return;
        }
      }

      // --- NORMAL FLOW IF NOT SUBSCRIBED ---

      const newCourse = await createCourse({
        title,
      });

      await updateSettings(
        newCourse.id,
        structureItems,
        apiEndpoints,
        languages,
        structure_mandatory as { key: string; values: string[] }[],
        systemPrompt
      );

      // Upload files if there are any
      if (files.length > 0) {
        setState('UploadFiles');
        updateProgress('UploadFiles');
        await uploadMaterial(newCourse.id, files, true);
      }

      // Start the state machine for the knowledge base creation
      const stateMachine = await createKnowledgeBase(newCourse.id);

      let completed = false;
      while (!completed) {
        completed = await pollStateMachineStatus(newCourse.id, stateMachine.executionArn);
        if (!completed) {
          const currentDelay = STATE_DURATIONS[state] || 5;
          await new Promise(resolve => setTimeout(resolve, currentDelay * 1000));
        }
      }

      // Redirect to the knowledge base view after the creation is complete
      navigate(`/knowledge-base/view/${newCourse.id}`);
    } catch (err) {
      setError(t('knowledge_base_creator.error_creating_kb'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Function to get the structure description
  const getStructureDescription = (structure: string[]): string => {
    let message = '';
    if (structure.length > 0) {
      const filename_structure =
        structure.map(item => `[${item.toLowerCase()}]`).join('_') + '_name-some-description.pdf';
      message = t('knowledge_base_creator.structure_description', { filename_structure });
    }
    return message;
  };

  return (
    <Layout title={t('knowledge_base_creator.create_knowledge_base')}>
      {state && (
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {t(STATE_MESSAGES[state] || 'state_messages.processing')}
              </span>
              <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
      {!state && (
        <div className="space-y-8">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-4 rounded-md shadow-sm shadow-gray-500"
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('knowledge_base_creator.kb.title')}
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
            </div>
          </form>

          {/* Section to upload files */}
          <div className="bg-white p-4 rounded-md shadow-sm shadow-gray-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base/7 font-semibold text-gray-900">{t('knowledge_base_creator.kb.files')}</h3>
            </div>

            <button
              type="button"
              className={`w-full border-2 border-dashed rounded-lg p-6 text-center ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
              aria-label={t('knowledge_base_creator.drag_and_drop_files')}
            >
              <div className="flex flex-col items-center">
                <DocumentIcon className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-2">{t('knowledge_base_creator.drag_and_drop_files_here')}</p>
                <span className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50">
                  {t('knowledge_base_creator.select_files')}
                </span>
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf"
                  onChange={handleFileInput}
                />
                <p className="text-xs text-gray-500 mt-2">PDF</p>
              </div>
            </button>
          </div>

          {/* Section to structure */}
          <div className="bg-white p-4 rounded-md shadow-sm shadow-gray-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base/7 font-semibold text-gray-900">{t('knowledge_base_creator.structure')}</h3>
              <button
                type="button"
                onClick={() => setIsEditingStructure(!isEditingStructure)}
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <PencilSquareIcon className="size-4 mr-1" />
                {isEditingStructure ? t('knowledge_base_creator.cancel') : t('knowledge_base_creator.edit_structure')}
              </button>
            </div>

            {!isEditingStructure ? (
              renderStructureContent()
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="newItem" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('knowledge_base_creator.add_new_item')}
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      id="newItem"
                      value={newItem}
                      onChange={e => setNewItem(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder={t('knowledge_base_creator.add_new_item_placeholder')}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddItem();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                    >
                      {t('knowledge_base_creator.add_new_item')}
                    </button>
                  </div>
                </div>

                {structureItems.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">{t('knowledge_base_creator.current_items')}</h4>
                    <ul className="space-y-2">
                      {structureItems.map((item, index) => (
                        <li
                          key={`structure-item-${item}`}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                        >
                          <span className="text-sm text-gray-700">{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="rounded-sm bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                          >
                            {t('knowledge_base_creator.delete')}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Visualization of files according to structure */}
          {files.length > 0 && (
            <div className="bg-white p-4 rounded-md shadow-sm shadow-gray-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base/7 font-semibold text-gray-900">{t('knowledge_base_creator.files_organized')}</h3>
              </div>

              {renderFilesContent()}
            </div>
          )}

          {/* Section to endpoints */}
          {renderApiEndpoints()}

          {/* Section to languages */}
          {renderLanguagesSection()}

          <SystemPromptSection
            isEditing={isEditingSystemPrompt}
            systemPrompt={systemPrompt}
            updateLoading={false}
            updateError={null}
            updateSuccess={false}
            course={null}
            onStartEdit={handleStartEditSystemPrompt}
            onCancelEdit={handleCancelEditSystemPrompt}
            onSave={handleSaveSystemPrompt}
            onSystemPromptChange={setSystemPrompt}
          />

          {/* Action buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
            >
              {t('knowledge_base_creator.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !title.trim()}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              {loading ? t('knowledge_base_creator.creating') : t('knowledge_base_creator.create_knowledge_base')}
            </button>
          </div>

          {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
        </div>
      )}
    </Layout>
  );
};

export default KnowledgebaseCreator;
