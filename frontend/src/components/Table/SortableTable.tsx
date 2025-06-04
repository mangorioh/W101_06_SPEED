import React from "react";

interface SortableTableProps {
  headers: { key: string; label: string }[];
  data: any[];
}

const SortableTable: React.FC<SortableTableProps> = ({ headers, data }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full border border-slate-300 bg-white rounded-lg shadow">
      <thead>
        <tr className="bg-slate-200">
          {headers.map((header) => (
            <th
              key={header.key}
              className="px-4 py-2 text-left font-semibold text-slate-700 border-b border-slate-300"
            >
              {header.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr
            key={i}
            className={i % 2 === 0 ? "bg-slate-100" : "bg-white"}
          >
            {headers.map((header) => (
              <td
                key={header.key}
                className="px-4 py-2 border-b border-slate-200 text-slate-800"
              >
                {header.key === "rating"
                  ? `${row[header.key]}/5`
                  : row[header.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default SortableTable;
