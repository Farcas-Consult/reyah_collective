'use client';

import { Review } from '@/types/review';

interface ReviewDisplayProps {
  review: Review;
}

export default function ReviewDisplay({ review }: ReviewDisplayProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-yellow-400">
            {star <= rating ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="border-b pb-4 mb-4 last:border-b-0">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold">{review.buyerName}</p>
          <p className="text-sm text-gray-500">{formatDate(review.date)}</p>
        </div>
        {renderStars(review.rating)}
      </div>
      <p className="text-gray-700">{review.comment}</p>
    </div>
  );
}
