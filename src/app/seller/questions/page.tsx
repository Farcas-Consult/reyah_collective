'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  getAllQuestions,
  answerQuestion,
  updateQuestionStatus
} from '@/utils/productQA';
import { ProductQuestion } from '@/types/productQA';

const getProductName = (productId: number): string => {
  if (typeof window === 'undefined') return 'Unknown Product';
  const products = JSON.parse(localStorage.getItem('reyah_products') || '[]');
  const product = products.find((p: any) => p.id === productId);
  return product?.name || 'Unknown Product';
};

export default function SellerQuestionsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'answered'>('unanswered');
  const [answerText, setAnswerText] = useState<{ [key: string]: string }>({});
  const [showAnswerForm, setShowAnswerForm] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!isAuthenticated || !user?.isSeller) {
      router.push('/seller-setup');
      return;
    }

    loadQuestions();
  }, [isAuthenticated, user, router, filter]);

  const loadQuestions = () => {
    const products = JSON.parse(localStorage.getItem('reyah_products') || '[]');
    const sellerProducts = products.filter((p: any) => p.seller === user?.sellerName);
    const sellerProductIds = sellerProducts.map((p: any) => p.id);

    let allQuestions = getAllQuestions();
    
    // Filter questions for seller's products
    allQuestions = allQuestions.filter(q => sellerProductIds.includes(q.productId));

    // Apply status filter
    if (filter === 'unanswered') {
      allQuestions = allQuestions.filter(q => q.status === 'pending');
    } else if (filter === 'answered') {
      allQuestions = allQuestions.filter(q => q.status === 'answered');
    }

    // Sort by date, newest first
    allQuestions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setQuestions(allQuestions);
  };

  const handleAnswerSubmit = (questionId: string) => {
    if (!answerText[questionId]?.trim()) return;

    answerQuestion(
      questionId, 
      user?.email || 'seller@example.com',
      user?.sellerName || user?.email || 'Seller',
      'seller',
      answerText[questionId]
    );
    setAnswerText(prev => ({ ...prev, [questionId]: '' }));
    setShowAnswerForm(prev => ({ ...prev, [questionId]: false }));
    loadQuestions();
  };

  const handleToggleAnswerForm = (questionId: string) => {
    setShowAnswerForm(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleHideQuestion = (questionId: string) => {
    if (confirm('Are you sure you want to hide this question?')) {
      updateQuestionStatus(questionId, 'rejected');
      loadQuestions();
    }
  };

  if (!isAuthenticated || !user?.isSeller) {
    return null;
  }

  const stats = {
    total: getAllQuestions().filter(q => {
      const products = JSON.parse(localStorage.getItem('reyah_products') || '[]');
      const sellerProducts = products.filter((p: any) => p.seller === user?.sellerName);
      return sellerProducts.some((p: any) => p.id === q.productId);
    }).length,
    unanswered: getAllQuestions().filter(q => {
      const products = JSON.parse(localStorage.getItem('reyah_products') || '[]');
      const sellerProducts = products.filter((p: any) => p.seller === user?.sellerName);
      return sellerProducts.some((p: any) => p.id === q.productId) && q.status === 'pending';
    }).length,
    answered: getAllQuestions().filter(q => {
      const products = JSON.parse(localStorage.getItem('reyah_products') || '[]');
      const sellerProducts = products.filter((p: any) => p.seller === user?.sellerName);
      return sellerProducts.some((p: any) => p.id === q.productId) && q.status === 'answered';
    }).length
  };

  return (
    <div className="bg-[var(--beige-100)]">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-[var(--beige-300)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold">
                <span className="text-[var(--brown-800)]">REYAH</span>
                <span className="text-[var(--accent)] text-3xl">⭐</span>
              </Link>
              <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">SELLER</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--brown-700)]">
                <span className="font-bold">{user?.sellerName}</span>
              </span>
              <Link href="/seller" className="text-sm text-[var(--accent)] hover:text-[var(--brown-600)] font-semibold">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--brown-800)] mb-2">Product Questions</h1>
          <p className="text-gray-600">Answer customer questions about your products</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
            <p className="text-sm text-gray-600 mb-1">Total Questions</p>
            <p className="text-3xl font-bold text-[var(--brown-800)]">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
            <p className="text-sm text-gray-600 mb-1">Awaiting Answer</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.unanswered}</p>
          </div>
          <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
            <p className="text-sm text-gray-600 mb-1">Answered</p>
            <p className="text-3xl font-bold text-green-600">{stats.answered}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'unanswered', label: 'Unanswered', count: stats.unanswered },
            { id: 'answered', label: 'Answered', count: stats.answered },
            { id: 'all', label: 'All Questions', count: stats.total }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-[var(--beige-300)]'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="bg-white rounded-lg border border-[var(--beige-300)] p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 text-lg mb-2">No {filter === 'all' ? '' : filter} questions yet</p>
              <p className="text-gray-500 text-sm">Customer questions will appear here</p>
            </div>
          ) : (
            questions.map(question => {
              const productName = getProductName(question.productId);
              return (
                <div key={question.id} className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          question.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          question.status === 'answered' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {question.status === 'pending' ? 'Awaiting Answer' :
                           question.status === 'answered' ? 'Answered' : 'Hidden'}
                        </span>
                        {question.upvotes > 0 && (
                          <span className="text-sm text-gray-600">
                            👍 {question.upvotes} {question.upvotes === 1 ? 'person' : 'people'} found this helpful
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Product: <Link href={`/product/${question.productId}`} className="text-[var(--accent)] hover:underline font-semibold">
                          {productName}
                        </Link>
                      </p>
                    </div>
                    <button
                      onClick={() => handleHideQuestion(question.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Hide question"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Question */}
                  <div className="mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-semibold text-sm">
                          {question.customerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">{question.customerName}</p>
                        <p className="text-gray-700">{question.question}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(question.createdAt).toLocaleDateString()} at {new Date(question.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Answer */}
                  {question.answer && (
                    <div className="ml-13 mb-4 pl-4 border-l-2 border-green-300 bg-green-50 p-4 rounded">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 font-semibold text-xs">
                            {question.answer.answererName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm mb-1">{question.answer.answererName} (Seller)</p>
                          <p className="text-gray-700 text-sm">{question.answer.answer}</p>
                          {question.answer.createdAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(question.answer.createdAt).toLocaleDateString()} at {new Date(question.answer.createdAt).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Answer Form */}
                  {question.status === 'pending' && (
                    <div className="ml-13">
                      {!showAnswerForm[question.id] ? (
                        <button
                          onClick={() => handleToggleAnswerForm(question.id)}
                          className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold text-sm"
                        >
                          Answer Question
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <textarea
                            value={answerText[question.id] || ''}
                            onChange={(e) => setAnswerText(prev => ({ ...prev, [question.id]: e.target.value }))}
                            placeholder="Type your answer here..."
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAnswerSubmit(question.id)}
                              disabled={!answerText[question.id]?.trim()}
                              className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              Submit Answer
                            </button>
                            <button
                              onClick={() => handleToggleAnswerForm(question.id)}
                              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
