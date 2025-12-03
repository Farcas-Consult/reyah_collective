'use client';

import { useState, useEffect } from 'react';
import { ProductReview } from '@/types/productReview';
import { 
  submitReview, 
  updateReview, 
  convertImageToBase64,
  validateReviewContent,
  hasCustomerPurchased 
} from '@/utils/productReviews';
import StarRating from './StarRating';

interface ProductReviewFormProps {
  productId: number;
  productName: string;
  customerName: string;
  customerEmail: string;
  existingReview?: ProductReview | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductReviewForm({
  productId,
  productName,
  customerName,
  customerEmail,
  existingReview,
  onSuccess,
  onCancel
}: ProductReviewFormProps) {
  const [rating, setRating] = useState<number>(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [review, setReview] = useState(existingReview?.review || '');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(existingReview?.images || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verified = hasCustomerPurchased(productId, customerEmail);
    setIsVerified(verified);
  }, [productId, customerEmail]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + images.length + files.length;
    
    if (totalImages > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    
    // Check file sizes (max 5MB per image)
    const oversized = files.find(file => file.size > 5 * 1024 * 1024);
    if (oversized) {
      setError('Each image must be less than 5MB');
      return;
    }
    
    setImages(prev => [...prev, ...files]);
    setError('');
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }
    
    if (!title.trim()) {
      setError('Please enter a review title');
      return;
    }
    
    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters');
      return;
    }
    
    if (!review.trim()) {
      setError('Please enter your review');
      return;
    }
    
    const contentValidation = validateReviewContent(review);
    if (!contentValidation.valid) {
      setError(contentValidation.reason || 'Invalid review content');
      return;
    }
    
    setLoading(true);
    
    try {
      // Convert images to base64
      const imagePromises = images.map(file => convertImageToBase64(file));
      const base64Images = await Promise.all(imagePromises);
      const allImages = [...existingImages, ...base64Images];
      
      if (existingReview) {
        // Update existing review
        updateReview(existingReview.id, {
          rating: rating as 1 | 2 | 3 | 4 | 5,
          title: title.trim(),
          review: review.trim(),
          images: allImages
        });
      } else {
        // Submit new review
        submitReview(
          productId,
          productName,
          customerName,
          customerEmail,
          rating as 1 | 2 | 3 | 4 | 5,
          title.trim(),
          review.trim(),
          allImages
        );
      }
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h2>

      {!isVerified && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <span className="font-semibold">Note:</span> You haven't purchased this product yet. 
            Your review will not have a "Verified Purchase" badge.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Overall Rating *
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <svg
                  className={`w-10 h-10 ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                  fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-gray-600 font-semibold">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </span>
            )}
          </div>
        </div>

        {/* Review Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Review Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            maxLength={100}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            {title.length}/100 characters
          </p>
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience with this product. What did you like or dislike? How does it compare to similar products?"
            rows={6}
            maxLength={2000}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {review.length}/2000 characters (minimum 10 characters)
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Add Photos (Optional)
          </label>
          <p className="text-xs text-gray-600 mb-3">
            Share photos of your product to help other shoppers. Max 5 images, 5MB each.
          </p>
          
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {existingImages.map((image, index) => (
                <div key={`existing-${index}`} className="relative">
                  <img
                    src={image}
                    alt={`Review ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* New Images Preview */}
          {images.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {images.map((file, index) => (
                <div key={`new-${index}`} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {(existingImages.length + images.length) < 5 && (
            <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs text-gray-600">Add Photo</span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          By submitting, you agree that your review may be publicly displayed and used for marketing purposes.
        </p>
      </form>
    </div>
  );
}
