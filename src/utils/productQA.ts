import { ProductQuestion, ProductAnswer, QuestionStatus, QuestionFilters, QuestionStats } from '@/types/productQA';

const STORAGE_KEY = 'reyah_product_questions';

// Get all questions
export const getAllQuestions = (): ProductQuestion[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Get questions for a specific product
export const getProductQuestions = (
  productId: number,
  includeUnapproved: boolean = false
): ProductQuestion[] => {
  const allQuestions = getAllQuestions();
  return allQuestions
    .filter(q => q.productId === productId)
    .filter(q => includeUnapproved || q.status === 'approved' || q.status === 'answered')
    .sort((a, b) => {
      // Sort answered first, then by upvotes, then by date
      if (a.answer && !b.answer) return -1;
      if (!a.answer && b.answer) return 1;
      if (a.upvotes !== b.upvotes) return b.upvotes - a.upvotes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
};

// Get questions by customer
export const getCustomerQuestions = (customerEmail: string): ProductQuestion[] => {
  const allQuestions = getAllQuestions();
  return allQuestions
    .filter(q => q.customerEmail === customerEmail)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Submit a new question
export const submitQuestion = (
  productId: number,
  productName: string,
  customerId: string,
  customerName: string,
  customerEmail: string,
  question: string,
  isVerifiedPurchase: boolean = false
): ProductQuestion => {
  const allQuestions = getAllQuestions();
  
  const newQuestion: ProductQuestion = {
    id: `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    productId,
    productName,
    customerId,
    customerName,
    customerEmail,
    question: question.trim(),
    status: 'approved', // Auto-approve for now, can change to 'pending' for moderation
    createdAt: new Date().toISOString(),
    upvotes: 0,
    upvotedBy: [],
    reportCount: 0,
    reportedBy: [],
    isVerifiedPurchase
  };
  
  allQuestions.push(newQuestion);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allQuestions));
  
  return newQuestion;
};

// Answer a question
export const answerQuestion = (
  questionId: string,
  answeredBy: string,
  answererName: string,
  answererRole: 'seller' | 'admin' | 'support',
  answerText: string
): ProductQuestion => {
  const allQuestions = getAllQuestions();
  const questionIndex = allQuestions.findIndex(q => q.id === questionId);
  
  if (questionIndex === -1) {
    throw new Error('Question not found');
  }
  
  const answer: ProductAnswer = {
    id: `answer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    answeredBy,
    answererName,
    answererRole,
    answer: answerText.trim(),
    createdAt: new Date().toISOString(),
    upvotes: 0,
    upvotedBy: []
  };
  
  allQuestions[questionIndex].answer = answer;
  allQuestions[questionIndex].status = 'answered';
  allQuestions[questionIndex].updatedAt = new Date().toISOString();
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allQuestions));
  
  return allQuestions[questionIndex];
};

// Update an answer
export const updateAnswer = (
  questionId: string,
  answerText: string
): ProductQuestion => {
  const allQuestions = getAllQuestions();
  const questionIndex = allQuestions.findIndex(q => q.id === questionId);
  
  if (questionIndex === -1) {
    throw new Error('Question not found');
  }
  
  if (!allQuestions[questionIndex].answer) {
    throw new Error('Question has no answer to update');
  }
  
  allQuestions[questionIndex].answer!.answer = answerText.trim();
  allQuestions[questionIndex].answer!.updatedAt = new Date().toISOString();
  allQuestions[questionIndex].updatedAt = new Date().toISOString();
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allQuestions));
  
  return allQuestions[questionIndex];
};

// Delete a question
export const deleteQuestion = (questionId: string): boolean => {
  const allQuestions = getAllQuestions();
  const filteredQuestions = allQuestions.filter(q => q.id !== questionId);
  
  if (filteredQuestions.length === allQuestions.length) {
    return false; // Question not found
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredQuestions));
  return true;
};

// Update question status
export const updateQuestionStatus = (
  questionId: string,
  status: QuestionStatus
): ProductQuestion | null => {
  const allQuestions = getAllQuestions();
  const questionIndex = allQuestions.findIndex(q => q.id === questionId);
  
  if (questionIndex === -1) {
    return null;
  }
  
  allQuestions[questionIndex].status = status;
  allQuestions[questionIndex].updatedAt = new Date().toISOString();
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allQuestions));
  
  return allQuestions[questionIndex];
};

// Upvote a question
export const upvoteQuestion = (questionId: string, customerEmail: string): ProductQuestion | null => {
  const allQuestions = getAllQuestions();
  const questionIndex = allQuestions.findIndex(q => q.id === questionId);
  
  if (questionIndex === -1) {
    return null;
  }
  
  const question = allQuestions[questionIndex];
  
  if (question.upvotedBy.includes(customerEmail)) {
    // Remove upvote
    question.upvotedBy = question.upvotedBy.filter(email => email !== customerEmail);
    question.upvotes = Math.max(0, question.upvotes - 1);
  } else {
    // Add upvote
    question.upvotedBy.push(customerEmail);
    question.upvotes += 1;
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allQuestions));
  
  return question;
};

// Upvote an answer
export const upvoteAnswer = (questionId: string, customerEmail: string): ProductQuestion | null => {
  const allQuestions = getAllQuestions();
  const questionIndex = allQuestions.findIndex(q => q.id === questionId);
  
  if (questionIndex === -1 || !allQuestions[questionIndex].answer) {
    return null;
  }
  
  const answer = allQuestions[questionIndex].answer!;
  
  if (answer.upvotedBy.includes(customerEmail)) {
    // Remove upvote
    answer.upvotedBy = answer.upvotedBy.filter(email => email !== customerEmail);
    answer.upvotes = Math.max(0, answer.upvotes - 1);
  } else {
    // Add upvote
    answer.upvotedBy.push(customerEmail);
    answer.upvotes += 1;
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allQuestions));
  
  return allQuestions[questionIndex];
};

// Report a question
export const reportQuestion = (questionId: string, reporterEmail: string): ProductQuestion | null => {
  const allQuestions = getAllQuestions();
  const questionIndex = allQuestions.findIndex(q => q.id === questionId);
  
  if (questionIndex === -1) {
    return null;
  }
  
  const question = allQuestions[questionIndex];
  
  if (!question.reportedBy.includes(reporterEmail)) {
    question.reportedBy.push(reporterEmail);
    question.reportCount += 1;
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allQuestions));
  
  return question;
};

// Get filtered questions (for admin)
export const getFilteredQuestions = (filters: QuestionFilters): ProductQuestion[] => {
  let questions = getAllQuestions();
  
  if (filters.productId) {
    questions = questions.filter(q => q.productId === filters.productId);
  }
  
  if (filters.status) {
    questions = questions.filter(q => q.status === filters.status);
  }
  
  if (filters.customerId) {
    questions = questions.filter(q => q.customerId === filters.customerId);
  }
  
  if (filters.hasAnswer !== undefined) {
    questions = questions.filter(q => filters.hasAnswer ? !!q.answer : !q.answer);
  }
  
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    questions = questions.filter(q =>
      q.question.toLowerCase().includes(term) ||
      q.customerName.toLowerCase().includes(term) ||
      q.productName.toLowerCase().includes(term) ||
      (q.answer?.answer.toLowerCase().includes(term))
    );
  }
  
  return questions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Get question statistics
export const getQuestionStats = (): QuestionStats => {
  const allQuestions = getAllQuestions();
  
  const stats: QuestionStats = {
    total: allQuestions.length,
    pending: allQuestions.filter(q => q.status === 'pending').length,
    approved: allQuestions.filter(q => q.status === 'approved').length,
    answered: allQuestions.filter(q => q.status === 'answered').length,
    rejected: allQuestions.filter(q => q.status === 'rejected').length
  };
  
  // Calculate average response time for answered questions
  const answeredQuestions = allQuestions.filter(q => q.answer);
  if (answeredQuestions.length > 0) {
    const totalResponseTime = answeredQuestions.reduce((sum, q) => {
      const questionTime = new Date(q.createdAt).getTime();
      const answerTime = new Date(q.answer!.createdAt).getTime();
      return sum + (answerTime - questionTime);
    }, 0);
    
    stats.averageResponseTime = totalResponseTime / answeredQuestions.length / (1000 * 60 * 60); // Convert to hours
  }
  
  return stats;
};

// Check if customer has purchased product
export const hasCustomerPurchasedProduct = (productId: number, customerEmail: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  const orders = JSON.parse(localStorage.getItem('reyah_orders') || '[]');
  
  return orders.some((order: any) =>
    order.customer.email === customerEmail &&
    order.items.some((item: any) => item.id === productId)
  );
};
