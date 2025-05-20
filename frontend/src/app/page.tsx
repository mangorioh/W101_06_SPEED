// Kirby Pascua | 22172362

// Added search query

"use client";

import { useState } from "react";
import SortableTable from "@/components/Table/SortableTable";
import data from "../utils/dummydata";

interface ArticlesInterface {
  id: string;
  title: string;
  authors: string;
  source: string;
  pubyear: string;
  doi: string;
  claim: string;
  evidence: string;
  practice: string;
}

export default function ArticlesPage() {
  const [selectedPractice, setSelectedPractice] = useState<string>("All");
  const [startYear, setStartYear] = useState<string>("");
  const [endYear, setEndYear] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const practices = Array.from(new Set(data.map(article => article.practice)));

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

  const filteredData = data
    .filter(article => {
      const matchesPractice = selectedPractice === "All" || article.practice === selectedPractice;
      const pubYear = parseInt(article.pubyear);
      
      let matchesYear = true;
      if (startYear && endYear) {
        matchesYear = pubYear >= parseInt(startYear) && pubYear <= parseInt(endYear);
      }

      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.evidence.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesPractice && matchesYear && matchesSearch;
    })
    .sort((a, b) => sortOrder === "asc" 
      ? parseInt(a.pubyear) - parseInt(b.pubyear)
      : parseInt(b.pubyear) - parseInt(a.pubyear)
    );

  const headers = [
    { key: "title", label: "Title" },
    { key: "authors", label: "Authors" },
    { key: "source", label: "Source" },
    { key: "pubyear", label: "Publication Year" },
    { key: "doi", label: "DOI" },
    { key: "claim", label: "Claim" },
    { key: "evidence", label: "Evidence" },
    { key: "practice", label: "SE Practice" }
  ];

  return (
    <div className="container">
      <div className="filters">
        {}
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        {}
        <select 
          value={selectedPractice} 
          onChange={(e) => setSelectedPractice(e.target.value)}
        >
          <option value="All">All Practices</option>
          {practices.map(practice => (
            <option key={practice} value={practice}>{practice}</option>
          ))}
        </select>

        {
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

        {}
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

      <SortableTable headers={headers} data={filteredData} />
    </div>
  );
}
