"use client";

import { useState, useEffect, useMemo, ChangeEvent } from "react";
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
  ratingSum?: number;
  ratingCount?: number;
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
  rating_ui: true,
  moderatedBy: true,
  practice: true,
  claim: true,
};

export default function ArticlesPage() {
  const [articlesRaw, setArticlesRaw] = useState<ArticlesInterface[]>([]);
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
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("columnVisibility");
        return saved ? JSON.parse(saved) : defaultVisibleColumns;
      }
      return defaultVisibleColumns;
    }
  );

  // Rating summary and user rating state
  const [ratingSummaries, setRatingSummaries] = useState<
    Record<string, { averageRating: number; ratingCount: number }>
  >({});
  const [userRatings, setUserRatings] = useState<Record<string, number | null>>(
    {}
  );

  const getJwt = () => {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
  };

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const url =
          `${process.env.NEXT_PUBLIC_SITE_URL}/articles` +
          (searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : "");
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${getJwt() ?? ""}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
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

          const claimArray =
            typeof article.claim === "string"
              ? article.claim.split(",").map((id: string) => id.trim())
              : Array.isArray(article.claim)
              ? article.claim
              : [];

          interface PracticeArray extends Array<string> {}

          const practiceArray: PracticeArray = Array.isArray(article.practice)
            ? article.practice
            : typeof article.practice === "string" && article.practice !== "N/A"
            ? article.practice.split(",").map((p: string) => p.trim())
            : [];

          return {
            ...article,
            published_date: formatDate(article.published_date),
            updated_date: formatDate(article.updated_date),
            moderated_date: formatDate(article.moderated_date),
            author: authorDisplay,
            status: article.status || "Pending",
            publisher: article.publisher || "Unknown Publisher",
            claim: claimArray.join(", "),
            practice: practiceArray,
          };
        });

        setArticlesRaw(processedData);
        setFetchError("");
      } catch (error) {
        console.error("Error fetching articles:", error);
        setFetchError("Failed to load articles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [searchQuery]);

  // Fetch ratings for all articles
  useEffect(() => {
    if (loading || articlesRaw.length === 0) return;

    const fetchRatingsForAll = async () => {
      const jwt = getJwt() ?? "";
      const newSummaries: Record<
        string,
        { averageRating: number; ratingCount: number }
      > = {};
      const newUserRatings: Record<string, number | null> = {};

      await Promise.all(
        articlesRaw.map(async (article) => {
          const aId = article._id;
          try {
            // Summary
            const summaryResp = await fetch(
              `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${aId}/rating/summary`,
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
              newSummaries[aId] = { averageRating: 0, ratingCount: 0 };
            }
          } catch (e) {
            newSummaries[aId] = { averageRating: 0, ratingCount: 0 };
          }

          try {
            // User's own rating
            const userRatingResp = await fetch(
              `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${aId}/rating`,
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
            newUserRatings[aId] = null;
          }
        })
      );

      setRatingSummaries(newSummaries);
      setUserRatings(newUserRatings);
    };

    fetchRatingsForAll();
  }, [loading, articlesRaw]);

  // Handle rating change
  const handleRatingChange = async (articleId: string, newValue: number) => {
    const jwt = getJwt() ?? "";
    try {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${articleId}/rating`,
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

  // Column visibility toggle
  const toggleColumnVisibility = (column: string) => {
    setVisibleColumns((prev) => {
      const newVisibility = { ...prev, [column]: !prev[column] };
      localStorage.setItem("columnVisibility", JSON.stringify(newVisibility));
      return newVisibility;
    });
  };

  // Filter options
  const statusOptions = Array.from(
    new Set(
      articlesRaw
        .map((article) => article.status)
        .filter((status) => status && status !== "Unknown")
    )
  );

  const practiceOptions = Array.from(
    new Set(
      articlesRaw
        .flatMap((article) => article.practice || [])
        .filter((practice) => practice && practice !== "N/A")
    )
  );

  const claimOptions = useMemo(() => {
    if (selectedPractice === "All") {
      return [];
    }
    const practiceClaims = new Set<string>();
    articlesRaw.forEach((article) => {
      if (
        article.practice &&
        article.practice.includes(selectedPractice) &&
        article.claim
      ) {
        article.claim.split(",").forEach((claim) => {
          practiceClaims.add(claim.trim());
        });
      }
    });
    return Array.from(practiceClaims).filter((c) => c.length > 0);
  }, [articlesRaw, selectedPractice]);

  // Year validation
  const validateYears = (start: string, end: string): boolean => {
    const startNum = parseInt(start);
    const endNum = parseInt(end);

    if (start && end && startNum > endNum) {
      setErrorMessage("End year cannot be earlier than start year");
      return false;
    }
    if (
      (start && startNum < 1900) ||
      (end && endNum > new Date().getFullYear())
    ) {
      setErrorMessage("Years must be between 1900 and current year");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  useEffect(() => {
    if (startYear || endYear) {
      validateYears(startYear, endYear);
    } else {
      setErrorMessage("");
    }
  }, [startYear, endYear]);

  useEffect(() => {
    setSelectedClaim("All");
  }, [selectedPractice]);

  // Filtering and sorting
  const filteredData = articlesRaw
    .filter((article) => {
      const matchesStatus =
        selectedStatus === "All" || article.status === selectedStatus;
      const matchesPractice =
        selectedPractice === "All" ||
        (article.practice && article.practice.includes(selectedPractice));
      const matchesClaim =
        selectedClaim === "All" ||
        (article.claim &&
          article.claim
            .split(",")
            .map((c) => c.trim())
            .includes(selectedClaim));
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

      return (
        matchesStatus &&
        matchesPractice &&
        matchesClaim &&
        matchesYear &&
        matchesSearch
      );
    })
    .sort((a, b) =>
      sortOrder === "asc"
        ? (parseInt(a.published_date) || 0) - (parseInt(b.published_date) || 0)
        : (parseInt(b.published_date) || 0) - (parseInt(a.published_date) || 0)
    );

  // Table headers
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
          {statusOptions.map((status, index) => (
            <option key={`status-${index}`} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={selectedPractice}
          onChange={(e) => setSelectedPractice(e.target.value)}
          className="px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          <option value="All">All Practices</option>
          {practiceOptions.map((practice, index) => (
            <option key={`practice-${index}`} value={practice}>
              {practice}
            </option>
          ))}
        </select>

        <select
          value={selectedClaim}
          onChange={(e) => setSelectedClaim(e.target.value)}
          disabled={selectedPractice === "All" || claimOptions.length === 0}
          className="px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          <option value="All">
            {selectedPractice === "All"
              ? "Select a practice first"
              : claimOptions.length === 0
              ? "No claims for this practice"
              : "All Claims"}
          </option>
          {claimOptions.map((claim, index) => (
            <option key={`claim-${index}`} value={claim}>
              {claim}
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

        <ColumnSelector
          headers={headers}
          visibleColumns={visibleColumns}
          onToggle={toggleColumnVisibility}
        />
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
            practice: article.practice?.join(", ") || "N/A",
            rating_ui: (
              <div>
                {/* Dropdown for selecting 1–5 stars */}
                <select
                  value={userRatings[article._id] ?? ""}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    const val =
                      e.target.value === "" ? null : Number(e.target.value);
                    if (val !== null) {
                      handleRatingChange(article._id, val);
                    }
                  }}
                >
                  <option value="">Your Rating</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
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
