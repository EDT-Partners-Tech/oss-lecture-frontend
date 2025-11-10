// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React from 'react';
import { useTranslation } from 'react-i18next';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onFilterApply: () => void;
  children?: React.ReactNode;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onFilterApply,
  children,
}) => {
  const { t } = useTranslation();
  const handleDateRangeSelect = (range: 'today' | 'month' | 'year' | 'all') => {
    const today = new Date();
    let start;
    let end;

    switch (range) {
      case 'today':
        start = today.toISOString().split('T')[0];
        end = today.toISOString().split('T')[0];
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'year':
        start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        end = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
        break;
      case 'all':
        start = '';
        end = '';
        break;
    }

    onStartDateChange(start);
    onEndDateChange(end);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">{t('analytics.filter_by_date_range')}</h3>

      {/* Quick Date Range Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleDateRangeSelect('today')}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          {t('analytics.today')}
        </button>
        <button
          onClick={() => handleDateRangeSelect('month')}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          {t('analytics.this_month')}
        </button>
        <button
          onClick={() => handleDateRangeSelect('year')}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          {t('analytics.this_year')}
        </button>
        <button
          onClick={() => handleDateRangeSelect('all')}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          {t('analytics.all_time')}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('analytics.start_date')}
            <input
              type="date"
              value={startDate}
              onChange={e => onStartDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('analytics.end_date')}
            <input
              type="date"
              value={endDate}
              onChange={e => onEndDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
        <div className="flex items-end">
          <button
            onClick={onFilterApply}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors mr-4"
          >
            {t('analytics.apply_filter')}
          </button>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilter;
