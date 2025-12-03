'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { Message, Conversation } from '@/types/message';

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadConversations();
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = () => {
    if (!user) return;

    const allMessages = JSON.parse(localStorage.getItem('reyah_messages') || '[]') as Message[];
    
    // Group messages by conversation
    const conversationMap = new Map<string, Conversation>();

    allMessages.forEach((msg) => {
      // Only include conversations where user is a participant
      if (msg.senderId !== user.id && msg.receiverId !== user.id) return;

      const conversationId = msg.conversationId;
      const existing = conversationMap.get(conversationId);

      if (!existing) {
        conversationMap.set(conversationId, {
          id: conversationId,
          participant1Id: msg.senderId,
          participant1Name: msg.senderName,
          participant2Id: msg.receiverId,
          participant2Name: msg.receiverName,
          lastMessage: msg.message,
          lastMessageTime: msg.timestamp,
          unreadCount: !msg.read && msg.receiverId === user.id ? 1 : 0,
        });
      } else {
        // Update with latest message
        if (new Date(msg.timestamp) > new Date(existing.lastMessageTime)) {
          existing.lastMessage = msg.message;
          existing.lastMessageTime = msg.timestamp;
        }
        // Count unread messages
        if (!msg.read && msg.receiverId === user.id) {
          existing.unreadCount++;
        }
      }
    });

    const conversationsList = Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );

    setConversations(conversationsList);
    setLoading(false);
  };

  const loadMessages = (conversationId: string) => {
    const allMessages = JSON.parse(localStorage.getItem('reyah_messages') || '[]') as Message[];
    const conversationMessages = allMessages
      .filter((msg) => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Mark messages as read
    const updatedMessages = allMessages.map((msg) => {
      if (msg.conversationId === conversationId && msg.receiverId === user?.id && !msg.read) {
        return { ...msg, read: true };
      }
      return msg;
    });
    localStorage.setItem('reyah_messages', JSON.stringify(updatedMessages));

    setMessages(conversationMessages);
    loadConversations(); // Reload to update unread counts
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const otherParticipantId = selectedConversation.participant1Id === user.id
      ? selectedConversation.participant2Id
      : selectedConversation.participant1Id;

    const otherParticipantName = selectedConversation.participant1Id === user.id
      ? selectedConversation.participant2Name
      : selectedConversation.participant1Name;

    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversationId: selectedConversation.id,
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`,
      receiverId: otherParticipantId,
      receiverName: otherParticipantName,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    const allMessages = JSON.parse(localStorage.getItem('reyah_messages') || '[]');
    allMessages.push(message);
    localStorage.setItem('reyah_messages', JSON.stringify(allMessages));

    setMessages([...messages, message]);
    setNewMessage('');
    loadConversations();
  };

  const getOtherParticipantName = (conversation: Conversation) => {
    if (!user) return '';
    return conversation.participant1Id === user.id
      ? conversation.participant2Name
      : conversation.participant1Name;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      <Header />
      <main className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <BackButton />
          <h1 className="text-3xl font-bold text-[var(--brown-800)] mb-6">Messages</h1>

          <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] overflow-hidden">
            <div className="grid md:grid-cols-3 h-[600px]">
              {/* Conversations List */}
              <div className="border-r border-[var(--beige-300)] overflow-y-auto">
                <div className="p-4 bg-[var(--beige-50)] border-b border-[var(--beige-300)]">
                  <h2 className="font-bold text-[var(--brown-800)]">Conversations</h2>
                </div>
                {loading ? (
                  <div className="p-4 text-center text-gray-600">Loading...</div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-gray-600 text-sm">No conversations yet</p>
                    <p className="text-gray-500 text-xs mt-2">Contact a seller to start messaging</p>
                  </div>
                ) : (
                  <div>
                    {conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`w-full p-4 border-b border-[var(--beige-200)] hover:bg-[var(--beige-50)] transition-colors text-left ${
                          selectedConversation?.id === conversation.id ? 'bg-[var(--beige-100)]' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-semibold text-[var(--brown-800)] truncate">
                            {getOtherParticipantName(conversation)}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-[var(--accent)] text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatTime(conversation.lastMessageTime)}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Thread */}
              <div className="md:col-span-2 flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 bg-[var(--beige-50)] border-b border-[var(--beige-300)]">
                      <h3 className="font-bold text-[var(--brown-800)]">
                        {getOtherParticipantName(selectedConversation)}
                      </h3>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => {
                        const isSent = message.senderId === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${isSent ? 'order-2' : 'order-1'}`}>
                              <div
                                className={`rounded-lg p-3 ${
                                  isSent
                                    ? 'bg-[var(--accent)] text-white'
                                    : 'bg-[var(--beige-100)] text-[var(--brown-800)]'
                                }`}
                              >
                                <p className="text-sm">{message.message}</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-1 px-1">
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--beige-300)]">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 border border-[var(--beige-300)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim()}
                          className="bg-[var(--accent)] text-white px-6 py-2 rounded-lg hover:bg-[var(--brown-600)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Send
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p>Select a conversation to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
