export interface TransactionLog {
  id: string;
  type: 'task' | 'ad' | 'referral' | 'withdraw_pending' | 'withdraw_success' | 'withdraw_failed' | 'vip_proof' | 'premium_proof' | 'social_proof' | 'daily_bonus' | 'lucky_wheel';
  title: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  proofScreenshot?: string;
  proofScreenshot2?: string;
  username?: string; // used for admin tracking
  taskId?: string; // tie to the VIP task
  withdrawPhone?: string;
  withdrawMethod?: string;
  userUid?: string;
  userFullName?: string;
}

export interface UserState {
  name: string;
  username: string;
  uid: string;
  balance: number;
  referralsCount: number;
  avatarSeed: string;
  adsWatchedCount: number;
  tasksCompletedCount: number;
  referralLink: string;
  accountStatus?: 'active' | 'frozen' | 'suspended';
  lastDailyBonusClaimDate?: string;
  dailyBonusStreakIndex?: number;
  lastLuckyWheelSpinDate?: string;
  luckyWheelSpinCount?: number;
  lastAdResetTime?: number;
  lastAdResetDateStr?: string;
}

export interface EarnTask {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: 'math' | 'captcha' | 'click' | 'poll' | 'social_link' | 'download';
  category: 'vip' | 'social' | 'premium';
  completed: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cooldown?: number; // timestamp until next available
  proofRequired?: boolean;
  proofScreenshot?: string;
  proofScreenshot2?: string;
  adminStatus?: 'idle' | 'pending' | 'approved' | 'rejected';
  link?: string;
  logoUrl?: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  username: string;
  balance: number;
  isCurrentUser?: boolean;
}
