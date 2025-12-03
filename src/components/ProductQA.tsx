'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getProductQuestions,
  submitQuestion,
  upvoteQuestion,
  upvoteAnswer,
  reportQuestion,
  hasCustomerPurchasedProduct
} from '@/utils/productQA';
import { ProductQuestion } from '@/types/productQA';

interface ProductQAProps {
  productId: number;
  productName: string;
}

export default function ProductQA({ productId, productName }: ProductQAProps) {
  const { user, isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [showAskForm, setShowAskForm] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadQuestions();
  }, [productId]);

  const loadQuestions = () => {
    const productQuestions = getProductQuestions(productId, false);
    setQuestions(productQuestions);
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      setMessage({ type: 'error', text: 'Please log in to ask a question' });
      return;
    }

    if (questionText.trim().length < 10) {
      setMessage({ type: 'error', text: 'Question must be at least 10 characters' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const isVerifiedPurchase = hasCustomerPurchasedProduct(productId, user.email);
      
      submitQuestion(
        productId,
        productName,
        user.email,
        `${user.firstName} ${user.lastName}`,
        user.email,
        questionText,
        isVerifiedPurchase
      );

      setMessage({ type: 'success', text: 'Your question has been submitted!' });
      setQuestionText('');
      setShowAskForm(false);
      loadQuestions();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit question. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvoteQuestion = (questionId: string) => {
    if (!isAuthenticated || !user) {
      setMessage({ type: 'error', text: 'Please log in to upvote' });
      return;
    }

    upvoteQuestion(questionId, user.email);
    loadQuestions();
  };

  const handleUpvoteAnswer = (questionId: string) => {
    if (!isAuthenticated || !user) {
      setMessage({ type: 'error', text: 'Please log in to upvote' });
      return;
    }

    upvoteAnswer(questionId, user.email);
    loadQuestions();
  };

  const handleReport = (questionId: string) => {
    if (!isAuthenticated || !user) {
      setMessage({ type: 'error', text: 'Please log in to report' });
      return;
    }

    if (confirm('Report this question as inappropriate?')) {
      reportQuestion(questionId, user.email);
      setMessage({ type: 'success', text: 'Question reported. Thank you!' });
      loadQuestions();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--brown-800)]">
          Questions & Answers ({questions.length})
        </h2>
        <button
          onClick={() => setShowAskForm(!showAskForm)}
          className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold text-sm"
        >
          Ask a Question
        </button>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Ask Question Form */}
      {showAskForm && (
        <form onSubmit={handleSubmitQuestion} className="mb-6 p-4 bg-[var(--beige-100)] rounded-lg border border-[var(--beige-300)]">
          <h3 className="font-semibold text-[var(--brown-800)] mb-3">Ask Your Question</h3>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="What would you like to know about this product?"
            required
            rows={4}
            className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-lg focus:outline-none focus:border-[var(--accent)] resize-none mb-3"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[var(--accent)] text-white px-6 py-2 rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Question'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAskForm(false);
                setQuestionText('');
                setMessage(null);
              }}
              className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 mb-2">No questions yet</p>
          <p className="text-sm text-gray-500">Be the first to ask about this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((question) => (
            <div key={question.id} className="border-b border-[var(--beige-300)] pb-6 last:border-b-0">
              {/* Question */}
              <div className="mb-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-[var(--brown-800)]">{question.customerName}</span>
                      {question.isVerifiedPurchase && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified Purchase
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[var(--brown-800)] font-medium">Q: {question.question}</p>
                  </div>
                </div>

                {/* Question Actions */}
                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() => handleUpvoteQuestion(question.id)}
                    className={`flex items-center gap-1 text-sm transition-colors ${
                      user && question.upvotedBy.includes(user.email)
                        ? 'text-[var(--accent)] font-semibold'
                        : 'text-gray-600 hover:text-[var(--accent)]'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    Helpful ({question.upvotes})
                  </button>
                  <button
                    onClick={() => handleReport(question.id)}
                    className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                  >
                    Report
                  </button>
                </div>
              </div>

              {/* Answer */}
              {question.answer && (
                <div className="ml-6 pl-4 border-l-2 border-[var(--accent)]">
                  <div className="bg-[var(--beige-50)] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[var(--accent)] text-white text-xs font-semibold rounded">
                        {question.answer.answererRole.toUpperCase()}
                      </span>
                      <span className="font-semibold text-[var(--brown-800)]">
                        {question.answer.answererName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(question.answer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[var(--brown-800)] mb-3">A: {question.answer.answer}</p>
                    
                    {/* Answer Actions */}
                    <button
                      onClick={() => handleUpvoteAnswer(question.id)}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        user && question.answer.upvotedBy.includes(user.email)
                          ? 'text-[var(--accent)] font-semibold'
                          : 'text-gray-600 hover:text-[var(--accent)]'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      Helpful ({question.answer.upvotes})
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
