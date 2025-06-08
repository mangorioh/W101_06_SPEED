import ColumnSelector from "@/components/Table/ColumnSelector";

interface FiltersProps {
  filters: {
    selectedStatus: string;
    setSelectedStatus: (status: string) => void;
    selectedPractice: string;
    setSelectedPractice: (practice: string) => void;
    selectedClaim: string;
    setSelectedClaim: (claim: string) => void;
    startYear: string;
    setStartYear: (year: string) => void;
    endYear: string;
    setEndYear: (year: string) => void;
    sortOrder: "asc" | "desc";
    setSortOrder: (order: "asc" | "desc") => void;
  };
  options: {
    statusOptions: string[];
    practiceOptions: string[];
    claimOptions: string[];
  };
  errorMessage?: string;
  visibleColumns: Record<string, boolean>;
  onToggleColumn: (column: string) => void;
  headers: Array<{ key: string; label: string }>;
}

export const Filters = ({
  filters,
  options,
  errorMessage,
  visibleColumns,
  onToggleColumn,
  headers,
}: FiltersProps) => {
  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4">
        <select
          value={filters.selectedStatus}
          onChange={(e) => filters.setSelectedStatus(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="All">All Statuses</option>
          {options.statusOptions.map((s, i) => (
            <option key={i}>{s}</option>
          ))}
        </select>

        <select
          value={filters.selectedPractice}
          onChange={(e) => filters.setSelectedPractice(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="All">All Practices</option>
          {options.practiceOptions.map((p, i) => (
            <option key={i}>{p}</option>
          ))}
        </select>

        <select
          value={filters.selectedClaim}
          onChange={(e) => filters.setSelectedClaim(e.target.value)}
          disabled={filters.selectedPractice === "All"}
          className="border rounded px-2 py-1"
        >
          <option value="All">All Claims</option>
          {options.claimOptions.map((c, i) => (
            <option key={i}>{c}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Start Year"
          value={filters.startYear}
          onChange={(e) => filters.setStartYear(e.target.value)}
          className="border rounded px-2 py-1 w-24"
        />
        <input
          type="number"
          placeholder="End Year"
          value={filters.endYear}
          onChange={(e) => filters.setEndYear(e.target.value)}
          className="border rounded px-2 py-1 w-24"
        />

        <select
          value={filters.sortOrder}
          onChange={(e) =>
            filters.setSortOrder(e.target.value as "asc" | "desc")
          }
          className="border rounded px-2 py-1"
        >
          <option value="asc">Oldest First</option>
          <option value="desc">Newest First</option>
        </select>

        <ColumnSelector
          headers={headers}
          visibleColumns={visibleColumns}
          onToggle={onToggleColumn}
        />
      </div>

      {errorMessage && <p className="text-red-600">{errorMessage}</p>}
    </div>
  );
};
