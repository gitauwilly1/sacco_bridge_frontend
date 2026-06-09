import { Star } from 'lucide-react';

export default function TrustScoreBadge({ score, size = 'sm', showLabel = true }) {
  const numericScore = parseFloat(score || 0);
  const filledStars = Math.round(numericScore);

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
  };

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  return (
    <div className={`inline-flex items-center ${sizeClasses[size]}`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSizes[size]} ${
              star <= filledStars
                ? 'text-alert-500 fill-alert-500'
                : 'text-slate-300'
            }`}
          />
        ))}
      </div>
      {showLabel && (
        <span className="font-medium text-slate-600">
          {numericScore.toFixed(1)}
        </span>
      )}
    </div>
  );
}