"use client";

import { useState } from "react";
import { useTableColumns } from "@/hooks/useTableColumns";
import { SearchBar } from "@/components/Search/SearchBar";
import { Filters } from "@/components/Filters/Filters";
import { Rating } from "@/components/Rating/Rating";
import SortableTable from "@/components/Table/SortableTable";
import { useArticles } from "@/hooks/useArticles";
import { useFilters } from "@/hooks/useFilters";
import { useRatings } from "@/hooks/useRatings";
import { usePracticesAndClaims } from "@/hooks/usePracticesAndClaims";

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
  claim: true,
};

const headers = [
  { key: "title", label: "Title" },
  { key: "author", label: "Author" },
  { key: "published_date", label: "Year" },
  { key: "publisher", label: "Publisher" },
  { key: "status", label: "Status" },
  { key: "journal", label: "Journal" },
  { key: "rating_ui", label: "Rating" },
  { key: "moderatedBy", label: "Moderated By" },
  { key: "practice", label: "Practice" },
  { key: "claim", label: "Claims" },
];

export default function ArticlesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { articles, loading, error: fetchError } = useArticles(searchQuery);
  const { visibleColumns, toggleColumnVisibility } = useTableColumns(
    defaultVisibleColumns
  );
  const { ratingSummaries, userRatings, handleRatingChange } = useRatings(
    articles.map((article) => article._id)
  );

  const {
    practices,
    claims,
    loading: metadataLoading,
  } = usePracticesAndClaims();

  const { filters, options, errorMessage, filteredArticles } = useFilters({
    articles,
    practices,
    claims,
  });

  if (loading || metadataLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 text-lg">{fetchError}</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <Filters
        filters={filters}
        options={options}
        errorMessage={errorMessage}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumnVisibility}
        headers={headers}
      />

      {filteredArticles.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <SortableTable
          headers={headers}
          data={filteredArticles.map((article) => ({
            ...article,
            practice: Array.isArray(article.practice)
              ? article.practice.join(", ")
              : "N/A",
            claim: Array.isArray(article.claim)
              ? article.claim.join(", ")
              : "N/A",
            rating_ui: (
              <Rating
                articleId={article._id}
                userRating={userRatings[article._id]}
                ratingSummary={ratingSummaries[article._id]}
                onRatingChange={handleRatingChange}
              />
            ),
          }))}
          visibleColumns={visibleColumns}
        />
      )}
    </div>
  );
}
