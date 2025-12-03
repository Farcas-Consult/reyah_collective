'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { ProductReview } from '@/types/productReview';
import {
  getAllReviews,
  getPendingReviews,
  getFlaggedReviews,
  updateReviewStatus,
  deleteReview,
  bulkApproveReviews,
  bulkRejectReviews
} from '@/utils/productReviews';
import ProductReviewDisplay from '@/components/ProductReviewDisplay';

type FilterType = 'all' | 'pending' | 'approved' | 'rejected' | 'flagged';

export default function AdminReviewsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ProductReview[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [moderatingReview, setModeratingReview] = useState<ProductReview | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!user?.isAdmin) {
      router.push('/');
      return;
    }

    loadReviews();
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    filterReviews();
  }, [filter, searchTerm, reviews]);

  const loadReviews = () => {
    const allReviews = getAllReviews();
    setReviews(allReviews);
  };

  const filterReviews = () => {
    let filtered = [...reviews];

    // Filter by status
    if (filter === 'pending') {
      filtered = getPendingReviews();
    } else if (filter === 'flagged') {
      filtered = getFlaggedReviews();
    } else if (filter !== 'all') {
      filtered = filtered.filter(r => r.status === filter);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.productName.toLowerCase().includes(search) ||
        r.customerName.toLowerCase().includes(search) ||
        r.customerEmail.toLowerCase().includes(search) ||
        r.review.toLowerCase().includes(search)
      );
    }

    setFilteredReviews(filtered);
  };

  const handleModerate = (review: ProductReview) => {
    setModeratingReview(review);
    setAdminNotes(review.adminNotes || '');
    setShowModerationModal(true);
  };

  const handleUpdateStatus = (status: 'approved' | 'rejected') => {
    if (!moderatingReview || !user) return;

    updateReviewStatus(moderatingReview.id, status, user.email, adminNotes);
    loadReviews();
    setShowModerationModal(false);
    setModeratingReview(null);
    setAdminNotes('');
  };

  const handleDelete = (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      deleteReview(reviewId);
      loadReviews();
    }
  };

  const handleSelectAll = () => {
    if (selectedReviews.length === filteredReviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(filteredReviews.map(r => r.id));
    }
  };

  const handleSelectReview = (reviewId: string) => {
    setSelectedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const handleBulkApprove = () => {
    if (selectedReviews.length === 0) return;
    if (confirm(`Approve ${selectedReviews.length} selected reviews?`)) {
      bulkApproveReviews(selectedReviews, user?.email || 'admin');
      setSelectedReviews([]);
      loadReviews();
    }
  };

  const handleBulkReject = () => {
    if (selectedReviews.length === 0) return;
    if (confirm(`Reject ${selectedReviews.length} selected reviews?`)) {
      bulkRejectReviews(selectedReviews, user?.email || 'admin');
      setSelectedReviews([]);
      loadReviews();
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      flagged: 'bg-orange-100 text-orange-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      <Header />
      <main className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[var(--brown-800)] mb-2">Review Moderation</h1>
              <p className="text-gray-600">Manage and moderate product reviews</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Reviews: <span className="font-semibold">{reviews.length}</span></p>
              <p className="text-sm text-yellow-600">Pending: <span className="font-semibold">{getPendingReviews().length}</span></p>
              <p className="text-sm text-orange-600">Flagged: <span className="font-semibold">{getFlaggedReviews().length}</span></p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-[var(--beige-300)] p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {(['all', 'pending', 'approved', 'rejected', 'flagged'] as FilterType[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === f
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex-1 md:max-w-md">
                <input
                  type="text"
                  placeholder="Search by product, customer, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedReviews.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  {selectedReviews.length} selected
                </span>
                <button
                  onClick={handleBulkApprove}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Approve Selected
                </button>
                <button
                  onClick={handleBulkReject}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Reject Selected
                </button>
                <button
                  onClick={() => setSelectedReviews([])}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>

          {/* Reviews List */}
          {filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map(review => (
                <div key={review.id} className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedReviews.includes(review.id)}
                      onChange={() => handleSelectReview(review.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(review.status)}`}>
                            {review.status.toUpperCase()}
                          </span>
                          {review.reportCount > 0 && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                              {review.reportCount} Report{review.reportCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleModerate(review)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Moderate
                          </button>
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <ProductReviewDisplay
                        review={review}
                        currentUserEmail=""
                        showProductName={true}
                      />

                      {review.reportReasons && review.reportReasons.length > 0 && (
                        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-sm font-semibold text-red-800 mb-2">Report Reasons:</p>
                          <ul className="text-sm text-red-700 space-y-1">
                            {review.reportReasons.map((reason, idx) => (
                              <li key={idx}>• {reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {review.adminNotes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm font-semibold text-gray-800 mb-1">Admin Notes:</p>
                          <p className="text-sm text-gray-700">{review.adminNotes}</p>
                          {review.moderatedBy && (
                            <p className="text-xs text-gray-500 mt-2">
                              Moderated by {review.moderatedBy} on {new Date(review.moderatedAt!).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[var(--beige-300)] p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Reviews Found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </main>

      {/* Moderation Modal */}
      {showModerationModal && moderatingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Moderate Review</h2>
            
            <div className="mb-6">
              <ProductReviewDisplay
                review={moderatingReview}
                currentUserEmail=""
                showProductName={true}
              />
            </div>

            {moderatingReview.reportReasons && moderatingReview.reportReasons.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="font-semibold text-red-800 mb-2">Report Reasons:</p>
                <ul className="text-sm text-red-700 space-y-1">
                  {moderatingReview.reportReasons.map((reason, idx) => (
                    <li key={idx}>• {reason}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this moderation decision..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleUpdateStatus('approved')}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Approve Review
              </button>
              <button
                onClick={() => handleUpdateStatus('rejected')}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Reject Review
              </button>
              <button
                onClick={() => {
                  setShowModerationModal(false);
                  setModeratingReview(null);
                  setAdminNotes('');
                }}
                className="flex-1 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
