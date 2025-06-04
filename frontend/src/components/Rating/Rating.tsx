interface RatingProps {
  articleId: string;
  userRating: number | null;
  ratingSummary?: {
    averageRating: number;
    ratingCount: number;
  };
  onRatingChange: (articleId: string, value: number) => void;
}

export const Rating = ({
  articleId,
  userRating,
  ratingSummary,
  onRatingChange,
}: RatingProps) => {
  return (
    <div className="flex items-center space-x-4">
      <select
        value={userRating || ""}
        onChange={(e) => {
          const val = e.target.value ? Number(e.target.value) : null;
          if (val !== null) onRatingChange(articleId, val);
        }}
        className="border rounded px-2 py-1"
      >
        <option value="">Rate this article</option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <span>
        {ratingSummary
          ? `${ratingSummary.averageRating.toFixed(1)} (${
              ratingSummary.ratingCount
            } vote${ratingSummary.ratingCount === 1 ? "" : "s"})`
          : "No ratings"}
      </span>
    </div>
  );
};
