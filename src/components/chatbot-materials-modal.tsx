// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React from 'react';
import { FaFile } from 'react-icons/fa';
import { ChatbotFile } from '../types';

interface ChatbotMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: ChatbotFile[];
}

const ChatbotMaterialsModal: React.FC<ChatbotMaterialsModalProps> = ({ isOpen, onClose, materials }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Materiales del Chatbot</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        
        <div className="mt-4">
          {materials.length === 0 ? (
            <p className="text-gray-500">No hay materiales asociados</p>
          ) : (
            <ul className="space-y-2">
              {materials.map((material) => (
                <li key={material.id} className="flex items-center gap-2 text-gray-700">
                  <FaFile className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{material.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotMaterialsModal; 