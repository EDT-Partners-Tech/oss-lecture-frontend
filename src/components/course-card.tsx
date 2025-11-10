// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import { Eye, Loader2, AlertCircle } from 'lucide-react';
import { Course } from '../types';
import { useTranslation } from 'react-i18next';

interface CourseCardProps {
  course: Course;
  isActive: boolean;
  onActiveChange: (id: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isActive, onActiveChange }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCardClick = () => {
    if (course.ingestion_status === 'IN_PROGRESS') return;
    onActiveChange(course.id);
  };

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    if (course.ingestion_status === 'IN_PROGRESS') return;
    navigate(`/course/${course.id}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  const isInProgress = course.ingestion_status === 'IN_PROGRESS';
  const isError = course.ingestion_status === 'ERROR';
  const isNull = course.ingestion_status === null;

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={handleKeyPress}
      role="tab"
      tabIndex={0}
      aria-label={`Course: ${course.title}`}
      aria-selected={isActive}
      className={`flex flex-col w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2 text-left ${
        isInProgress ? 'cursor-not-allowed' : 'cursor-pointer'
      } focus:outline-none focus:ring-opacity-50`}
    >
      <div
        className={`relative flex flex-col h-full bg-white border rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl ${
          isActive ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'
        } ${isInProgress ? 'opacity-75' : ''}`}
      >
        <div className="absolute top-2 right-2 group">
          <button
            onClick={handleEditClick}
            className={`p-2 bg-white border rounded-full shadow transition-all duration-300 ${
              isInProgress ? 'cursor-not-allowed' : 'hover:bg-blue-50'
            }`}
            disabled={isInProgress}
          >
            {isInProgress ? (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            ) : isError ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : isNull ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            ) : (
              <Eye className="w-4 h-4 text-blue-500" />
            )}
          </button>
          <div
            className="absolute bottom-full -right-2 mb-3 px-2 py-1 bg-gray-700 text-white text-xs rounded 
                        opacity-0 transition-opacity duration-300 group-hover:opacity-100 whitespace-nowrap"
          >
            {isError
              ? t('knowledge_base_dashboard.ingestion_status.error')
              : isInProgress
              ? t('knowledge_base_dashboard.ingestion_status.in_progress')
              : isNull
              ? t('knowledge_base_dashboard.ingestion_status.initializing')
              : t('check_course_details')}
          </div>
        </div>
        <div className="flex-1 p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">{course.title}</h2>
          <p className="text-gray-600 text-sm">
            {isError
              ? t('knowledge_base_dashboard.ingestion_status.error')
              : isInProgress
              ? t('knowledge_base_dashboard.ingestion_status.in_progress')
              : isNull
              ? t('knowledge_base_dashboard.ingestion_status.initializing')
              : course.description
              ? `${course.description.split(' ').slice(0, 10).join(' ')}...`
              : t('no_description')}
          </p>
        </div>
        <div className="p-3 border-t border-gray-200">
          <p className="text-gray-500 text-sm">{t('created_at')}: {formatDate(course.created_at)}</p>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
