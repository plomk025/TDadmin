// Componente de tabla de datos
import React from 'react';
import { cn } from '@/utils/helpers';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
}

function DataTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No hay datos disponibles'
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="rounded-xl border bg-card">
        <div className="animate-pulse">
          <div className="h-12 bg-muted/50 rounded-t-xl" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t">
              <div className="flex gap-4 p-4">
                {columns.map((_, j) => (
                  <div key={j} className="h-4 flex-1 rounded bg-muted/30" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <table className="table-modern">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.className}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="transition-colors">
              {columns.map((column) => (
                <td key={column.key} className={column.className}>
                  {column.render
                    ? column.render(item)
                    : String((item as any)[column.key] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
