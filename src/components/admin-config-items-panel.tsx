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

import { useState } from 'react';
import { SelectableItem } from '../types';
import { ColumnDefinition, SelectableItemsTable } from './selectable-items-table';
import { t } from 'i18next';

interface AdminConfigItemsPanelProps<T extends SelectableItem> {
  panelTitle: string;
  panelDescription: string;
  selectableItemsGroups: Array<T[]>;
  selectableItemsGroupNames: string[];
  alreadyChosenItems: T[];
  columnDefinition: ColumnDefinition<T>[];
  handleApply: (chosenItems: T[]) => void;
}

function AdminConfigItemsPanel<T extends SelectableItem>({
  panelTitle,
  panelDescription,
  selectableItemsGroups,
  selectableItemsGroupNames,
  alreadyChosenItems,
  columnDefinition,
  handleApply,
}: AdminConfigItemsPanelProps<T>) {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [chosenItems, setChosenItems] = useState<T[]>(alreadyChosenItems);

  const handleTabChange = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  const handleItemSelection = (selectableItem: T) => {
    const exists = chosenItems.some(citem => citem.id === selectableItem.id);
    if (exists) {
      setChosenItems(prev => prev.filter(citem => citem.id !== selectableItem.id));
    } else {
      setChosenItems(prev => [...prev, selectableItem]);
    }
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md mt-4">
      <span className="text-xl font-bold">{panelTitle}</span>
      <div className="text-sm">{panelDescription}</div>
      <div className="mt-3">
        {selectableItemsGroups.map((_, index) => (
          <button
            key={index}
            onClick={() => handleTabChange(index)}
            className={`px-4 py-2 inline-block h-10 rounded-t-lg ${
              activeTab === index
                ? 'text-primary bg-background active border-b border-b-2 border-primary dark:text-blue-500'
                : 'hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'
            }`}
          >
            {selectableItemsGroupNames[index]}
          </button>
        ))}
      </div>

      {selectableItemsGroups.map(
        (itemsGroup, index) =>
          activeTab === index && (
            <SelectableItemsTable<T>
              key={index}
              items={itemsGroup}
              selectedItems={chosenItems}
              onToggleItem={handleItemSelection}
              columns={columnDefinition}
            />
          )
      )}

      <button
        onClick={() => handleApply(chosenItems)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {t('admin_panel.apply_configuration')}
      </button>
    </div>
  );
}

export default AdminConfigItemsPanel;
