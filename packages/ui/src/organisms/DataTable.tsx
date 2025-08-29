import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, MoreHorizontal } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Dropdown } from '../molecules/Dropdown';
import { Pagination } from '../molecules/Pagination';
import { Spinner } from '../atoms/Spinner';
import { cn } from '../lib/utils';

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T = any> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize?: number;
    onPageSizeChange?: (size: number) => void;
  };
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  actions?: {
    label: string;
    onClick: (rows: T[]) => void;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  }[];
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = false,
  sortable = true,
  pagination,
  selectable = false,
  onSelectionChange,
  actions = [],
  emptyMessage = 'Нет данных для отображения',
  className,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Фильтрация данных по поисковому запросу
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter(row =>
      columns.some(column => {
        const value = row[column.key];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, columns, searchTerm]);

  // Сортировка данных
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  const handleSort = (columnKey: keyof T) => {
    if (!sortable) return;

    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === sortedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(sortedData.map((_, index) => index)));
    }
    onSelectionChange?.(selectedRows.size === sortedData.length ? [] : sortedData);
  };

  const handleSelectRow = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(Array.from(newSelected).map(i => sortedData[i]));
  };

  const getSortIcon = (columnKey: keyof T) => {
    if (sortColumn !== columnKey) {
      return React.createElement(ChevronUp as any, { className: "h-4 w-4 opacity-0 group-hover:opacity-50" });
    }
    if (sortDirection === 'asc') {
      return React.createElement(ChevronUp as any, { className: "h-4 w-4" });
    }
    if (sortDirection === 'desc') {
      return React.createElement(ChevronDown as any, { className: "h-4 w-4" });
    }
    return React.createElement(ChevronUp as any, { className: "h-4 w-4 opacity-50" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Панель инструментов */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {searchable && (
            <div className="relative max-w-sm">
              {React.createElement(Search as any, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" })}
              <Input
                placeholder="Поиск..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {selectedRows.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Выбрано: {selectedRows.size}
              </span>
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'primary'}
                  size="sm"
                  onClick={() => action.onClick(Array.from(selectedRows).map(i => sortedData[i]))}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {pagination?.onPageSizeChange && (
          <Dropdown
            options={[
              { value: '10', label: '10 строк' },
              { value: '25', label: '25 строк' },
              { value: '50', label: '50 строк' },
              { value: '100', label: '100 строк' },
            ]}
            value={pagination.pageSize?.toString() || '25'}
            onChange={(value) => pagination.onPageSizeChange?.(parseInt(Array.isArray(value) ? value[0] : value))}
            className="w-32"
          />
        )}
      </div>

      {/* Таблица */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {selectable && (
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                      column.sortable && sortable && 'cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-700',
                      column.className
                    )}
                    style={{ width: column.width }}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      {column.header}
                      {column.sortable && sortable && getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
                {actions.length > 0 && !selectable && (
                  <th className="px-4 py-3 text-right">
                    <span className="sr-only">Действия</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                sortedData.map((row, index) => (
                  <tr
                    key={index}
                    className={cn(
                      'hover:bg-gray-50 dark:hover:bg-gray-800',
                      selectedRows.has(index) && 'bg-blue-50 dark:bg-blue-900/20'
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(index)}
                          onChange={() => handleSelectRow(index)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={cn('px-4 py-3 text-sm text-gray-900 dark:text-gray-100', column.className)}
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : String(row[column.key] || '')
                        }
                      </td>
                    ))}
                    {actions.length > 0 && !selectable && (
                      <td className="px-4 py-3 text-right">
                        <Dropdown
                          options={actions.map((action, actionIndex) => ({
                            value: actionIndex.toString(),
                            label: action.label,
                            icon: action.icon,
                          }))}
                          onChange={(value) => {
                            const actionIndex = Array.isArray(value) ? parseInt(value[0]) : parseInt(value);
                            const action = actions[actionIndex];
                            action.onClick([row]);
                          }}
                          placeholder=""
                          className="w-8 h-8 p-0"
                        />
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Пагинация */}
      {pagination && sortedData.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Показано {((pagination.currentPage - 1) * (pagination.pageSize || 25)) + 1} -{' '}
            {Math.min(pagination.currentPage * (pagination.pageSize || 25), sortedData.length)} из{' '}
            {sortedData.length} записей
          </div>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
}
