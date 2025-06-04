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
  status: string;
  submitter: string;
}

const UserSubmissionsPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      alert("You must be logged in to view your submissions.");
      window.location.href = "/user/login";
      return;
    }

    // Fetch user profile to get username
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          alert("Session expired or unauthorized.");
          window.location.href = "/user/login";
          return;
        }
        const data = await res.json();
        setUsername(data.username);
      })
      .catch(() => {
        alert("Failed to fetch profile.");
        window.location.href = "/user/login";
      });
  }, []);

  useEffect(() => {
    if (!username) return;

    const fetchArticles = async () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        alert("You must be logged in to view your submissions.");
        window.location.href = "/user/login";
        return;
      }
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_SITE_URL
          }/moderation/by-submitter/${encodeURIComponent(username)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setArticles(Array.isArray(data) ? data : []);
      } catch (error) {
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [username]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Pending Submissions</h1>
      {loading ? (
        <p>Loading articles...</p>
      ) : (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {articles.length === 0 ? (
            <p>No pending articles found.</p>
          ) : (
            articles.map((article) => (
              <div
                key={article._id}
                className="border rounded p-4 shadow-sm bg-white"
              >
                <h2 className="text-xl font-semibold">{article.title}</h2>
                <p className="text-gray-700 mb-2">
                  {Array.isArray(article.author)
                    ? article.author.join(", ")
                    : article.author}
                </p>
                <p className="text-sm text-gray-500">
                  Submitted by: {article.submitter}
                </p>
                <p className="text-sm text-gray-500">
                  Status:{" "}
                  <span className="font-semibold">{article.status}</span>
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserSubmissionsPage;
