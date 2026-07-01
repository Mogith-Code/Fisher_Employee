import React from 'react';
import { Database } from 'lucide-react';

export default function DataTable({ columns = [], data = [], emptyMessage = 'No data found', onRowClick }) {
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-brand-gray">
        <Database className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="bg-gray-50/80">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-brand-gray
                  ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              onClick={() => onRowClick?.(row)}
              className={`
                ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-brand-ivory/40'}
                ${onRowClick ? 'cursor-pointer hover:bg-brand-teal/5' : ''}
                transition-all-custom
              `}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 text-sm text-brand-dark
                    ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
