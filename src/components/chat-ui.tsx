// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { askQuestion } from '../services/api';
import { Robot, UserCircle } from '../images/icons';
import { showToast } from '../services/toastService';
import { Copy } from '../images/icons';
import ModelSelector from './model-selector';

interface ChatUIProps {
  initialResponse: string;
  docId?: string;
}

const ChatUI: React.FC<ChatUIProps> = ({ initialResponse, docId }) => {
  const [messages, setMessages] = useState([{ text: initialResponse, type: 'bot' }]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('');

  const getAllMessagesText = () => {
    return messages
      .map(msg => {
        const type = msg.type.charAt(0).toUpperCase() + msg.type.slice(1);
        return `${type}:\n${msg.text}`;
      })
      .join('\n');
  };

  const handleSend = async () => {
    if (input.trim() === '') return;

    const newMessages = [...messages, { text: input, type: 'user' }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      if (docId) {
        const response = await askQuestion(docId, input, selectedModel);
        setMessages([...newMessages, { text: response.answer, type: 'bot' }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages([
        ...newMessages,
        { text: 'Error fetching response. Please try again.', type: 'bot' },
      ]);
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

  return (
    <div>
      <div className="flex justify-end">
        <button
          onClick={() => {
            navigator.clipboard.writeText(getAllMessagesText());
            showToast('success', 'Copied to clipboard');
          }}
          className="flex items-center hover:underline"
        >
          <Copy className="w-4 text-gray-700" />
        </button>
      </div>

      <div className="flex flex-col h-[calc(100vh-12rem)] bg-gray-100 p-4 rounded-lg shadow-lg">
        <div className="ml-auto">
          <ModelSelector
            value={selectedModel}
            onChange={modelId => setSelectedModel(modelId)}
            defaultModel="anthropic.claude-instant-v1"
          />
        </div>
        <div className="flex-1 overflow-auto mb-4 p-2">
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
                } max-w-xl overflow-hidden`}
              >
                <ReactMarkdown className="whitespace-pre-wrap break-words">
                  {msg.text}
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
            placeholder="Ask questions about the content..."
            className="flex-1 border border-gray-300 rounded-md p-2"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="ml-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatUI;
