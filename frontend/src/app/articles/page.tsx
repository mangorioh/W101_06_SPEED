// Kirby Pascua | 22172362
// mongodb connection articles
"use client";

import { useState, useEffect, useMemo } from "react";
import SortableTable from "@/components/Table/SortableTable";
import ColumnSelector from "@/components/Table/ColumnSelector";

interface ArticlesInterface {
  _id: string;
  title: string;
  author: string | string[];
  published_date: string;
  description?: string;
  publisher?: string;
  status?: string;
  isbn?: string;
  moderatedBy?: string;
  rating?: number | string;
  reason_for_decision?: string;
  volume?: string;
  number?: number;
  journal?: string;
  updated_date?: string;
  moderated_date?: string;
  practice?: string[];
  claim?: string;
}

const defaultVisibleColumns = {
  title: true,
  author: true,
  published_date: true,
  publisher: true,
  status: true,
  journal: true,
  rating: true,
  moderatedBy: true,
  practice: true,
  claim: true
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticlesInterface[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedPractice, setSelectedPractice] = useState<string>("All");
  const [selectedClaim, setSelectedClaim] = useState<string>("All");
  const [startYear, setStartYear] = useState<string>("");
  const [endYear, setEndYear] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('columnVisibility');
      return saved ? JSON.parse(saved) : defaultVisibleColumns;
    }
    return defaultVisibleColumns;
  });

  const [savedQueries, setSavedQueries] = useState<Record<string, string>>({});
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
    setSearchQuery(query);
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const url = `http://localhost:3000/articles${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`;
        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const processedData = data.map((article: any) => {
          const formatDate = (dateString: string | { $date: string }) => {
            try {
              const dateValue = typeof dateString === 'string' ? dateString : dateString?.$date;
              return new Date(dateValue).getFullYear().toString();
            } catch {
              return 'N/A';
            }
          };

          const authorDisplay = Array.isArray(article.author) && article.author.length > 0
            ? article.author.join(', ')
            : article.author || 'Anonymous';

          const claimArray = typeof article.claim === 'string'
            ? article.claim.split(',').map((id: string) => id.trim())
            : Array.isArray(article.claim) ? article.claim : [];

          const practiceArray = Array.isArray(article.practice)
            ? article.practice
            : (typeof article.practice === 'string' && article.practice !== 'N/A'
                ? article.practice.split(',').map(p => p.trim())
                : []);

          return {
            ...article,
            published_date: formatDate(article.published_date),
            updated_date: formatDate(article.updated_date),
            moderated_date: formatDate(article.moderated_date),
            author: authorDisplay,
            status: article.status || 'Pending',
            publisher: article.publisher || 'Unknown Publisher',
            rating: article.rating ?? 'Not rated',
            claim: claimArray.join(', '),
            practice: practiceArray,
          };
        });

        setArticles(processedData);
        setFetchError("");
      } catch (error) {
        console.error('Error fetching articles:', error);
        setFetchError("Failed to load articles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [searchQuery]);

  const toggleColumnVisibility = (column: string) => {
    setVisibleColumns(prev => {
      const newVisibility = {...prev, [column]: !prev[column]};
      localStorage.setItem('columnVisibility', JSON.stringify(newVisibility));
      return newVisibility;
    });
  };

  const statusOptions = Array.from(
    new Set(articles.map(a => a.status).filter(s => s && s !== 'Unknown'))
  );

  const practiceOptions = Array.from(
    new Set(articles.flatMap(a => a.practice || []).filter(p => p && p !== 'N/A'))
  );

  const claimOptions = useMemo(() => {
    if (selectedPractice === "All") return [];
    const claimSet = new Set<string>();
    articles.forEach(a => {
      if (a.practice?.includes(selectedPractice) && a.claim) {
        a.claim.split(',').forEach(c => claimSet.add(c.trim()));
      }
    });
    return Array.from(claimSet);
  }, [articles, selectedPractice]);

  const validateYears = (start: string, end: string) => {
    const s = parseInt(start), e = parseInt(end);
    if (start && end && s > e) {
      setErrorMessage("End year cannot be earlier than start year");
      return false;
    }
    if ((start && s < 1900) || (end && e > new Date().getFullYear())) {
      setErrorMessage("Years must be between 1900 and the current year");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  useEffect(() => {
    if (startYear || endYear) validateYears(startYear, endYear);
  }, [startYear, endYear]);

  useEffect(() => setSelectedClaim("All"), [selectedPractice]);

  const filteredData = articles
    .filter(a => {
      const year = parseInt(a.published_date) || 0;
      return (
        (selectedStatus === "All" || a.status === selectedStatus) &&
        (selectedPractice === "All" || a.practice?.includes(selectedPractice)) &&
        (selectedClaim === "All" || a.claim?.split(',').map(c => c.trim()).includes(selectedClaim)) &&
        (!startYear || !endYear || (year >= parseInt(startYear) && year <= parseInt(endYear))) &&
        (
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (Array.isArray(a.author) ? a.author.join(", ") : a.author || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    })
    .sort((a, b) =>
      sortOrder === "asc"
        ? (parseInt(a.published_date) || 0) - (parseInt(b.published_date) || 0)
        : (parseInt(b.published_date) || 0) - (parseInt(a.published_date) || 0)
    );

  const headers = [
    { key: "title", label: "Title" },
    { key: "author", label: "Author" },
    { key: "published_date", label: "Year" },
    { key: "publisher", label: "Publisher" },
    { key: "status", label: "Status" },
    { key: "journal", label: "Journal" },
    { key: "rating", label: "Rating" },
    { key: "moderatedBy", label: "Moderated By" },
    { key: "practice", label: "Practice" },
    { key: "claim", label: "Claims" },
  ];

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
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
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded px-2 py-1 flex-1"
        />
      </div>

      {/* Filters and controls */}
      <div className="flex flex-wrap gap-4 mb-4">
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="border rounded px-2 py-1">
          <option value="All">All Statuses</option>
          {statusOptions.map((s, i) => <option key={i}>{s}</option>)}
        </select>

        <select value={selectedPractice} onChange={(e) => setSelectedPractice(e.target.value)} className="border rounded px-2 py-1">
          <option value="All">All Practices</option>
          {practiceOptions.map((p, i) => <option key={i}>{p}</option>)}
        </select>

        <select value={selectedClaim} onChange={(e) => setSelectedClaim(e.target.value)} disabled={selectedPractice === "All"} className="border rounded px-2 py-1">
          <option value="All">All Claims</option>
          {claimOptions.map((c, i) => <option key={i}>{c}</option>)}
        </select>

        <input type="number" placeholder="Start Year" value={startYear} onChange={(e) => setStartYear(e.target.value)} className="border rounded px-2 py-1 w-24" />
        <input type="number" placeholder="End Year" value={endYear} onChange={(e) => setEndYear(e.target.value)} className="border rounded px-2 py-1 w-24" />

        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")} className="border rounded px-2 py-1">
          <option value="asc">Oldest First</option>
          <option value="desc">Newest First</option>
        </select>

        <ColumnSelector
          headers={headers}
          visibleColumns={visibleColumns}
          onToggle={toggleColumnVisibility}
        />
      </div>

      {errorMessage && <p className="text-red-600">{errorMessage}</p>}
      {filteredData.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <SortableTable
          headers={headers}
          data={filteredData.map(a => ({ ...a, practice: a.practice?.join(", ") || "N/A" }))}
          visibleColumns={visibleColumns}
        />
      )}

      {showSavePrompt && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">Save Search</h2>
            <input
              type="text"
              placeholder="Search name"
              value={newQueryName}
              onChange={(e) => setNewQueryName(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowSavePrompt(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
              <button onClick={confirmSaveQuery} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
