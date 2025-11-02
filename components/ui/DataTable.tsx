"use client";

import React, { useState, useMemo } from "react";
import { Search, Filter, MoreHorizontal, Plus } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  enableSorting?: boolean;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title: string;
  description?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showFilter?: boolean;
  showNewButton?: boolean;
  newButtonText?: string;
  onNewClick?: () => void;
  onRowClick?: (item: T) => void;
  onActionClick?: (item: T) => void;
  itemsPerPage?: number;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  description,
  searchPlaceholder = "Search...",
  showSearch = true,
  showFilter = true,
  showNewButton = true,
  newButtonText = "New Item",
  onNewClick,
  onRowClick,
  onActionClick,
  itemsPerPage = 10,
  className = "",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const defaultRender = (value: any, item: T, column: Column<T>) => {
    if (column.key === "actions") {
      return (
        <button 
          className="text-gray-400 hover:text-gray-600"
          onClick={(e) => {
            e.stopPropagation();
            onActionClick?.(item);
          }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      );
    }
    
    return (
      <span className="text-sm text-gray-900">
        {value || "-"}
      </span>
    );
  };

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="text-gray-600 mt-2">{description}</p>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-4">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
          {showFilter && (
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          )}
        </div>
        {showNewButton && (
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={onNewClick}
          >
            <Plus className="h-4 w-4 mr-2" />
            {newButtonText}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.width ? column.width : ""
                    }`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((item, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {column.render
                        ? column.render(item[column.key], item)
                        : defaultRender(item[column.key], item, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredData.length)}
            </span>{" "}
            of <span className="font-medium">{filteredData.length}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`px-3 py-2 rounded-lg text-sm ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Utility functions for common column types
export const createStatusColumn = <T extends Record<string, any>>(
  key: string,
  header: string,
  statusColors: Record<string, string>
): Column<T> => ({
  key,
  header,
  render: (value: string) => (
    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[value] || statusColors.default || "bg-gray-100 text-gray-800"}`}>
      {value}
    </span>
  ),
});

export const createPriorityColumn = <T extends Record<string, any>>(
  key: string,
  header: string
): Column<T> => ({
  key,
  header,
  render: (value: string) => {
    const colors = {
      High: "bg-red-100 text-red-800",
      Normal: "bg-blue-100 text-blue-800",
      Low: "bg-gray-100 text-gray-600",
      default: "bg-gray-100 text-gray-600",
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[value as keyof typeof colors] || colors.default}`}>
        {value}
      </span>
    );
  },
});

export const createActionsColumn = <T extends Record<string, any>>(
  header: string = "Actions"
): Column<T> => ({
  key: "actions",
  header,
  render: () => null, // Will be handled by defaultRender
});
