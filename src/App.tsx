import { useState, useEffect } from 'react';
import { ListTodo, Trophy, Home, Tv, Menu, Sparkles, HelpCircle, Check, ArrowUpRight, AlertCircle } from 'lucide-react';
import Header from './components/Header';
import HomeView from './components/HomeView';
import TaskView from './components/TaskView';
import AdsView from './components/AdsView';
import LeaderboardView from './components/LeaderboardView';
import WithdrawModal from './components/WithdrawModal';
import MenuView from './components/MenuView';
import { UserState, EarnTask, TransactionLog } from './types';
import { INITIAL_TASKS, INITIAL_LEADERBOARD, INITIAL_HISTORY, AVATAR_SEEDS } from './mockData';
import AuthView from './components/AuthView';
import AdminPanel from './components/AdminPanel';
import { LanguageCode, autoDetectLanguage, translations } from './utils/language';

// Beautiful 3D Glassmorphism navigation icon image imports
import homeNavIcon from './assets/images/home_nav_icon_1781281792316.jpg';
import taskNavIcon from './assets/images/task_nav_icon_1781281809197.jpg';
import leadersNavIcon from './assets/images/leaders_nav_icon_1781281822051.jpg';
import adsNavIcon from './assets/images/ads_nav_icon_1781281836336.jpg';
import menuNavIcon from './assets/images/menu_nav_icon_1781281851240.jpg';

export default function App() {
  // 0. AUTHENTICATION CONTROLLER STATE
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('cashhive_is_authenticated_v1') === 'true';
  });

  // Dynamic server configuration settings persisted across sessions
  const [appSettings, setAppSettings] = useState<{
    telegramChannel: string;
    telegramGroup: string;
    adReward: number;
    referralBonus: number;
    minWithdraw: number;
    dailyAdLimit: number;
    adsterraDirectLink: string;
    adsterraScript1: string;
    adsterraScript2: string;
    adminInboxImage?: string;
    adminInboxMessage?: string;
    adminInboxEnabled?: boolean;
    adminInboxMessages?: { id: string; image?: string; message: string; date: string }[];
  }>(() => {
    const saved = localStorage.getItem('cashhive_app_settings_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.dailyAdLimit !== 'number') {
          parsed.dailyAdLimit = 30;
        }
        if (typeof parsed.adsterraDirectLink !== 'string') {
          parsed.adsterraDirectLink = 'https://www.effectivecpmnetwork.com/mm0dfq18?key=6845e24a8a8aefd84e40e26e869455c5';
        }
        if (typeof parsed.adsterraScript1 !== 'string') {
          parsed.adsterraScript1 = 'https://pl28714174.effectivecpmnetwork.com/63/d2/29/63d229f932feef65422956e6bedd4d91.js';
        }
        if (typeof parsed.adsterraScript2 !== 'string') {
          parsed.adsterraScript2 = 'https://pl28714169.effectivecpmnetwork.com/b6/60/25/b6602588deb1c60de716b6ace763b58b.js';
        }
        if (typeof parsed.adminInboxImage !== 'string') {
          parsed.adminInboxImage = 'https://images.unsplash.com/photo-1579869847514-7c1a19d2d2ad?q=80&w=600&auto=format&fit=crop';
        }
        if (typeof parsed.adminInboxMessage !== 'string') {
          parsed.adminInboxMessage = 'নতুন স্পেশাল অফার রিলিজ হয়েছে! আমাদের টেলিগ্রাম চ্যানেলে জয়েন করুন এবং আপনার মতামত জানান। বেশি রেফার করুন ও আপনার ডেইলি স্যালারি নিশ্চিত করুন!';
        }
        if (typeof parsed.adminInboxEnabled !== 'boolean') {
          parsed.adminInboxEnabled = true;
        }
        if (!Array.isArray(parsed.adminInboxMessages)) {
          parsed.adminInboxMessages = [
            {
              id: 'msg_1',
              image: 'https://images.unsplash.com/photo-1579869847514-7c1a19d2d2ad?q=80&w=600&auto=format&fit=crop',
              message: 'আমাদের নতুন মেম্বারশিপ ও স্যালারি গিল্ড সার্ভিসটি সফলভাবে চালু হয়েছে! আপনার লিডারশিপ টিম গড়ে তুলুন এবং প্রতিদিন নিশ্চিত কমিশন ক্যাশআউট করুন।',
              date: 'আজকে ১২:১০'
            },
            {
              id: 'msg_2',
              image: 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?q=80&w=600&auto=format&fit=crop',
              message: 'আজকের দৈনিক ভাগ্য পরিবর্তনকারী স্পিন চাকাটি ঘুরিয়েছেন কি? প্রতিদিন ১ বার গোল চাকা ঘোরান এবং জিতে নিন নিশ্চিত ৩ বা ৪ টাকা মূল ব্যালেন্সে!',
              date: 'গতকাল ১৮:৪৫'
            },
            {
              id: 'msg_3',
              image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
              message: 'গুরুত্বপূর্ণ বিজ্ঞপ্তি: পেমেন্ট রিকোয়েস্ট সাবমিট করার পর দয়া করে ২ থেকে ২৪ ঘন্টা অপেক্ষা করুন। আমরা প্রতিটি উইথড্রয়াল ম্যানুয়ালি যাচাই করে শতভাগ নিশ্চিতভাবে পেমেন্ট প্রদান করি।',
              date: '০৯ জুন ২০২৬'
            }
          ];
        }
        // Force the stored setting to 30 if we updated the requirements to daily 30 tasks
        if (parsed.dailyAdLimit === 20) {
          parsed.dailyAdLimit = 30;
        }
        return parsed;
      } catch (e) {}
    }
    return {
      telegramChannel: 'https://t.me/CashHiveBot',
      telegramGroup: 'https://t.me/CashHiveBot',
      adReward: 0.50,
      referralBonus: 5.00,
      minWithdraw: 20.00,
      dailyAdLimit: 30,
      adsterraDirectLink: 'https://www.effectivecpmnetwork.com/mm0dfq18?key=6845e24a8a8aefd84e40e26e869455c5',
      adsterraScript1: 'https://pl28714174.effectivecpmnetwork.com/63/d2/29/63d229f932feef65422956e6bedd4d91.js',
      adsterraScript2: 'https://pl28714169.effectivecpmnetwork.com/b6/60/25/b6602588deb1c60de716b6ace763b58b.js',
      adminInboxImage: 'https://images.unsplash.com/photo-1579869847514-7c1a19d2d2ad?q=80&w=600&auto=format&fit=crop',
      adminInboxMessage: 'নতুন স্পেশাল অফার রিলিজ হয়েছে! আমাদের টেলিগ্রাম চ্যানেলে জয়েন করুন এবং আপনার মতামত জানান। বেশি রেফার করুন ও আপনার ডেইলি স্যালারি নিশ্চিত করুন!',
      adminInboxEnabled: true,
      adminInboxMessages: [
        {
          id: 'msg_1',
          image: 'https://images.unsplash.com/photo-1579869847514-7c1a19d2d2ad?q=80&w=600&auto=format&fit=crop',
          message: 'আমাদের নতুন মেম্বারশিপ ও স্যালারি গিল্ড সার্ভিসটি সফলভাবে চালু হয়েছে! আপনার লিডারশিপ টিম গড়ে তুলুন এবং প্রতিদিন নিশ্চিত কমিশন ক্যাশআউট করুন।',
          date: 'আজকে ১২:১০'
        },
        {
          id: 'msg_2',
          image: 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?q=80&w=600&auto=format&fit=crop',
          message: 'আজকের দৈনিক ভাগ্য পরিবর্তনকারী স্পিন চাকাটি ঘুরিয়েছেন কি? প্রতিদিন ১ বার গোল চাকা ঘোরান এবং জিতে নিন নিশ্চিত ৩ বা ৪ টাকা মূল ব্যালেন্সে!',
          date: 'গতকাল ১৮:৪৫'
        },
        {
          id: 'msg_3',
          image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
          message: 'গুরুত্বপূর্ণ বিজ্ঞপ্তি: পেমেন্ট রিকোয়েস্ট সাবমিট করার পর দয়া করে ২ থেকে ২৪ ঘন্টা অপেক্ষা করুন। আমরা প্রতিটি উইথড্রয়াল ম্যানুয়ালি যাচাই করে শতভাগ নিশ্চিতভাবে পেমেন্ট প্রদান করি।',
          date: '০৯ জুন ২০২৬'
        }
      ]
    };
  });

  // Registered user database persistent manager
  const [allUsers, setAllUsers] = useState<UserState[]>(() => {
    const saved = localStorage.getItem('cashhive_all_users_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Seed default simulated user family
    return [
      {
        name: 'Nahid Hasan',
        username: 'Hasan778810',
        uid: '7487052695',
        balance: 2.50,
        referralsCount: 0,
        avatarSeed: AVATAR_SEEDS[0],
        adsWatchedCount: 3,
        tasksCompletedCount: 1,
        referralLink: 'https://t.me/CashHiveBot?startapp=7487052695'
      },
      {
        name: 'তাসনিম কবির (Tasnim)',
        username: 'tasnim_99',
        uid: '2849057102',
        balance: 2450.00,
        referralsCount: 42,
        avatarSeed: AVATAR_SEEDS[1],
        adsWatchedCount: 52,
        tasksCompletedCount: 18,
        referralLink: 'https://t.me/CashHiveBot?startapp=2849057102'
      },
      {
        name: 'এমডি শাকিল (Shakil)',
        username: 'shakil_boss',
        uid: '9184061124',
        balance: 1890.50,
        referralsCount: 29,
        avatarSeed: AVATAR_SEEDS[2],
        adsWatchedCount: 110,
        tasksCompletedCount: 45,
        referralLink: 'https://t.me/CashHiveBot?startapp=9184061124'
      },
      {
        name: 'আরাফাত রহমান (Arafat)',
        username: 'raihan_dev',
        uid: '4729105820',
        balance: 1420.00,
        referralsCount: 15,
        avatarSeed: AVATAR_SEEDS[3],
        adsWatchedCount: 41,
        tasksCompletedCount: 12,
        referralLink: 'https://t.me/CashHiveBot?startapp=4729105820'
      }
    ];
  });

  // Language localization state with smart auto-detection
  const [language, setLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('cashhive_language_v1') as LanguageCode;
    if (saved) return saved;
    return autoDetectLanguage();
  });

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLanguage(newLang);
    localStorage.setItem('cashhive_language_v1', newLang);
  };

  const t = (key: string) => {
    return translations[language]?.[key] || translations['BN']?.[key] || key;
  };

  // 1. CHOOSE ACTIVE PANEL (Default to 'home')
  const [activeTab, setActiveTab] = useState<string>('home');

  // 2. USER PROFILE REALISTIC STATE (LOCALPERSISTED)
  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem('cashhive_user_state_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore errors and fallback
      }
    }
    // Setup initial customized defaults (Matching requested Nahid Hasan screenshot context, but completely distinct and gorgeous)
    return {
      name: 'Nahid Hasan',
      username: 'Hasan778810',
      uid: '7487052695',
      balance: 2.50, // Matches initial state exactly!
      referralsCount: 0,
      avatarSeed: AVATAR_SEEDS[0],
      adsWatchedCount: 3, // Matches stats
      tasksCompletedCount: 1,
      referralLink: 'https://t.me/CashHiveBot?startapp=7487052695'
    };
  });

  // 3. ACTIONS LOG (LOCALPERSISTED)
  const [transactionHistory, setTransactionHistory] = useState<TransactionLog[]>(() => {
    const saved = localStorage.getItem('cashhive_history_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore fallback
      }
    }
    return INITIAL_HISTORY;
  });

  // 4. MICROJOB ACTIVE TASKS (LOCALPERSISTED)
  const [tasks, setTasks] = useState<EarnTask[]>(() => {
    const saved = localStorage.getItem('cashhive_tasks_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_TASKS;
  });

  // 5. COPY COOLDOWN STATUS
  const [copied, setCopied] = useState<boolean>(false);

  // Sync to outer localstorage persistently
  useEffect(() => {
    localStorage.setItem('cashhive_user_state_v1', JSON.stringify(userState));
    // Mirror active session user to global user directory to prevent stales!
    setAllUsers(prevUsers => {
      const exists = prevUsers.some(u => u.username === userState.username);
      if (exists) {
        return prevUsers.map(u => u.username === userState.username ? userState : u);
      } else {
        return [userState, ...prevUsers];
      }
    });
  }, [userState]);

  useEffect(() => {
    localStorage.setItem('cashhive_history_v1', JSON.stringify(transactionHistory));
  }, [transactionHistory]);

  useEffect(() => {
    localStorage.setItem('cashhive_tasks_v1', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('cashhive_app_settings_v3', JSON.stringify(appSettings));
  }, [appSettings]);

  // Automated 24-Hour Ads watch limit resetting engine
  useEffect(() => {
    const checkAndResetAdLimit = () => {
      const now = Date.now();
      const lastReset = userState.lastAdResetTime || now;
      const todayString = new Date().toISOString().split('T')[0];
      const lastResetDateStr = userState.lastAdResetDateStr || todayString;

      let shouldReset = false;

      // Reset conditions:
      // 1. Initial baseline setting
      if (!userState.lastAdResetTime) {
        shouldReset = true;
      }
      // 2. Strict 24 hours elapsed
      else if (now - lastReset >= 24 * 60 * 60 * 1000) {
        shouldReset = true;
      }
      // 3. New calendar date starts (beneficial if day changes)
      else if (lastResetDateStr && lastResetDateStr !== todayString) {
        shouldReset = true;
      }

      if (shouldReset) {
        setUserState(prev => {
          // Double check to prevent loops
          if (prev.adsWatchedCount === 0 && prev.lastAdResetTime === now && prev.lastAdResetDateStr === todayString) {
            return prev;
          }
          return {
            ...prev,
            adsWatchedCount: 0,
            lastAdResetTime: now,
            lastAdResetDateStr: todayString
          };
        });
      }
    };

    // Run custom reset check on component load
    checkAndResetAdLimit();

    // Run periodic interval checks in the background (every 10s)
    const interval = setInterval(checkAndResetAdLimit, 10000);
    return () => clearInterval(interval);
  }, [userState.lastAdResetTime, userState.lastAdResetDateStr]);

  useEffect(() => {
    localStorage.setItem('cashhive_all_users_v3', JSON.stringify(allUsers));
    
    // Sync changes to the main registration/login database (cashhive_accounts_v1)
    const existingAccountsStr = localStorage.getItem('cashhive_accounts_v1');
    if (existingAccountsStr) {
      try {
        const existingAccounts = JSON.parse(existingAccountsStr);
        let updated = false;
        
        const nextAccounts = existingAccounts.map((acc: any) => {
          // Check if it's the current userState
          if (acc.username.toLowerCase() === userState.username.toLowerCase()) {
            updated = true;
            return {
              ...acc,
              name: userState.name,
              balance: userState.balance,
              referralsCount: userState.referralsCount,
              avatarSeed: userState.avatarSeed,
              adsWatchedCount: userState.adsWatchedCount,
              tasksCompletedCount: userState.tasksCompletedCount,
              accountStatus: userState.accountStatus || acc.accountStatus || 'active'
            };
          }
          
          // Or check in allUsers list
          const matchedInAll = allUsers.find(u => u.username.toLowerCase() === acc.username.toLowerCase());
          if (matchedInAll) {
            updated = true;
            return {
              ...acc,
              name: matchedInAll.name,
              balance: matchedInAll.balance,
              referralsCount: matchedInAll.referralsCount,
              avatarSeed: matchedInAll.avatarSeed,
              adsWatchedCount: matchedInAll.adsWatchedCount,
              tasksCompletedCount: matchedInAll.tasksCompletedCount,
              accountStatus: matchedInAll.accountStatus || acc.accountStatus || 'active'
            };
          }
          return acc;
        });

        if (updated) {
          localStorage.setItem('cashhive_accounts_v1', JSON.stringify(nextAccounts));
        }
      } catch (e) {
        console.error("Desync warning: Syncing accounts failed", e);
      }
    }
  }, [allUsers, userState]);

  // Handler: When a Microjob task is successfully completed
  const handleCompleteTask = (taskId: string, reward: number, taskTitle: string) => {
    const isFrozen = userState.accountStatus === 'frozen';
    const task = tasks.find(t => t.id === taskId);
    const category = task?.category;

    // Increment balance and stats
    setUserState(prev => ({
      ...prev,
      balance: isFrozen ? prev.balance : prev.balance + reward,
      tasksCompletedCount: prev.tasksCompletedCount + 1
    }));

    // Mark task as completed
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true, adminStatus: 'approved' } : t));

    // Register into the history logs
    const newLog: TransactionLog = {
      id: `tx_${Date.now()}`,
      type: category === 'vip' 
        ? 'vip_proof' 
        : category === 'social' 
        ? 'social_proof' 
        : category === 'premium' 
          ? 'premium_proof' 
          : 'task',
      title: category === 'vip'
        ? `👑 VIP: ${taskTitle} সম্পন্ন`
        : category === 'social'
          ? `📢 সোশ্যাল: ${taskTitle} সম্পন্ন`
          : category === 'premium'
            ? `💎 প্রিমিয়াম: ${taskTitle} সম্পন্ন`
            : `${taskTitle} সম্পন্ন`,
      amount: reward,
      date: 'আজকে ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      taskId: taskId,
      username: userState.username,
      userUid: userState.uid
    };

    setTransactionHistory(prev => [newLog, ...prev]);
  };

  // Handler: Submission of Proof (Screenshots) for Premium & VIP tasks
  const handleSubmitProof = (taskId: string, proofScreenshot: string, proofScreenshot2?: string) => {
    // Find target task
    const tTask = tasks.find(t => t.id === taskId);
    if (!tTask) return;

    const isVip = tTask.category === 'vip';
    const isSocial = tTask.category === 'social';
    const isPremium = tTask.category === 'premium';

    // 1. Set task status as 'pending' with the screenshot(s)
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      adminStatus: 'pending',
      proofScreenshot: proofScreenshot,
      proofScreenshot2: proofScreenshot2
    } : t));

    // 2. Add pending task proof submission to transaction log
    const proofLog: TransactionLog = {
      id: `tx_proof_${Date.now()}`,
      type: isVip 
        ? 'vip_proof' 
        : isSocial 
          ? 'social_proof' 
          : 'premium_proof',
      title: isVip 
        ? `👑 VIP: ${tTask.title} (পেন্ডিং)` 
        : isSocial 
          ? `📢 সোশ্যাল: ${tTask.title} (পেন্ডিং প্রমাণ)` 
          : `💎 প্রিমিয়াম: ${tTask.title} (পেন্ডিং প্রমাণ)`,
      amount: tTask.reward,
      date: 'আজকে ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
      proofScreenshot: proofScreenshot,
      proofScreenshot2: proofScreenshot2,
      username: userState.username,
      taskId: taskId
    };

    setTransactionHistory(prev => [proofLog, ...prev]);

    // Note: We completely removed the automatic setTimeouts here to adhere 
    // to user instructions so the admin panel must manually verify and resolve it!
  };

  // Handler: When a Video Ad is successfully watched
  const handleWatchAd = (reward: number) => {
    const isFrozen = userState.accountStatus === 'frozen';
    
    setUserState(prev => ({
      ...prev,
      balance: isFrozen ? prev.balance : prev.balance + reward,
      adsWatchedCount: prev.adsWatchedCount + 1
    }));

    const newLog: TransactionLog = {
      id: `tx_${Date.now()}`,
      type: 'ad',
      title: 'ভিডিও বিজ্ঞাপন বোনাস ক্লেইম',
      amount: reward,
      date: 'আজকে ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      username: userState.username,
      userUid: userState.uid
    };

    setTransactionHistory(prev => [newLog, ...prev]);
  };

  // Handler: Claim Daily Bonus
  const handleClaimDailyBonus = (reward: number, currentStreakIndex: number) => {
    const isFrozen = userState.accountStatus === 'frozen';
    const todayStr = new Date().toISOString().split('T')[0];

    setUserState(prev => ({
      ...prev,
      balance: isFrozen ? prev.balance : prev.balance + reward,
      lastDailyBonusClaimDate: todayStr,
      dailyBonusStreakIndex: (currentStreakIndex + 1) % 7
    }));

    const newLog: TransactionLog = {
      id: `daily_${Date.now()}`,
      type: 'daily_bonus',
      title: `দৈনিক চেক-ইন বোনাস (দিন ${currentStreakIndex + 1})`,
      amount: reward,
      date: 'আজকে ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      username: userState.username,
      userUid: userState.uid,
      userFullName: userState.name
    };

    setTransactionHistory(prev => [newLog, ...prev]);
  };

  // Handler: Spin Lucky Wheel
  const handleSpinLuckyWheel = (reward: number) => {
    const isFrozen = userState.accountStatus === 'frozen';
    const todayStr = new Date().toISOString().split('T')[0];

    setUserState(prev => ({
      ...prev,
      balance: isFrozen ? prev.balance : prev.balance + reward,
      lastLuckyWheelSpinDate: todayStr,
      luckyWheelSpinCount: (prev.luckyWheelSpinCount || 0) + 1
    }));

    const newLog: TransactionLog = {
      id: `spin_${Date.now()}`,
      type: 'lucky_wheel',
      title: reward > 0 ? `লাকি স্পিন হুইল জয় (৳ ${reward.toFixed(2)})` : `লাকি স্পিন হুইল (ফাঁকা/Better luck)`,
      amount: reward,
      date: 'আজকে ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      username: userState.username,
      userUid: userState.uid,
      userFullName: userState.name
    };

    setTransactionHistory(prev => [newLog, ...prev]);
  };

  // Handler: Copy Invitation URL with visual feedback
  const handleCopyReferral = () => {
    navigator.clipboard.writeText(userState.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dynamically map master tasks to represent active user's completed state based on transaction history
  const getCurrentUserTasks = (): EarnTask[] => {
    return tasks.map(task => {
      // Find the latest transaction history log for this specific task of this user
      const userTx = transactionHistory.find(
        tx => tx.taskId === task.id && (tx.username === userState.username || tx.userUid === userState.uid)
      );

      if (userTx) {
        const isCompleted = userTx.status === 'completed';
        const isPending = userTx.status === 'pending';
        return {
          ...task,
          completed: isCompleted,
          adminStatus: isPending ? 'pending' : isCompleted ? 'approved' : 'rejected',
          proofScreenshot: userTx.proofScreenshot || task.proofScreenshot,
          proofScreenshot2: userTx.proofScreenshot2 || task.proofScreenshot2
        };
      }
      return {
        ...task,
        completed: false,
        adminStatus: 'idle',
        proofScreenshot: undefined,
        proofScreenshot2: undefined
      };
    });
  };

  // Handler: Submit a payout withdrawal request (bKash/Nagad/Rocket)
  const handleWithdrawRequest = (amount: number, method: string, number: string): boolean | string => {
    if (amount < 100.00) {
      return 'ক্ষমা করবেন! সর্বনিম্ন উইথড্র লিমিট ৳ ১০০.০০ টাকা।';
    }
    if (amount > 25000.00) {
      return 'ক্ষমা করবেন! সর্বোচ্চ উইথড্র লিমিট ৳ ২৫,০০০.০০ টাকা।';
    }
    if (amount > userState.balance) {
      return 'ক্ষমা করবেন! আপনার প্রয়োজনীয় ফান্ড ব্যালেন্স অপূর্ণ আছে।';
    }

    // Deduct from local user money
    setUserState(prev => ({
      ...prev,
      balance: prev.balance - amount
    }));

    // Register payout pending log entries
    const payoutLog: TransactionLog = {
      id: `withdraw_${Date.now()}`,
      type: 'withdraw_pending',
      title: `ক্যাশআউট রিকোয়েস্ট (${method})`,
      amount: amount,
      date: 'আজকে ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      status: 'pending', // pending until processed
      withdrawPhone: number,
      withdrawMethod: method,
      username: userState.username,
      userUid: userState.uid,
      userFullName: userState.name
    };

    setTransactionHistory(prev => [payoutLog, ...prev]);
    return true;
  };

  // Handler: Edit profile settings menu panel
  const handleUpdateProfile = (newName: string, newUsername: string, newAvatarSeed: string) => {
    setUserState(prev => ({
      ...prev,
      name: newName,
      username: newUsername,
      avatarSeed: newAvatarSeed,
      referralLink: `https://t.me/CashHiveBot?startapp=${prev.uid}`
    }));
  };

  // Handler: Complete sign up or sign in
  const handleAuthSuccess = (selectedUser: UserState, showWelcome: boolean) => {
    setUserState(selectedUser);
    localStorage.setItem('cashhive_user_state_v1', JSON.stringify(selectedUser));
    localStorage.setItem('cashhive_is_authenticated_v1', 'true');
    setIsAuthenticated(true);
    setActiveTab('home');
  };

  // Handler: Sign out of terminal session
  const handleLogout = () => {
    localStorage.removeItem('cashhive_is_authenticated_v1');
    setIsAuthenticated(false);
  };

  // ==================== MASTER ADMIN PORTAL CRITERIAL HANDLERS ====================
  const handleUpdateSettings = (newSettings: typeof appSettings) => {
    setAppSettings(newSettings);
  };

  const handleAddTask = (newTask: EarnTask) => {
    setTasks(prev => [newTask, ...prev]);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleUpdateTaskReward = (taskId: string, reward: number) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, reward } : t));
  };

  const handleUpdateUserBalance = (username: string, changeAmount: number) => {
    // If updating active current session user, modify userState directly
    if (userState.username === username) {
      setUserState(prev => ({
        ...prev,
        balance: Math.max(0, prev.balance + changeAmount)
      }));
    } else {
      // Modify in all users list
      setAllUsers(prev => prev.map(u => u.username === username ? {
        ...u,
        balance: Math.max(0, u.balance + changeAmount)
      } : u));
    }
  };

  const handleResolveWithdrawal = (txId: string, status: 'completed' | 'failed') => {
    // 1. Find the transaction and the user
    const tx = transactionHistory.find(t => t.id === txId);
    if (!tx) {
      alert('দুঃখিত, এই লেনদেন রেকর্ডটি খুঁজে পাওয়া যায়নি!');
      return;
    }

    if (tx.status !== 'pending') {
      alert('এই উইথড্র রিকোয়েস্টটি ইতিমধ্যে সমাধান করা হয়েছে!');
      return;
    }

    const username = tx.username || '';
    const isTargetCurrentUser = username === userState.username;

    // 2. Process status and refund if rejected (failed)
    if (status === 'failed') {
      // Refund the money back to the user's balance
      if (isTargetCurrentUser) {
        setUserState(prev => ({
          ...prev,
          balance: prev.balance + tx.amount
        }));
      } else {
        setAllUsers(prev => prev.map(u => u.username === username || (tx.userUid && u.uid === tx.userUid) ? {
          ...u,
          balance: u.balance + tx.amount
        } : u));
      }
      alert(`❌ উইথড্র রিকোয়েস্টটি রিজেক্ট/বাতিল করা হয়েছে এবং সদস্যের ওয়ালেটে ৳ ${tx.amount.toFixed(2)} সফলভাবে রিফান্ড করা হয়েছে!`);
    } else {
      alert(`✅ উইথড্র রিকোয়েস্টটি সফলভাবে এপ্রুভ ও সম্পন্ন করা হয়েছে!`);
    }

    // 3. Update status in transaction history (keeping records for user payload list history)
    setTransactionHistory(prev => prev.map(item => {
      if (item.id === txId) {
        return {
          ...item,
          status: status === 'completed' ? 'completed' : 'failed',
          type: status === 'completed' ? 'withdraw_success' : 'withdraw_failed'
        };
      }
      return item;
    }));
  };

  const handleResolveProof = (txId: string, status: 'approved' | 'rejected') => {
    const rx = transactionHistory.find(t => t.id === txId || t.taskId === txId);
    if (!rx) return;

    const username = rx.username || userState.username;
    const isTargetCurrentUser = username === userState.username;

    // Find the user status to see if frozen
    const targetUser = allUsers.find(u => u.username === username) || (isTargetCurrentUser ? userState : null);
    const isFrozen = targetUser?.accountStatus === 'frozen';

    if (status === 'approved') {
      // Credit
      if (isTargetCurrentUser) {
        setUserState(prev => ({
          ...prev,
          balance: isFrozen ? prev.balance : prev.balance + rx.amount,
          tasksCompletedCount: prev.tasksCompletedCount + 1
        }));
      } else {
        setAllUsers(prev => prev.map(u => u.username === username ? {
          ...u,
          balance: isFrozen ? u.balance : u.balance + rx.amount,
          tasksCompletedCount: u.tasksCompletedCount + 1
        } : u));
      }

      setTransactionHistory(prev => prev.map(t => t.id === rx.id ? { ...t, status: 'completed' } : t));
      if (rx.taskId) {
        setTasks(prev => prev.map(t => t.id === rx.taskId ? { ...t, adminStatus: 'approved', completed: true } : t));
      }
    } else {
      // Reject
      setTransactionHistory(prev => prev.map(t => t.id === rx.id ? { ...t, status: 'failed' } : t));
      if (rx.taskId) {
        setTasks(prev => prev.map(t => t.id === rx.taskId ? { ...t, adminStatus: 'rejected', completed: false } : t));
      }
    }
  };

  const handleUpdateUserStatus = (username: string, status: 'active' | 'frozen' | 'suspended') => {
    if (userState.username === username) {
      setUserState(prev => ({
        ...prev,
        accountStatus: status
      }));
    }
    setAllUsers(prev => prev.map(u => u.username === username ? { ...u, accountStatus: status } : u));
  };

  return (
    <div 
      id="root_wrapper" 
      className="min-h-screen w-full bg-[#f3faf7] text-slate-800 font-sans flex flex-col items-center justify-start md:py-8 md:px-4 relative overflow-x-hidden"
    >
      {/* Decorative organic background vectors for desktop viewport */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl -z-10 pointer-events-none hidden md:block"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl -z-10 pointer-events-none hidden md:block"></div>

      {/* MOBILE CONTAINER FRAME / SMARTPHONE VIEWER FOR PC VIEWS */}
      <div 
        id="app_canvas" 
        className="w-full max-w-md bg-white border border-gray-100 md:rounded-[36px] md:shadow-2xl overflow-hidden flex flex-col min-h-screen md:min-h-[820px] relative md:border-8 md:border-slate-800"
      >
        {/* Real Smart camera notch emulation only on desktop */}
        <div className="hidden md:flex justify-center items-center w-full bg-slate-800 text-white py-1">
          <div className="w-24 h-4 bg-black rounded-full mb-1"></div>
        </div>

        {/* 1. EMBEDDED HEADER BAR TO SECURE THE WEB-APP STATUS */}
        <Header appName="CashHive" onClose={() => {
          if(confirm("আপনি কি CashHive প্ল্যাটফর্ম বন্ধ করতে চান?")) {
            window.close();
          }
        }} />

        {/* 2. DYNAMIC CONTENT WORKSPACE */}
        {isAuthenticated ? (
          userState?.accountStatus === 'suspended' ? (
            <div id="suspended_blocked_view" className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-5 bg-red-50/10">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center animate-bounce border-2 border-red-200">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-sm font-black text-red-950 uppercase">একাউন্ট সাসপেন্ড করা হয়েছে!</h3>
                <p className="text-[11px] text-red-700 font-medium leading-relaxed bg-red-50 p-3 rounded-2xl border border-red-100">
                  সঠিকভাবে নিয়ম না মেনে বা নিয়ম লঙ্ঘন করে কাজ করার কারণে আপনার CashHive একাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে।
                </p>
                <p className="text-[10px] text-slate-500">
                  বিস্তারিত জানতে দয়া করে টেলিগ্রাম গ্রূপে এডমিনের সাথে যোগাযোগ করুন।
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className="text-[11px] bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-extrabold px-5 py-2.5 rounded-2xl shadow-sm transition-all cursor-pointer"
              >
                লগ আউট করুন (Sign Out)
              </button>
            </div>
          ) : (
            <>
              <main 
                id="canvas_content" 
                className="flex-1 overflow-y-auto px-4 py-4 bg-[#eefbf6] pb-32"
                style={{ contentVisibility: 'auto' }}
              >
              {activeTab === 'home' && (
                <HomeView 
                  userState={userState}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onCopyReferral={handleCopyReferral}
                  copied={copied}
                  language={language}
                  onLanguageChange={handleLanguageChange}
                  onClaimDailyBonus={handleClaimDailyBonus}
                  onSpinLuckyWheel={handleSpinLuckyWheel}
                  appSettings={appSettings}
                />
              )}

              {activeTab === 'task' && (
                <TaskView 
                  userState={userState}
                  tasks={getCurrentUserTasks()}
                  onCompleteTask={handleCompleteTask}
                  onSubmitProof={handleSubmitProof}
                  language={language}
                />
              )}

              {activeTab === 'leaders' && (
                <LeaderboardView 
                  currentUserName={userState.name}
                  currentUserUsername={userState.username}
                  currentUserBalance={userState.balance}
                  initialLeaderboard={INITIAL_LEADERBOARD}
                  language={language}
                />
              )}

              {activeTab === 'ads' && (
                <AdsView 
                  userState={userState}
                  onWatchAd={handleWatchAd}
                  language={language}
                  appSettings={appSettings}
                />
              )}

              {activeTab === 'withdraw' && (
                <WithdrawModal 
                  userState={userState}
                  onWithdrawRequest={handleWithdrawRequest}
                  onNavigateHome={() => setActiveTab('home')}
                  language={language}
                  appSettings={appSettings}
                />
              )}

              {activeTab === 'menu' && (
                <MenuView 
                  userState={userState}
                  transactionHistory={transactionHistory}
                  onUpdateProfile={handleUpdateProfile}
                  onNavigate={(tab) => setActiveTab(tab)}
                  setUserState={setUserState}
                  setTransactionHistory={setTransactionHistory}
                  onWithdrawRequest={handleWithdrawRequest}
                  tasks={getCurrentUserTasks()}
                  onLogout={handleLogout}
                  language={language}
                  onLanguageChange={handleLanguageChange}
                  appSettings={appSettings}
                />
              )}

              {activeTab === 'admin' && (
                <AdminPanel 
                  appSettings={appSettings}
                  onUpdateSettings={handleUpdateSettings}
                  tasks={tasks}
                  onAddTask={handleAddTask}
                  onDeleteTask={handleDeleteTask}
                  onUpdateTaskReward={handleUpdateTaskReward}
                  allUsers={allUsers}
                  onUpdateUserBalance={handleUpdateUserBalance}
                  onUpdateUserStatus={handleUpdateUserStatus}
                  transactionHistory={transactionHistory}
                  onResolveWithdrawal={handleResolveWithdrawal}
                  onResolveProof={handleResolveProof}
                  language={language}
                  onNavigateBack={() => setActiveTab('home')}
                />
              )}
            </main>

            {/* 3. RESPONSIVE BOTTOM NAVIGATION BAR LAYOUT WITH EXQUISITE 3D GLASSMISM ICONS */}
            <nav 
              id="canvas_footer_nav"
              className="absolute bottom-0 inset-x-0 bg-slate-950 border-t border-slate-900/60 flex items-center justify-around px-2 pt-2.5 pb-4 select-none shadow-[0_-5px_25px_rgba(0,0,0,0.5)] z-50 rounded-t-[28px]"
            >
              {/* Item 1: TASK */}
              <button 
                type="button"
                id="nav_item_task"
                onClick={() => setActiveTab('task')}
                className={`flex flex-col items-center justify-center w-14 py-1 transition-all relative cursor-pointer group ${
                  activeTab === 'task' ? 'scale-105 text-emerald-400' : 'text-slate-450 hover:text-slate-200 text-slate-400'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all duration-300 ${
                  activeTab === 'task' ? 'bg-gradient-to-tr from-emerald-500/20 to-teal-400/10 ring-2 ring-emerald-500/40 relative -translate-y-0.5' : 'opacity-85 filter grayscale-[20%]'
                }`}>
                  <img 
                    src={taskNavIcon} 
                    alt="Task Tab Icon" 
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 object-cover rounded-lg shadow-md"
                  />
                </div>
                <span className={`text-[9.5px] tracking-tight mt-1 font-sans font-black ${
                  activeTab === 'task' ? 'text-white' : 'text-slate-400 font-bold'
                }`}>{t('task_tab')}</span>
                {activeTab === 'task' && (
                  <span className="absolute bottom-[-4px] w-2 h-1 bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full shadow-md shadow-emerald-400"></span>
                )}
              </button>

              {/* Item 2: LEADERS */}
              <button 
                type="button"
                id="nav_item_leaders"
                onClick={() => setActiveTab('leaders')}
                className={`flex flex-col items-center justify-center w-14 py-1 transition-all relative cursor-pointer group ${
                  activeTab === 'leaders' ? 'scale-105 text-amber-400' : 'text-slate-450 hover:text-slate-200 text-slate-400'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all duration-300 ${
                  activeTab === 'leaders' ? 'bg-gradient-to-tr from-amber-500/20 to-yellow-400/10 ring-2 ring-amber-500/40 relative -translate-y-0.5' : 'opacity-85 filter grayscale-[20%]'
                }`}>
                  <img 
                    src={leadersNavIcon} 
                    alt="Leaders Tab Icon" 
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 object-cover rounded-lg shadow-md"
                  />
                </div>
                <span className={`text-[9.5px] tracking-tight mt-1 font-sans font-black ${
                  activeTab === 'leaders' ? 'text-white' : 'text-slate-400 font-bold'
                }`}>{t('leaders_tab')}</span>
                {activeTab === 'leaders' && (
                  <span className="absolute bottom-[-4px] w-2 h-1 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full shadow-md shadow-amber-400"></span>
                )}
              </button>

              {/* Item 3: HOME BUTTON (Central highly polished raised circular button with 3D house logo) */}
              <div className="relative -top-3.5 flex flex-col items-center justify-center select-none">
                <button 
                  type="button"
                  id="nav_item_home"
                  onClick={() => setActiveTab('home')}
                  className={`w-15 h-15 rounded-full flex items-center justify-center shadow-xl cursor-pointer transform active:scale-95 transition-all outline-none ${
                    activeTab === 'home' 
                      ? 'p-[3px] bg-gradient-to-tr from-emerald-500 via-teal-400 to-yellow-300 ring-4 ring-emerald-500/35 scale-110' 
                      : 'p-[2px] bg-slate-800 hover:bg-slate-700'
                  }`}
                  title="Home"
                >
                  <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center border-2 border-slate-900 shadow-inner">
                    <img 
                      src={homeNavIcon} 
                      alt="Home Tab Icon" 
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 object-cover rounded-full"
                    />
                  </div>
                </button>
                <span className={`text-[10px] tracking-tight mt-0.5 font-black ${
                  activeTab === 'home' ? 'text-emerald-400' : 'text-slate-400 font-bold'
                }`}>{t('home_tab')}</span>
              </div>

              {/* Item 4: ADS */}
              <button 
                type="button"
                id="nav_item_ads"
                onClick={() => setActiveTab('ads')}
                className={`flex flex-col items-center justify-center w-14 py-1 transition-all relative cursor-pointer group ${
                  activeTab === 'ads' ? 'scale-105 text-emerald-400' : 'text-slate-450 hover:text-slate-200 text-slate-400'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all duration-300 ${
                  activeTab === 'ads' ? 'bg-gradient-to-tr from-emerald-500/20 to-teal-400/10 ring-2 ring-emerald-500/40 relative -translate-y-0.5' : 'opacity-85 filter grayscale-[20%]'
                }`}>
                  <img 
                    src={adsNavIcon} 
                    alt="Ads Tab Icon" 
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 object-cover rounded-lg shadow-md"
                  />
                </div>
                <span className={`text-[9.5px] tracking-tight mt-1 font-sans font-black ${
                  activeTab === 'ads' ? 'text-white' : 'text-slate-400 font-bold'
                }`}>{t('ads_tab')}</span>
                {activeTab === 'ads' && (
                  <span className="absolute bottom-[-4px] w-2 h-1 bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full shadow-md shadow-emerald-400"></span>
                )}
              </button>

              {/* Item 5: MENU */}
              <button 
                type="button"
                id="nav_item_menu"
                onClick={() => setActiveTab('menu')}
                className={`flex flex-col items-center justify-center w-14 py-1 transition-all relative cursor-pointer group ${
                  activeTab === 'menu' ? 'scale-105 text-purple-400' : 'text-slate-450 hover:text-slate-200 text-slate-400'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all duration-300 ${
                  activeTab === 'menu' ? 'bg-gradient-to-tr from-purple-500/20 to-indigo-400/10 ring-2 ring-purple-500/40 relative -translate-y-0.5' : 'opacity-85 filter grayscale-[20%]'
                }`}>
                  <img 
                    src={menuNavIcon} 
                    alt="Menu Tab Icon" 
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 object-cover rounded-lg shadow-md"
                  />
                </div>
                <span className={`text-[9.5px] tracking-tight mt-1 font-sans font-black ${
                  activeTab === 'menu' ? 'text-white' : 'text-slate-400 font-bold'
                }`}>{t('menu_tab')}</span>
                {activeTab === 'menu' && (
                  <span className="absolute bottom-[-4px] w-2 h-1 bg-gradient-to-r from-purple-400 to-fuchsia-350 rounded-full shadow-md shadow-purple-400"></span>
                )}
              </button>
            </nav>
          </>
          )
        ) : (
          <AuthView 
            onAuthSuccess={handleAuthSuccess} 
            language={language}
            onLanguageChange={handleLanguageChange}
          />
        )}
      </div>
      
    </div>
  );
}
