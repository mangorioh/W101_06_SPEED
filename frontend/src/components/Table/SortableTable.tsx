import React, { useState } from "react";

interface Header {
  key: string;
  label: string;
}

interface SortableTableProps {
  headers: Header[];
  data: any[];
  visibleColumns: Record<string, boolean>;
}

const SortableTable: React.FC<SortableTableProps> = ({
  headers,
  data,
  visibleColumns,
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      // Handle numeric fields
      if (sortConfig.key === "published_date" || sortConfig.key === "rating") {
        const aValue = parseInt(a[sortConfig.key]) || 0;
        const bValue = parseInt(b[sortConfig.key]) || 0;
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      // Handle string fields
      const aValue = a[sortConfig.key]?.toString().toLowerCase() || "";
      const bValue = b[sortConfig.key]?.toString().toLowerCase() || "";

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  return (
    <div className="table-container">
      <table className="responsive-table w-full">
        <thead>
          <tr>
            {headers
              .filter((header) => visibleColumns[header.key])
              .map((header) => (
                <th
                  key={header.key}
                  onClick={() => handleSort(header.key)}
                  className="cursor-pointer hover:bg-gray-100 p-2 text-left"
                >
                  <div className="flex items-center">
                    <span>{header.label}</span>
                    {sortConfig?.key === header.key && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
              {headers
                .filter((header) => visibleColumns[header.key])
                .map((header) => (
                  <td key={`${index}-${header.key}`} className="p-2 border-t">
                    {header.key === "rating"
                      ? `${row[header.key]}/5`
                      : row[header.key] || "N/A"}
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SortableTable;
