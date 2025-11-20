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

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { analyticsService } from '../services/api';
import useAuth from '../hooks/useAuth';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import Layout from '../components/layout';
import { CSVLink } from 'react-csv';
import { AnalyticsData, AnalyticsResponse, AnalyticsRequest } from '../types';
import DateRangeFilter from '../components/date-range-filter';
import TopicsDistributionStats from '../components/topics-distribution-stats';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filteredRequests, setFilteredRequests] = useState<AnalyticsRequest[]>([]);
  const [showCombinedView, setShowCombinedView] = useState(false);
  const [servicePages, setServicePages] = useState<Record<string, number>>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      if (user) {
        let response;
        if (user.role === 'admin') {
          response = (await analyticsService.getGroupAnalytics(
            startDate,
            endDate
          )) as unknown as AnalyticsResponse;
        } else {
          response = (await analyticsService.getUserAnalytics(
            startDate,
            endDate
          )) as unknown as AnalyticsResponse;
        }
        setAnalytics(response.analytics);
        const allRequests = Object.values(response.analytics.services ?? {}).flatMap(
          service => service.requests ?? []
        );

        // Filter out duplicate requests based on request_id
        const uniqueRequests = allRequests.reduce(
          (acc, request) => {
            if (!acc[request.request_id]) {
              acc[request.request_id] = request;
            }
            return acc;
          },
          {} as Record<string, AnalyticsRequest>
        );

        setFilteredRequests(Object.values(uniqueRequests));
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch analytics data: ' + (err as Error).message);
      setLoading(false);
    }
  }, [user, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add a function to handle date range changes
  const handleDateRangeChange = async () => {
    setLoading(true);
    await fetchData();
  };

  // Prepare CSV data
  const prepareCSVData = () => {
    return filteredRequests.map(request => ({
      Time: new Date(request.created_at).toLocaleString(),
      Title: request.title,
      Model: request.model_info?.name ?? request.model,
      'Request Tokens': request.request_tokens,
      'Response Tokens': request.response_tokens,
      'Processing Time (s)': request.processing_time?.toFixed(2),
      Cost: `$${request.estimated_cost?.toFixed(4)}`,
      Status: request.status,
      'Response Type': request.response_type,
    }));
  };

  // Add pagination handler
  const handlePageChange = (serviceName: string, newPage: number) => {
    setServicePages(prev => ({
      ...prev,
      [serviceName]: newPage,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  // Add null check for services
  const services = analytics.services ?? {};

  // Prepare data for service distribution pie chart
  const serviceDistributionData = {
    labels: Object.keys(services),
    datasets: [
      {
        data: Object.values(services).map(service => service.total_tokens),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
          'rgba(83, 102, 255, 0.6)',
          'rgba(40, 159, 64, 0.6)',
          'rgba(210, 199, 199, 0.6)',
          'rgba(78, 52, 199, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
          'rgba(40, 159, 64, 1)',
          'rgba(210, 199, 199, 1)',
          'rgba(78, 52, 199, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for model distribution pie chart
  const prepareModelDistributionData = () => {
    const allRequests = Object.values(services).flatMap(service => service.requests ?? []);

    const modelCounts = allRequests.reduce(
      (acc, request) => {
        const modelName = request.model_info?.name ?? request.model;
        acc[modelName] = (acc[modelName] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      labels: Object.keys(modelCounts),
      datasets: [
        {
          data: Object.values(modelCounts),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(199, 199, 199, 0.6)',
            'rgba(83, 102, 255, 0.6)',
            'rgba(40, 159, 64, 0.6)',
            'rgba(210, 199, 199, 0.6)',
            'rgba(78, 52, 199, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)',
            'rgba(83, 102, 255, 1)',
            'rgba(40, 159, 64, 1)',
            'rgba(210, 199, 199, 1)',
            'rgba(78, 52, 199, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for model cost distribution
  const prepareModelCostData = () => {
    const allRequests = Object.values(services).flatMap(service => service.requests ?? []);

    const modelCosts = allRequests.reduce(
      (acc, request) => {
        const modelName = request.model_info?.name ?? request.model;
        acc[modelName] = (acc[modelName] ?? 0) + (request.estimated_cost ?? 0);
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      labels: Object.keys(modelCosts),
      datasets: [
        {
          data: Object.values(modelCosts),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(199, 199, 199, 0.6)',
            'rgba(83, 102, 255, 0.6)',
            'rgba(40, 159, 64, 0.6)',
            'rgba(210, 199, 199, 0.6)',
            'rgba(78, 52, 199, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)',
            'rgba(83, 102, 255, 1)',
            'rgba(40, 159, 64, 1)',
            'rgba(210, 199, 199, 1)',
            'rgba(78, 52, 199, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Update token usage over time to include model information
  const prepareTokenUsageData = () => {
    const allRequests = Object.values(services).flatMap(service => service.requests ?? []);
    const sortedRequests = [...allRequests].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Group requests by time intervals (e.g., every 5 minutes) for cleaner x-axis
    const timeIntervals = sortedRequests.reduce(
      (acc, request) => {
        const date = new Date(request.created_at);
        // Round to nearest 5 minutes
        const roundedTime = new Date(
          Math.round(date.getTime() / (5 * 60 * 1000)) * (5 * 60 * 1000)
        );
        const timeKey = roundedTime.toISOString();

        if (!acc[timeKey]) {
          acc[timeKey] = {
            time: roundedTime,
            requests: [],
          };
        }
        acc[timeKey].requests.push(request);
        return acc;
      },
      {} as Record<string, { time: Date; requests: AnalyticsRequest[] }>
    );

    const timeLabels = Object.values(timeIntervals).map(interval =>
      interval.time.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    );

    if (showCombinedView) {
      return {
        labels: timeLabels,
        datasets: [
          {
            label: 'Total Token Usage',
            data: Object.values(timeIntervals).map(interval =>
              interval.requests.reduce(
                (sum, req) => sum + req.request_tokens + req.response_tokens,
                0
              )
            ),
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1,
          },
        ],
      };
    }

    // Group requests by model
    const models = [...new Set(sortedRequests.map(req => req.model_info?.name ?? req.model))];

    const lineColors = [
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 206, 86)',
      'rgb(75, 192, 192)',
      'rgb(153, 102, 255)',
      'rgb(255, 159, 64)',
      'rgb(199, 199, 199)',
      'rgb(83, 102, 255)',
      'rgb(40, 159, 64)',
      'rgb(210, 199, 199)',
      'rgb(78, 52, 199)',
      'rgb(255, 99, 132)',
    ];

    return {
      labels: timeLabels,
      datasets: models.map((model, index) => ({
        label: model,
        data: Object.values(timeIntervals).map(interval =>
          interval.requests
            .filter(req => (req.model_info?.name ?? req.model) === model)
            .reduce((sum, req) => sum + req.request_tokens + req.response_tokens, 0)
        ),
        borderColor: lineColors[index % lineColors.length],
        tension: 0.1,
      })),
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
    animation: {
      duration: 200,
    },
  };

  return (
    <Layout title={t('analytics.section_title')}>
      <div className="p-6">
        {/* Date Filter Section */}
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onFilterApply={handleDateRangeChange}
        >
          <CSVLink
            data={prepareCSVData()}
            filename="analytics_data.csv"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            {t('analytics.export_to_csv')}
          </CSVLink>
        </DateRangeFilter>

        {/* No Data Message */}
        {analytics.total_requests === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('analytics.no_data_available')}</h3>
            <p className="text-gray-500">
              {t('analytics.no_data_available_description')}
            </p>
          </div>
        )}

        {/* Summary Cards */}
        {analytics.total_requests > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-600">{t('analytics.total_requests')}</h3>
                <p className="text-3xl font-bold">{analytics.total_requests}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-600">{t('analytics.total_tokens')}</h3>
                <p className="text-3xl font-bold">{analytics.total_tokens}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-600">{t('analytics.total_cost')}</h3>
                <p className="text-3xl font-bold">${analytics.total_cost?.toFixed(4)}</p>
              </div>
            </div>

            {/* User Selection for Admin */}
            {user?.role === 'admin' && analytics.users && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{t('analytics.user_analytics')}</h3>
                  {selectedUserId && (
                    <button
                      onClick={() => setSelectedUserId(null)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      {t('analytics.show_all_users')}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(analytics.users).map(([userId, userData]) => (
                    <button
                      key={userId}
                      className={`w-full text-left border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedUserId === userId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedUserId(userId)}
                    >
                      <h4 className="font-semibold mb-2">{userData.name}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-600">Requests</p>
                          <p className="font-semibold">{userData.total_requests}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tokens</p>
                          <p className="font-semibold">{userData.total_tokens}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Cost</p>
                          <p className="font-semibold">${userData.total_cost?.toFixed(4)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">{t('analytics.token_usage_by_service')}</h3>
                <Pie data={serviceDistributionData} options={chartOptions} />
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">{t('analytics.model_distribution')}</h3>
                <Pie data={prepareModelDistributionData()} options={chartOptions} />
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">{t('analytics.cost_distribution_by_model')}</h3>
                <Pie data={prepareModelCostData()} options={chartOptions} />
              </div>
            </div>

            {/* Token Usage Over Time */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{t('analytics.token_usage_over_time')}</h3>
                <div className="flex items-center">
                  <span className="mr-2 text-gray-600">
                    {showCombinedView ? t('analytics.combined_view') : t('analytics.individual_models')}
                  </span>
                  <label
                    className="relative inline-flex items-center cursor-pointer"
                    aria-label="Toggle between combined and individual model views"
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={showCombinedView}
                      onChange={() => setShowCombinedView(!showCombinedView)}
                    />
                    <div className="w-11 h-6 bg-blue-500 rounded-full shadow-inner"></div>
                    <div
                      className={`dot absolute w-4 h-4 bg-white rounded-full shadow transition ${
                        showCombinedView ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    ></div>
                  </label>
                </div>
              </div>
              <Line data={prepareTokenUsageData()} options={chartOptions} />
            </div>

            {/* Topics Distribution Statistics (Admin Only) */}
            {user?.role === 'admin' && (
              <div className="mb-8">
                <TopicsDistributionStats />
              </div>
            )}

            {/* Service Details */}
            <div className="space-y-6">
              {Object.entries(services).map(([serviceName, serviceData]) => {
                const currentPage = servicePages[serviceName] ?? 1;
                const itemsPerPage = 10;
                const totalPages = Math.ceil(serviceData.requests.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginatedRequests = serviceData.requests.slice(
                  startIndex,
                  startIndex + itemsPerPage
                );

                return (
                  <div key={serviceName} className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4">{serviceName}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">{t('analytics.total_requests')}</p>
                        <p className="text-lg font-semibold">{serviceData.total_requests}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{t('analytics.total_tokens')}</p>
                        <p className="text-lg font-semibold">{serviceData.total_tokens}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{t('analytics.total_cost')}</p>
                        <p className="text-lg font-semibold">
                          ${serviceData.total_cost?.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-normal">
                              {t('analytics.time')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-normal max-w-[200px]">
                              {t('analytics.title')}
                            </th>
                            {user?.role === 'admin' && !selectedUserId && (
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-normal">
                                {t('analytics.user')}
                              </th>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-normal max-w-[150px]">
                              {t('analytics.model')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-normal">
                              {t('analytics.request_tokens')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-normal">
                              {t('analytics.response_tokens')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-normal">
                              {t('analytics.processing_time')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-normal">
                              {t('analytics.cost')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedRequests.map((request, index) => (
                            <tr key={request.request_id + '_' + index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(request.created_at).toLocaleTimeString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 max-w-[200px]">
                                <div className="truncate" title={request.title}>
                                  {request.title}
                                </div>
                              </td>
                              {user?.role === 'admin' && !selectedUserId && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {request.user_name ?? 'N/A'}
                                </td>
                              )}
                              <td className="px-6 py-4 text-sm text-gray-900 max-w-[150px]">
                                <div
                                  className="truncate"
                                  title={request.model_info?.name ?? request.model}
                                >
                                  {request.model_info?.name ?? request.model}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {request.request_tokens}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {request.response_tokens}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {request.processing_time?.toFixed(2)}s
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${request.estimated_cost?.toFixed(4)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-4">
                          <nav className="flex items-center space-x-2">
                            <button
                              onClick={() => handlePageChange(serviceName, currentPage - 1)}
                              disabled={currentPage === 1}
                              className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {t('analytics.previous')}
                            </button>
                            <span className="text-sm text-gray-700">
                              {t('analytics.page')} {currentPage} {t('analytics.of')} {totalPages}
                            </span>
                            <button
                              onClick={() => handlePageChange(serviceName, currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {t('analytics.next')}
                            </button>
                          </nav>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AnalyticsDashboard;
