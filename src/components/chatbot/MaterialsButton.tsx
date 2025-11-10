// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React from 'react';
import { FaFile } from 'react-icons/fa';
import { ChatbotFile } from '../../types';

interface MaterialsButtonProps {
  materials: ChatbotFile[];
  onShowMaterials: (e: React.MouseEvent, materials: ChatbotFile[]) => void;
  className?: string;
}

const MaterialsButton: React.FC<MaterialsButtonProps> = ({ 
  materials, 
  onShowMaterials, 
  className = '' 
}) => (
  materials && materials.length > 0 && (
    <button
      onClick={(e) => onShowMaterials(e, materials)}
      className={`text-gray-400 hover:text-blue-500 transition-colors duration-200 ${className}`}
    >
      <FaFile className="w-4 h-4" />
    </button>
  )
);

export default MaterialsButton; 