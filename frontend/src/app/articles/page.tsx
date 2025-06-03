// Kirby Pascua | 22172362
// mongodb connection articles
"use client";

import { useState, useEffect } from "react";
import SortableTable from "@/components/Table/SortableTable";

// need to redo with proper fields later 

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
  rating?: number;
  reason_for_decision?: string;
  volume?: string;
  number?: number;
  journal?: string;
  updated_date?: string;
  moderated_date?: string;
}
export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticlesInterface[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [startYear, setStartYear] = useState<string>("");
  const [endYear, setEndYear] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

useEffect(() => {
  const fetchArticles = async () => {
    try {
      const url = `http://localhost:3000/articles${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`;
      console.log('Fetching from:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);

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

  return {
    ...article,
    published_date: formatDate(article.published_date),
    updated_date: formatDate(article.updated_date),
    moderated_date: formatDate(article.moderated_date),
    author: authorDisplay,
    status: article.status || 'Pending',
    publisher: article.publisher || 'Unknown Publisher',
    rating: article.rating ?? 'Not rated'
  };
});
      
      setArticles(processedData);
      setFetchError("");
    } catch (error) {
      console.error('Full error details:', error);
      setFetchError("Failed to load articles. Please try again later.");
    } finally {
      setLoading(false); 
    }
  };
  fetchArticles();
}, [searchQuery]);

const statusOptions = Array.from(
  new Set(
    articles
      .map(article => article.status)
      .filter(status => status && status !== 'Unknown')
  )
);

  const validateYears = (start: string, end: string): boolean => {
    const startNum = parseInt(start);
    const endNum = parseInt(end);
    
    if (start && end && startNum > endNum) {
      setErrorMessage("End year cannot be earlier than start year");
      return false;
    }
    
    if (startNum < 1900 || endNum > new Date().getFullYear()) {
      setErrorMessage("Years must be between 1900 and current year");
      return false;
    }
    
    setErrorMessage("");
    return true;
  };

const filteredData = articles
  .filter(article => {
    const matchesStatus = selectedStatus === "All" || article.status === selectedStatus;
    const pubYear = article.published_date ? parseInt(article.published_date) : 0;
    
    let matchesYear = true;
    if (startYear && endYear) {
      matchesYear = pubYear >= parseInt(startYear) && pubYear <= parseInt(endYear);
    }

    const authorString = Array.isArray(article.author) 
      ? article.author.join(", ") 
      : article.author || "Unknown Author";
      
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      authorString.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.description && article.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesYear && matchesSearch;
  })
  .sort((a, b) => sortOrder === "asc" 
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
  { key: "moderatedBy", label: "Moderated By" }
];

  if (loading) {
    return <div className="container">Loading articles...</div>;
  }

  if (fetchError) {
    return <div className="container error-message">{fetchError}</div>;
  }

  return (
    <div className="container">
      <div className="filters">
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <select 
          value={selectedStatus} 
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          {statusOptions.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <div className="year-inputs">
          <input
            type="number"
            placeholder="Start year"
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            min="1900"
            max={new Date().getFullYear()}
          />
          <input
            type="number"
            placeholder="End year"
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
        >
          <option value="asc">Oldest First</option>
          <option value="desc">Newest First</option>
        </select>
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}
      
      {filteredData.length === 0 && searchQuery && (
        <div className="no-results">No articles found matching "{searchQuery}"</div>
      )}

      {filteredData.length === 0 && !searchQuery && (
        <div className="no-results">No articles found</div>
      )}

      {filteredData.length > 0 && (
        <SortableTable headers={headers} data={filteredData} />
      )}
    </div>
  );
}
