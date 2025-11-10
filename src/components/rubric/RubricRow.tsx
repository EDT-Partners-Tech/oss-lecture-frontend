import React from 'react';
import { FaEye, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';

interface RubricRowProps {
  rubric: {
    id: number;
    name: string;
    description: string;
    created_at?: string;
    updated_at?: string;
  };
  deleteLoading: string | null;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onView: (id: number) => void;
  t: (key: string) => string;
}

const RubricRow: React.FC<RubricRowProps> = ({
  rubric,
  deleteLoading,
  onDelete,
  onEdit,
  onView,
  t,
}) => {
  // Detect if the rubric is in IN_PROGRESS state
  const isInProgress = !rubric.name && !rubric.description; 

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {isInProgress ? (
            <span className="text-blue-600">{t('rubrics_management.generating_rubric')}</span>
          ) : (
            rubric.name || t('rubrics_management.no_name')
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {isInProgress ? (
            <span></span>
          ) : (
            rubric.description || t('rubrics_management.no_description')
          )}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          {isInProgress ? (
            <FaSpinner className="w-4 h-4 animate-spin text-blue-500" />
          ) : (
            <>
              <button
                onClick={() => onView(rubric.id)}
                className="text-green-600 hover:text-green-900 transition-colors duration-200 p-1 rounded"
                title={t('rubrics_management.view_rubric')}
              >
                <FaEye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(rubric.id)}
                className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-1 rounded"
                title={t('rubrics_management.edit_rubric')}
              >
                <FaEdit className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => onDelete(rubric.id)}
            disabled={deleteLoading === rubric.id.toString()}
            className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('rubrics_management.delete_rubric')}
          >
            {deleteLoading === rubric.id.toString() ? (
              <FaSpinner className="w-4 h-4 animate-spin" />
            ) : (
              <FaTrash className="w-4 h-4" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default RubricRow; 