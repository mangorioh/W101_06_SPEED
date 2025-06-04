"use client";

import { useState, useEffect, ChangeEvent } from "react";
import SortableTable from "@/components/Table/SortableTable";

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
  ratingSum?: number;
  ratingCount?: number;
  reason_for_decision?: string;
  volume?: string;
  number?: number;
  journal?: string;
  updated_date?: string;
  moderated_date?: string;
}

export default function ArticlesPage() {
  const [articlesRaw, setArticlesRaw] = useState<ArticlesInterface[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [startYear, setStartYear] = useState<string>("");
  const [endYear, setEndYear] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string>("");

  // NEW STATE: store per-article rating summary (avg + count)
  const [ratingSummaries, setRatingSummaries] = useState<
    Record<string, { averageRating: number; ratingCount: number }>
  >({});

  // NEW STATE: store the current user's own rating (1–5 or null) for each article
  const [userRatings, setUserRatings] = useState<Record<string, number | null>>(
    {}
  );

  const getJwt = () => {
    return localStorage.getItem("token");
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const url =
          "http://localhost:3000/articles" +
          (searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : "");
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${getJwt() ?? ""}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const processedData = data.map((article: any) => {
          const formatDate = (dateString: string | { $date: string }) => {
            try {
              const dateValue =
                typeof dateString === "string" ? dateString : dateString?.$date;
              return new Date(dateValue).getFullYear().toString();
            } catch {
              return "N/A";
            }
          };

          const authorDisplay =
            Array.isArray(article.author) && article.author.length > 0
              ? article.author.join(", ")
              : article.author || "Anonymous";

          return {
            ...article,
            published_date: formatDate(article.published_date),
            updated_date: formatDate(article.updated_date),
            moderated_date: formatDate(article.moderated_date),
            author: authorDisplay,
            status: article.status || "Pending",
            publisher: article.publisher || "Unknown Publisher",
            // We no longer set `rating: article.rating ?? "Not rated"`,
            // because we will fetch the summary + user rating separately.
            // Optionally, you could calculate `article.rating = ratingSum / ratingCount` here if available.
          } as ArticlesInterface;
        });

        setArticlesRaw(processedData);
        setFetchError("");
      } catch (error) {
        console.error("Full error details:", error);
        setFetchError("Failed to load articles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [searchQuery]);

  // Whenever the raw list of articles changes, we want to make two extra calls per article:
  // 1) GET /articles/:articleId/rating/summary
  // 2) GET /articles/:articleId/rating
  useEffect(() => {
    // If there are no articles or we’re still loading, skip.
    if (loading || articlesRaw.length === 0) return;

    const fetchRatingsForAll = async () => {
      const jwt = getJwt() ?? "";
      // We’ll build new copies of these two maps, then setState once.
      const newSummaries: Record<
        string,
        { averageRating: number; ratingCount: number }
      > = {};
      const newUserRatings: Record<string, number | null> = {};

      // We can do them in parallel:
      await Promise.all(
        articlesRaw.map(async (article) => {
          const aId = article._id;
          try {
            // 1) Summary
            const summaryResp = await fetch(
              `http://localhost:3000/articles/${aId}/rating/summary`,
              {
                headers: {
                  Authorization: `Bearer ${jwt}`,
                },
              }
            );
            if (summaryResp.ok) {
              const summaryJson = await summaryResp.json();
              newSummaries[aId] = {
                averageRating: summaryJson.averageRating,
                ratingCount: summaryJson.ratingCount,
              };
            } else {
              // If article not found or no ratings yet, default to 0
              newSummaries[aId] = { averageRating: 0, ratingCount: 0 };
            }
          } catch (e) {
            console.error(`Error fetching summary for ${aId}:`, e);
            newSummaries[aId] = { averageRating: 0, ratingCount: 0 };
          }

          try {
            // 2) Current user's own rating
            const userRatingResp = await fetch(
              `http://localhost:3000/articles/${aId}/rating`,
              {
                headers: {
                  Authorization: `Bearer ${jwt}`,
                },
              }
            );
            if (userRatingResp.ok) {
              if (userRatingResp.status === 204) {
                newUserRatings[aId] = null;
              } else {
                const text = await userRatingResp.text();
                if (!text) {
                  newUserRatings[aId] = null;
                } else {
                  const val = JSON.parse(text);
                  newUserRatings[aId] = val === null ? null : Number(val);
                }
              }
            } else {
              newUserRatings[aId] = null;
            }
          } catch (e) {
            console.error(`Error fetching user rating for ${aId}:`, e);
            newUserRatings[aId] = null;
          }
        })
      );

      setRatingSummaries(newSummaries);
      setUserRatings(newUserRatings);
    };

    fetchRatingsForAll();
  }, [loading, articlesRaw]);

  // Helper to call the PUT endpoint when user changes rating
  const handleRatingChange = async (articleId: string, newValue: number) => {
    const jwt = getJwt() ?? "";
    try {
      const resp = await fetch(
        `http://localhost:3000/articles/${articleId}/rating`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({ value: newValue }),
        }
      );
      if (!resp.ok) {
        const txt = await resp.text();
        console.error("Failed to set rating:", txt);
        return;
      }
      const updated = await resp.json();
      // updated: { averageRating: number; ratingCount: number }
      // Patch our state so the UI immediately updates:
      setUserRatings((prev) => ({
        ...prev,
        [articleId]: newValue,
      }));
      setRatingSummaries((prev) => ({
        ...prev,
        [articleId]: {
          averageRating: updated.averageRating,
          ratingCount: updated.ratingCount,
        },
      }));
    } catch (e) {
      console.error("Error when submitting rating:", e);
    }
  };

  // Filter / sort logic exactly as before, except that now each article uses ratingSummaries + userRatings instead of article.rating
  const statusOptions = Array.from(
    new Set(
      articlesRaw
        .map((article) => article.status)
        .filter((s) => s && s !== "Unknown")
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

  const filteredData = articlesRaw
    .filter((article) => {
      const matchesStatus =
        selectedStatus === "All" || article.status === selectedStatus;
      const pubYear = article.published_date
        ? parseInt(article.published_date)
        : 0;

      let matchesYear = true;
      if (startYear && endYear) {
        matchesYear =
          pubYear >= parseInt(startYear) && pubYear <= parseInt(endYear);
      }

      const authorString = Array.isArray(article.author)
        ? article.author.join(", ")
        : article.author || "Unknown Author";

      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        authorString.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.description &&
          article.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesYear && matchesSearch;
    })
    .sort((a, b) =>
      sortOrder === "asc"
        ? (parseInt(a.published_date) || 0) - (parseInt(b.published_date) || 0)
        : (parseInt(b.published_date) || 0) - (parseInt(a.published_date) || 0)
    );

  // Extend the headers to include a new “Rating” column
  const headers = [
    { key: "title", label: "Title" },
    { key: "author", label: "Author" },
    { key: "published_date", label: "Year" },
    { key: "publisher", label: "Publisher" },
    { key: "status", label: "Status" },
    { key: "journal", label: "Journal" },
    // <-- replaced the raw “rating” column with our custom rating UI below:
    { key: "rating_ui", label: "Rating" },
    { key: "moderatedBy", label: "Moderated By" },
  ];

  if (loading) {
    return <div className="container">Loading articles...</div>;
  }

  if (fetchError) {
    return <div className="container error-message">{fetchError}</div>;
  }

  return (
    <div className="container mx-auto">
      {/* Filters Section */}
      <div className="filters flex flex-wrap gap-4 items-end bg-slate-100 p-4 rounded-lg shadow mb-6">
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        />

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          <option value="All">All Statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <div className="year-inputs flex gap-2">
          <input
            type="number"
            placeholder="Start year"
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            min="1900"
            max={new Date().getFullYear()}
            className="px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white w-28"
          />
          <input
            type="number"
            placeholder="End year"
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
            min="1900"
            max={new Date().getFullYear()}
            className="px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white w-28"
          />
        </div>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          className="px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          <option value="asc">Oldest First</option>
          <option value="desc">Newest First</option>
        </select>
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {filteredData.length === 0 && searchQuery && (
        <div className="no-results">
          No articles found matching "{searchQuery}"
        </div>
      )}

      {filteredData.length === 0 && !searchQuery && (
        <div className="no-results">No articles found</div>
      )}

      {filteredData.length > 0 && (
        <SortableTable
          headers={headers}
          data={filteredData.map((article) => ({
            ...article,
            // We inject two extra fields so that SortableTable can render them:
            rating_ui: (
              <div>
                {/* Dropdown for selecting 1–5 stars */}
                <select
                  value={userRatings[article._id] ?? ""}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    // If user clears the select (""), do nothing
                    const val =
                      e.target.value === "" ? null : Number(e.target.value);
                    if (val !== null) {
                      handleRatingChange(article._id, val);
                    }
                  }}
                >
                  {/* If user has not rated yet, we show an empty option first */}
                  <option value="">Your Rating</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>

                {/* Display average + count below */}
                <div style={{ fontSize: "0.8em", marginTop: "4px" }}>
                  Avg:{" "}
                  {ratingSummaries[article._id]
                    ? ratingSummaries[article._id].averageRating.toFixed(1)
                    : "0.0"}{" "}
                  ({ratingSummaries[article._id]?.ratingCount ?? 0} vote
                  {(ratingSummaries[article._id]?.ratingCount ?? 0) === 1
                    ? ""
                    : "s"}
                  )
                </div>
              </div>
            ),
          }))}
        />
      )}
    </div>
  );
}
