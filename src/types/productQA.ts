// Product Q&A Types

export type QuestionStatus = 'pending' | 'approved' | 'rejected' | 'answered';

export interface ProductQuestion {
  id: string;
  productId: number;
  productName: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  question: string;
  status: QuestionStatus;
  createdAt: string;
  updatedAt?: string;
  answer?: ProductAnswer;
  upvotes: number;
  upvotedBy: string[]; // Array of customer emails
  reportCount: number;
  reportedBy: string[];
  isVerifiedPurchase: boolean;
}

export interface ProductAnswer {
  id: string;
  answeredBy: string; // Email of seller/admin
  answererName: string;
  answererRole: 'seller' | 'admin' | 'support';
  answer: string;
  createdAt: string;
  updatedAt?: string;
  upvotes: number;
  upvotedBy: string[];
}

export interface QuestionFilters {
  productId?: number;
  status?: QuestionStatus;
  customerId?: string;
  hasAnswer?: boolean;
  searchTerm?: string;
}

export interface QuestionStats {
  total: number;
  pending: number;
  approved: number;
  answered: number;
  rejected: number;
  averageResponseTime?: number; // in hours
}
