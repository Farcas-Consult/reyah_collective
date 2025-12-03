// Loyalty Points and Rewards System Types

export type PointTransactionType = 
  | 'purchase'
  | 'review'
  | 'referral'
  | 'signup_bonus'
  | 'birthday'
  | 'redeem_reward'
  | 'admin_adjustment'
  | 'expired';

export type RewardType = 'discount_percentage' | 'discount_fixed' | 'free_shipping' | 'gift_product' | 'exclusive_access';

export type MemberTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface PointTransaction {
  id: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  type: PointTransactionType;
  points: number; // positive for earning, negative for redemption
  description: string;
  referenceId?: string; // order ID, review ID, referral code, etc.
  createdAt: string;
  expiresAt?: string; // points can expire after 1 year
}

export interface LoyaltyPoints {
  customerId: string;
  customerEmail: string;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  currentBalance: number;
  tier: MemberTier;
  lifetimeSpend: number; // total KSH spent for tier calculation
  referralCode: string; // unique code for this customer
  referralCount: number; // how many people used their code
  joinedAt: string;
  lastActivityAt: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  pointCost: number;
  value: number; // percentage for discount_percentage, KSH for discount_fixed, etc.
  image?: string;
  terms?: string;
  active: boolean;
  stockLimit?: number; // for gift products
  stockRemaining?: number;
  minTier?: MemberTier; // minimum tier required
  expiryDays: number; // how many days reward code is valid after redemption
  createdAt: string;
  updatedAt?: string;
}

export interface RedeemedReward {
  id: string;
  rewardId: string;
  rewardName: string;
  rewardType: RewardType;
  rewardValue: number;
  customerId: string;
  customerEmail: string;
  pointsSpent: number;
  code: string; // unique redemption code
  redeemedAt: string;
  expiresAt: string;
  usedAt?: string; // when the reward was applied to an order
  orderId?: string; // if used in an order
  status: 'active' | 'used' | 'expired';
}

export interface EarningRule {
  id: string;
  name: string;
  type: PointTransactionType;
  pointsAwarded: number;
  value?: number; // for purchase: points per KSH spent (e.g., 1 point per 100 KSH)
  description: string;
  active: boolean;
  minPurchaseAmount?: number; // minimum order value to earn points
  createdAt: string;
  updatedAt?: string;
}

export interface LoyaltyConfig {
  programActive: boolean;
  pointsPerKSH: number; // e.g., 1 point per 100 KSH spent
  reviewPoints: number;
  referralPointsReferrer: number; // points for person who refers
  referralPointsReferee: number; // points for person who signs up with referral
  signupBonusPoints: number;
  birthdayBonusPoints: number;
  pointExpirationMonths: number; // how many months until points expire
  tierThresholds: {
    bronze: number; // lifetime spend in KSH
    silver: number;
    gold: number;
    platinum: number;
  };
  tierBenefits: {
    bronze: { pointsMultiplier: number; description: string };
    silver: { pointsMultiplier: number; description: string };
    gold: { pointsMultiplier: number; description: string };
    platinum: { pointsMultiplier: number; description: string };
  };
}

export interface LoyaltyStats {
  totalMembers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  activeRewards: number;
  redemptionRate: number; // percentage
  averagePointBalance: number;
  tierDistribution: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  topEarners: {
    customerName: string;
    customerEmail: string;
    points: number;
  }[];
}
