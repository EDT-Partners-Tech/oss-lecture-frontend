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

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout';
import { getChatbotById, chatbotConversation } from '../services/api';
import { Chatbot, ChatbotMessage } from '../types';
import { FaUser, FaPaperPlane, FaArrowLeft, FaRobot, FaSpinner } from 'react-icons/fa';
import { showToast } from '../services/toastService';
import { useSettings } from '../contexts/useSettings';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import { subscribeToEvent, unsubscribeFromEvent } from '../utils/appsyncEvents';

interface MarkdownImageProps {
  onLoad: () => void;
  alt?: string;
  src?: string;
}

const MarkdownImage: React.FC<MarkdownImageProps> = ({ onLoad, alt, src, ...props }) => (
  <img
    {...props}
    src={src}
    alt={alt ?? 'Chat message image'}
    onLoad={onLoad}
    className="max-w-full h-auto rounded-lg shadow-md"
    loading="lazy"
  />
);

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface MarkdownMessageProps {
  content: string;
  onImageLoad: () => void;
}

// Cache para los diagramas Mermaid
const mermaidCache = new Map<string, string>();

interface MermaidDiagramProps {
  code: string;
}

const MermaidDiagram = React.memo(({ code }: MermaidDiagramProps) => {
  const [svg, setSvg] = useState<string>(() => {
    const cachedSvg = mermaidCache.get(code);
    if (cachedSvg) return cachedSvg;
    return '';
  });

  useEffect(() => {
    const renderDiagram = async () => {
      if (mermaidCache.has(code)) return;

      try {
        const { svg } = await mermaid.render(`mermaid-${crypto.randomUUID()}`, code);
        const modifiedSvg = svg
          .replace(/fill="black"/g, 'fill="white"')
          .replace(/stroke="black"/g, 'stroke="#e5e7eb"')
          .replace(/<rect/g, '<rect rx="8" ry="8"');
        
        mermaidCache.set(code, modifiedSvg);
        setSvg(modifiedSvg);
      } catch (error) {
        console.error('Error rendering mermaid diagram:', error);
      }
    };

    renderDiagram();
  }, [code]);

  if (!svg) {
    return <div className="mermaid-diagram my-4 p-4 bg-white rounded-lg shadow-sm animate-pulse" />;
  }

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: svg }} 
      className="mermaid-diagram my-4 p-4 bg-white rounded-lg shadow-sm"
      style={{
        '--mermaid-bg-color': '#ffffff',
        '--mermaid-border-radius': '8px',
      } as React.CSSProperties}
    />
  );
});

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, onImageLoad }) => {
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      themeVariables: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '16px',
        primaryColor: '#2563eb',
        primaryTextColor: '#fff',
        primaryBorderColor: '#1d4ed8',
        lineColor: '#94a3b8',
        secondaryColor: '#f3f4f6',
        tertiaryColor: '#e5e7eb',
        noteBkgColor: '#f8fafc',
        noteTextColor: '#1e293b',
        noteBorderColor: '#e2e8f0',
        mainBkg: '#ffffff',
        errorBkgColor: '#fee2e2',
        errorTextColor: '#dc2626',
        darkMode: false,
        background: '#ffffff',
      },
      flowchart: {
        curve: 'basis',
        padding: 15,
        htmlLabels: true,
        nodeSpacing: 50,
        rankSpacing: 50,
        useMaxWidth: true,
        diagramPadding: 8,
      },
      sequence: {
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
      },
    });
  }, []);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        img: props => <MarkdownImage {...props} onLoad={onImageLoad} />,
        code: ({ inline, className, children, ...props }: CodeProps) => {
          const match = /language-(\w+)/.exec(className || '');
          if (!inline && match && match[1] === 'mermaid') {
            return <MermaidDiagram code={String(children)} />;
          }
          return <code className={className} {...props}>{children}</code>;
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

const ChatbotChat: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { settings } = useSettings();
  const { isAppSyncSubscribed } = useAuth();
  const navigate = useNavigate();
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const renderUserAvatar = () => {
    if (settings.picture) {
      return (
        <img
          src={settings.picture}
          alt="User profile"
          className="w-full h-full rounded-full object-cover"
        />
      );
    }
    return <FaUser className="w-3.5 h-3.5 text-blue-500" />;
  };

  const fetchChatbot = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getChatbotById(id!);
      if (data) {
        setChatbot(data);
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error getting the chatbot:', error);
      showToast('error', 'Error loading the chatbot');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchChatbot();
    }
  }, [id, fetchChatbot]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const scrollOptions = {
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth' as ScrollBehavior,
      };
      chatContainerRef.current.scrollTo(scrollOptions);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [prompt]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Función para manejar la respuesta del chatbot a través de AppSync
  const handleChatbotResponse = useCallback(() => {
    const handleEvent = (event: any) => {
      const { event: appSyncEvent } = event;
      if (appSyncEvent?.service_id === 'chatbot_conversation' && 
          appSyncEvent?.data?.chatbot_id === id && 
          appSyncEvent?.data?.stage === 'completed') {
        const assistantMessage: ChatbotMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: appSyncEvent.data.response.response,
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsProcessing(false);
      }
    };

    // Suscribirse al evento
    subscribeToEvent('chatbotConversation', handleEvent);

    // Limpiar la suscripción cuando el componente se desmonte
    return () => {
      unsubscribeFromEvent('chatbotConversation', handleEvent);
    };
  }, [id]);

  useEffect(() => {
    if (isAppSyncSubscribed) {
      return handleChatbotResponse();
    }
  }, [isAppSyncSubscribed, handleChatbotResponse]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim() || !id) return;

    // Add the user message
    const userMessage: ChatbotMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
    };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsProcessing(true);

    try {
      // Get the response from the API
      const response = await chatbotConversation(prompt, id, isAppSyncSubscribed);
      
      // Si no está suscrito a AppSync, manejar la respuesta directamente
      if (!isAppSyncSubscribed) {
        const assistantMessage: ChatbotMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.response,
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error getting the response:', error);
      showToast('error', 'Error getting the response from the chatbot');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout title={t('chatbot_chat.loading_chatbot')}>
        <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!chatbot) {
    return (
      <Layout title={t('chatbot_chat.chatbot_not_found')}>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('chatbot_chat.chatbot_not_found')}</h1>
          <button
            onClick={() => navigate('/chatbot')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mx-auto"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span>{t('chatbot_chat.back_to_dashboard')}</span>
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={chatbot.chatbot_name}>
      <div className="flex flex-col h-[calc(100vh-10rem)] bg-gradient-to-br from-white via-blue-50/30 to-gray-50/30">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/chatbot')}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full shadow-sm">
                <FaRobot className="w-5 h-5 text-blue-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-800">{chatbot.chatbot_name}</h1>
            </div>
          </div>
        </div>

        {/* Chat container */}
        <div className="flex-1 overflow-y-auto p-6" ref={chatContainerRef}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="bg-blue-100 p-4 rounded-full mb-4 shadow-md">
                <FaRobot className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {t('chatbot_chat.welcome_to', { name: chatbot.chatbot_name })}
              </h2>
              <p className="text-gray-500 text-sm">
                {t('chatbot_chat.write_your_question_in_the_field_below_to_start')}
              </p>
            </div>
          ) : (
            messages.map(message => (
              <div
                key={message.id}
                className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start gap-2.5 max-w-[70%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center shadow-sm ${
                      message.role === 'user'
                        ? 'bg-blue-50 ring-1 ring-blue-100'
                        : 'bg-gray-50 ring-1 ring-gray-100'
                    }`}
                  >
                    {message.role === 'user' ? (
                      renderUserAvatar()
                    ) : (
                      <FaRobot className="w-3.5 h-3.5 text-gray-500" />
                    )}
                  </div>
                  <div
                    className={`py-2.5 px-3.5 rounded-2xl max-w-none prose-sm shadow-sm ${
                      message.role === 'user'
                        ? 'bg-blue-50/80 text-gray-800 prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-gray-900 ring-1 ring-blue-100'
                        : 'bg-white text-gray-800 ring-1 ring-gray-100'
                    }`}
                  >
                    <div>
                      <MarkdownMessage content={message.content} onImageLoad={scrollToBottom} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Start of the loading animation */}
          {isProcessing && (
            <div className="flex mb-4">
              <div className="flex items-start gap-2.5 max-w-[70%]">
                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-gray-50 ring-1 ring-gray-100 shadow-sm">
                  <FaRobot className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div className="py-2.5 px-3.5 rounded-2xl bg-white text-gray-800 prose max-w-none prose-sm shadow-sm ring-1 ring-gray-100">
                  <div className="flex items-center gap-2">
                    <FaSpinner className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-500">{t('chatbot_chat.processing')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSubmit}
            className={`relative flex rounded-xl p-1 shadow-sm ${isProcessing ? 'border-2 border-transparent animate-border-color' : 'border-2 border-gray-200'}`}
          >
            <div className="relative flex-1 flex items-center">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={handlePromptChange}
                onKeyDown={handleKeyDown}
                placeholder={t('chatbot_chat.write_your_question')}
                className="flex-1 p-3 border-none focus:outline-none focus:ring-0 w-full bg-transparent resize-none min-h-[44px] max-h-[200px] overflow-y-auto"
                rows={1}
              />
              <button
                type="submit"
                className="h-[calc(100%-8px)] px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <FaSpinner className="w-5 h-5 animate-spin" />
                ) : (
                  <FaPaperPlane className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ChatbotChat;
