'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import {
  getAllQuestions,
  answerQuestion,
  updateAnswer,
  getQuestionStats
} from '@/utils/productQA';
import { ProductQuestion } from '@/types/productQA';
import Link from 'next/link';

export default function SellerQAPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    answered: 0,
    rejected: 0,
    averageResponseTime: 0
  });
  const [filterHasAnswer, setFilterHasAnswer] = useState<'all' | 'answered' | 'unanswered'>('unanswered');
  const [searchTerm, setSearchTerm] = useState('');
  const [answeringQuestion, setAnsweringQuestion] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [editingAnswer, setEditingAnswer] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.isSeller) {
      router.push('/login');
      return;
    }

    loadData();
  }, [isAuthenticated, user, router, filterHasAnswer, searchTerm]);

  const loadData = () => {
    // Get all questions - in a real app, filter by seller's products
    let allQuestions = getAllQuestions();
    
    // Filter by search term
    if (searchTerm) {
      allQuestions = allQuestions.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by answer status
    if (filterHasAnswer === 'answered') {
      allQuestions = allQuestions.filter(q => q.answer);
    } else if (filterHasAnswer === 'unanswered') {
      allQuestions = allQuestions.filter(q => !q.answer);
    }

    // Sort by date (newest first)
    allQuestions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setQuestions(allQuestions);

    // Get stats
    const questionStats = getQuestionStats();
    setStats({
      ...questionStats,
      averageResponseTime: questionStats.averageResponseTime ?? 0
    });
  };

  const handleAnswerQuestion = (questionId: string) => {
    if (!user || !answerText.trim()) return;

    try {
      answerQuestion(
        questionId,
        user.email,
        `${user.firstName} ${user.lastName}`,
        'seller',
        answerText
      );
      setAnswerText('');
      setAnsweringQuestion(null);
      loadData();
    } catch (error) {
      console.error('Error answering question:', error);
      alert('Failed to submit answer');
    }
  };

  const handleUpdateAnswer = (questionId: string) => {
    if (!user || !answerText.trim()) return;

    try {
      updateAnswer(questionId, answerText);
      setAnswerText('');
      setEditingAnswer(null);
      loadData();
    } catch (error) {
      console.error('Error updating answer:', error);
      alert('Failed to update answer');
    }
  };

  const handleStartAnswering = (questionId: string, existingAnswer?: string) => {
    setAnsweringQuestion(questionId);
    setAnswerText(existingAnswer || '');
    setEditingAnswer(existingAnswer ? questionId : null);
  };

  const handleCancelAnswering = () => {
    setAnsweringQuestion(null);
    setEditingAnswer(null);
    setAnswerText('');
  };

  if (!user || !user.isSeller) {
    return null;
  }

  return (
    <div className="bg-[var(--beige-100)]">
      <Header />
      <main className="pt-40 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[var(--brown-800)] mb-2">Product Questions & Answers</h1>
              <p className="text-gray-600">Answer customer questions to build trust and increase sales</p>
            </div>
            <Link
              href="/seller"
              className="text-[var(--accent)] hover:text-[var(--brown-600)] font-semibold"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
              <p className="text-sm text-gray-600 mb-1">Total Questions</p>
              <p className="text-3xl font-bold text-[var(--brown-800)]">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
              <p className="text-sm text-gray-600 mb-1">Answered</p>
              <p className="text-3xl font-bold text-green-600">{stats.answered}</p>
            </div>
            <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
              <p className="text-sm text-gray-600 mb-1">Unanswered</p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.approved - stats.answered}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
              <p className="text-sm text-gray-600 mb-1">Pending Review</p>
              <p className="text-3xl font-bold text-blue-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
              <p className="text-sm text-gray-600 mb-1">Avg Response Time</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.averageResponseTime ? `${Math.round(stats.averageResponseTime)}h` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search questions or products..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Answer Status</label>
                <select
                  value={filterHasAnswer}
                  onChange={(e) => setFilterHasAnswer(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="all">All Questions</option>
                  <option value="unanswered">Unanswered</option>
                  <option value="answered">Answered</option>
                </select>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="bg-white rounded-lg border border-[var(--beige-300)]">
            {questions.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Questions Found</h3>
                <p className="text-gray-600">No questions match your current filters</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {questions.map((question) => (
                  <div key={question.id} className="p-6 hover:bg-gray-50 transition-colors">
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Link
                          href={`/product/${question.productId}`}
                          className="text-sm font-semibold text-[var(--accent)] hover:underline"
                        >
                          {question.productName}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-600">
                            by {question.customerName}
                          </span>
                          {question.isVerifiedPurchase && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-semibold">
                              Verified Purchase
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(question.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          question.status === 'answered' ? 'bg-green-100 text-green-800' :
                          question.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          question.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                        </span>
                        <div className="flex items-center gap-1 text-gray-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          <span className="text-sm">{question.upvotes}</span>
                        </div>
                      </div>
                    </div>

                    {/* Question */}
                    <div className="mb-4">
                      <p className="text-gray-900 font-medium">Q: {question.question}</p>
                    </div>

                    {/* Answer or Answer Form */}
                    {question.answer && answeringQuestion !== question.id ? (
                      <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              A: {question.answer.answererName}
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                {question.answer.answererRole === 'seller' ? 'Seller' : 'Admin'}
                              </span>
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {new Date(question.answer.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {question.answer.answeredBy === user.email && (
                            <button
                              onClick={() => handleStartAnswering(question.id, question.answer?.answer)}
                              className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                        <p className="text-gray-800 mt-2">{question.answer.answer}</p>
                        <div className="flex items-center gap-1 text-gray-600 mt-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          <span className="text-sm">{question.answer.upvotes} helpful</span>
                        </div>
                      </div>
                    ) : answeringQuestion === question.id ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Your Answer
                        </label>
                        <textarea
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          rows={4}
                          placeholder="Provide a helpful and detailed answer..."
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => editingAnswer ? handleUpdateAnswer(question.id) : handleAnswerQuestion(question.id)}
                            disabled={!answerText.trim()}
                            className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold disabled:bg-gray-400"
                          >
                            {editingAnswer ? 'Update Answer' : 'Submit Answer'}
                          </button>
                          <button
                            onClick={handleCancelAnswering}
                            className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      !question.answer && (
                        <button
                          onClick={() => handleStartAnswering(question.id)}
                          className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold"
                        >
                          Answer This Question
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
