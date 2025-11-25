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

import { useState, useEffect, useCallback } from 'react';
import { getTopicsDistribution } from '../services/api';
import { TopicsDistribution } from '../types';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface GlobalTopicData {
  topic: string;
  count: number;
  chatbots: {
    id: string;
    topics: string;
  }[];
}

function TopicsDistributionStats() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [distribution, setDistribution] = useState<TopicsDistribution | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  const fetchDistribution = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTopicsDistribution();
      setDistribution(data);
    } catch (error: any) {
      console.error('Error fetching topics distribution:', error);
      setError(t('topics_distribution.errors.failed_to_load'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchDistribution();
  }, [fetchDistribution]);

  const toggleTopicExpansion = (topic: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topic)) {
      newExpanded.delete(topic);
    } else {
      newExpanded.add(topic);
    }
    setExpandedTopics(newExpanded);
  };

  const getSortedGlobalTopics = (): GlobalTopicData[] => {
    if (!distribution) return [];

    return Object.entries(distribution)
      .map(([topic, data]) => ({
        topic: topic || t('topics_distribution.uncategorized'),
        count: data.count,
        chatbots: data.chatbots,
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending (most popular first)
  };

  const getTotalChatbots = (): number => {
    if (!distribution) return 0;
    return Object.values(distribution).reduce((sum, topic) => sum + topic.count, 0);
  };

  const handleChatbotClick = (chatbotId: string) => {
    // Navigate to the chatbot page
    navigate(`/chatbot/${chatbotId}`);
  };

  const capitalizeFirstLetter = (str: string) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">{t('topics_distribution.title')}</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">{t('topics_distribution.title')}</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right font-bold cursor-pointer"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  if (!distribution || Object.keys(distribution).length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">{t('topics_distribution.title')}</h2>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">{t('topics_distribution.no_data')}</p>
          <p className="text-sm text-gray-400">{t('topics_distribution.no_data_description')}</p>
        </div>
      </div>
    );
  }

  const sortedTopics = getSortedGlobalTopics();
  const totalChatbots = getTotalChatbots();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">{t('topics_distribution.title')}</h2>
        <button
          onClick={fetchDistribution}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {t('topics_distribution.refresh')}
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="text-sm text-gray-600">{t('topics_distribution.total_chatbots')}:</div>
          <div className="text-2xl font-semibold text-blue-600">{totalChatbots}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="text-sm text-gray-600">{t('topics_distribution.global_topics')}:</div>
          <div className="text-2xl font-semibold text-green-600">{sortedTopics.length}</div>
        </div>
      </div>

      {/* Global Topics Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{t('topics_distribution.topics_breakdown')}:</h3>
        
        {sortedTopics.map((topicData, index) => {
          const isExpanded = expandedTopics.has(topicData.topic);
          const percentage = ((topicData.count / totalChatbots) * 100).toFixed(1);
          
          return (
            <div key={topicData.topic} className="border border-gray-200 rounded-lg">
              {/* Topic Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                onClick={() => toggleTopicExpansion(topicData.topic)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTopicExpansion(topicData.topic);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-expanded={isExpanded}
                aria-label={`${isExpanded ? t('topics_distribution.collapse') : t('topics_distribution.expand')} ${topicData.topic} topic`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {isExpanded ? (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-lg font-medium">{capitalizeFirstLetter(topicData.topic)}</span>
                  </div>
                  <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    #{index + 1}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold">{topicData.count}</div>
                    <div className="text-sm text-gray-500">{percentage}%</div>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Chatbots Dropdown */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50">
                  <div className="p-4">
                    <h4 className="font-medium text-gray-700 mb-3">
                      {t('topics_distribution.chatbots_in_topic')} ({topicData.count})
                    </h4>
                    <div className="space-y-2">
                      {topicData.chatbots.map((chatbot) => (
                        <div
                          key={chatbot.id}
                          className="bg-white p-3 rounded border border-gray-200 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                  {t('topics_distribution.chatbot_id')}: {chatbot.id}
                                </span>
                                <button
                                  onClick={() => handleChatbotClick(chatbot.id)}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  {t('topics_distribution.view_chatbot')} →
                                </button>
                              </div>
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">{t('topics_distribution.topics')}:</span>
                                <div className="mt-1">
                                  {chatbot.topics.split(',').map((topic, topicIndex) => (
                                    <span
                                      key={topicIndex}
                                      className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-1 mb-1"
                                    >
                                      {topic.trim()}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Statistics */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          {t('topics_distribution.last_updated')}: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default TopicsDistributionStats; 