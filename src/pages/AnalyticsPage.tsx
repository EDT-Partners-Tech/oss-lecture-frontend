import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { analyticsService } from '../services/api';
import useAuth from '../hooks/useAuth';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface AnalyticsData {
  id: string;
  request_id: string;
  model: string;
  request_token_count: number;
  response_token_count: number;
  created_at: string;
  response_type: string;
  error: string | null;
  model_parameters: any;
  status: string;
  processing_time: number;
  estimated_cost: number;
  reference: string | null;
}

const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [userAnalytics, setUserAnalytics] = useState<any>();
  const [groupAnalytics, setGroupAnalytics] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        if (user) {
          const userData = await analyticsService.getUserAnalytics();
          setUserAnalytics(userData);

          if (user.role === 'admin' && user.group?.id) {
            const groupData = await analyticsService.getGroupAnalytics(user.group.id);
            setGroupAnalytics(groupData);
          }
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch analytics data');
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

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

  // Prepare data for charts
  const prepareChartData = (analytics: AnalyticsData[]) => {
    const dates = analytics.map(item => new Date(item.created_at).toLocaleDateString());
    const requestTokens = analytics.map(item => item.request_token_count);
    const responseTokens = analytics.map(item => item.response_token_count);

    return {
      labels: dates,
      datasets: [
        {
          label: 'Request Tokens',
          data: requestTokens,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
        {
          label: 'Response Tokens',
          data: responseTokens,
          borderColor: 'rgb(53, 162, 235)',
          tension: 0.1,
        },
      ],
    };
  };

  const prepareCostData = (analytics: AnalyticsData[]) => {
    const dates = analytics.map(item => new Date(item.created_at).toLocaleDateString());
    const costs = analytics.map(item => item.estimated_cost);

    return {
      labels: dates,
      datasets: [
        {
          label: 'Estimated Cost ($)',
          data: costs,
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Token Usage Over Time',
      },
    },
  };

  const costOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Cost Analysis Over Time',
      },
    },
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{t('analytics.title')}</h1>

      {/* User Analytics Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <Line options={options} data={prepareChartData(userAnalytics)} />
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <Line options={costOptions} data={prepareCostData(userAnalytics)} />
          </div>
        </div>
      </div>

      {/* Group Analytics Section (Admin Only) */}
      {user?.role === 'admin' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Group Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <Line options={options} data={prepareChartData(groupAnalytics)} />
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <Line options={costOptions} data={prepareCostData(groupAnalytics)} />
            </div>
          </div>
        </div>
      )}

      {/* Analytics Summary Table */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Detailed Analytics</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Tokens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Tokens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processing Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estimated Cost
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userAnalytics.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.request_token_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.response_token_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.processing_time?.toFixed(2)}s
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${item.estimated_cost?.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
