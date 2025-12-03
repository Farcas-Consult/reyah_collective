import {
  PointTransaction,
  LoyaltyPoints,
  Reward,
  RedeemedReward,
  EarningRule,
  LoyaltyConfig,
  LoyaltyStats,
  PointTransactionType,
  MemberTier,
  RewardType
} from '@/types/loyalty';

// LocalStorage keys
const LOYALTY_POINTS_KEY = 'reyah_loyalty_points';
const POINT_TRANSACTIONS_KEY = 'reyah_point_transactions';
const REWARDS_KEY = 'reyah_rewards';
const REDEEMED_REWARDS_KEY = 'reyah_redeemed_rewards';
const EARNING_RULES_KEY = 'reyah_earning_rules';
const LOYALTY_CONFIG_KEY = 'reyah_loyalty_config';

// Default loyalty configuration
const DEFAULT_CONFIG: LoyaltyConfig = {
  programActive: true,
  pointsPerKSH: 1, // 1 point per 1 KSH spent
  reviewPoints: 50,
  referralPointsReferrer: 200,
  referralPointsReferee: 100,
  signupBonusPoints: 100,
  birthdayBonusPoints: 150,
  pointExpirationMonths: 12,
  tierThresholds: {
    bronze: 0,
    silver: 50000,
    gold: 150000,
    platinum: 300000
  },
  tierBenefits: {
    bronze: { pointsMultiplier: 1.0, description: 'Standard point earning' },
    silver: { pointsMultiplier: 1.25, description: '25% bonus points on all purchases' },
    gold: { pointsMultiplier: 1.5, description: '50% bonus points + exclusive rewards' },
    platinum: { pointsMultiplier: 2.0, description: 'Double points + VIP perks' }
  }
};

// ============= CONFIG MANAGEMENT =============

export function getLoyaltyConfig(): LoyaltyConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  const config = localStorage.getItem(LOYALTY_CONFIG_KEY);
  return config ? JSON.parse(config) : DEFAULT_CONFIG;
}

export function updateLoyaltyConfig(config: Partial<LoyaltyConfig>): void {
  const currentConfig = getLoyaltyConfig();
  const updatedConfig = { ...currentConfig, ...config };
  localStorage.setItem(LOYALTY_CONFIG_KEY, JSON.stringify(updatedConfig));
}

// ============= CUSTOMER LOYALTY POINTS =============

export function getCustomerLoyaltyPoints(email: string): LoyaltyPoints | null {
  if (typeof window === 'undefined') return null;
  const allPoints = JSON.parse(localStorage.getItem(LOYALTY_POINTS_KEY) || '[]');
  return allPoints.find((lp: LoyaltyPoints) => lp.customerEmail === email) || null;
}

export function getAllLoyaltyPoints(): LoyaltyPoints[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(LOYALTY_POINTS_KEY) || '[]');
}

export function initializeCustomerLoyalty(customerId: string, customerEmail: string, customerName: string): LoyaltyPoints {
  const existing = getCustomerLoyaltyPoints(customerEmail);
  if (existing) return existing;

  const config = getLoyaltyConfig();
  const referralCode = generateReferralCode(customerEmail);

  const newLoyalty: LoyaltyPoints = {
    customerId,
    customerEmail,
    totalPointsEarned: 0,
    totalPointsRedeemed: 0,
    currentBalance: 0,
    tier: 'bronze',
    lifetimeSpend: 0,
    referralCode,
    referralCount: 0,
    joinedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString()
  };

  const allPoints = getAllLoyaltyPoints();
  allPoints.push(newLoyalty);
  localStorage.setItem(LOYALTY_POINTS_KEY, JSON.stringify(allPoints));

  // Award signup bonus
  if (config.signupBonusPoints > 0) {
    awardPoints(
      customerId,
      customerEmail,
      customerName,
      config.signupBonusPoints,
      'signup_bonus',
      'Welcome bonus for joining our loyalty program!'
    );
  }

  return newLoyalty;
}

function generateReferralCode(email: string): string {
  const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `REF${hash}${Date.now().toString().slice(-6)}`.toUpperCase();
}

function calculateTier(lifetimeSpend: number): MemberTier {
  const config = getLoyaltyConfig();
  if (lifetimeSpend >= config.tierThresholds.platinum) return 'platinum';
  if (lifetimeSpend >= config.tierThresholds.gold) return 'gold';
  if (lifetimeSpend >= config.tierThresholds.silver) return 'silver';
  return 'bronze';
}

function updateCustomerLoyalty(loyalty: LoyaltyPoints): void {
  const allPoints = getAllLoyaltyPoints();
  const index = allPoints.findIndex(lp => lp.customerEmail === loyalty.customerEmail);
  if (index !== -1) {
    allPoints[index] = { ...loyalty, lastActivityAt: new Date().toISOString() };
    localStorage.setItem(LOYALTY_POINTS_KEY, JSON.stringify(allPoints));
  }
}

// ============= POINT TRANSACTIONS =============

export function getPointTransactions(email?: string): PointTransaction[] {
  if (typeof window === 'undefined') return [];
  const transactions = JSON.parse(localStorage.getItem(POINT_TRANSACTIONS_KEY) || '[]');
  if (email) {
    return transactions.filter((t: PointTransaction) => t.customerEmail === email);
  }
  return transactions;
}

function addPointTransaction(transaction: PointTransaction): void {
  const transactions = getPointTransactions();
  transactions.push(transaction);
  localStorage.setItem(POINT_TRANSACTIONS_KEY, JSON.stringify(transactions));
}

export function awardPoints(
  customerId: string,
  customerEmail: string,
  customerName: string,
  points: number,
  type: PointTransactionType,
  description: string,
  referenceId?: string
): PointTransaction {
  // Get or initialize customer loyalty
  let loyalty = getCustomerLoyaltyPoints(customerEmail);
  if (!loyalty) {
    loyalty = initializeCustomerLoyalty(customerId, customerEmail, customerName);
  }

  const config = getLoyaltyConfig();
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + config.pointExpirationMonths);

  const transaction: PointTransaction = {
    id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    customerId,
    customerEmail,
    customerName,
    type,
    points,
    description,
    referenceId,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString()
  };

  addPointTransaction(transaction);

  // Update loyalty points
  loyalty.totalPointsEarned += points;
  loyalty.currentBalance += points;
  updateCustomerLoyalty(loyalty);

  return transaction;
}

export function awardPurchasePoints(
  customerId: string,
  customerEmail: string,
  customerName: string,
  orderTotal: number,
  orderId: string
): PointTransaction | null {
  const config = getLoyaltyConfig();
  if (!config.programActive) return null;

  const loyalty = getCustomerLoyaltyPoints(customerEmail);
  if (!loyalty) return null;

  // Calculate base points
  const basePoints = Math.floor(orderTotal * config.pointsPerKSH);
  
  // Apply tier multiplier
  const tierMultiplier = config.tierBenefits[loyalty.tier].pointsMultiplier;
  const finalPoints = Math.floor(basePoints * tierMultiplier);

  if (finalPoints <= 0) return null;

  const description = `Earned ${finalPoints} points from order #${orderId.slice(-6)} (${tierMultiplier}x ${loyalty.tier} tier bonus)`;

  // Update lifetime spend
  loyalty.lifetimeSpend += orderTotal;
  const newTier = calculateTier(loyalty.lifetimeSpend);
  if (newTier !== loyalty.tier) {
    loyalty.tier = newTier;
    // Could trigger tier upgrade notification here
  }
  updateCustomerLoyalty(loyalty);

  return awardPoints(customerId, customerEmail, customerName, finalPoints, 'purchase', description, orderId);
}

export function awardReviewPoints(
  customerId: string,
  customerEmail: string,
  customerName: string,
  reviewId: string,
  productName: string
): PointTransaction | null {
  const config = getLoyaltyConfig();
  if (!config.programActive || config.reviewPoints <= 0) return null;

  const description = `Earned ${config.reviewPoints} points for reviewing "${productName}"`;
  return awardPoints(customerId, customerEmail, customerName, config.reviewPoints, 'review', description, reviewId);
}

export function awardReferralPoints(
  referrerEmail: string,
  refereeEmail: string,
  refereeName: string
): { referrerTransaction: PointTransaction | null; refereeTransaction: PointTransaction | null } {
  const config = getLoyaltyConfig();
  if (!config.programActive) return { referrerTransaction: null, refereeTransaction: null };

  const referrer = getCustomerLoyaltyPoints(referrerEmail);
  if (!referrer) return { referrerTransaction: null, refereeTransaction: null };

  // Award points to referrer
  let referrerTransaction: PointTransaction | null = null;
  if (config.referralPointsReferrer > 0) {
    referrerTransaction = awardPoints(
      referrer.customerId,
      referrerEmail,
      `Referrer`,
      config.referralPointsReferrer,
      'referral',
      `Earned ${config.referralPointsReferrer} points for referring ${refereeName}`,
      refereeEmail
    );
    referrer.referralCount++;
    updateCustomerLoyalty(referrer);
  }

  // Referee points are awarded during signup initialization
  return { referrerTransaction, refereeTransaction: null };
}

// ============= REWARDS CATALOG =============

export function getAllRewards(): Reward[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(REWARDS_KEY) || '[]');
}

export function getActiveRewards(minTier?: MemberTier): Reward[] {
  const rewards = getAllRewards().filter(r => r.active);
  if (minTier) {
    return rewards.filter(r => !r.minTier || getTierLevel(minTier) >= getTierLevel(r.minTier));
  }
  return rewards;
}

function getTierLevel(tier: MemberTier): number {
  const levels = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
  return levels[tier];
}

export function getRewardById(id: string): Reward | null {
  const rewards = getAllRewards();
  return rewards.find(r => r.id === id) || null;
}

export function createReward(reward: Omit<Reward, 'id' | 'createdAt'>): Reward {
  const newReward: Reward = {
    ...reward,
    id: `reward-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };

  const rewards = getAllRewards();
  rewards.push(newReward);
  localStorage.setItem(REWARDS_KEY, JSON.stringify(rewards));
  return newReward;
}

export function updateReward(id: string, updates: Partial<Reward>): Reward | null {
  const rewards = getAllRewards();
  const index = rewards.findIndex(r => r.id === id);
  if (index === -1) return null;

  rewards[index] = {
    ...rewards[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(REWARDS_KEY, JSON.stringify(rewards));
  return rewards[index];
}

export function deleteReward(id: string): boolean {
  const rewards = getAllRewards();
  const filtered = rewards.filter(r => r.id !== id);
  if (filtered.length === rewards.length) return false;
  localStorage.setItem(REWARDS_KEY, JSON.stringify(filtered));
  return true;
}

// ============= REWARD REDEMPTION =============

export function getRedeemedRewards(email?: string): RedeemedReward[] {
  if (typeof window === 'undefined') return [];
  const redeemed = JSON.parse(localStorage.getItem(REDEEMED_REWARDS_KEY) || '[]');
  if (email) {
    return redeemed.filter((r: RedeemedReward) => r.customerEmail === email);
  }
  return redeemed;
}

export function getActiveRedeemedRewards(email: string): RedeemedReward[] {
  return getRedeemedRewards(email).filter(r => r.status === 'active');
}

export function redeemReward(
  rewardId: string,
  customerId: string,
  customerEmail: string
): { success: boolean; message: string; redeemedReward?: RedeemedReward } {
  const reward = getRewardById(rewardId);
  if (!reward) return { success: false, message: 'Reward not found' };
  if (!reward.active) return { success: false, message: 'Reward is no longer active' };

  const loyalty = getCustomerLoyaltyPoints(customerEmail);
  if (!loyalty) return { success: false, message: 'Customer loyalty account not found' };

  // Check points balance
  if (loyalty.currentBalance < reward.pointCost) {
    return { success: false, message: `Insufficient points. You need ${reward.pointCost} points but have ${loyalty.currentBalance}` };
  }

  // Check tier requirement
  if (reward.minTier && getTierLevel(loyalty.tier) < getTierLevel(reward.minTier)) {
    return { success: false, message: `This reward requires ${reward.minTier} tier or higher` };
  }

  // Check stock
  if (reward.stockLimit !== undefined && reward.stockRemaining !== undefined) {
    if (reward.stockRemaining <= 0) {
      return { success: false, message: 'This reward is out of stock' };
    }
  }

  // Generate unique redemption code
  const code = generateRedemptionCode(reward.type, rewardId);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + reward.expiryDays);

  const redeemedReward: RedeemedReward = {
    id: `redeemed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    rewardId,
    rewardName: reward.name,
    rewardType: reward.type,
    rewardValue: reward.value,
    customerId,
    customerEmail,
    pointsSpent: reward.pointCost,
    code,
    redeemedAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'active'
  };

  const allRedeemed = getRedeemedRewards();
  allRedeemed.push(redeemedReward);
  localStorage.setItem(REDEEMED_REWARDS_KEY, JSON.stringify(allRedeemed));

  // Deduct points
  const transaction: PointTransaction = {
    id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    customerId,
    customerEmail,
    customerName: loyalty.customerEmail,
    type: 'redeem_reward',
    points: -reward.pointCost,
    description: `Redeemed ${reward.name}`,
    referenceId: redeemedReward.id,
    createdAt: new Date().toISOString()
  };
  addPointTransaction(transaction);

  loyalty.currentBalance -= reward.pointCost;
  loyalty.totalPointsRedeemed += reward.pointCost;
  updateCustomerLoyalty(loyalty);

  // Update reward stock
  if (reward.stockLimit !== undefined && reward.stockRemaining !== undefined) {
    updateReward(rewardId, { stockRemaining: reward.stockRemaining - 1 });
  }

  return { success: true, message: 'Reward redeemed successfully!', redeemedReward };
}

function generateRedemptionCode(type: RewardType, rewardId: string): string {
  const prefix = type === 'discount_percentage' ? 'DISC' : 
                 type === 'discount_fixed' ? 'SAVE' :
                 type === 'free_shipping' ? 'SHIP' : 'GIFT';
  const random = Math.random().toString(36).substr(2, 8).toUpperCase();
  return `${prefix}${random}`;
}

export function markRewardAsUsed(code: string, orderId: string): boolean {
  const allRedeemed = getRedeemedRewards();
  const index = allRedeemed.findIndex(r => r.code === code && r.status === 'active');
  if (index === -1) return false;

  allRedeemed[index].status = 'used';
  allRedeemed[index].usedAt = new Date().toISOString();
  allRedeemed[index].orderId = orderId;
  localStorage.setItem(REDEEMED_REWARDS_KEY, JSON.stringify(allRedeemed));
  return true;
}

export function validateRewardCode(code: string, customerEmail: string): {
  valid: boolean;
  reward?: RedeemedReward;
  message?: string;
} {
  const redeemed = getRedeemedRewards(customerEmail);
  const reward = redeemed.find(r => r.code === code);

  if (!reward) return { valid: false, message: 'Invalid reward code' };
  if (reward.status === 'used') return { valid: false, message: 'This reward has already been used' };
  if (reward.status === 'expired') return { valid: false, message: 'This reward has expired' };
  if (new Date(reward.expiresAt) < new Date()) {
    // Mark as expired
    const allRedeemed = getRedeemedRewards();
    const index = allRedeemed.findIndex(r => r.code === code);
    if (index !== -1) {
      allRedeemed[index].status = 'expired';
      localStorage.setItem(REDEEMED_REWARDS_KEY, JSON.stringify(allRedeemed));
    }
    return { valid: false, message: 'This reward has expired' };
  }

  return { valid: true, reward };
}

// ============= STATISTICS =============

export function getLoyaltyStats(): LoyaltyStats {
  const allLoyalty = getAllLoyaltyPoints();
  const allTransactions = getPointTransactions();
  const allRewards = getAllRewards();

  const totalPointsIssued = allTransactions
    .filter(t => t.points > 0)
    .reduce((sum, t) => sum + t.points, 0);

  const totalPointsRedeemed = allTransactions
    .filter(t => t.points < 0)
    .reduce((sum, t) => sum + Math.abs(t.points), 0);

  const tierDistribution = {
    bronze: allLoyalty.filter(l => l.tier === 'bronze').length,
    silver: allLoyalty.filter(l => l.tier === 'silver').length,
    gold: allLoyalty.filter(l => l.tier === 'gold').length,
    platinum: allLoyalty.filter(l => l.tier === 'platinum').length
  };

  const topEarners = allLoyalty
    .sort((a, b) => b.currentBalance - a.currentBalance)
    .slice(0, 10)
    .map(l => ({
      customerName: l.customerEmail.split('@')[0],
      customerEmail: l.customerEmail,
      points: l.currentBalance
    }));

  return {
    totalMembers: allLoyalty.length,
    totalPointsIssued,
    totalPointsRedeemed,
    activeRewards: allRewards.filter(r => r.active).length,
    redemptionRate: totalPointsIssued > 0 ? (totalPointsRedeemed / totalPointsIssued) * 100 : 0,
    averagePointBalance: allLoyalty.length > 0 
      ? allLoyalty.reduce((sum, l) => sum + l.currentBalance, 0) / allLoyalty.length 
      : 0,
    tierDistribution,
    topEarners
  };
}

// ============= INITIALIZATION =============

export function initializeLoyaltyProgram(): void {
  // Initialize default rewards if none exist
  const rewards = getAllRewards();
  if (rewards.length === 0) {
    const defaultRewards: Omit<Reward, 'id' | 'createdAt'>[] = [
      {
        name: '10% Off Your Next Purchase',
        description: 'Get 10% discount on your next order (excludes sale items)',
        type: 'discount_percentage',
        pointCost: 500,
        value: 10,
        active: true,
        expiryDays: 30,
        terms: 'Valid for 30 days. Cannot be combined with other offers. Excludes sale items.'
      },
      {
        name: 'KSH 1,000 Off',
        description: 'Save KSH 1,000 on orders over KSH 5,000',
        type: 'discount_fixed',
        pointCost: 800,
        value: 1000,
        active: true,
        expiryDays: 60,
        terms: 'Minimum order value KSH 5,000. Valid for 60 days.'
      },
      {
        name: 'Free Shipping',
        description: 'Free shipping on your next order (any value)',
        type: 'free_shipping',
        pointCost: 300,
        value: 0,
        active: true,
        expiryDays: 45,
        terms: 'Valid for 45 days. Applies to standard shipping only.'
      },
      {
        name: '20% Off - Silver Tier',
        description: 'Get 20% discount on your next order',
        type: 'discount_percentage',
        pointCost: 1000,
        value: 20,
        active: true,
        minTier: 'silver',
        expiryDays: 30,
        terms: 'Silver tier and above. Valid for 30 days.'
      },
      {
        name: 'VIP Gift - Gold Tier',
        description: 'Exclusive artisan gift product',
        type: 'gift_product',
        pointCost: 2000,
        value: 0,
        active: true,
        minTier: 'gold',
        stockLimit: 50,
        stockRemaining: 50,
        expiryDays: 90,
        terms: 'Gold tier and above. Limited stock available.'
      }
    ];

    defaultRewards.forEach(reward => createReward(reward));
  }

  // Ensure config exists
  const config = getLoyaltyConfig();
  if (!config.programActive) {
    localStorage.setItem(LOYALTY_CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
  }
}
