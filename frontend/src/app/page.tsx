// Kirby Pascua | 22172362
// Added "Practice" field for ids. filtering/sorting logic implemented

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
  const [selectedYearRange, setSelectedYearRange] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const articles = data.map(article => ({
    ...article,
    id: article.id || article._id
  }));
  const practices = Array.from(new Set(articles.map(article => article.practice)));

  // Filter and sort logic
  const filteredData = articles
    .filter(article => {
      const matchesPractice = selectedPractice === "All" || article.practice === selectedPractice;
      const pubYear = parseInt(article.pubyear);
      
      let matchesYear = true;
      if (selectedYearRange === "2015-2020") {
        matchesYear = pubYear >= 2015 && pubYear <= 2020;
      } else if (selectedYearRange === "2010-2014") {
        matchesYear = pubYear >= 2010 && pubYear <= 2014;
      } else if (selectedYearRange === "2005-2009") {
        matchesYear = pubYear >= 2005 && pubYear <= 2009;
      }
      
      return matchesPractice && matchesYear;
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
        <select 
          value={selectedPractice} 
          onChange={(e) => setSelectedPractice(e.target.value)}
        >
          <option value="All">All Practices</option>
          {practices.map(practice => (
            <option key={practice} value={practice}>{practice}</option>
          ))}
        </select>

        <select
          value={selectedYearRange}
          onChange={(e) => setSelectedYearRange(e.target.value)}
        >
          {["All", "2015-2020", "2010-2014", "2005-2009"].map(range => (
            <option key={range} value={range}>{range}</option>
          ))}
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
        >
          <option value="asc">Oldest First</option>
          <option value="desc">Newest First</option>
        </select>
      </div>

      <SortableTable headers={headers} data={filteredData} />
    </div>
  );
}
