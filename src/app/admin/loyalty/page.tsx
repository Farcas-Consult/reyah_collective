'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import {
  getLoyaltyConfig,
  updateLoyaltyConfig,
  getAllRewards,
  createReward,
  updateReward,
  deleteReward,
  getAllLoyaltyPoints,
  getPointTransactions
} from '@/utils/loyalty';
import { LoyaltyConfig, Reward, LoyaltyPoints, RewardType } from '@/types/loyalty';

export default function AdminLoyaltyPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'config' | 'rewards' | 'members' | 'transactions'>('config');
  const [config, setConfig] = useState<LoyaltyConfig | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [allMembers, setAllMembers] = useState<LoyaltyPoints[]>([]);
  const [membersByTier, setMembersByTier] = useState<{
    bronze: LoyaltyPoints[];
    silver: LoyaltyPoints[];
    gold: LoyaltyPoints[];
    platinum: LoyaltyPoints[];
  }>({ bronze: [], silver: [], gold: [], platinum: [] });
  
  // Config form state
  const [editingConfig, setEditingConfig] = useState(false);
  const [configForm, setConfigForm] = useState<LoyaltyConfig | null>(null);
  
  // Reward form state
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    type: 'discount_percentage' as RewardType,
    pointCost: 0,
    value: 0,
    active: true,
    stockLimit: 0,
    expiryDays: 30
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!user?.isAdmin) {
      router.push('/');
      return;
    }

    loadData();
  }, [isAuthenticated, user, router]);

  const loadData = () => {
    const loyaltyConfig = getLoyaltyConfig();
    setConfig(loyaltyConfig);
    setConfigForm(loyaltyConfig);
    
    const allRewards = getAllRewards();
    setRewards(allRewards);
    
    const allTransactions = getPointTransactions();
    setTransactions(allTransactions.slice(0, 50)); // Last 50
    
    const members = getAllLoyaltyPoints();
    setAllMembers(members);
    
    // Group members by tier
    const byTier = {
      bronze: members.filter(m => m.tier === 'bronze'),
      silver: members.filter(m => m.tier === 'silver'),
      gold: members.filter(m => m.tier === 'gold'),
      platinum: members.filter(m => m.tier === 'platinum')
    };
    setMembersByTier(byTier);
  };

  const handleSaveConfig = () => {
    if (!configForm) return;
    updateLoyaltyConfig(configForm);
    setConfig(configForm);
    setEditingConfig(false);
    alert('Loyalty configuration updated successfully!');
  };

  const handleRewardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingReward) {
      updateReward(editingReward.id, rewardForm);
    } else {
      createReward(rewardForm);
    }
    
    setShowRewardForm(false);
    setEditingReward(null);
    setRewardForm({
      name: '',
      description: '',
      type: 'discount_percentage',
      pointCost: 0,
      value: 0,
      active: true,
      stockLimit: 0,
      expiryDays: 30
    });
    loadData();
  };

  const handleEditReward = (reward: Reward) => {
    setEditingReward(reward);
    setRewardForm({
      name: reward.name,
      description: reward.description,
      type: reward.type,
      pointCost: reward.pointCost,
      value: reward.value,
      active: reward.active,
      stockLimit: reward.stockLimit || 0,
      expiryDays: reward.expiryDays || 30
    });
    setShowRewardForm(true);
  };

  const handleDeleteReward = (rewardId: string) => {
    if (confirm('Delete this reward? This cannot be undone.')) {
      deleteReward(rewardId);
      loadData();
    }
  };

  const handleToggleRewardStatus = (reward: Reward) => {
    updateReward(reward.id, { active: !reward.active });
    loadData();
  };

  if (!user || !user.isAdmin) {
    return null;
  }

  const stats = {
    totalMembers: allMembers.length,
    activeRewards: rewards.filter(r => r.active).length,
    totalPointsIssued: transactions
      .filter(t => t.type === 'earn')
      .reduce((sum, t) => sum + t.points, 0),
    totalPointsRedeemed: transactions
      .filter(t => t.type === 'redeem')
      .reduce((sum, t) => sum + Math.abs(t.points), 0)
  };

  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      <Header />
      <main className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[var(--brown-800)] mb-2">Loyalty Program Management</h1>
              <p className="text-gray-600">Configure earning rules, manage rewards, and track member engagement</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
              <p className="text-sm text-gray-600 mb-1">Total Members</p>
              <p className="text-3xl font-bold text-[var(--brown-800)]">{stats.totalMembers}</p>
            </div>
            <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
              <p className="text-sm text-gray-600 mb-1">Active Rewards</p>
              <p className="text-3xl font-bold text-[var(--accent)]">{stats.activeRewards}</p>
            </div>
            <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
              <p className="text-sm text-gray-600 mb-1">Points Issued</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalPointsIssued.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
              <p className="text-sm text-gray-600 mb-1">Points Redeemed</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalPointsRedeemed.toLocaleString()}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {[
              { id: 'config', label: 'Earning Rules' },
              { id: 'rewards', label: 'Rewards Catalog' },
              { id: 'members', label: 'Members' },
              { id: 'transactions', label: 'Transactions' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-[var(--beige-300)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Config Tab */}
          {activeTab === 'config' && config && (
            <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[var(--brown-800)]">Points Earning Rules</h2>
                {!editingConfig ? (
                  <button
                    onClick={() => setEditingConfig(true)}
                    className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold"
                  >
                    Edit Rules
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveConfig}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditingConfig(false);
                        setConfigForm(config);
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Purchase Points */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">💰</span>
                    Purchase Points
                  </h3>
                  {editingConfig ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Points per KSH Spent
                        </label>
                        <input
                          type="number"
                          value={configForm?.pointsPerKSH || 1}
                          onChange={(e) => setConfigForm(prev => prev ? {...prev, pointsPerKSH: parseInt(e.target.value)} : prev)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Points Expiration (months)
                        </label>
                        <input
                          type="number"
                          value={configForm?.pointExpirationMonths || 12}
                          onChange={(e) => setConfigForm(prev => prev ? {...prev, pointExpirationMonths: parseInt(e.target.value)} : prev)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          min="0"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700">Earn <span className="font-bold text-blue-600">{config.pointsPerKSH} point</span> per KSH spent</p>
                      {config.pointExpirationMonths > 0 && (
                        <p className="text-gray-600">Points expire after {config.pointExpirationMonths} months</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Review Points */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">⭐</span>
                    Product Reviews
                  </h3>
                  {editingConfig ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Points per Review
                      </label>
                      <input
                        type="number"
                        value={configForm?.reviewPoints || 0}
                        onChange={(e) => setConfigForm(prev => prev ? {...prev, reviewPoints: parseInt(e.target.value)} : prev)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        min="0"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700">Earn <span className="font-bold text-yellow-600">{config.reviewPoints} points</span> for each product review</p>
                  )}
                </div>

                {/* Referral Points */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">👥</span>
                    Referrals
                  </h3>
                  {editingConfig ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Points per Referral
                      </label>
                      <input
                        type="number"
                        value={configForm?.referralPointsReferrer || 0}
                        onChange={(e) => setConfigForm(prev => prev ? {...prev, referralPointsReferrer: parseInt(e.target.value)} : prev)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        min="0"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700">Earn <span className="font-bold text-green-600">{config.referralPointsReferrer} points</span> when referral makes first purchase</p>
                  )}
                </div>

                {/* Birthday Bonus */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">🎂</span>
                    Birthday Bonus
                  </h3>
                  {editingConfig ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Birthday Points
                      </label>
                      <input
                        type="number"
                        value={configForm?.birthdayBonusPoints || 0}
                        onChange={(e) => setConfigForm(prev => prev ? {...prev, birthdayBonusPoints: parseInt(e.target.value)} : prev)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        min="0"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700">Earn <span className="font-bold text-pink-600">{config.birthdayBonusPoints} points</span> on your birthday</p>
                  )}
                </div>
              </div>

              {/* Tier Thresholds */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Membership Tiers</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Object.entries(config.tierThresholds).map(([tier, threshold]) => (
                    <div key={tier} className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 capitalize">{tier}</h4>
                      {editingConfig && configForm ? (
                        <input
                          type="number"
                          value={configForm.tierThresholds[tier as keyof typeof configForm.tierThresholds]}
                          onChange={(e) => setConfigForm(prev => prev ? {
                            ...prev,
                            tierThresholds: {
                              ...prev.tierThresholds,
                              [tier]: parseInt(e.target.value)
                            }
                          } : prev)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          min="0"
                        />
                      ) : (
                        <p className="text-2xl font-bold text-[var(--accent)]">{threshold}+ pts</p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">{membersByTier[tier as keyof typeof membersByTier].length} members</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
            <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[var(--brown-800)]">Rewards Catalog</h2>
                <button
                  onClick={() => setShowRewardForm(true)}
                  className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Reward
                </button>
              </div>

              {/* Reward Form Modal */}
              {showRewardForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {editingReward ? 'Edit Reward' : 'Create New Reward'}
                    </h3>
                    <form onSubmit={handleRewardSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Reward Name *</label>
                          <input
                            type="text"
                            value={rewardForm.name}
                            onChange={(e) => setRewardForm({...rewardForm, name: e.target.value})}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Type *</label>
                          <select
                            value={rewardForm.type}
                            onChange={(e) => setRewardForm({...rewardForm, type: e.target.value as RewardType})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          >
                            <option value="discount_percentage">Discount Percentage</option>
                            <option value="discount_fixed">Discount Fixed Amount</option>
                            <option value="free_shipping">Free Shipping</option>
                            <option value="gift_product">Gift Product</option>
                            <option value="exclusive_access">Exclusive Access</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Points Cost *</label>
                          <input
                            type="number"
                            value={rewardForm.pointCost}
                            onChange={(e) => setRewardForm({...rewardForm, pointCost: parseInt(e.target.value)})}
                            required
                            min="1"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Value ({rewardForm.type === 'discount_percentage' ? '%' : 'KSH'}) *
                          </label>
                          <input
                            type="number"
                            value={rewardForm.value}
                            onChange={(e) => setRewardForm({...rewardForm, value: parseInt(e.target.value)})}
                            required
                            min="1"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Limit (0 = unlimited)</label>
                          <input
                            type="number"
                            value={rewardForm.stockLimit}
                            onChange={(e) => setRewardForm({...rewardForm, stockLimit: parseInt(e.target.value)})}
                            min="0"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry (days)</label>
                          <input
                            type="number"
                            value={rewardForm.expiryDays}
                            onChange={(e) => setRewardForm({...rewardForm, expiryDays: parseInt(e.target.value)})}
                            min="1"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                        <textarea
                          value={rewardForm.description}
                          onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})}
                          required
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="active"
                          checked={rewardForm.active}
                          onChange={(e) => setRewardForm({...rewardForm, active: e.target.checked})}
                        />
                        <label htmlFor="active" className="text-sm font-medium text-gray-700">Active</label>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          className="flex-1 bg-[var(--accent)] text-white px-6 py-3 rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold"
                        >
                          {editingReward ? 'Update Reward' : 'Create Reward'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowRewardForm(false);
                            setEditingReward(null);
                            setRewardForm({
                              name: '',
                              description: '',
                              type: 'discount_percentage',
                              pointCost: 0,
                              value: 0,
                              active: true,
                              stockLimit: 0,
                              expiryDays: 30
                            });
                          }}
                          className="flex-1 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Rewards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map(reward => (
                  <div key={reward.id} className={`border rounded-lg p-4 ${reward.active ? 'border-gray-300' : 'border-red-300 bg-red-50'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{reward.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                      </div>
                      <button
                        onClick={() => handleToggleRewardStatus(reward)}
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          reward.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {reward.active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Cost:</span>
                        <span className="font-bold text-[var(--accent)]">{reward.pointCost} pts</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Value:</span>
                        <span className="font-semibold">
                          {reward.type === 'discount_percentage' ? `${reward.value}% off` : 
                           reward.type === 'discount_fixed' ? `KSH ${reward.value} off` :
                           reward.type === 'free_shipping' ? 'Free Shipping' :
                           `Value: ${reward.value}`}
                        </span>
                      </div>
                      {reward.stockLimit !== undefined && reward.stockLimit > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Stock:</span>
                          <span className="font-semibold">{reward.stockRemaining || 0} / {reward.stockLimit}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditReward(reward)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
              <h2 className="text-2xl font-bold text-[var(--brown-800)] mb-6">Loyalty Members by Tier</h2>
              <div className="space-y-6">
                {Object.entries(membersByTier).map(([tier, tierMembers]) => (
                  <div key={tier}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 capitalize flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${
                        tier === 'platinum' ? 'bg-purple-500' :
                        tier === 'gold' ? 'bg-yellow-500' :
                        tier === 'silver' ? 'bg-gray-400' : 'bg-orange-700'
                      }`}></span>
                      {tier} ({tierMembers.length} members)
                    </h3>
                    {tierMembers.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left p-3 font-semibold">Member</th>
                              <th className="text-left p-3 font-semibold">Points</th>
                              <th className="text-left p-3 font-semibold">Lifetime Earned</th>
                              <th className="text-left p-3 font-semibold">Total Redeemed</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tierMembers.slice(0, 5).map((member: LoyaltyPoints) => (
                              <tr key={member.customerEmail} className="border-t border-gray-200">
                                <td className="p-3">{member.customerEmail}</td>
                                <td className="p-3 font-semibold text-[var(--accent)]">{member.currentBalance.toLocaleString()}</td>
                                <td className="p-3">{member.totalPointsEarned.toLocaleString()}</td>
                                <td className="p-3">{member.totalPointsRedeemed.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm">No members in this tier yet</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
              <h2 className="text-2xl font-bold text-[var(--brown-800)] mb-6">Recent Transactions (Last 50)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-semibold">Date</th>
                      <th className="text-left p-3 font-semibold">Customer</th>
                      <th className="text-left p-3 font-semibold">Type</th>
                      <th className="text-left p-3 font-semibold">Points</th>
                      <th className="text-left p-3 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx.id} className="border-t border-gray-200">
                        <td className="p-3">{new Date(tx.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">{tx.customerEmail}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            tx.points > 0 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {tx.points > 0 ? 'Earned' : 'Redeemed'}
                          </span>
                        </td>
                        <td className={`p-3 font-semibold ${tx.points > 0 ? 'text-green-600' : 'text-blue-600'}`}>
                          {tx.points > 0 ? '+' : ''}{tx.points}
                        </td>
                        <td className="p-3 text-gray-600">{tx.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
