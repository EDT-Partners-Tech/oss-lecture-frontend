// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React, { useState, useContext } from 'react';
import { DocumentIcon, TrashIcon } from '@heroicons/react/20/solid';
import { Material } from '../../types';
import { deleteMaterials, deleteAndUpdateCourse } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../authentication/authContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface MaterialsListProps {
  materials: Material[];
  courseId: string;
  onMaterialsDeleted: () => void;
}

const MaterialsList: React.FC<MaterialsListProps> = ({ materials, courseId, onMaterialsDeleted }) => {
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { isAppSyncSubscribed } = useContext(AuthContext);
  const { t } = useTranslation();

  const handleMaterialSelect = (materialId: string) => {
    setSelectedMaterials(prev =>
      prev.includes(materialId) ? prev.filter(id => id !== materialId) : [...prev, materialId]
    );
  };

  const handleDeleteMaterials = async () => {
    if (selectedMaterials.length === 0) return;

    setIsDeleting(true);
    try {
      if (isAppSyncSubscribed) {
        const response = await deleteAndUpdateCourse(courseId, selectedMaterials, true);
        
        if (response.status >= 200 && response.status < 300) {
          toast.success(t('kbm_generation.processing'));
          navigate('/knowledge-base');
          return;
        } else {
          toast.error(t('kbm_generation.error'));
          setIsDeleting(false);
          return;
        }
      }

      // Flujo normal si no está suscrito
      await deleteMaterials(courseId, selectedMaterials);
      onMaterialsDeleted();
      setSelectedMaterials([]);
    } catch (error) {
      console.error('Error deleting materials:', error);
      toast.error(t('kbm_generation.error'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-900">Materials</h3>
        {selectedMaterials.length > 0 && (
          <button
            onClick={handleDeleteMaterials}
            disabled={isDeleting}
            className="flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
          >
            <TrashIcon className="h-5 w-5 mr-1" />
            {isDeleting ? 'Removing...' : 'Remove selected'}
          </button>
        )}
      </div>
      <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
        {materials.map(material => (
          <li
            key={material.id}
            className="flex items-center justify-between py-4 pr-5 pl-4 text-sm/6"
          >
            <div className="flex w-0 flex-1 items-center">
              <input
                type="checkbox"
                checked={selectedMaterials.includes(material.id)}
                onChange={() => handleMaterialSelect(material.id)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <DocumentIcon className="size-5 shrink-0 text-gray-400 ml-3" aria-hidden="true" />
              <div className="ml-4 flex min-w-0 flex-1 gap-2">
                <span className="truncate font-medium">{material.title}</span>
                <span className="shrink-0 text-gray-400">{material.type}</span>
              </div>
            </div>
            <div className="ml-4 shrink-0">
              <a
                href={material.s3_uri}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                View
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MaterialsList;
