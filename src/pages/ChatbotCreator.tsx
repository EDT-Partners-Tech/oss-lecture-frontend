// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout';
import { getChatbotResources, startChatbot } from '../services/api';
import {
  FaUpload,
  FaTrash,
  FaArrowLeft,
  FaSpinner,
  FaFileAlt,
  FaDatabase,
  FaChevronDown,
  FaChevronRight,
} from 'react-icons/fa';
import { showToast } from '../services/toastService';
import { ChatbotResource } from '../types';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';

const ChatbotCreator: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAppSyncSubscribed } = useAuth();
  const [name, setName] = useState<string>('');
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [resources, setResources] = useState<ChatbotResource[]>([]);
  const [selectedResource, setSelectedResource] = useState<ChatbotResource | null>(null);
  const [inputType, setInputType] = useState<'file' | 'resource' | 'both'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getChatbotResources().then(setResources);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Verify that the number of files does not exceed 10
      if (files.length + newFiles.length > 5) {
        showToast('error', t('chatbot_creator.only_5_files_are_allowed'));
        return;
      }

      // Verify that all files are PDF
      const invalidFiles = newFiles.filter(file => file.type !== 'application/pdf');
      if (invalidFiles.length > 0) {
        showToast('error', t('chatbot_creator.only_pdf_files_are_allowed'));
        return;
      }

      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleResourceSelect = (resource: ChatbotResource) => {
    setSelectedResource(resource);
  };

  const handleResourceDeselect = () => {
    setSelectedResource(null);
  };

  const handleInputTypeChange = (type: 'file' | 'resource' | 'both') => {
    setInputType(type);
    if (type === 'resource') {
      setFiles([]);
    } else if (type === 'file') {
      setSelectedResource(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('error', t('chatbot_creator.please_enter_a_name_for_the_chatbot'));
      return;
    }

    setSystemPrompt(systemPrompt.trim());

    if (inputType === 'file' && files.length === 0) {
      showToast('error', t('chatbot_creator.please_upload_at_least_one_pdf_file'));
      return;
    }

    if (inputType === 'resource' && !selectedResource) {
      showToast('error', t('chatbot_creator.please_select_a_resource'));
      return;
    }

    if (inputType === 'both' && files.length === 0 && !selectedResource) {
      showToast('error', 'Please upload at least one PDF file or select a resource');
      return;
    }

    try {
      setIsSubmitting(true);
      const resourceData = resources.find(
        resource => resource.resource_id === selectedResource?.resource_id
      );
      
      // Determinar si se debe usar async_processing
      // Si existen archivos y las suscripciones están activas, usar async_processing = true
      const shouldUseAsyncProcessing = files.length > 0 && isAppSyncSubscribed;
      
      const response = await startChatbot(files, name, systemPrompt, resourceData, shouldUseAsyncProcessing);
      
      // Si async_processing es true, redirigir al dashboard del chatbot
      // Si async_processing es false, redirigir al chatbot específico
      if (shouldUseAsyncProcessing) {
        showToast('success', 'Chatbot creation started successfully');
        navigate('/chatbot');
      } else {
        showToast('success', 'Chatbot created successfully');
        navigate(`/chatbot/${response.chatbot_id}`);
      }
    } catch (error) {
      console.error('Error creating chatbot:', error);
      showToast('error', 'Error creating chatbot');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleResourceType = (type: string) => {
    setExpandedTypes(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const formatResourceType = (type: string): string => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const groupResourcesByType = (
    resources: ChatbotResource[]
  ): Record<string, ChatbotResource[]> => {
    // Filtrar recursos de tipo "course_knowledge_base" cuando inputType es "both"
    const filteredResources =
      inputType === 'both'
        ? resources.filter(resource => resource.resource_type !== 'course_knowledge_base')
        : resources;

    return filteredResources.reduce(
      (acc, resource) => {
        const type = resource.resource_type;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(resource);
        return acc;
      },
      {} as Record<string, ChatbotResource[]>
    );
  };

  const hasCourseMaterialResources = () => {
    return resources.some(resource => resource.resource_type === 'course_material');
  };

  return (
    <Layout title={t('chatbot_creator.create_chatbot')}>
      <div className="mx-auto px-4 py-8">
        <div className="mx-auto">
          <div className="mb-6">
            <button
              onClick={() => navigate('/chatbot')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span>{t('chatbot_creator.back_to_dashboard')}</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('chatbot_creator.create_new_chatbot')}</h1>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('chatbot_creator.chatbot_name')}
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('chatbot_creator.enter_chatbot_name')}
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="systemPrompt"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t('chatbot_creator.system_prompt')}
                </label>
                <textarea
                  id="systemPrompt"
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="You are a helpful assistant that can answer questions about the uploaded documents."
                />
              </div>

              <div className="mb-6">
                <label htmlFor="inputType" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('chatbot_creator.input_type')}
                </label>
                <div className="flex space-x-4 mb-4">
                  <button
                    type="button"
                    onClick={() => handleInputTypeChange('file')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      inputType === 'file'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    <FaFileAlt className="w-4 h-4" />
                    <span>{t('chatbot_creator.upload_files')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputTypeChange('resource')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      inputType === 'resource'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    <FaDatabase className="w-4 h-4" />
                    <span>{t('chatbot_creator.select_resource')}</span>
                  </button>
                  {hasCourseMaterialResources() && (
                    <button
                      type="button"
                      onClick={() => handleInputTypeChange('both')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                        inputType === 'both'
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      }`}
                    >
                      <FaUpload className="w-4 h-4" />
                      <span>{t('chatbot_creator.both')}</span>
                    </button>
                  )}
                </div>

                {/* Files section */}
                {(inputType === 'file' || inputType === 'both') && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('chatbot_creator.pdf_files')}
                    </label>

                    <button
                      type="button"
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors duration-200"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf"
                        multiple
                        className="hidden"
                      />
                      <FaUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">
                        {t('chatbot_creator.click_to_select_pdf_files_or_drag_and_drop_here')}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {files.length}/{t('chatbot_creator.max_files_allowed')}
                      </p>
                    </button>

                    {files.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                          {t('chatbot_creator.selected_files')}
                        </h3>
                        <ul className="space-y-2">
                          {files.map((file, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between bg-gray-50 p-2 rounded"
                            >
                              <span className="text-sm text-gray-700 truncate">{file.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {formatFileSize(file.size)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FaTrash className="w-4 h-4" />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Resources section */}
                {(inputType === 'resource' || inputType === 'both') && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('chatbot_creator.available_resources')}
                    </label>

                    {resources.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        {t('chatbot_creator.no_resources_available')}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(groupResourcesByType(resources)).map(
                          ([type, typeResources]) => (
                            <div key={type} className="border rounded-lg overflow-hidden">
                              <button
                                type="button"
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleResourceType(type);
                                }}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center">
                                  <span className="font-medium text-gray-800">
                                    {formatResourceType(type)}
                                  </span>
                                  <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                    {typeResources.length}
                                  </span>
                                </div>
                                {expandedTypes[type] ? (
                                  <FaChevronDown className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <FaChevronRight className="w-4 h-4 text-gray-500" />
                                )}
                              </button>

                              {expandedTypes[type] && (
                                <div className="p-3 bg-white">
                                  <ul className="space-y-2">
                                    {typeResources.map(resource => (
                                      <button
                                        key={resource.resource_id}
                                        type="button"
                                        className={`w-full p-3 border rounded-lg cursor-pointer transition-colors ${
                                          selectedResource?.resource_id === resource.resource_id
                                            ? 'bg-blue-100 border-blue-300'
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                        }`}
                                        onClick={e => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          if (
                                            selectedResource?.resource_id === resource.resource_id
                                          ) {
                                            handleResourceDeselect();
                                          } else {
                                            handleResourceSelect(resource);
                                          }
                                        }}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <h3 className="font-medium text-gray-800">
                                              {resource.resource_name}
                                            </h3>
                                          </div>
                                          {selectedResource?.resource_id ===
                                            resource.resource_id && (
                                            <button
                                              type="button"
                                              onClick={e => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleResourceDeselect();
                                              }}
                                              className="text-red-500 hover:text-red-700"
                                            >
                                              <FaTrash className="w-4 h-4" />
                                            </button>
                                          )}
                                        </div>
                                      </button>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/chatbot')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 mr-2 hover:bg-gray-50"
                >
                  {t('chatbot_creator.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      <span>{t('chatbot_creator.creating')}</span>
                    </>
                  ) : (
                    <span>{t('chatbot_creator.create_chatbot')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChatbotCreator;
