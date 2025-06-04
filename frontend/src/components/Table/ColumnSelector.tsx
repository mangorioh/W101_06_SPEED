import { useState } from "react";

interface ColumnSelectorProps {
  headers: { key: string; label: string }[];
  visibleColumns: Record<string, boolean>;
  onToggle: (column: string) => void;
}

const ColumnSelector = ({ 
  headers, 
  visibleColumns, 
  onToggle 
}: ColumnSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-200 hover:bg-gray-300 py-1 px-3 rounded flex items-center"
      >
        <span>Columns</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10 p-2">
          {headers.map((header) => (
            <label 
              key={header.key} 
              className="flex items-center space-x-2 p-1 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={visibleColumns[header.key]}
                onChange={() => onToggle(header.key)}
                className="rounded text-blue-600"
              />
              <span className="text-sm">{header.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColumnSelector;
