"use client";

import { useEffect, useState } from "react";

interface Article {
  _id: string;
  title: string;
  summary: string;
  submitter: string;
  status: string;
  rejectionReason?: string;
}

const ModerateArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");

  const fetchArticles = async () => {
    const res = await fetch("http://localhost:3000/articles");
    const data = await res.json();
    const pending = data.filter(
      (article: Article) => article.status === "pending"
    );
    setArticles(pending);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    await fetch(`http://localhost:3000/articles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    });
    setLoadingId(null);
    fetchArticles();
  };

  const handleRejectSubmit = async (id: string) => {
    if (!rejectReason.trim()) return;

    setLoadingId(id);

    await fetch(`http://localhost:3000/moderation/${id}/reject`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rejectionReason: rejectReason,
        moderator: "Test - He Who Moderates",
      }),
    });

    setLoadingId(null);
    setRejectingId(null);
    setRejectReason("");
    fetchArticles(); // Refresh list
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Moderate Articles</h1>

      {articles.length === 0 ? (
        <p className="text-gray-600">No articles pending moderation.</p>
      ) : (
        articles.map((article) => (
          <div
            key={article._id}
            className="border rounded-lg p-4 mb-4 shadow-sm bg-white"
          >
            <h2 className="text-xl font-semibold">{article.title}</h2>
            <p className="text-gray-700 mt-2">{article.summary}</p>
            <p className="text-sm text-gray-500 mt-1">
              Submitted by: {article.submitter}
            </p>

            <div className="flex gap-4 mt-4">
              <button
                onClick={() => handleApprove(article._id)}
                disabled={loadingId === article._id}
              >
                {loadingId === article._id ? "Approving..." : "Approve"}
              </button>
              <button
                onClick={() =>
                  setRejectingId(
                    rejectingId === article._id ? null : article._id
                  )
                }
                disabled={loadingId === article._id}
              >
                {loadingId === article._id ? "Processing..." : "Reject"}
              </button>
            </div>

            {/* Reject form */}
            {rejectingId === article._id && (
              <div className="mt-4">
                <textarea
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Enter rejection reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <button onClick={() => handleRejectSubmit(article._id)}>
                    Submit Rejection
                  </button>
                  <button
                    onClick={() => {
                      setRejectingId(null);
                      setRejectReason("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ModerateArticlesPage;
