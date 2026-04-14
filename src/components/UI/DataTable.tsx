// src/components/UI/DataTable.tsx
import { useState } from 'react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onValidate?: (item: any) => void;
  onRefuse?: (item: any) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  onValidate,
  onRefuse 
}) => {
  const [search, setSearch] = useState('');

  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete || onValidate || onRefuse) && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {col.render ? col.render(item[col.key], item) : item[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete || onValidate || onRefuse) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {onValidate && (
                      <button
                        onClick={() => onValidate(item)}
                        className="text-green-600 hover:text-green-900 mr-3"
                        title="Valider"
                      >
                        ✓
                      </button>
                    )}
                    {onRefuse && (
                      <button
                        onClick={() => onRefuse(item)}
                        className="text-red-600 hover:text-red-900 mr-3"
                        title="Refuser"
                      >
                        ✗
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Modifier"
                      >
                        ✏️
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Aucune donnée trouvée
        </div>
      )}
    </div>
  );
};