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

import { SelectableItem } from '../types';
import { t } from 'i18next';

export interface ColumnDefinition<T> {
  header: string;
  render: (item: T) => React.ReactNode;
}

interface SelectableItemsTableProps<T extends SelectableItem> {
  items: T[];
  selectedItems: T[];
  onToggleItem: (item: T) => void;
  visibleRows?: number;
  columns: ColumnDefinition<T>[];
  hideActivatedColumn?: boolean;
}

export function SelectableItemsTable<T extends SelectableItem>({
  items,
  selectedItems,
  onToggleItem,
  visibleRows = 8,
  columns,
  hideActivatedColumn = false,
}: SelectableItemsTableProps<T>) {
  const rowHeight = 48;
  const maxHeight = visibleRows * rowHeight;

  return (
    <div className="mb-4">
      <div className="overflow-y-auto" style={{ maxHeight: `${maxHeight}px` }}>
        <table className="table-auto w-full">
          <thead className="sticky top-0 z-5 bg-gray-100">
            <tr className="bg-gray-100">
              {!hideActivatedColumn && (
                <th className="px-4 py-2">{t('admin_panel.activated')}</th>
              )}
              {columns.map((column, index) => (
                <th key={index} className="px-4 py-2">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const isSelected = selectedItems.some(sitem => sitem.id === item.id);
              // Usar un key más robusto que combine id e index para evitar duplicados
              const uniqueKey = item.id ? `${item.id}-${index}` : `item-${index}`;
              return (
                <tr key={uniqueKey}>
                  {!hideActivatedColumn && (
                    <td className="border px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleItem(item)}
                      />
                    </td>
                  )}
                  {columns.map((column, columnIndex) => (
                    <td key={`${uniqueKey}-col-${columnIndex}`} className="border px-4 py-2">
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
