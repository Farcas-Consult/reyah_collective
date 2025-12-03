export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export interface ProductReview {
  id: string;
  productId: number;
  productName: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  review: string;
  images?: string[];
  verifiedPurchase: boolean;
  purchaseDate?: string;
  createdAt: string;
  updatedAt?: string;
  status: ReviewStatus;
  helpfulCount: number;
  helpfulBy: string[]; // Array of user IDs who marked as helpful
  reportCount: number;
  reportedBy: string[]; // Array of user IDs who reported
  reportReasons?: string[];
  adminNotes?: string;
  moderatedBy?: string;
  moderatedAt?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verifiedPurchaseCount: number;
  recommendationRate: number; // Percentage of 4-5 star reviews
}

export interface ReviewFormData {
  rating: number;
  title: string;
  review: string;
  images?: File[];
}
