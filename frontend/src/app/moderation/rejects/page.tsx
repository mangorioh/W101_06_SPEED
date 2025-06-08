"use client";

import { useEffect, useState } from "react";

interface Article {
  _id: string;
  title: string;
  author: string;
  journal: string;
  published_date: Date;
  volume: number;
  number: number;
  pages: number;
  DOI: string;
  moderatedBy: string;
}

const RejectArticlePage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/moderation/rejects`
        );
        const data = await res.json();
        console.log("Fetched articles:", data);
        setArticles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching articles:", error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Viewing Rejection Log...</h1>
      {loading ? (
        <p>Loading articles...</p>
      ) : (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {articles.length === 0 ? (
            <p>No articles to review.</p>
          ) : (
            articles.map((article) => (
              <div
                key={article._id}
                className="border rounded p-4 shadow-sm bg-white"
              >
                <h2 className="text-xl font-semibold">{article.title}</h2>
                <p className="text-gray-700 mb-2">{article.author}</p>
                <p className="text-sm text-gray-500">
                  Submitted by: {article.journal}
                </p>
                <p className="text-sm text-gray-500">
                  Rejected by moderator: {article.moderatedBy}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RejectArticlePage;
