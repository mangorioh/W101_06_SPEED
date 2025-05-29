"use client";

import { useEffect, useState } from "react";

interface Article {
  _id: string;
  title: string;
  author: string | string[];
  published_date: string;
  updated_date?: string;
  description?: string;
  publisher?: string;
  journal?: string;
}

// Hash function to deterministically select an article based on date
function hashStringToIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
}

export default function HomePage() {
  const [randomArticle, setRandomArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Format utility
  const formatDate = (dateString: string | { $date: string }): string => {
    try {
      const rawDate =
        typeof dateString === "string" ? dateString : dateString?.$date;
      return new Date(rawDate).getFullYear().toString();
    } catch {
      return "N/A";
    }
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/articles");
        const data: Article[] = await res.json();

        // Format each article
        const formatted = data.map((article) => ({
          ...article,
          author: Array.isArray(article.author)
            ? article.author.join(", ")
            : article.author || "Anonymous",
          published_date: formatDate(article.published_date),
          updated_date: article.updated_date
            ? formatDate(article.updated_date)
            : undefined,
        }));

        setArticles(formatted);

        if (formatted.length > 0) {
          const today = new Date().toISOString().split("T")[0];
          const index = hashStringToIndex(today, formatted.length);
          setRandomArticle(formatted[index]);
        }
      } catch (err: any) {
        console.error("Failed to load articles:", err);
        setError("Failed to fetch articles");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading)
    return <div className="container">Loading random article...</div>;
  if (error) return <div className="container error-message">{error}</div>;
  if (!randomArticle)
    return <div className="container">No article to display</div>;

  return (
    <div className="container">
      <div className="text-center mb-8 pt-8 max-w-4xl mx-auto">
        <p className="text-3xl font-bold">
          Welcome to the Software Practice Empirical Evidence Database
        </p>
        <p className="text-lg text-gray-700">
          Your number one source for evaluating SE practices
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Covering {articles.length} articles
        </p>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">Featured Article</h1>
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {randomArticle.title}
        </h2>
        <p className="text-sm text-gray-600 mb-1">
          <strong>Author:</strong> {randomArticle.author}
        </p>
        <p className="text-sm text-gray-600 mb-1">
          <strong>Published:</strong> {randomArticle.published_date}
        </p>
        {randomArticle.publisher && (
          <p className="text-sm text-gray-600 mb-1">
            <strong>Publisher:</strong> {randomArticle.publisher}
          </p>
        )}
        {randomArticle.journal && (
          <p className="text-sm text-gray-600 mb-1">
            <strong>Journal:</strong> {randomArticle.journal}
          </p>
        )}
        {randomArticle.description && (
          <p className="text-sm text-gray-700 mt-4">
            {randomArticle.description}
          </p>
        )}
      </div>

      <div className="text-center py-14">
        <a
          href="/articles"
          className="inline-block min-w-[300px] mt-6 px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold transition duration-200"
        >
          Start Browsing
        </a>
      </div>

      <hr className="my-8 border-t border-gray-300" />

      <div className="container mx-auto px-4">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Latest Articles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles
            .sort((a, b) => {
              const dateA = new Date(
                a.updated_date ?? a.published_date
              ).getTime();
              const dateB = new Date(
                b.updated_date ?? b.published_date
              ).getTime();
              return dateB - dateA;
            })
            .slice(0, 9)
            .map((article) => (
              <div
                key={article._id}
                className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 hover:shadow-md transition"
              >
                <h3 className="text-lg font-bold mb-1">{article.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  By {article.author} • {article.published_date}
                </p>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {article.description || "No description available."}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
