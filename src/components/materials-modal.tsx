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

import React, { useState } from 'react';
import { Material } from '../types';
import { useTranslation } from 'react-i18next';

interface MaterialsModalProps {
  materials: Material[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedMaterials: string[]) => void;
}

const MaterialsModal: React.FC<MaterialsModalProps> = ({ materials, isOpen, onClose, onSave }) => {
  const { t } = useTranslation();
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const processed = ['Transcribed version available', 'Processed version available'];

  const handleMaterialsChange = (audience: string) => {
    setSelectedMaterials(prev =>
      prev.includes(audience) ? prev.filter(a => a !== audience) : [...prev, audience]
    );
  };

  const handleSave = () => {
    const finalMaterials = [...selectedMaterials];

    onSave(finalMaterials);
    onClose();
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
        <div className="bg-white rounded-lg shadow-lg p-6 z-10 max-w-3xl">
          <h2 className="text-lg font-semibold mb-4">{t('knowledgebase_chat.filter_materials')}</h2>
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {materials.map(material => (
                <div
                  key={material.id}
                  onClick={() =>
                    (material.status === null || processed.includes(material.status)) &&
                    handleMaterialsChange(material.id)
                  }
                  className={`border rounded-lg p-2 px-4 text-center transition-colors duration-200 ${
                    selectedMaterials.includes(material.id)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  } ${
                    material.status !== null && !processed.includes(material.status)
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                  title={
                    material.status !== null && !processed.includes(material.status)
                      ? t('knowledgebase_chat.not_selectable_material_not_indexed')
                      : material.title
                  }
                >
                  <span className="text-sm mb-2 overflow-hidden text-ellipsis line-clamp-2">
                    {material.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">
              {t('knowledgebase_chat.save')}
            </button>
            <button onClick={onClose} className="ml-2 bg-gray-300 px-4 py-2 rounded">
              {t('knowledgebase_chat.cancel')}
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default MaterialsModal;
