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

import React from 'react';

interface TableProps<T> {
  tableHead: string[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  emptyStateMessage: string;
}

function Table<T>({ tableHead, data, renderRow, emptyStateMessage }: TableProps<T>) {
  return (
    <table className="w-full table-auto text-left">
      <thead>
        <tr>
          {tableHead.map(head => (
            <th key={head} className="border-b border-blue-gray-100 bg-gray-50 p-4">
              <span className="text-sm font-bold text-gray-700">{head}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((item, index) => renderRow(item, index))
        ) : (
          <tr>
            <td colSpan={tableHead.length} className="p-4 text-center text-gray-500">
              {emptyStateMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default Table;
