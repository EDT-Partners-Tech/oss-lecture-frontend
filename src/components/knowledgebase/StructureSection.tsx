import React from 'react';
import { FolderIcon } from '@heroicons/react/20/solid';
import ActionButton from '../ActionButton';
import InputField from '../InputField';
import { useTranslation } from 'react-i18next';

interface StructureSectionProps {
  isEditing: boolean;
  structureItems: string[];
  newItem: string;
  updateLoading: boolean;
  updateError: string | null;
  updateSuccess: boolean;
  course: any;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onSaveStructure: () => void;
  onCancelEdit: () => void;
  onCreateStructure: () => void;
  onNewItemChange: (value: string) => void;
}

const StructureSection: React.FC<StructureSectionProps> = ({
  isEditing,
  structureItems,
  newItem,
  updateLoading,
  updateError,
  updateSuccess,
  course,
  onAddItem,
  onRemoveItem,
  onSaveStructure,
  onCancelEdit,
  onCreateStructure,
  onNewItemChange,
}) => {
  const { t } = useTranslation();
  const getStructureDescription = (structure: string[]): string => {
    let message = '';
    if (structure.length > 0) {
      const filename_structure =
        structure.map(item => `[${item.toLowerCase()}]`).join('_') + '_name-some-description.pdf';
      message = `The files must follow the format: ${filename_structure} (example: ${filename_structure})`;
    }
    return message;
  };

  return (
    <div className="mb-8 bg-white p-4 rounded-md shadow-sm shadow-gray-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base/7 font-semibold text-gray-900">{t('knowledge_base_creator.structure')}</h3>
      </div>

      {!isEditing ? (
        <>
          {!course?.settings?.knowledge_base_filter_structure ||
          course.settings.knowledge_base_filter_structure.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-4">
                {t('knowledge_base_creator.do_not_define_structure')}
              </p>
              <ActionButton onClick={onCreateStructure} label={t('knowledge_base_creator.create_structure')} />
            </div>
          ) : (
            <>
              <nav aria-label="Estructura" className="flex">
                <ol className="flex space-x-4 rounded-md bg-white px-6 shadow-sm py-3">
                  <li className="flex">
                    <div className="flex items-center">
                      <span className="text-gray-400">
                        <FolderIcon className="size-5 shrink-0" aria-hidden="true" />
                      </span>
                    </div>
                  </li>
                  {course.settings.knowledge_base_filter_structure.map((item: string) => (
                    <li key={item} className="flex">
                      <div className="flex items-center">
                        <svg
                          fill="currentColor"
                          viewBox="0 0 24 44"
                          preserveAspectRatio="none"
                          aria-hidden="true"
                          className="h-full w-6 shrink-0 text-gray-200"
                        >
                          <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
                        </svg>
                        <span className="ml-4 text-sm font-medium text-gray-500 capitalize">
                          {item}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </nav>

              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  {getStructureDescription(course.settings.knowledge_base_filter_structure)}
                </p>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div>
            <InputField
              id="newItem"
              value={newItem}
              onChange={e => onNewItemChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddItem();
                }
              }}
              placeholder={t('knowledge_base_creator.add_new_item_placeholder')}
              label={t('knowledge_base_creator.add_new_item')}
            />
            <div className="flex space-x-2 mt-2">
              <ActionButton onClick={onAddItem} label={t('knowledge_base_creator.add')} />
            </div>
          </div>

          {structureItems.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Current items</h4>
              <ul className="space-y-2">
                {structureItems.map(item => (
                  <li
                    key={item}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <span className="text-sm text-gray-700">{item}</span>
                    <ActionButton
                      onClick={() => onRemoveItem(structureItems.indexOf(item))}
                      label={t('knowledge_base_creator.delete')}
                      className="rounded-sm px-2 py-1 text-xs"
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <ActionButton
              onClick={onSaveStructure}
              disabled={updateLoading || structureItems.length === 0}
              label={updateLoading ? t('knowledge_base_creator.saving') : t('knowledge_base_creator.save_changes')}
            />
            <ActionButton onClick={onCancelEdit} disabled={updateLoading} label={t('knowledge_base_creator.cancel')} />
          </div>

          {updateSuccess && (
            <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
              {t('knowledge_base_creator.file_structure_updated')}
            </div>
          )}

          {updateError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{updateError}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default StructureSection;
