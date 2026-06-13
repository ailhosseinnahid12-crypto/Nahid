import { EarnTask, LeaderboardUser, TransactionLog } from './types';

export const INITIAL_TASKS: EarnTask[] = [
  // === VIP TASKS ===
  {
    id: 'vip_1',
    title: '👑 গোল্ডেন গাণিতিক চ্যালেঞ্জ (VIP Math Quiz)',
    description: 'উচ্চ মূল্যের স্পেশাল ম্যাথ কুইজটি সমাধান করে সরাসরি বড় আকারের বোনাস অর্জন করুন।',
    reward: 12.00,
    type: 'math',
    category: 'vip',
    completed: false,
    difficulty: 'Hard',
    adminStatus: 'idle'
  },
  {
    id: 'vip_2',
    title: '👑 প্রিমিয়াম ডাবল-ক্লিক টাস্ক (Double Click Portal)',
    description: 'আমাদের প্রধান পার্টনার সাইটে ২৫ সেকেন্ড ভিজিট করে দ্বিগুণ রেটে ব্যালেন্স রিওয়ার্ড দাবি করুন।',
    reward: 15.00,
    type: 'click',
    category: 'vip',
    completed: false,
    difficulty: 'Medium',
    adminStatus: 'idle'
  },
  {
    id: 'vip_3',
    title: '👑 ক্যাশহাইভ মেগা ফিডব্যাক জরিপ (Mega Feedback Poll)',
    description: 'কমিউনিটি ও সার্ভিস উন্নত করার জন্য আপনার গুরুত্বপূর্ণ ও চমৎকার মতামত দিন ও ভিআইপি রিওয়ার্ড পান।',
    reward: 10.00,
    type: 'poll',
    category: 'vip',
    completed: false,
    difficulty: 'Easy',
    adminStatus: 'idle'
  },

  // === SOCIAL TASKS ===
  {
    id: 'social_1',
    title: '🎁 আমাদের অফিসিয়াল পেজ লাইক করুন (FB Page Follow)',
    description: 'আমাদের ফেসবুক ফেজ লাইক ও ফলো করে সোশ্যাল টাস্ক বোনাস সাথে সাথে পেয়ে যান।',
    reward: 2.00,
    type: 'social_link',
    category: 'social',
    completed: false,
    difficulty: 'Easy',
    adminStatus: 'idle'
  },
  {
    id: 'social_2',
    title: '📢 টেলিগ্রাম চ্যানেলে জয়েন করুন (Telegram Channel)',
    description: 'নতুন নতুন কাজের আপডেট ও পেমেন্ট প্রুফ রিয়েল-টাইমে পেতে আমাদের টেলিগ্রাম গ্রুপে জয়েন করুন।',
    reward: 2.20,
    type: 'social_link',
    category: 'social',
    completed: false,
    difficulty: 'Easy',
    adminStatus: 'idle'
  },
  {
    id: 'social_3',
    title: '📺 ইউটিউব চ্যানেল সাবস্ক্রাইব করুন (YT Channel Subs)',
    description: 'আজকের নতুন স্পন্সর ভিডিও চ্যানেলটি সাবস্ক্রাইব করুন এবং সম্পূর্ণ টাস্ক করুন।',
    reward: 2.50,
    type: 'social_link',
    category: 'social',
    completed: false,
    difficulty: 'Medium',
    adminStatus: 'idle'
  },
  {
    id: 'social_4',
    title: '💥 ফেসবুক গ্রুপ পোস্ট শেয়ার করুন (Share Post)',
    description: 'আমাদের গুরুত্বপূর্ণ অফার পোস্ট আপনার অন্তত ২টি আর্নিং গ্রুপে শেয়ার করে বোনাস ক্লেইম করুন।',
    reward: 2.00,
    type: 'social_link',
    category: 'social',
    completed: false,
    difficulty: 'Medium',
    adminStatus: 'idle'
  },
  {
    id: 'social_5',
    title: '🎵 ٹک ٹاک চ্যানেল ফলো করুন (TikTok Follow)',
    description: 'টিকটক অ্যাকাউন্টটি ফলো ও লাইক করুন এবং ইনস্ট্যান্ট ব্যালেন্স যোগ করুন।',
    reward: 2.00,
    type: 'social_link',
    category: 'social',
    completed: false,
    difficulty: 'Easy',
    adminStatus: 'idle'
  },

  // === PREMIUM TASKS ===
  {
    id: 'premium_1',
    title: '🎰 BD Games Downloader App',
    description: 'প্লে-স্টোর থেকে আমাদের অফিশিয়াল আর্নিং গেম অ্যাপটি ডাউনলোড করে স্ক্রিনশট প্রমাণ সাবমিট করুন।',
    reward: 8.50,
    type: 'download',
    category: 'premium',
    completed: false,
    difficulty: 'Medium',
    proofRequired: true,
    adminStatus: 'idle'
  },
  {
    id: 'premium_2',
    title: '🎯 BD Rummy App Install & Play',
    description: 'অ্যাপটি ডাউনলোড করে রেজিস্টার করুন এবং গেম লবির একটি স্ক্রিনশট প্রমাণ হিসেবে এখানে আপলোড করুন।',
    reward: 10.00,
    type: 'download',
    category: 'premium',
    completed: false,
    difficulty: 'Hard',
    proofRequired: true,
    adminStatus: 'idle'
  },
  {
    id: 'premium_3',
    title: '🚀 Playtok Lite App Download',
    description: 'Playtok Lite অ্যাপ ইনস্টল করে অ্যাকাউন্ট প্রোফাউল সেকশনের স্ক্রিনশট উইথ ইউজারনেম আপলোড করুন।',
    reward: 8.00,
    type: 'download',
    category: 'premium',
    completed: false,
    difficulty: 'Medium',
    proofRequired: true,
    adminStatus: 'idle'
  },
  {
    id: 'premium_4',
    title: '🌐 Super Fast Proxy Browser Install',
    description: 'নিরাপদ ব্রাউজার অ্যাপটি ইনস্টল করে ৫ স্টার রিভিউ দিন এবং সেটির স্ক্রিনশট আপলোড করুন।',
    reward: 9.00,
    type: 'download',
    category: 'premium',
    completed: false,
    difficulty: 'Medium',
    proofRequired: true,
    adminStatus: 'idle'
  }
];

export const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: 'আরিফুল ইসলাম (Arif)', username: 'arif_earn_99', balance: 8450.00 },
  { rank: 2, name: 'মোঃ হাসিব (Hasib)', username: 'hasib_king', balance: 7890.50 },
  { rank: 3, name: 'তামিম চৌধুরী', username: 'tamim_official', balance: 6720.00 },
  { rank: 4, name: 'তানিয়া সুলতানা', username: 'tania_pro', balance: 6105.00 },
  { rank: 5, name: 'তাসনিম কবির (Tasnim)', username: 'tasnim_99', balance: 5450.00 },
  { rank: 6, name: 'এমডি শাকিল (Shakil)', username: 'shakil_boss', balance: 4890.50 },
  { rank: 7, name: 'রাইহান আহমেদ (Raihan)', username: 'raihan_dev', balance: 4420.00 },
  { rank: 8, name: 'সুমি আক্তার (Sumi)', username: 'sumi_earn', balance: 3950.00 },
  { rank: 9, name: 'আল-আমিন মিঞা', username: 'alamin_miah', balance: 3430.00 },
  { rank: 10, name: 'নাহিদ হাসান', username: 'Hasan778810', balance: 2.50, isCurrentUser: true }, // will sync with state
  { rank: 11, name: 'ফয়সাল আহমেদ (Faysal)', username: 'faysal_ahmed', balance: 2750.00 },
  { rank: 12, name: 'তানজিলা রহমান', username: 'tanzila_kbd', balance: 2140.00 },
  { rank: 13, name: 'মোঃ ইমরান হোসাইন (Imran)', username: 'imran_rock', balance: 1845.00 },
  { rank: 14, name: 'সাদিয়া জাহান (Sadia)', username: 'sadia_honey', balance: 1490.00 },
  { rank: 15, name: 'সাকিব আল হাসান', username: 'sakib_75', balance: 1200.00 }
];

export const INITIAL_HISTORY: TransactionLog[] = [
  {
    id: 'tx_init',
    type: 'referral',
    title: 'নতুন একাউন্ট জয়েন বোনাস',
    amount: 2.50,
    date: '২০২৬-০৬-১০ ১০:২০ মিনিট',
    status: 'completed'
  }
];

export const AVATAR_SEEDS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80', // Man 1
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80', // Woman 1
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80', // Man 2
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&h=120&q=80', // Woman 2
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80'  // Man 3
];
