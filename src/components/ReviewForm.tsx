'use client';

import { useState } from 'react';
import { Review } from '@/types/review';

interface ReviewFormProps {
  orderId: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  onSubmit: (review: Review) => void;
  onCancel: () => void;
  isSupplier?: boolean;
  supplierId?: string;
  supplierName?: string;
}

export default function ReviewForm({
  orderId,
  sellerId,
  sellerName,
  buyerId,
  buyerName,
  onSubmit,
  onCancel,
  isSupplier = false,
  supplierId,
  supplierName
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const review: Review = {
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sellerId,
      sellerName,
      buyerId,
      buyerName,
      orderId,
      rating,
      comment,
      date: new Date().toISOString(),
      isSupplierReview: isSupplier,
      supplierId,
      supplierName
    };

    onSubmit(review);
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoveredRating(star)}
        onMouseLeave={() => setHoveredRating(0)}
        className="text-3xl transition-colors"
      >
        {star <= (hoveredRating || rating) ? (
          <span className="text-yellow-400">★</span>
        ) : (
          <span className="text-gray-300">☆</span>
        )}
      </button>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">
          Leave a Review for {isSupplier ? supplierName : sellerName}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-1">{renderStars()}</div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Your Review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Share your experience with this seller..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Submit Review
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
