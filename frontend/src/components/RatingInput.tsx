import React, { useState, useEffect } from 'react';

interface RatingInputProps {
  articleId: string;
  initialUserRating: number | null;     // e.g. 3 if user has rated 3/5, or null if none
  initialSummary: { average: number; count: number } | null;
  token: string | null;
  onRatingUpdated?: () => void;         // callback to re-fetch summary + user rating
}

const MAX_STARS = 5;

const RatingInput: React.FC<RatingInputProps> = ({
  articleId,
  initialUserRating,
  initialSummary,
  token,
  onRatingUpdated,
}) => {
  const [userRating, setUserRating] = useState<number | null>(initialUserRating);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [summary, setSummary] = useState<{ average: number; count: number } | null>(initialSummary);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper: render ★ for filled, ☆ for empty
  const renderStar = (index: number) => {
    const filled = (hoveredStar ?? userRating ?? 0) >= index + 1;
    return filled ? '★' : '☆';
  };

  // Whenever initial props change (e.g. parent re-fetch), update local
  useEffect(() => {
    setUserRating(initialUserRating);
    setSummary(initialSummary);
  }, [initialUserRating, initialSummary]);

  const handleClick = async (newRating: number) => {
    if (!token) {
      setError('You must be logged in to rate.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/articles/${articleId}/rating`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: newRating }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      // Optimistically update userRating
      setUserRating(newRating);

      // Now re-fetch the summary and user‐rating to reflect any changes on the server.
      if (onRatingUpdated) {
        onRatingUpdated();
      }
    } catch (err: any) {
      console.error('Failed to update rating:', err);
      setError('Failed to update rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render:
  return (
    <div className="rating-input">
      <div className="stars" style={{ cursor: token ? 'pointer' : 'not-allowed' }}>
        {Array.from({ length: MAX_STARS }).map((_, idx) => (
          <span
            key={idx}
            onMouseEnter={() => token && setHoveredStar(idx + 1)}
            onMouseLeave={() => token && setHoveredStar(null)}
            onClick={() => token && handleClick(idx + 1)}
            style={{ fontSize: '1.2rem', marginRight: '2px' }}
          >
            {renderStar(idx)}
          </span>
        ))}
      </div>
      {loading && <div style={{ fontSize: '0.8rem' }}>Saving...</div>}
      {error && <div className="error-message" style={{ fontSize: '0.8rem', color: 'red' }}>{error}</div>}
      {summary && (
        <div style={{ fontSize: '0.8rem', color: '#555' }}>
          {summary.average.toFixed(1)} / {MAX_STARS} ({summary.count} vote{summary.count !== 1 ? 's' : ''})
        </div>
      )}
    </div>
  );
};

export default RatingInput;