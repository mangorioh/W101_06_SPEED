import { useState, useEffect } from "react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

interface SavedSearches {
  [key: string]: string;
}

export const SearchBar = ({ searchQuery, onSearchChange }: SearchBarProps) => {
  const [savedQueries, setSavedQueries] = useState<SavedSearches>({});
  const [newQueryName, setNewQueryName] = useState<string>("");
  const [showSavePrompt, setShowSavePrompt] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem("savedSearchQueries");
    if (saved) {
      setSavedQueries(JSON.parse(saved));
    }
  }, []);

  const handleSaveQuery = () => {
    setShowSavePrompt(true);
  };

  const confirmSaveQuery = () => {
    if (!newQueryName.trim()) return;
    const newSaved = { ...savedQueries, [newQueryName]: searchQuery };
    setSavedQueries(newSaved);
    localStorage.setItem("savedSearchQueries", JSON.stringify(newSaved));
    setShowSavePrompt(false);
    setNewQueryName("");
  };

  const loadSavedQuery = (query: string) => {
    onSearchChange(query);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <button
        type="button"
        onClick={handleSaveQuery}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Current Search
      </button>

      <select
        onChange={(e) => loadSavedQuery(savedQueries[e.target.value])}
        className="border rounded px-2 py-1"
      >
        <option value="">-- Load Saved Search --</option>
        {Object.entries(savedQueries).map(([name]) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="border rounded px-2 py-1 flex-1"
      />

      {showSavePrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Save Search Query</h2>
            <input
              type="text"
              value={newQueryName}
              onChange={(e) => setNewQueryName(e.target.value)}
              placeholder="Enter a name for your query"
              className="border rounded px-3 py-2 w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSavePrompt(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmSaveQuery}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save Query
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
