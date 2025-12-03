'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import {
  getCustomerLoyaltyPoints,
  getPointTransactions,
  getActiveRewards,
  getRedeemedRewards,
  initializeCustomerLoyalty,
  redeemReward,
  getLoyaltyConfig,
  initializeLoyaltyProgram
} from '@/utils/loyalty';
import { LoyaltyPoints, PointTransaction, Reward, RedeemedReward, MemberTier } from '@/types/loyalty';

export default function RewardsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loyalty, setLoyalty] = useState<LoyaltyPoints | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([]);
  const [redeemedRewards, setRedeemedRewards] = useState<RedeemedReward[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'earn' | 'redeem' | 'history'>('overview');
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redeemMessage, setRedeemMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    // Initialize loyalty program
    initializeLoyaltyProgram();

    // Load or initialize customer loyalty
    let customerLoyalty = getCustomerLoyaltyPoints(user.email);
    if (!customerLoyalty) {
      customerLoyalty = initializeCustomerLoyalty(user.id, user.email, `${user.firstName} ${user.lastName}`);
    }
    setLoyalty(customerLoyalty);

    // Load transactions and rewards
    loadData();
  }, [isAuthenticated, user, router]);

  const loadData = () => {
    if (!user) return;
    
    const txns = getPointTransactions(user.email);
    setTransactions(txns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

    const customerLoyalty = getCustomerLoyaltyPoints(user.email);
    if (customerLoyalty) {
      const rewards = getActiveRewards(customerLoyalty.tier);
      setAvailableRewards(rewards);
    }

    const redeemed = getRedeemedRewards(user.email);
    setRedeemedRewards(redeemed.sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime()));
  };

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward);
    setShowRedeemModal(true);
    setRedeemMessage(null);
  };

  const confirmRedeem = () => {
    if (!selectedReward || !user || !loyalty) return;

    const result = redeemReward(selectedReward.id, user.id, user.email);
    
    if (result.success) {
      setRedeemMessage({ type: 'success', text: result.message });
      loadData();
      const updatedLoyalty = getCustomerLoyaltyPoints(user.email);
      setLoyalty(updatedLoyalty);
      
      setTimeout(() => {
        setShowRedeemModal(false);
        setSelectedReward(null);
        setRedeemMessage(null);
      }, 2000);
    } else {
      setRedeemMessage({ type: 'error', text: result.message });
    }
  };

  const getTierColor = (tier: MemberTier) => {
    const colors = {
      bronze: 'from-orange-400 to-orange-600',
      silver: 'from-gray-300 to-gray-500',
      gold: 'from-yellow-400 to-yellow-600',
      platinum: 'from-purple-400 to-purple-600'
    };
    return colors[tier];
  };

  const getTierBadge = (tier: MemberTier) => {
    const badges = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎'
    };
    return badges[tier];
  };

  const getNextTier = (): { tier: string; threshold: number; progress: number } | null => {
    if (!loyalty) return null;
    const config = getLoyaltyConfig();
    
    if (loyalty.tier === 'bronze') {
      return {
        tier: 'Silver',
        threshold: config.tierThresholds.silver,
        progress: (loyalty.lifetimeSpend / config.tierThresholds.silver) * 100
      };
    } else if (loyalty.tier === 'silver') {
      return {
        tier: 'Gold',
        threshold: config.tierThresholds.gold,
        progress: (loyalty.lifetimeSpend / config.tierThresholds.gold) * 100
      };
    } else if (loyalty.tier === 'gold') {
      return {
        tier: 'Platinum',
        threshold: config.tierThresholds.platinum,
        progress: (loyalty.lifetimeSpend / config.tierThresholds.platinum) * 100
      };
    }
    return null;
  };

  if (!user || !loyalty) return null;

  const config = getLoyaltyConfig();
  const nextTier = getNextTier();

  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      <Header />
      <main className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[var(--brown-800)] mb-8">Rewards & Loyalty</h1>

          {/* Points Overview Card */}
          <div className={`bg-gradient-to-br ${getTierColor(loyalty.tier)} text-white rounded-2xl p-8 mb-8 shadow-xl`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-4xl">{getTierBadge(loyalty.tier)}</span>
                  <span className="text-2xl font-bold capitalize">{loyalty.tier} Member</span>
                </div>
                <p className="text-white/90 text-sm">
                  {config.tierBenefits[loyalty.tier].description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold">{loyalty.currentBalance.toLocaleString()}</div>
                <div className="text-white/90 text-sm">Available Points</div>
              </div>
            </div>

            {/* Progress to Next Tier */}
            {nextTier && (
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Progress to {nextTier.tier}</span>
                  <span className="text-sm">
                    KSH {loyalty.lifetimeSpend.toLocaleString()} / {nextTier.threshold.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-white h-full transition-all duration-500"
                    style={{ width: `${Math.min(nextTier.progress, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Referral Code */}
            <div className="mt-6 bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold mb-1">Your Referral Code</p>
                  <p className="text-2xl font-mono font-bold tracking-wider">{loyalty.referralCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Successful Referrals</p>
                  <p className="text-3xl font-bold">{loyalty.referralCount}</p>
                </div>
              </div>
              <p className="text-xs text-white/80 mt-2">
                Share your code and earn {config.referralPointsReferrer} points for each friend who signs up!
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg border border-[var(--beige-300)] mb-6">
            <div className="flex border-b border-[var(--beige-300)] overflow-x-auto">
              {(['overview', 'earn', 'redeem', 'history'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                    selectedTab === tab
                      ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                      : 'text-gray-600 hover:text-[var(--brown-800)]'
                  }`}
                >
                  {tab === 'overview' && '📊 Overview'}
                  {tab === 'earn' && '💰 Earn Points'}
                  {tab === 'redeem' && '🎁 Redeem Rewards'}
                  {tab === 'history' && '📜 History'}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {selectedTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                      <div className="text-blue-600 text-sm font-semibold mb-2">Total Earned</div>
                      <div className="text-3xl font-bold text-blue-900">{loyalty.totalPointsEarned.toLocaleString()}</div>
                      <div className="text-xs text-blue-700 mt-1">All-time points earned</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                      <div className="text-green-600 text-sm font-semibold mb-2">Available</div>
                      <div className="text-3xl font-bold text-green-900">{loyalty.currentBalance.toLocaleString()}</div>
                      <div className="text-xs text-green-700 mt-1">Ready to redeem</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                      <div className="text-purple-600 text-sm font-semibold mb-2">Redeemed</div>
                      <div className="text-3xl font-bold text-purple-900">{loyalty.totalPointsRedeemed.toLocaleString()}</div>
                      <div className="text-xs text-purple-700 mt-1">Points used for rewards</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[var(--brown-800)] mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {transactions.slice(0, 5).map(txn => (
                        <div key={txn.id} className="flex items-center justify-between p-4 bg-[var(--beige-50)] rounded-lg border border-[var(--beige-300)]">
                          <div className="flex-1">
                            <p className="font-semibold text-[var(--brown-800)]">{txn.description}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {new Date(txn.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className={`text-xl font-bold ${txn.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {txn.points > 0 ? '+' : ''}{txn.points}
                          </div>
                        </div>
                      ))}
                      {transactions.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No activity yet. Start earning points!</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Earn Points Tab */}
              {selectedTab === 'earn' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[var(--brown-800)] mb-4">Ways to Earn Points</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-300">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">🛍️</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-green-900 mb-2">Make Purchases</h4>
                          <p className="text-sm text-green-800 mb-2">
                            Earn {config.pointsPerKSH} point for every KSH {1 / config.pointsPerKSH} spent
                          </p>
                          <p className="text-xs text-green-700 bg-green-200/50 rounded px-2 py-1 inline-block">
                            {config.tierBenefits[loyalty.tier].pointsMultiplier}x multiplier as {loyalty.tier} member
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-300">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">⭐</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-blue-900 mb-2">Write Reviews</h4>
                          <p className="text-sm text-blue-800 mb-2">
                            Earn {config.reviewPoints} points for each product review
                          </p>
                          <p className="text-xs text-blue-700">
                            Help other shoppers and get rewarded!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-300">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">👥</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-purple-900 mb-2">Refer Friends</h4>
                          <p className="text-sm text-purple-800 mb-2">
                            Earn {config.referralPointsReferrer} points for each successful referral
                          </p>
                          <p className="text-xs text-purple-700 mb-2">
                            Your referral code: <span className="font-mono font-bold">{loyalty.referralCode}</span>
                          </p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(loyalty.referralCode);
                              alert('Referral code copied!');
                            }}
                            className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                          >
                            Copy Code
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border-2 border-yellow-300">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">🎂</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-yellow-900 mb-2">Birthday Bonus</h4>
                          <p className="text-sm text-yellow-800 mb-2">
                            Receive {config.birthdayBonusPoints} points on your birthday
                          </p>
                          <p className="text-xs text-yellow-700">
                            Make sure your birthday is set in your profile!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Redeem Tab */}
              {selectedTab === 'redeem' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[var(--brown-800)]">Available Rewards</h3>
                    <div className="text-sm text-gray-600">
                      Your balance: <span className="font-bold text-[var(--accent)]">{loyalty.currentBalance}</span> points
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableRewards.map(reward => {
                      const canRedeem = loyalty.currentBalance >= reward.pointCost;
                      const isOutOfStock = reward.stockLimit !== undefined && 
                                          reward.stockRemaining !== undefined && 
                                          reward.stockRemaining <= 0;

                      return (
                        <div key={reward.id} className={`bg-white rounded-lg border-2 p-6 ${canRedeem && !isOutOfStock ? 'border-[var(--accent)]' : 'border-gray-300'}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="text-3xl">
                              {reward.type === 'discount_percentage' && '💸'}
                              {reward.type === 'discount_fixed' && '💰'}
                              {reward.type === 'free_shipping' && '📦'}
                              {reward.type === 'gift_product' && '🎁'}
                            </div>
                            {reward.minTier && (
                              <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-semibold">
                                {reward.minTier.toUpperCase()}+
                              </div>
                            )}
                          </div>

                          <h4 className="font-bold text-[var(--brown-800)] mb-2">{reward.name}</h4>
                          <p className="text-sm text-gray-600 mb-4">{reward.description}</p>

                          <div className="flex items-center justify-between mb-4">
                            <div className="text-2xl font-bold text-[var(--accent)]">
                              {reward.pointCost.toLocaleString()} pts
                            </div>
                            {reward.stockRemaining !== undefined && (
                              <div className="text-xs text-gray-500">
                                {reward.stockRemaining} left
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleRedeemClick(reward)}
                            disabled={!canRedeem || isOutOfStock}
                            className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                              canRedeem && !isOutOfStock
                                ? 'bg-[var(--accent)] text-white hover:bg-[var(--brown-600)]'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {isOutOfStock ? 'Out of Stock' : canRedeem ? 'Redeem Now' : 'Not Enough Points'}
                          </button>

                          {reward.terms && (
                            <p className="text-xs text-gray-500 mt-3">{reward.terms}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {availableRewards.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-600">No rewards available at the moment. Check back soon!</p>
                    </div>
                  )}
                </div>
              )}

              {/* History Tab */}
              {selectedTab === 'history' && (
                <div className="space-y-6">
                  {/* Redeemed Rewards */}
                  <div>
                    <h3 className="text-lg font-bold text-[var(--brown-800)] mb-4">Redeemed Rewards</h3>
                    <div className="space-y-3">
                      {redeemedRewards.map(redeemed => (
                        <div key={redeemed.id} className="bg-[var(--beige-50)] rounded-lg p-4 border border-[var(--beige-300)]">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-bold text-[var(--brown-800)]">{redeemed.rewardName}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Redeemed on {new Date(redeemed.redeemedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              redeemed.status === 'active' ? 'bg-green-100 text-green-800' :
                              redeemed.status === 'used' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {redeemed.status.toUpperCase()}
                            </div>
                          </div>

                          <div className="bg-white rounded p-3 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-600">Redemption Code:</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(redeemed.code);
                                  alert('Code copied!');
                                }}
                                className="text-xs text-[var(--accent)] hover:underline"
                              >
                                Copy
                              </button>
                            </div>
                            <p className="font-mono font-bold text-lg text-center">{redeemed.code}</p>
                          </div>

                          <div className="flex items-center justify-between mt-3 text-sm">
                            <span className="text-gray-600">Points Spent: <span className="font-bold">{redeemed.pointsSpent}</span></span>
                            <span className="text-gray-600">
                              Expires: {new Date(redeemed.expiresAt).toLocaleDateString()}
                            </span>
                          </div>

                          {redeemed.usedAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              Used on {new Date(redeemed.usedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                      {redeemedRewards.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No redeemed rewards yet</p>
                      )}
                    </div>
                  </div>

                  {/* All Transactions */}
                  <div>
                    <h3 className="text-lg font-bold text-[var(--brown-800)] mb-4">All Transactions</h3>
                    <div className="space-y-2">
                      {transactions.map(txn => (
                        <div key={txn.id} className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[var(--brown-800)]">{txn.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(txn.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className={`font-bold ${txn.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {txn.points > 0 ? '+' : ''}{txn.points}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Redeem Confirmation Modal */}
      {showRedeemModal && selectedReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[var(--brown-800)] mb-4">Confirm Redemption</h2>
            
            <div className="bg-[var(--beige-50)] rounded-lg p-4 mb-4">
              <h3 className="font-bold text-[var(--brown-800)] mb-2">{selectedReward.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{selectedReward.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Point Cost:</span>
                <span className="text-xl font-bold text-[var(--accent)]">{selectedReward.pointCost.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-300">
                <span className="text-sm text-gray-700">New Balance:</span>
                <span className="text-xl font-bold text-green-600">
                  {(loyalty.currentBalance - selectedReward.pointCost).toLocaleString()}
                </span>
              </div>
            </div>

            {redeemMessage && (
              <div className={`mb-4 p-3 rounded-lg ${
                redeemMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {redeemMessage.text}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={confirmRedeem}
                disabled={redeemMessage?.type === 'success'}
                className="flex-1 bg-[var(--accent)] text-white px-6 py-3 rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold disabled:bg-gray-400"
              >
                {redeemMessage?.type === 'success' ? 'Redeemed!' : 'Confirm Redemption'}
              </button>
              <button
                onClick={() => {
                  setShowRedeemModal(false);
                  setSelectedReward(null);
                  setRedeemMessage(null);
                }}
                disabled={redeemMessage?.type === 'success'}
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
