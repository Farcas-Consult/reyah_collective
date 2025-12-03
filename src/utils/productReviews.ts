import { ProductReview, ReviewStats, ReviewStatus } from '@/types/productReview';
import { getOrders } from './orders';
import { awardReviewPoints } from './loyalty';

const STORAGE_KEY = 'reyah_product_reviews';

// Get all reviews
export const getAllReviews = (): ProductReview[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Get reviews for a specific product
export const getProductReviews = (
  productId: number, 
  status: ReviewStatus | 'all' = 'approved'
): ProductReview[] => {
  const allReviews = getAllReviews();
  let reviews = allReviews.filter(r => r.productId === productId);
  
  if (status !== 'all') {
    reviews = reviews.filter(r => r.status === status);
  }
  
  return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Get reviews by customer
export const getCustomerReviews = (customerEmail: string): ProductReview[] => {
  const allReviews = getAllReviews();
  return allReviews
    .filter(r => r.customerEmail.toLowerCase() === customerEmail.toLowerCase())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Check if customer has already reviewed a product
export const hasCustomerReviewed = (productId: number, customerEmail: string): ProductReview | null => {
  const allReviews = getAllReviews();
  const existing = allReviews.find(
    r => r.productId === productId && r.customerEmail.toLowerCase() === customerEmail.toLowerCase()
  );
  return existing || null;
};

// Verify if customer purchased the product
export const hasCustomerPurchased = (productId: number, customerEmail: string): boolean => {
  const orders = getOrders();
  const customerOrders = orders.filter(
    order => order.customer.email.toLowerCase() === customerEmail.toLowerCase() &&
    order.status === 'delivered'
  );
  
  return customerOrders.some(order => 
    order.items.some(item => item.id === productId)
  );
};

// Submit a new review
export const submitReview = (
  productId: number,
  productName: string,
  customerName: string,
  customerEmail: string,
  rating: 1 | 2 | 3 | 4 | 5,
  title: string,
  reviewText: string,
  images?: string[]
): ProductReview => {
  const allReviews = getAllReviews();
  
  // Check if already reviewed
  const existing = hasCustomerReviewed(productId, customerEmail);
  if (existing) {
    throw new Error('You have already reviewed this product. Please edit your existing review.');
  }
  
  // Check if verified purchase
  const verifiedPurchase = hasCustomerPurchased(productId, customerEmail);
  const purchaseDate = verifiedPurchase ? getPurchaseDate(productId, customerEmail) : undefined;
  
  const newReview: ProductReview = {
    id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    productId,
    productName,
    customerId: customerEmail, // Using email as ID for now
    customerName,
    customerEmail,
    rating,
    title,
    review: reviewText,
    images: images || [],
    verifiedPurchase,
    purchaseDate,
    createdAt: new Date().toISOString(),
    status: 'approved', // Auto-approve for now, can change to 'pending' for moderation
    helpfulCount: 0,
    helpfulBy: [],
    reportCount: 0,
    reportedBy: []
  };
  
  allReviews.push(newReview);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allReviews));
  
  // Award loyalty points for writing a review
  try {
    awardReviewPoints(
      customerEmail, // customerId
      customerEmail, // customerEmail
      customerName, // customerName
      newReview.id, // reviewId
      productName // productName
    );
  } catch (error) {
    console.error('Failed to award review points:', error);
  }
  
  return newReview;
};

// Update an existing review
export const updateReview = (
  reviewId: string,
  updates: {
    rating?: 1 | 2 | 3 | 4 | 5;
    title?: string;
    review?: string;
    images?: string[];
  }
): ProductReview => {
  const allReviews = getAllReviews();
  const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex === -1) {
    throw new Error('Review not found');
  }
  
  const updatedReview = {
    ...allReviews[reviewIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
    status: 'approved' as ReviewStatus // Reset to approved after edit
  };
  
  allReviews[reviewIndex] = updatedReview;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allReviews));
  
  return updatedReview;
};

// Mark review as helpful
export const markReviewHelpful = (reviewId: string, userId: string): void => {
  const allReviews = getAllReviews();
  const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex === -1) return;
  
  const review = allReviews[reviewIndex];
  
  // Toggle helpful
  if (review.helpfulBy.includes(userId)) {
    review.helpfulBy = review.helpfulBy.filter(id => id !== userId);
    review.helpfulCount = Math.max(0, review.helpfulCount - 1);
  } else {
    review.helpfulBy.push(userId);
    review.helpfulCount += 1;
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allReviews));
};

// Report a review
export const reportReview = (reviewId: string, userId: string, reason: string): void => {
  const allReviews = getAllReviews();
  const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex === -1) return;
  
  const review = allReviews[reviewIndex];
  
  // Only report once per user
  if (!review.reportedBy.includes(userId)) {
    review.reportedBy.push(userId);
    review.reportCount += 1;
    
    if (!review.reportReasons) {
      review.reportReasons = [];
    }
    review.reportReasons.push(reason);
    
    // Auto-flag if multiple reports
    if (review.reportCount >= 3 && review.status !== 'flagged') {
      review.status = 'flagged';
    }
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allReviews));
};

// Update review status (admin only)
export const updateReviewStatus = (
  reviewId: string,
  status: ReviewStatus,
  adminEmail: string,
  notes?: string
): void => {
  const allReviews = getAllReviews();
  const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex === -1) return;
  
  allReviews[reviewIndex] = {
    ...allReviews[reviewIndex],
    status,
    adminNotes: notes,
    moderatedBy: adminEmail,
    moderatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allReviews));
};

// Delete review (admin only)
export const deleteReview = (reviewId: string): void => {
  const allReviews = getAllReviews();
  const filtered = allReviews.filter(r => r.id !== reviewId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

// Calculate review statistics for a product
export const calculateReviewStats = (productId: number): ReviewStats => {
  const reviews = getProductReviews(productId, 'approved');
  
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      verifiedPurchaseCount: 0,
      recommendationRate: 0
    };
  }
  
  const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalRating = 0;
  let verifiedCount = 0;
  let recommendCount = 0;
  
  reviews.forEach(review => {
    totalRating += review.rating;
    ratingBreakdown[review.rating]++;
    if (review.verifiedPurchase) verifiedCount++;
    if (review.rating >= 4) recommendCount++;
  });
  
  return {
    averageRating: Number((totalRating / reviews.length).toFixed(1)),
    totalReviews: reviews.length,
    ratingBreakdown,
    verifiedPurchaseCount: verifiedCount,
    recommendationRate: Math.round((recommendCount / reviews.length) * 100)
  };
};

// Sort reviews
export const sortReviews = (
  reviews: ProductReview[],
  sortBy: 'date' | 'rating-high' | 'rating-low' | 'helpful'
): ProductReview[] => {
  const sorted = [...reviews];
  
  switch (sortBy) {
    case 'date':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'rating-high':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'rating-low':
      return sorted.sort((a, b) => a.rating - b.rating);
    case 'helpful':
      return sorted.sort((a, b) => b.helpfulCount - a.helpfulCount);
    default:
      return sorted;
  }
};

// Get purchase date for verified purchase badge
const getPurchaseDate = (productId: number, customerEmail: string): string | undefined => {
  const orders = getOrders();
  const order = orders.find(
    order => order.customer.email.toLowerCase() === customerEmail.toLowerCase() &&
    order.status === 'delivered' &&
    order.items.some(item => item.id === productId)
  );
  return order?.date;
};

// Get reviews pending moderation
export const getPendingReviews = (): ProductReview[] => {
  return getAllReviews().filter(r => r.status === 'pending');
};

// Get flagged/reported reviews
export const getFlaggedReviews = (): ProductReview[] => {
  return getAllReviews().filter(r => r.status === 'flagged' || r.reportCount > 0);
};

// Bulk approve reviews
export const bulkApproveReviews = (reviewIds: string[], adminEmail: string): void => {
  reviewIds.forEach(id => updateReviewStatus(id, 'approved', adminEmail));
};

// Bulk reject reviews
export const bulkRejectReviews = (reviewIds: string[], adminEmail: string, notes?: string): void => {
  reviewIds.forEach(id => updateReviewStatus(id, 'rejected', adminEmail, notes));
};

// Convert images to base64 for storage
export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Validate review text for spam/inappropriate content
export const validateReviewContent = (text: string): { valid: boolean; reason?: string } => {
  // Basic validation
  if (text.length < 10) {
    return { valid: false, reason: 'Review must be at least 10 characters long' };
  }
  
  if (text.length > 2000) {
    return { valid: false, reason: 'Review must be less than 2000 characters' };
  }
  
  // Check for spam patterns (simple implementation)
  const spamPatterns = [
    /(.)\1{10,}/, // Repeated characters
    /(https?:\/\/[^\s]+)/gi, // URLs (optional - you may want to allow these)
    /\b(buy|click|visit|www\.|\.com)\b/gi // Spam keywords
  ];
  
  for (const pattern of spamPatterns) {
    if (pattern.test(text)) {
      return { valid: false, reason: 'Review contains inappropriate content or spam' };
    }
  }
  
  return { valid: true };
};
