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

import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import Layout from '../components/layout';
import { Robot, UserCircle } from '../images/icons';
import { askQuestionAgent, getMaterials, getSampleQuestions } from '../services/api';
import { useParams, useLocation } from 'react-router-dom';
import { showToast } from '../services/toastService';
import { FaFilter } from 'react-icons/fa';
import MaterialsModal from '../components/materials-modal';
import { Material } from '../types';
import { useNavigate } from 'react-router';
import ModelSelector from '../components/model-selector';
import { useTranslation } from 'react-i18next';

interface Citation {
  text: string;
  document_name: string;
  page_number: number;
}

interface Message {
  text: string;
  type: 'user' | 'bot';
  isLoading?: boolean;
  citations?: Citation[];
}

const KnowledgebaseChat: React.FC = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    { text: t('knowledgebase_chat.hi_there'), type: 'bot' },
  ]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentCitation, setCurrentCitation] = useState<Citation[] | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [titleLoading, setTitleLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedModel, setSelectedModel] = useState<string>('');
  const { id } = useParams<{ id: string }>();

  const fromDashboard = location.state?.fromDashboard ?? false;

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleBackToKnowledgeBase = () => {
    navigate('/knowledge-base');
  };

  if (!id) {
    showToast('error', t('knowledgebase_chat.course_id_required'));
    throw new Error(t('knowledgebase_chat.course_id_required'));
  }

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  useEffect(() => {
    const fetchSampleQuestions = async () => {
      try {
        const response = await getSampleQuestions(id);
        setQuestions(response.questions);
      } catch (error) {
        console.error('Error:', error);
        showToast('error', t('knowledgebase_chat.failed_to_fetch_questions'));
      }
    };

    fetchSampleQuestions();
  }, [id, t]);

  const fetchMaterialsData = async () => {
    if (!id) {
      return;
    }
    setTitleLoading(true);
    try {
      const response = await getMaterials(id);
      setMaterials(response.materials);
      setCourseTitle(response.title);
    } catch (err: any) {
      showToast('error', t('knowledgebase_chat.failed_to_fetch_course_data'));
    } finally {
      setTitleLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterialsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { text: input, type: 'user' };
    const loadingMessage: Message = {
      text: t('knowledgebase_chat.analyzing'),
      type: 'bot',
      isLoading: true,
    };

    const newMessages = [...messages, userMessage, loadingMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await askQuestionAgent(id, input, selectedMaterials, selectedModel);

      const updatedMessages = newMessages.slice(0, -1);
      const botMessage: Message = {
        text: response.answer,
        type: 'bot',
        citations: response.citation,
      };

      setMessages([...updatedMessages, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        text: t('knowledgebase_chat.failed_to_fetch_response'),
        type: 'bot',
      };
      setMessages([...newMessages.slice(0, -1), errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionClick = async (question: string) => {
    const userMessage: Message = { text: question, type: 'user' };
    const loadingMessage: Message = {
      text: t('knowledgebase_chat.analyzing'),
      type: 'bot',
      isLoading: true,
    };

    const newMessages = [...messages, userMessage, loadingMessage];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await askQuestionAgent(id, question, selectedMaterials, selectedModel);

      const updatedMessages = newMessages.slice(0, -1);
      const botMessage: Message = {
        text: response.answer,
        type: 'bot',
        citations: response.citation,
      };

      setMessages([...updatedMessages, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        text: t('knowledgebase_chat.failed_to_fetch_response'),
        type: 'bot',
      };
      setMessages([...newMessages.slice(0, -1), errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showCitation = (citationGroup: Citation[]) => {
    setCurrentCitation(citationGroup);
    setModalVisible(true);
  };

  return (
    <Layout title={t('knowledgebase_chat.title')}>
      <div className="flex justify-between items-center mb-4">
        <button
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
          onClick={fromDashboard ? handleBackToKnowledgeBase : handleBackToDashboard}
        >
          {t('knowledgebase_chat.back')}
        </button>
        <div className="flex items-center space-x-2 justify-end">
          <span className="text-sm font-medium">{t('knowledgebase_chat.filter_materials')}:</span>
          <button
            onClick={e => {
              e.preventDefault();
              setModalOpen(true);
            }}
            className="p-2 rounded"
          >
            <FaFilter
              className={`w-5 h-5 ${selectedMaterials.length > 0 ? 'text-blue-500' : ''}`}
            />
          </button>
          <div>
            <ModelSelector
              value={selectedModel}
              onChange={modelId => setSelectedModel(modelId)}
              defaultModel="anthropic.claude-instant-v1"
              supportsKnowledgeBase={true}
            />
          </div>
        </div>
      </div>
      <div className="space-y-6 bg-white p-6 rounded-md shadow-md">
        {/* Course title */}
        {titleLoading ? (
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-4 w-1/3"></div>
        ) : (
          <div className="text-2xl font-bold">{courseTitle}</div>
        )}
        <div className="mt-4 flex flex-col h-[calc(90vh-12rem)] bg-gray-100 p-4 rounded-lg shadow-lg">
          <div 
            ref={chatContainerRef} 
            className="flex-1 overflow-auto mb-4 p-2 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-100 hover:scrollbar-thumb-blue-700"
          >
            <div className="my-4">
              {questions.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {questions.map((question, index) => (
                      <div
                        key={index}
                        className="p-4 bg-blue-100 text-blue-800 rounded-lg shadow hover:bg-blue-200 transition cursor-pointer"
                        onClick={() => handleQuestionClick(question)}
                      >
                        {question}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start mb-2 ${
                  msg.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className="flex items-center mr-4">
                  {msg.type === 'user' ? (
                    <UserCircle className="text-blue-500 text-2xl" />
                  ) : (
                    <Robot className="text-gray-500 text-2xl" />
                  )}
                </div>
                <div
                  className={`p-4 rounded-lg ${
                    msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'
                  } max-w-xl`}
                >
                  <ReactMarkdown
                    className={`custom-prose max-w-none whitespace-pre-wrap leading-tight ${
                      msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'
                    }`}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      sup: ({ children }) => {
                        const index = parseInt(String(children).replace(/\[|\]/g, ''), 10) - 1;
                        if (!msg.citations || index < 0 || index >= msg.citations.length) {
                          return <sup>{children}</sup>;
                        }
                        return (
                          <sup
                            onClick={() => showCitation([msg.citations![index]])}
                            className="cursor-pointer text-blue-500 hover:text-blue-700"
                          >
                            [{index + 1}]
                          </sup>
                        );
                      },
                    }}
                  >
                    {msg.citations
                      ? `${msg.text} ${msg.citations
                          .map((_, i) => `<sup>[${i + 1}]</sup>`)
                          .join(' ')}`
                      : msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>

          <div className="flex mt-4">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('knowledgebase_chat.ask_questions_about_the_content')}
              className="flex-1 border border-gray-300 rounded-md p-2"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="ml-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? t('knowledgebase_chat.sending') : t('knowledgebase_chat.send')}
            </button>
          </div>
        </div>
      </div>

      {modalVisible && currentCitation && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={e => {
            if (e.target === e.currentTarget) {
              setModalVisible(false);
            }
          }}
        >
          <div className="bg-white rounded-md shadow-lg max-w-lg w-full max-h-[80vh] relative flex flex-col">
            <div className="p-6 overflow-y-auto rounded-md">
              <h2 className="text-lg font-bold mb-4">{t('knowledgebase_chat.citations')}</h2>
              {currentCitation.map((citation, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ReactMarkdown
                      className="prose max-w-none whitespace-pre-wrap mb-4"
                      rehypePlugins={[rehypeRaw]}
                    >
                      {citation.text}
                    </ReactMarkdown>
                    <div className="border-t pt-3 mt-3 text-sm text-gray-600">
                      <div className="font-medium">{t('knowledgebase_chat.source_document')}:</div>
                      <div className="text-blue-600">{citation.document_name.split('/').pop()}</div>
                      <div className="mt-1">
                        <span className="font-medium">Page:</span> {citation.page_number || 1}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-white sticky bottom-0 text-right rounded-md">
              <button
                onClick={() => setModalVisible(false)}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
              >
                {t('knowledgebase_chat.close')}
              </button>
            </div>
          </div>
        </div>
      )}
      <MaterialsModal
        materials={materials}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(materials: string[]) => {
          setSelectedMaterials(materials);
        }}
      />
    </Layout>
  );
};

export default KnowledgebaseChat;
