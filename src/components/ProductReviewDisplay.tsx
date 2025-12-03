'use client';

import { useState } from 'react';
import { ProductReview } from '@/types/productReview';
import StarRating from './StarRating';
import { markReviewHelpful, reportReview } from '@/utils/productReviews';

interface ReviewDisplayProps {
  review: ProductReview;
  currentUserEmail?: string;
  onEdit?: (review: ProductReview) => void;
  showProductName?: boolean;
}

export default function ProductReviewDisplay({ 
  review, 
  currentUserEmail, 
  onEdit,
  showProductName = false 
}: ReviewDisplayProps) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isHelpful, setIsHelpful] = useState(
    review.helpfulBy.includes(currentUserEmail || '')
  );
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [showFullReview, setShowFullReview] = useState(false);

  const isOwnReview = currentUserEmail?.toLowerCase() === review.customerEmail.toLowerCase();

  const handleMarkHelpful = () => {
    if (!currentUserEmail) {
      alert('Please log in to mark reviews as helpful');
      return;
    }

    markReviewHelpful(review.id, currentUserEmail);
    setIsHelpful(!isHelpful);
    setHelpfulCount(prev => isHelpful ? prev - 1 : prev + 1);
  };

  const handleReport = () => {
    if (!currentUserEmail) {
      alert('Please log in to report reviews');
      return;
    }

    if (!reportReason.trim()) {
      alert('Please provide a reason for reporting');
      return;
    }

    reportReview(review.id, currentUserEmail, reportReason);
    setShowReportModal(false);
    alert('Review reported successfully. Our team will review it shortly.');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const shouldTruncate = review.review.length > 300;
  const displayReview = showFullReview || !shouldTruncate 
    ? review.review 
    : review.review.substring(0, 300) + '...';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <StarRating rating={review.rating} size="sm" />
            <span className="text-sm font-semibold text-gray-900">{review.title}</span>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <span className="font-semibold text-gray-900">{review.customerName}</span>
            
            {review.verifiedPurchase && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-semibold">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified Purchase
              </span>
            )}
            
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">{formatDate(review.createdAt)}</span>
            
            {review.updatedAt && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500 text-xs">Edited</span>
              </>
            )}
          </div>

          {showProductName && (
            <div className="mt-1 text-sm text-gray-600">
              Product: <span className="font-semibold">{review.productName}</span>
            </div>
          )}
        </div>

        {isOwnReview && onEdit && (
          <button
            onClick={() => onEdit(review)}
            className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
          >
            Edit
          </button>
        )}
      </div>

      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {displayReview}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setShowFullReview(!showFullReview)}
            className="text-blue-600 hover:text-blue-800 text-sm font-semibold mt-2"
          >
            {showFullReview ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {review.images && review.images.length > 0 && (
        <div className="mb-4 flex gap-2 flex-wrap">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
              onClick={() => window.open(image, '_blank')}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
        <button
          onClick={handleMarkHelpful}
          disabled={isOwnReview}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
            isHelpful
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } ${isOwnReview ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg className="w-4 h-4" fill={isHelpful ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          Helpful {helpfulCount > 0 && `(${helpfulCount})`}
        </button>

        {!isOwnReview && (
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
            Report
          </button>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Report Review</h3>
            <p className="text-gray-600 mb-4">
              Please select a reason for reporting this review:
            </p>
            
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a reason...</option>
              <option value="spam">Spam or fake review</option>
              <option value="offensive">Offensive or inappropriate language</option>
              <option value="misleading">Misleading or false information</option>
              <option value="irrelevant">Not relevant to the product</option>
              <option value="personal">Contains personal information</option>
              <option value="other">Other</option>
            </select>

            <div className="flex gap-3">
              <button
                onClick={handleReport}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold"
              >
                Submit Report
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
