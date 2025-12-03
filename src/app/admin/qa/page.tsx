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
  updateQuestionStatus,
  deleteQuestion,
  getQuestionStats,
  getFilteredQuestions
} from '@/utils/productQA';
import { ProductQuestion, QuestionStatus } from '@/types/productQA';
import Link from 'next/link';

export default function AdminQAPage() {
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
  const [filterStatus, setFilterStatus] = useState<QuestionStatus | 'all'>('all');
  const [filterHasAnswer, setFilterHasAnswer] = useState<'all' | 'answered' | 'unanswered'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [answeringQuestion, setAnsweringQuestion] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [editingAnswer, setEditingAnswer] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/login');
      return;
    }

    loadData();
  }, [isAuthenticated, user, router, filterStatus, filterHasAnswer, searchTerm]);

  const loadData = () => {
    const filters: any = { searchTerm };
    
    if (filterStatus !== 'all') {
      filters.status = filterStatus;
    }
    
    if (filterHasAnswer === 'answered') {
      filters.hasAnswer = true;
    } else if (filterHasAnswer === 'unanswered') {
      filters.hasAnswer = false;
    }

    const filtered = getFilteredQuestions(filters);
    setQuestions(filtered);

    const questionStats = getQuestionStats();
    setStats({
      ...questionStats,
      averageResponseTime: questionStats.averageResponseTime ?? 0
    });
  };

  const handleAnswer = (questionId: string) => {
    if (!user || !answerText.trim()) return;

    try {
      answerQuestion(
        questionId,
        user.email,
        `${user.firstName} ${user.lastName}`,
        'admin',
        answerText
      );
      setAnswerText('');
      setAnsweringQuestion(null);
      loadData();
    } catch (error) {
      alert('Failed to submit answer');
    }
  };

  const handleUpdateAnswer = (questionId: string) => {
    if (!answerText.trim()) return;

    try {
      updateAnswer(questionId, answerText);
      setAnswerText('');
      setEditingAnswer(null);
      loadData();
    } catch (error) {
      alert('Failed to update answer');
    }
  };

  const handleStatusChange = (questionId: string, status: QuestionStatus) => {
    if (confirm(`Change status to "${status}"?`)) {
      updateQuestionStatus(questionId, status);
      loadData();
    }
  };

  const handleDelete = (questionId: string) => {
    if (confirm('Delete this question? This cannot be undone.')) {
      deleteQuestion(questionId);
      loadData();
    }
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
              <h1 className="text-3xl font-bold text-[var(--brown-800)] mb-2">Product Q&A Management</h1>
              <p className="text-gray-600">Manage customer questions and provide helpful answers</p>
            </div>
            <Link
              href="/admin"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
              <p className="text-sm text-gray-600 mb-1">Total Questions</p>
              <p className="text-3xl font-bold text-[var(--brown-800)]">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
              <p className="text-sm text-gray-600 mb-1">Approved</p>
              <p className="text-3xl font-bold text-blue-600">{stats.approved}</p>
            </div>
            <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
              <p className="text-sm text-gray-600 mb-1">Answered</p>
              <p className="text-3xl font-bold text-green-600">{stats.answered}</p>
            </div>
            <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
              <p className="text-sm text-gray-600 mb-1">Avg Response</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.averageResponseTime ? `${Math.round(stats.averageResponseTime)}h` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search questions, products..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="answered">Answered</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Answer Status</label>
                <select
                  value={filterHasAnswer}
                  onChange={(e) => setFilterHasAnswer(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All</option>
                  <option value="unanswered">Unanswered</option>
                  <option value="answered">Answered</option>
                </select>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
            <h2 className="text-xl font-bold text-[var(--brown-800)] mb-6">
              Questions ({questions.length})
            </h2>

            {questions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No questions found matching your filters</p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Link
                            href={`/product/${question.productId}`}
                            className="font-semibold text-[var(--accent)] hover:underline"
                          >
                            {question.productName}
                          </Link>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            question.status === 'answered' ? 'bg-green-100 text-green-800' :
                            question.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            question.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {question.status.toUpperCase()}
                          </span>
                          {question.isVerifiedPurchase && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">{question.customerName}</span>
                          {' • '}
                          {new Date(question.createdAt).toLocaleString()}
                          {' • '}
                          {question.upvotes} upvote{question.upvotes !== 1 ? 's' : ''}
                          {question.reportCount > 0 && (
                            <span className="text-red-600 ml-2">
                              • {question.reportCount} report{question.reportCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </p>
                        <p className="text-[var(--brown-800)] font-medium">Q: {question.question}</p>
                      </div>
                    </div>

                    {/* Answer Section */}
                    {question.answer ? (
                      <div className="ml-6 mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        {editingAnswer === question.id ? (
                          <div>
                            <textarea
                              value={answerText}
                              onChange={(e) => setAnswerText(e.target.value)}
                              rows={4}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateAnswer(question.id)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold text-sm"
                              >
                                Update Answer
                              </button>
                              <button
                                onClick={() => {
                                  setEditingAnswer(null);
                                  setAnswerText('');
                                }}
                                className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 font-semibold text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 bg-[var(--accent)] text-white text-xs font-semibold rounded">
                                {question.answer.answererRole.toUpperCase()}
                              </span>
                              <span className="font-semibold text-sm">{question.answer.answererName}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(question.answer.createdAt).toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-600 ml-auto">
                                {question.answer.upvotes} upvote{question.answer.upvotes !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <p className="text-gray-800 mb-3">A: {question.answer.answer}</p>
                            <button
                              onClick={() => {
                                setEditingAnswer(question.id);
                                setAnswerText(question.answer!.answer);
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              Edit Answer
                            </button>
                          </div>
                        )}
                      </div>
                    ) : answeringQuestion === question.id ? (
                      <div className="ml-6 mb-4">
                        <textarea
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          placeholder="Write your answer..."
                          rows={4}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAnswer(question.id)}
                            className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg hover:bg-[var(--brown-600)] font-semibold text-sm"
                          >
                            Submit Answer
                          </button>
                          <button
                            onClick={() => {
                              setAnsweringQuestion(null);
                              setAnswerText('');
                            }}
                            className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 font-semibold text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {!question.answer && answeringQuestion !== question.id && (
                        <button
                          onClick={() => setAnsweringQuestion(question.id)}
                          className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg hover:bg-[var(--brown-600)] font-semibold text-sm"
                        >
                          Answer Question
                        </button>
                      )}
                      {question.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(question.id, 'approved')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm"
                        >
                          Approve
                        </button>
                      )}
                      {question.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(question.id, 'rejected')}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold text-sm"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 font-semibold text-sm"
                      >
                        Delete
                      </button>
                    </div>
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
