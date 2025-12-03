export interface Review {
  id: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  orderId: string;
  rating: number; // 1-5 stars
  comment: string;
  date: string;
  isSupplierReview?: boolean; // true if reviewing a supplier, false/undefined for seller
  supplierId?: string;
  supplierName?: string;
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
}
