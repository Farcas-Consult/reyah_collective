'use client';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  showNumber?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ 
  rating, 
  maxRating = 5, 
  showNumber = true,
  size = 'md'
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= maxRating; i++) {
      if (i <= fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400">★</span>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-400">⯨</span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300">☆</span>
        );
      }
    }
    return stars;
  };

  return (
    <div className={`flex items-center gap-1 ${sizeClasses[size]}`}>
      <div className="flex">{renderStars()}</div>
      {showNumber && (
        <span className="text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
