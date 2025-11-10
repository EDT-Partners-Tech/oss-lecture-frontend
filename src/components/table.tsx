// © [2025] EDT&Partners. Licensed under CC BY 4.0.
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
