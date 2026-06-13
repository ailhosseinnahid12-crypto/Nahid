import React, { useState } from 'react';
import { 
  Edit3, CheckCircle, Copy, AlertCircle, Sparkles, LayoutGrid, Users, Wallet, Briefcase, Send, Gift, History, ChevronRight, ChevronDown, ArrowRight, Award, Flame, Heart, Shield, Share2, Crown, LogOut, Trophy, Megaphone
} from 'lucide-react';
import { UserState, TransactionLog, EarnTask } from '../types';
import { AVATAR_SEEDS } from '../mockData';
import { LanguageCode } from '../utils/language';

interface MenuViewProps {
  userState: UserState;
  transactionHistory: TransactionLog[];
  onUpdateProfile: (name: string, username: string, avatarSeed: string) => void;
  onNavigate: (tab: string) => void;
  setUserState: React.Dispatch<React.SetStateAction<UserState>>;
  setTransactionHistory: React.Dispatch<React.SetStateAction<TransactionLog[]>>;
  onWithdrawRequest: (amount: number, method: string, number: string) => boolean | string;
  tasks: EarnTask[];
  onLogout?: () => void;
  language?: LanguageCode;
  onLanguageChange?: (newLang: LanguageCode) => void;
  appSettings?: {
    telegramChannel: string;
    telegramGroup: string;
    adReward: number;
    referralBonus: number;
    minWithdraw: number;
    dailyAdLimit?: number;
    adsterraDirectLink?: string;
    adsterraScript1?: string;
    adsterraScript2?: string;
  };
}

export default function MenuView({ 
  userState, 
  transactionHistory, 
  onUpdateProfile, 
  onNavigate, 
  setUserState, 
  setTransactionHistory,
  onWithdrawRequest,
  tasks,
  onLogout,
  language,
  onLanguageChange,
  appSettings
}: MenuViewProps) {
  
  // Toggles for different expandable menu list cards
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // States for Profile Editing (Inside Dashboard tab)
  const [profileName, setProfileName] = useState(userState.name);
  const [profileUsername, setProfileUsername] = useState(userState.username);
  const [profileAvatar, setProfileAvatar] = useState(userState.avatarSeed);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  // States for Withdrawal module
  const [withdrawMethod, setWithdrawMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);

  // Copy feedback states
  const [copiedUid, setCopiedUid] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);

  // Interactive Telegram tasks promo code state
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [claimedPromos, setClaimedPromos] = useState<string[]>([]);
  const [joinedChannel, setJoinedChannel] = useState(false);
  const [joinedGroup, setJoinedGroup] = useState(false);

  // Interactive Team referrals list state
  const [simulatedReferrals, setSimulatedReferrals] = useState<{name: string, date: string, bonus: number}[]>([
    { name: 'তাসমিমুল আরেফিন (Tasnimul)', date: 'আজকে ১২:১০', bonus: 5.00 },
    { name: 'আরাফাত রহমান (Arafat)', date: 'গতকাল ১৮:৪৫', bonus: 5.00 },
    { name: 'তানজিম সাকিব (Sajib)', date: '০৯ জুন ২০২৬', bonus: 5.00 }
  ]);

  // Milestone claim checker states
  const [claimedMilestones, setClaimedMilestones] = useState<number[]>([]); // holds indices like 1, 2, 3

  // Transaction history filter state
  const [txFilter, setTxFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

  // VIP task history filter state
  const [vipTxFilter, setVipTxFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

  // Premium task history filter state
  const [premiumTxFilter, setPremiumTxFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

  // Helper toggle function
  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  // Helper: Copy UID
  const handleCopyUid = () => {
    navigator.clipboard.writeText(userState.uid || '7487052695');
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  // Helper: Copy Referral Link
  const handleCopyRef = () => {
    navigator.clipboard.writeText(userState.referralLink || `https://t.me/CashHiveBot?startapp=${userState.uid || '7487052695'}`);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  // Profile Save
  const saveProfileSettings = () => {
    onUpdateProfile(profileName, profileUsername, profileAvatar);
    setIsEditingProfile(false);
    setProfileSuccessMsg(true);
    setTimeout(() => setProfileSuccessMsg(false), 2500);
  };

  // Sponsor Simulation (Add dynamic referrals cleanly!)
  const simulateNewReferral = () => {
    const names = [
      'শাকিল শেখ (Shakil)', 'সুমাইয়া তাসনিম (Sumi)', 'কামরুল হাসান (Kamrul)', 
      'তামিম ইকবাল (Tamim)', 'মাহমুদুল হাসান (Nayan)', 'নাজমুল হুদা (Rony)', 
      'মনিকা পারভীন (Mim)', 'রাফসান জনি (Rafsan)', 'আব্দুর রহিম (Rahim)'
    ];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const timeString = 'আজকে ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    const bonusReward = 5.00;

    // 1. Update list
    setSimulatedReferrals(prev => [
      { name: randomName, date: timeString, bonus: bonusReward },
      ...prev
    ]);

    // 2. Add cash balance and increment referral count
    setUserState(prev => ({
      ...prev,
      referralsCount: prev.referralsCount + 1,
      balance: prev.balance + bonusReward
    }));

    // 3. Log in transaction Ledger
    const entry: TransactionLog = {
      id: `sim_ref_${Date.now()}`,
      type: 'referral',
      title: `Sponsor Partner [${randomName}] Joined`,
      amount: bonusReward,
      date: timeString,
      status: 'completed'
    };
    setTransactionHistory(prev => [entry, ...prev]);

    // Trigger visual notification
    alert(`🎉 অভিনন্দন! নতুন রেফারেল পার্টনার [${randomName}] সফলভাবে যুক্ত হয়েছে এবং ৳ ${bonusReward.toFixed(2)} টাকা আপনার একাউন্টে ক্রেডিট করা হয়েছে!`);
  };

  // Telegram tasks reward trigger
  const handleTelegramJoin = (type: 'channel' | 'group', reward: number) => {
    if (type === 'channel' && joinedChannel) return;
    if (type === 'group' && joinedGroup) return;

    if (type === 'channel') setJoinedChannel(true);
    if (type === 'group') setJoinedGroup(true);

    const titleText = type === 'channel' ? 'অফিসিয়াল টেলিগ্রাম চ্যানেল জয়েন' : 'টেলিগ্রাম আলোচনা গ্রুপ জয়েন';
    const timeString = 'আজকে ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

    // Credit Balance
    setUserState(prev => ({
      ...prev,
      balance: prev.balance + reward
    }));

    // Register transaction ledger
    const entry: TransactionLog = {
      id: `tele_${type}_${Date.now()}`,
      type: 'task',
      title: `${titleText} বোনাস ক্লেইম`,
      amount: reward,
      date: timeString,
      status: 'completed'
    };
    setTransactionHistory(prev => [entry, ...prev]);

    alert(`✅ সফল! ${titleText} করার জন্য ৳ ${reward.toFixed(2)} টাকা সরাসরি আপনার ব্যালেন্সে যোগ করা হয়েছে।`);
  };

  // Secret promo code submitter
  const submitPromoCode = () => {
    setPromoError(null);
    setPromoSuccess(null);

    const code = promoCodeInput.trim().toUpperCase();

    if (!code) {
      setPromoError('দয়া করে একটি প্রমো কোড লিখুন।');
      return;
    }

    if (claimedPromos.includes(code)) {
      setPromoError('এই প্রোমো কোডটি আপনি ইতিমধ্যে ক্লেইম করেছেন!');
      return;
    }

    // Supported active coupon promo codes
    interface PromoOption { amount: number; name: string }
    const promoCodes: Record<string, PromoOption> = {
      'CASHHIVE2026': { amount: 20.00, name: 'বিশেষ ২০ টাকা লঞ্চ কুপন' },
      'TASTE50': { amount: 10.00, name: 'মিষ্টি টেস্টিং বোনাস কুপন' },
      'DAILY_GIFT': { amount: 5.00, name: 'দৈনিক স্পেশাল জয়েন গিফট কুপন' }
    };

    if (promoCodes[code]) {
      const match = promoCodes[code];
      
      // Update balance
      setUserState(prev => ({
        ...prev,
        balance: prev.balance + match.amount
      }));

      // Set claimed list
      setClaimedPromos(prev => [...prev, code]);

      // Log in Transaction history
      const timeString = 'আজকে ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
      const entry: TransactionLog = {
        id: `promo_${code}_${Date.now()}`,
        type: 'task',
        title: `🎁 কুপন কোড [${code}] রিডিম বোনাস`,
        amount: match.amount,
        date: timeString,
        status: 'completed'
      };
      setTransactionHistory(prev => [entry, ...prev]);

      setPromoSuccess(`অসাধারন! "${match.name}" প্রোমো কোডটি সফলভাবে অ্যাক্টিভেট হয়েছে এবং ৳ ${match.amount.toFixed(2)} টাকা আপনার একাউন্টে যোগ করা হয়েছে! ✨`);
      setPromoCodeInput('');
    } else {
      setPromoError('ভুল প্রোমো কোড! সঠিক এবং ভ্যালিড কুপন কোড ব্যবহার করুন।');
    }
  };

  // Milestone claim handlers
  const handleClaimMilestone = (tier: number, target: number, reward: number) => {
    if (claimedMilestones.includes(tier)) return;
    if (userState.referralsCount < target) return;

    // Claim bonus
    setClaimedMilestones(prev => [...prev, tier]);

    setUserState(prev => ({
      ...prev,
      balance: prev.balance + reward
    }));

    const timeString = 'আজকে ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    entry: TransactionLog = {
      id: `milestone_${tier}_${Date.now()}`,
      type: 'task',
      title: `🏆 রেফার মাইলস্টোন লেভেল ${tier} অর্জন বোনাস`,
      amount: reward,
      date: timeString,
      status: 'completed'
    };
    setTransactionHistory(prev => [entry, ...prev]);

    alert(`🏆 অভিনন্দন! আপনি সফলভাবে ${target} পার্টনার রেফারাল লক্ষ্য পূরণ করে ৳ ${reward.toFixed(2)} টাকার জ্যাকপট মাইলস্টোন ক্লেইম করেছেন!`);
  };

  // Withdraw processing
  const handleLocalWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawSuccess(null);

    const amt = parseFloat(withdrawAmount);
    if (!amt || isNaN(amt)) {
      setWithdrawError('সঠিক টাকার অঙ্ক পূরণ করুন।');
      return;
    }

    if (amt < 100.0) {
      setWithdrawError('দুঃখিত, সর্বনিম্ন ক্যাশআউট লিমিট ৳ ১০০.০০ টাকা।');
      return;
    }

    if (amt > 25000.0) {
      setWithdrawError('দুঃখিত, সর্বোচ্চ ক্যাশআউট লিমিট ৳ ২৫,০০০.০০ টাকা।');
      return;
    }

    if (amt > userState.balance) {
      setWithdrawError('আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই!');
      return;
    }

    const phoneRegex = /^(01)[3-9]\d{8}$/;
    if (!phoneRegex.test(withdrawPhone)) {
      setWithdrawError('১১ ডিজিটের মোবাইল নম্বরটি সঠিক নয় (যেমন: 018XXXXXXXX)');
      return;
    }

    const res = onWithdrawRequest(amt, withdrawMethod, withdrawPhone);
    if (typeof res === 'string') {
      setWithdrawError(res);
    } else {
      setWithdrawSuccess(`আপনার ক্যাশআউট সাবমিট হয়েছে! ৫ থেকে ৬ ঘণ্টার ভেতর আপনার নাম্বারে সরাসরি টাকা চলে যাবে।`);
      setWithdrawAmount('');
      setWithdrawPhone('');
    }
  };

  return (
    <div id="new_menu_root_view" className="space-y-5 pb-12 animate-fade-in text-xs">
      
      {/* 1. HIGH COP-STATUS PROFILE HEADER CARD */}
      <div id="menu_user_profile_card" className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-[30px] p-5.5 text-white shadow-xl relative overflow-hidden group">
        {/* Animated ambient glowing backdrops */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-48 h-10 bg-yellow-400/5 rounded-full blur-2xl rotate-45 transform pointer-events-none"></div>

        {/* Diagonal high-tech laser scanline visual */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100%_4px] opacity-20 pointer-events-none"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            {/* Elegant Luxury Gold Profile Glow Border */}
            <div className="p-[2.5px] bg-gradient-to-tr from-yellow-400 via-amber-500 to-indigo-400 rounded-full shadow-lg shadow-amber-500/10">
              <img 
                src={userState.avatarSeed} 
                alt="Nahid Hasan Profile Avatar" 
                className="w-[66px] h-[66px] rounded-full border-2 border-slate-950 object-cover bg-indigo-950"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Highly visible pulsing glowing online beacon */}
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 border-[3px] border-slate-900 rounded-full animate-bounce shadow-md"></span>
          </div>

          <div className="space-y-1.5 flex-1 select-none">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 id="user_display_name_header" className="text-[15.5px] font-black tracking-tight text-white flex items-center gap-1 leading-none drop-shadow-md">
                {userState.name}
              </h4>
              {/* Premium Verification badge with custom styling */}
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-900 text-[9px] px-2 py-0.5 rounded-full font-black tracking-wider flex items-center gap-0.5 shadow-xs border border-amber-300/40 animate-pulse uppercase">
                <CheckCircle size={10} className="fill-slate-950 text-amber-400 stroke-[3px]" />
                Verified
              </span>
            </div>
            
            <p className="text-[10px] font-mono font-bold text-indigo-300 tracking-wider">@{userState.username}</p>
            
            {/* Beautiful dark carbon glass dynamic UID copy button */}
            <button 
              type="button"
              onClick={handleCopyUid}
              className="mt-1.5 text-[9.5px] font-mono font-black bg-slate-950/80 hover:bg-slate-950 text-indigo-100 py-1.5 px-3 rounded-xl border border-slate-800/80 hover:border-slate-700/85 active:scale-95 flex items-center gap-1.5 cursor-pointer transition-all w-fit shadow-inner"
            >
              <span className="text-indigo-400">UID:</span>
              <span className="text-white letter font-bold">{userState.uid || '7487052695'}</span>
              {copiedUid ? (
                <span className="text-amber-300 font-extrabold text-[9px] animate-fade-in">COPIED!</span>
              ) : (
                <Copy size={11} className="text-indigo-400 hover:text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Separate Physical High-Contrast Stats Cards Row */}
        <div id="stats_glorious_row" className="mt-4 pt-4 border-t border-slate-800/80 flex gap-3 relative z-10">
          
          {/* Card A: Dynamic Available Balance Card with Sparkling Gradient Text */}
          <div className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 border border-emerald-500/15 rounded-2xl p-3 flex flex-col justify-between shadow-inner relative overflow-hidden group/bal">
            <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-400/5 rounded-full blur-md"></div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="text-[9.5px] text-emerald-400 uppercase font-black tracking-widest font-sans inline-block">AVAILABLE BALANCE</span>
                <Sparkles size={10} className="text-emerald-400 animate-pulse" />
              </div>
              <p className="text-[20px] font-black tracking-tight leading-none bg-gradient-to-r from-emerald-400 via-teal-300 to-yellow-300 bg-clip-text text-transparent drop-shadow-xs font-sans mt-1">
                ৳ {userState.balance.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Card B: Team Power Active Counter Stats Card */}
          <div className="w-[42%] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/15 rounded-2xl p-3 text-right flex flex-col justify-between shadow-inner relative overflow-hidden group/team">
            <div className="absolute top-0 left-0 w-8 h-8 bg-indigo-500/5 rounded-full blur-md"></div>
            <div className="space-y-0.5">
              <span className="text-[9.5px] text-indigo-300 uppercase font-black tracking-widest font-sans block">TOTAL MEMBERS</span>
              <p className="text-[15px] font-black text-white leading-none mt-1">
                {1 + userState.referralsCount} <span className="text-indigo-300 font-extrabold text-[12px]">Members</span>
              </p>
              <span className="text-[8.5px] font-black bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 mt-0.5 rounded-md font-sans border border-emerald-500/20 inline-block animate-pulse">
                Active🟢
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================
          2. MENU CHANNELS LIST GROUP (EXACT FIDELITY SCREENSHOT) 
          ======================================================== */}

      {/* === CATEGORY: QUICK ACCESS === */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pl-1 select-none">
          <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
          <span className="text-[11px] font-black text-emerald-800 tracking-wider uppercase font-sans">QUICK ACCESS</span>
        </div>

        <div className="space-y-2.5">
          {/* SECURE ADMIN CONTROL CENTER CARD */}
          <div className="bg-gradient-to-r from-red-500/10 to-amber-500/10 rounded-3xl border border-amber-200/55 overflow-hidden shadow-xs transition-all">
            <button 
              onClick={() => onNavigate('admin')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-amber-500/15 transition-all cursor-pointer shadow-inner"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500 text-white rounded-2xl relative">
                  <Shield size={18} className="fill-white" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                </div>
                <div>
                  <h5 className="text-[13px] font-black text-rose-900 flex items-center gap-1.5 font-sans leading-none">
                    অ্যাডমিন কন্ট্রোল সেন্ট্রাল 🗝️
                  </h5>
                  <p className="text-[10.5px] text-amber-800 font-medium font-sans mt-1">সম্পূর্ণ সাইট নিয়ন্ত্রণ, মেম্বারদের ব্যালেন্স ও পেমেন্ট ড্যাশবোর্ড</p>
                </div>
              </div>
              <div className="p-1 px-2 text-[10px] bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl flex items-center gap-1 shrink-0">
                প্রবেশ
                <ArrowRight size={11} />
              </div>
            </button>
          </div>

          {/* A. DASHBOARD CARD */}
          <div className="bg-white rounded-3xl border border-emerald-100/70 hover:border-emerald-300 hover:shadow-md overflow-hidden transition-all group relative">
            <button 
              onClick={() => toggleSection('dashboard')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-emerald-50/10 hover:to-transparent transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-md shadow-emerald-150 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3">
                  <LayoutGrid size={19} className="text-white relative z-10" />
                  <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h5 className="text-[13.5px] font-black text-slate-850 font-sans tracking-tight leading-none uppercase">Dashboard 📊</h5>
                  <p className="text-[10px] text-emerald-600 font-extrabold mt-1 leading-none">আপনার মেইন ওভারভিউ ও প্রোফাইল সেটিংস</p>
                </div>
              </div>
              <div className="text-slate-400 group-hover:text-emerald-500 transition-colors">
                {expandedSection === 'dashboard' ? <ChevronDown size={17} className="stroke-[2.5px]" /> : <ChevronRight size={17} className="stroke-[2.5px]" />}
              </div>
            </button>

            {expandedSection === 'dashboard' && (
              <div className="p-4 border-t border-gray-50 bg-slate-50/40 space-y-4 animate-fade-in">
                
                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-3 rounded-2xl border border-gray-100 text-center space-y-0.5">
                    <span className="text-[9px] text-gray-400 font-extrabold uppercase">TOTAL EARNED</span>
                    <p className="text-sm font-black text-slate-800">৳ {userState.balance.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-gray-100 text-center space-y-0.5">
                    <span className="text-[9px] text-gray-400 font-extrabold uppercase">MICRO JOBS</span>
                    <p className="text-sm font-black text-slate-800">{userState.tasksCompletedCount} Done</p>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-gray-100 text-center space-y-0.5">
                    <span className="text-[9px] text-gray-400 font-extrabold uppercase">ADS WATCHED</span>
                    <p className="text-sm font-black text-slate-800">{userState.adsWatchedCount} Ads</p>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-gray-100 text-center space-y-0.5">
                    <span className="text-[9px] text-gray-400 font-extrabold uppercase">TEAM REFERRALS</span>
                    <p className="text-sm font-black text-slate-800">{userState.referralsCount} Friends</p>
                  </div>
                </div>

                {/* Edit Profile Form Subpanel */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h6 className="font-extrabold text-slate-850 text-xs flex items-center gap-1 text-slate-800 bg-transparent py-0.5">
                      <Edit3 size={12} className="text-emerald-500" />
                      প্রোফাইল সম্পাদন (Update Profile Settings)
                    </h6>
                    {!isEditingProfile ? (
                      <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="text-[10px] text-emerald-600 font-extrabold hover:underline cursor-pointer"
                      >
                        সম্পাদন করুন
                      </button>
                    ) : (
                      <button 
                        onClick={saveProfileSettings}
                        className="text-[10px] text-green-600 font-extrabold hover:underline cursor-pointer"
                      >
                        সংরক্ষণ করুন
                      </button>
                    )}
                  </div>

                  {profileSuccessMsg && (
                    <div className="bg-emerald-50 text-emerald-700 py-2 px-2.5 rounded-lg border border-emerald-100 font-bold text-[9px] flex items-center gap-1">
                      <CheckCircle size={11} /> প্রোফাইল সেটিংস আপডেট হয়েছে!
                    </div>
                  )}

                  {isEditingProfile ? (
                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">CHOOSE ICON VIEW</label>
                        <div className="flex gap-1.5 overflow-x-auto py-1.5">
                          {AVATAR_SEEDS.map((seed, idx) => (
                            <button 
                              key={idx}
                              type="button"
                              onClick={() => setProfileAvatar(seed)}
                              className={`w-9 h-9 rounded-full border-2 flex-shrink-0 cursor-pointer overflow-hidden ${
                                profileAvatar === seed ? 'border-emerald-500 scale-105 shadow-xs' : 'border-transparent'
                              }`}
                            >
                              <img src={seed} alt="Seed" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400/80">আপনার নাম (Name):</label>
                          <input 
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400/80">ইউজারনেম (Username):</label>
                          <input 
                            type="text"
                            value={profileUsername}
                            onChange={(e) => setProfileUsername(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 p-2 bg-slate-50/50 rounded-xl">
                      <img src={userState.avatarSeed} className="w-10 h-10 rounded-full object-cover bg-slate-100" referrerPolicy="no-referrer" />
                      <div>
                        <p className="font-bold text-slate-800">{userState.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">@{userState.username}</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* C. DEDICATED VIP TASK HISTORY CARD */}
          <div className="bg-white rounded-3xl border border-amber-200/80 hover:border-amber-400 hover:shadow-md overflow-hidden transition-all group relative">
            <button 
              onClick={() => toggleSection('vip_task_history')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-amber-50/10 hover:to-transparent transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 shadow-md shadow-amber-200 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6">
                  <Crown size={19} className="text-white relative z-10" />
                  <div className="absolute inset-0 bg-white/10 rounded-lg scale-75 border border-dashed border-white/30"></div>
                </div>
                <div>
                  <h5 className="text-[14px] font-black tracking-tight text-slate-850 font-sans uppercase">VIP Task History 👑</h5>
                  <p className="text-[10px] text-amber-600 font-extrabold mt-1 leading-none">ভিআইপি কাজের প্রমান ও পেমেন্ট স্ট্যাটাস অডিট</p>
                </div>
              </div>
              <div className="text-slate-400 group-hover:text-amber-500 transition-colors">
                {expandedSection === 'vip_task_history' ? <ChevronDown size={17} className="stroke-[2.5px]" /> : <ChevronRight size={17} className="stroke-[2.5px]" />}
              </div>
            </button>

            {expandedSection === 'vip_task_history' && (
              <div className="p-4 border-t border-gray-50 bg-slate-50/40 space-y-4 animate-fade-in text-slate-700">
                {/* Visual Header / Explainer */}
                <div className="bg-amber-500/5 border border-amber-100 p-3 rounded-2xl text-amber-950 text-xs leading-relaxed font-semibold">
                  👑 <strong>ভিআইপি মেগাজব হিস্টোরি:</strong> আপনার করা সমস্ত ভিআইপি টাস্কের অডিট রিপোর্ট ও কাজের স্ট্যাটাস এখানে চেক করতে পারবেন। এডমিন প্যানেল চেক করার পর সাথে সাথে ব্যালেন্স যোগ হবে।
                </div>

                {/* Filter buttons */}
                <div className="grid grid-cols-4 gap-1">
                  {(['all', 'pending', 'completed', 'failed'] as const).map((filterVal) => (
                    <button
                      key={filterVal}
                      type="button"
                      onClick={() => setVipTxFilter(filterVal)}
                      className={`py-1.5 px-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer border ${
                        vipTxFilter === filterVal
                          ? 'bg-amber-500 border-amber-600 text-white font-black shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {filterVal === 'all' && 'সব (All)'}
                      {filterVal === 'pending' && 'পেন্ডিং'}
                      {filterVal === 'completed' && 'সফল'}
                      {filterVal === 'failed' && 'বাতিল'}
                    </button>
                  ))}
                </div>

                {/* List of items */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {(() => {
                    const vipHistoryList = transactionHistory.filter((log) => {
                      let isVip = log.type === 'vip_proof';
                      if (log.taskId) {
                        const associatedTask = tasks.find(t => t.id === log.taskId);
                        if (associatedTask?.category === 'vip') isVip = true;
                      }
                      const lowerTitle = log.title.toLowerCase();
                      if (lowerTitle.includes('vip') || log.title.includes('👑') || log.title.includes('ভিআইপি')) {
                        const hasSocial = lowerTitle.includes('social') || log.title.includes('📢') || log.title.includes('সোশ্যাল');
                        const hasPremium = lowerTitle.includes('premium') || log.title.includes('💎') || log.title.includes('প্রিমিয়াম');
                        if (!hasSocial && !hasPremium) {
                          isVip = true;
                        }
                      }
                      if (log.type === 'social_proof' || log.type === 'premium_proof') {
                        isVip = false;
                      }

                      if (!isVip) return false;
                      const matchesUser = !log.username || log.username === userState.username;
                      if (!matchesUser) return false;
                      if (vipTxFilter === 'all') return true;
                      return log.status === vipTxFilter;
                    });

                    if (vipHistoryList.length === 0) {
                      return (
                        <div className="p-6 text-center bg-white text-slate-400 border border-dashed rounded-2xl text-[11px] space-y-1">
                          <span className="text-xl block">👑</span>
                          <p className="font-extrabold">কোনো ভিআইপি কাজ পাওয়া যায়নি!</p>
                          <p className="text-[10px] text-slate-400 font-medium">ফিল্টার অনুযায়ী আপনার কোনো রেকর্ড নেই।</p>
                        </div>
                      );
                    }

                    return vipHistoryList.map((log) => {
                      const statusColor = 
                        log.status === 'completed' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                        log.status === 'pending' ? 'text-amber-600 bg-amber-50 border-amber-100 animate-pulse' :
                        'text-red-600 bg-red-50 border-red-100';

                      const statusText = 
                        log.status === 'completed' ? 'এপ্রুভড (Approved)' :
                        log.status === 'pending' ? 'অডিটে রয়েছে (Pending)' :
                        'বাতিল করা হয়েছে (Rejected)';

                      return (
                        <div key={log.id} className="bg-white p-3 rounded-2xl border border-slate-150 space-y-2 animate-fade-in text-xs shadow-xs">
                          <div className="flex justify-between items-start gap-2">
                            <div className="space-y-1">
                              <h6 className="font-bold text-slate-800 text-[11px] leading-snug">{log.title}</h6>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[8px] font-mono px-1.5 py-0.2 rounded font-extrabold uppercase bg-amber-50 text-amber-600 border border-amber-100">
                                  VIP Job
                                </span>
                                <span className="text-[8px] text-gray-400 font-medium">{log.date}</span>
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end flex-shrink-0">
                              <span className="text-[12px] font-black font-sans text-amber-600">
                                +৳ {log.amount.toFixed(2)}
                              </span>
                              <span className="text-[8px] text-slate-400 font-mono">ID: {log.id.slice(-8)}</span>
                            </div>
                          </div>

                          {/* Render screenshot if submitted for VIP validation */}
                          {log.proofScreenshot && (
                            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                              <img 
                                src={log.proofScreenshot} 
                                alt="Admin submitted task checkpoint proof" 
                                className="w-10 h-10 object-cover rounded-lg border border-slate-300"
                                referrerPolicy="no-referrer"
                              />
                              {log.proofScreenshot2 && (
                                <img 
                                  src={log.proofScreenshot2} 
                                  alt="Admin submitted task checkpoint proof 2" 
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-300"
                                  referrerPolicy="no-referrer"
                                />
                              )}
                              <div className="space-y-0.5">
                                <p className="text-[9px] text-slate-500 font-bold block">দাখিলকৃত প্রুফ স্ক্রিনশট (Receipt Proof)</p>
                                <p className="text-[8px] text-slate-400">{log.proofScreenshot2 ? '২টি স্ক্রিনশট সফলভাবে সাবমিট করা আছে।' : '১টি স্ক্রিনশট সফলভাবে সাবমিট করা আছে।'}</p>
                              </div>
                            </div>
                          )}

                          <div className={`text-[9.5px] font-black px-2 py-0.5 rounded-xl border w-fit font-sans flex items-center gap-1 ${statusColor}`}>
                            <span className="w-1 h-1 rounded-full bg-current"></span>
                            <span>{statusText}</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* D. DEDICATED SOCIAL TASK HISTORY CARD */}
          <div className="bg-white rounded-3xl border border-sky-200/80 hover:border-sky-450 hover:shadow-md overflow-hidden transition-all group relative">
            <button 
              onClick={() => toggleSection('social_task_history')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-sky-50/10 hover:to-transparent transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-550 from-sky-500 to-cyan-400 shadow-md shadow-sky-200 flex items-center justify-center transition-all group-hover:scale-110 group-hover:-rotate-6">
                  <Megaphone size={18} className="text-white relative z-10" />
                  <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h5 className="text-[14px] font-black tracking-tight text-slate-850 font-sans uppercase">Social Task History 📢</h5>
                  <p className="text-[10px] text-sky-655 font-extrabold mt-1 text-sky-600 leading-none">সোশ্যাল লাইক ও সাবস্ক্রিপশন কাজের প্রমান বিবরণ</p>
                </div>
              </div>
              <div className="text-slate-400 group-hover:text-sky-500 transition-colors">
                {expandedSection === 'social_task_history' ? <ChevronDown size={17} className="stroke-[2.5px]" /> : <ChevronRight size={17} className="stroke-[2.5px]" />}
              </div>
            </button>

            {expandedSection === 'social_task_history' && (
              <div className="p-4 border-t border-gray-50 bg-slate-50/40 space-y-4 animate-fade-in text-slate-700">
                {/* Visual Header / Explainer */}
                <div className="bg-sky-500/5 border border-sky-100 p-3 rounded-2xl text-sky-950 text-xs leading-relaxed">
                  📢 <strong>সোশ্যাল পেজ সাবস্ক্রিপশন ও ফলো হিস্টোরি:</strong> আপনার করা সমস্ত সোশ্যাল টাস্কের জমানো কাজের অডিট রিপোর্ট এখানে চেক করতে পারবেন।
                </div>

                {/* List of items */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                   {(() => {
                    const socialList = transactionHistory.filter(log => {
                      let isSocial = log.type === 'social_proof';
                      if (log.taskId) {
                        const associatedTask = tasks.find(t => t.id === log.taskId);
                        if (associatedTask?.category === 'social') isSocial = true;
                      }
                      const lowerTitle = log.title.toLowerCase();
                      if (lowerTitle.includes('social') || log.title.includes('📢') || log.title.includes('সোশ্যাল')) {
                        const hasVip = lowerTitle.includes('vip') || log.title.includes('👑') || log.title.includes('ভিআইপি');
                        const hasPremium = lowerTitle.includes('premium') || log.title.includes('💎') || log.title.includes('প্রিমিয়াম');
                        if (!hasVip && !hasPremium) {
                          isSocial = true;
                        }
                      }
                      if (log.type === 'vip_proof' || log.type === 'premium_proof') {
                        isSocial = false;
                      }
                      const matchesUser = !log.username || log.username === userState.username;
                      return isSocial && matchesUser;
                    });

                    if (socialList.length === 0) {
                      return (
                        <div className="p-6 text-center bg-white text-slate-400 border border-dashed rounded-2xl text-[11px] space-y-1">
                          <span className="text-xl block">📢</span>
                          <p className="font-extrabold">কোনো সোশ্যাল কাজের রেকর্ড নেই!</p>
                          <p className="text-[10px] text-slate-400">আপনি এখনও কোনো সোশ্যাল টাস্কের প্রুফ সাবমিট করেননি।</p>
                        </div>
                      );
                    }

                    return socialList.map((log) => {
                      const statusColor = 
                        log.status === 'completed' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                        log.status === 'pending' ? 'text-amber-600 bg-amber-50 border-amber-100 animate-pulse' :
                        'text-red-600 bg-red-50 border-red-100';

                      const statusText = 
                        log.status === 'completed' ? 'এপ্রুভড (Approved)' :
                        log.status === 'pending' ? 'অডিটে রয়েছে (Pending)' :
                        'বাতিল করা হয়েছে (Rejected)';

                      return (
                        <div key={log.id} className="bg-white p-3 rounded-2xl border border-slate-150 space-y-2 animate-fade-in text-xs shadow-xs">
                          <div className="flex justify-between items-start gap-2">
                            <div className="space-y-1">
                              <h6 className="font-bold text-slate-800 text-[11px] leading-snug">{log.title}</h6>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[8px] font-mono px-1.5 py-0.2 rounded font-extrabold uppercase bg-sky-50 text-sky-600 border border-sky-100">
                                  Social Job
                                </span>
                                <span className="text-[8px] text-gray-400 font-medium">{log.date}</span>
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end flex-shrink-0">
                              <span className="text-[12px] font-black font-sans text-sky-600">
                                +৳ {log.amount.toFixed(2)}
                              </span>
                              <span className="text-[8px] text-slate-400 font-mono">ID: {log.id.slice(-8)}</span>
                            </div>
                          </div>

                          {/* Render screenshot if submitted */}
                          {log.proofScreenshot && (
                            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                              <img 
                                src={log.proofScreenshot} 
                                alt="Admin submitted social proof screenshot" 
                                className="w-10 h-10 object-cover rounded-lg border border-slate-300"
                                referrerPolicy="no-referrer"
                              />
                              <div className="space-y-0.5">
                                <p className="text-[9px] text-slate-500 font-bold block">দাখিলকৃত সোশ্যাল প্রুফ স্ক্রিনশট (Screenshot Proof)</p>
                                <p className="text-[8px] text-slate-400">১০ সেকেন্ডের প্রুফ চেকপয়েন্ট। সঠিকতা নিশ্চিত হলে ব্যালেন্স অ্যাড হবে।</p>
                              </div>
                            </div>
                          )}

                          <div className={`text-[9.5px] font-black px-2 py-0.5 rounded-xl border w-fit font-sans flex items-center gap-1 ${statusColor}`}>
                            <span className="w-1 h-1 rounded-full bg-current"></span>
                            <span>{statusText}</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* D2. DEDICATED PREMIUM TASK HISTORY CARD */}
          <div className="bg-white rounded-3xl border border-purple-200/80 hover:border-purple-450 hover:shadow-md overflow-hidden transition-all group relative">
            <button 
              onClick={() => toggleSection('premium_task_history')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-purple-550/10 hover:to-transparent transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-400 shadow-md shadow-purple-200 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6">
                  <Award size={19} className="text-white relative z-10" />
                  <div className="absolute inset-0.5 bg-gradient-to-b from-white/20 to-transparent rounded-xl"></div>
                </div>
                <div>
                  <h5 className="text-[14px] font-black tracking-tight text-slate-850 font-sans uppercase">Premium Task History 💎</h5>
                  <p className="text-[10px] text-purple-600 font-extrabold mt-1 leading-none">প্রিমিয়াম কাজ ও স্ক্রিনশট পেমেন্ট যাচাইকরণের বিস্তারিত</p>
                </div>
              </div>
              <div className="text-slate-400 group-hover:text-purple-500 transition-colors">
                {expandedSection === 'premium_task_history' ? <ChevronDown size={17} className="stroke-[2.5px]" /> : <ChevronRight size={17} className="stroke-[2.5px]" />}
              </div>
            </button>

            {expandedSection === 'premium_task_history' && (
              <div className="p-4 border-t border-gray-50 bg-slate-50/40 space-y-4 animate-fade-in text-slate-700">
                {/* Visual Header / Explainer */}
                <div className="bg-purple-500/5 border border-purple-100 p-3 rounded-2xl text-purple-950 text-xs leading-relaxed font-semibold">
                  💎 <strong>প্রিমিয়াম মেম্বারশিপ টাস্ক হিস্টোরি:</strong> আপনার সাবমিট করা প্রিমিয়াম কাজের প্রমাণ ও অনুমোদন রেকর্ড এখানে চেক করতে পারবেন। এডমিন চেক করার পর আপডেট করা হবে।
                </div>

                {/* Filter buttons */}
                <div className="grid grid-cols-4 gap-1">
                  {(['all', 'pending', 'completed', 'failed'] as const).map((filterVal) => (
                    <button
                      key={filterVal}
                      type="button"
                      onClick={() => setPremiumTxFilter(filterVal)}
                      className={`py-1.5 px-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer border ${
                        premiumTxFilter === filterVal
                          ? 'bg-purple-600 border-purple-700 text-white font-black shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {filterVal === 'all' && 'সব (All)'}
                      {filterVal === 'pending' && 'পেন্ডিং'}
                      {filterVal === 'completed' && 'সফল'}
                      {filterVal === 'failed' && 'বাতিল'}
                    </button>
                  ))}
                </div>

                {/* List of items */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {(() => {
                    const premiumHistoryList = transactionHistory.filter((log) => {
                      let isPremium = log.type === 'premium_proof';
                      if (log.taskId) {
                        const associatedTask = tasks.find(t => t.id === log.taskId);
                        if (associatedTask?.category === 'premium') isPremium = true;
                      }
                      const lowerTitle = log.title.toLowerCase();
                      if (lowerTitle.includes('premium') || log.title.includes('💎') || log.title.includes('প্রিমিয়াম') || log.title.includes('📸')) {
                        const hasVip = lowerTitle.includes('vip') || log.title.includes('👑') || log.title.includes('ভিআইপি');
                        const hasSocial = lowerTitle.includes('social') || log.title.includes('📢') || log.title.includes('সোশ্যাল');
                        if (!hasVip && !hasSocial) {
                          isPremium = true;
                        }
                      }
                      if (log.type === 'vip_proof' || log.type === 'social_proof') {
                        isPremium = false;
                      }

                      if (!isPremium) return false;
                      const matchesUser = !log.username || log.username === userState.username;
                      if (!matchesUser) return false;
                      if (premiumTxFilter === 'all') return true;
                      return log.status === premiumTxFilter;
                    });

                    if (premiumHistoryList.length === 0) {
                      return (
                        <div className="p-6 text-center bg-white text-slate-400 border border-dashed rounded-2xl text-[11px] space-y-1">
                          <span className="text-xl block">💎</span>
                          <p className="font-extrabold">কোনো প্রিমিয়াম কাজ পাওয়া যায়নি!</p>
                          <p className="text-[10px] text-slate-400 font-medium">আপনি এখনও কোনো প্রিমিয়াম কাজের প্রুফ সাবমিট করেননি।</p>
                        </div>
                      );
                    }

                    return premiumHistoryList.map((log) => {
                      const statusColor = 
                        log.status === 'completed' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                        log.status === 'pending' ? 'text-amber-600 bg-amber-50 border-amber-100 animate-pulse' :
                        'text-red-600 bg-red-50 border-red-100';

                      const statusText = 
                        log.status === 'completed' ? 'এপ্রুভড (Approved)' :
                        log.status === 'pending' ? 'অডিটে রয়েছে (Pending)' :
                        'বাতিল করা হয়েছে (Rejected)';

                      return (
                        <div key={log.id} className="bg-white p-3 rounded-2xl border border-slate-150 space-y-2 animate-fade-in text-xs shadow-xs">
                          <div className="flex justify-between items-start gap-2">
                            <div className="space-y-1">
                              <h6 className="font-bold text-slate-800 text-[11px] leading-snug">{log.title}</h6>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[8px] font-mono px-1.5 py-0.2 rounded font-extrabold uppercase bg-purple-50 text-purple-600 border border-purple-100">
                                  Premium Job
                                </span>
                                <span className="text-[8px] text-gray-400 font-medium">{log.date}</span>
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end flex-shrink-0">
                              <span className="text-[12px] font-black font-sans text-purple-600">
                                +৳ {log.amount.toFixed(2)}
                              </span>
                              <span className="text-[8px] text-slate-400 font-mono">ID: {log.id.slice(-8)}</span>
                            </div>
                          </div>

                          {/* Render screenshots if submitted for premium validation */}
                          {log.proofScreenshot && (
                            <div className="space-y-1 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                              <div className="flex items-center gap-2">
                                <img 
                                  src={log.proofScreenshot} 
                                  alt="Admin submitted premium checkpoint proof" 
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-300"
                                  referrerPolicy="no-referrer"
                                />
                                {log.proofScreenshot2 && (
                                  <img 
                                    src={log.proofScreenshot2} 
                                    alt="Admin submitted premium checkpoint proof 2" 
                                    className="w-10 h-10 object-cover rounded-lg border border-slate-300"
                                    referrerPolicy="no-referrer"
                                  />
                                )}
                                <div className="space-y-0.5">
                                  <p className="text-[9px] text-slate-500 font-bold block">দাখিলকৃত প্রুফ স্ক্রিনশট (Receipt Proof)</p>
                                  <p className="text-[8px] text-slate-400">{log.proofScreenshot2 ? '২টি স্ক্রিনশট সফলভাবে সাবমিট করা আছে।' : '১টি স্ক্রিনশট সফলভাবে সাবমিট করা আছে।'}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className={`text-[9.5px] font-black px-2 py-0.5 rounded-xl border w-fit font-sans flex items-center gap-1 ${statusColor}`}>
                            <span className="w-1 h-1 rounded-full bg-current"></span>
                            <span>{statusText}</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* B. MY TEAM REFERRAL CARD */}
          <div className="bg-white rounded-3xl border border-rose-200/80 hover:border-rose-400 hover:shadow-md overflow-hidden transition-all group relative">
            <button 
              onClick={() => toggleSection('team')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-rose-50/10 hover:to-transparent transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 shadow-md shadow-rose-200 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6">
                  <Users size={19} className="text-white relative z-10" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-teal-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h5 className="text-[14px] font-black tracking-tight text-slate-850 font-sans uppercase">My Team 👥</h5>
                  <p className="text-[10px] text-rose-600 font-extrabold mt-1 leading-none">আপনার রেফার করা বন্ধুদের বিবরণ ও রেভিনিউ হিস্টোরি</p>
                </div>
              </div>
              <div className="text-slate-400 group-hover:text-rose-500 transition-colors">
                {expandedSection === 'team' ? <ChevronDown size={17} className="stroke-[2.5px]" /> : <ChevronRight size={17} className="stroke-[2.5px]" />}
              </div>
            </button>

            {expandedSection === 'team' && (
              <div className="p-4 border-t border-gray-50 bg-slate-50/40 space-y-4 animate-fade-in">
                
                {/* 1. GREETINGS WELCOME BANNER */}
                <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 p-4 rounded-2xl text-white relative overflow-hidden shadow-md">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                  <div className="relative z-10 space-y-1">
                    <p className="text-[10px] uppercase tracking-widest font-mono text-rose-100 font-extrabold">🎖️ TEAM ZONE WELCOME</p>
                    <h4 className="text-[14px] font-black leading-tight">🎉 অভিনন্দন ও শুভেচ্ছা! টিম পার্টনার জোনে আপনাকে স্বাগতম।</h4>
                    <p className="text-[10px] text-rose-50 font-bold leading-normal">
                      আপনার রেফারেল সার্কেল বড় করুন, একটি সচল টিম তৈরি করুন এবং প্রতি মাসে প্ল্যাটফর্ম থেকে নির্দিষ্ট মাসিক স্যালারি (বেতন) ও আর্থিক কমিশন উপভোগ করুন!
                    </p>
                  </div>
                </div>

                {/* 2. TEAM SALARY SYSTEM CARDS */}
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 p-4 rounded-2xl text-white space-y-3 border border-indigo-800 shadow-md">
                  <div className="flex items-center gap-1.5 border-b border-indigo-800/65 pb-2">
                    <span className="text-sm">💼</span>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300 font-sans">টিম স্যালারি সিস্টেম (Team Salary Scheme)</h4>
                      <p className="text-[9px] text-gray-400 font-bold">৫০ জন বা তার বেশি অ্যাক্টিভ মেম্বার হলেই প্রতি মাসে নিশ্চিত স্যালারি গিল্ড!</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Tier 1 Salary */}
                    <div className="bg-indigo-900/60 p-2.5 rounded-xl border border-indigo-700/50 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-[10px]">
                          🥈
                        </div>
                        <div>
                          <p className="text-[11px] font-extrabold text-slate-100 font-sans">৫০টি রেফার একটিভ মেম্বার</p>
                          <p className="text-[8px] text-slate-400 font-bold">সফলভাবে টিম প্রমোশন অর্জন</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-400 font-sans">৳ ২৫০.০০ / মাস</span>
                        <p className="text-[7.5px] uppercase text-slate-400 font-mono">Monthly Salary</p>
                      </div>
                    </div>

                    {/* Tier 2 Salary */}
                    <div className="bg-indigo-900/60 p-2.5 rounded-xl border border-indigo-700/50 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-[10px]">
                          🥇
                        </div>
                        <div>
                          <p className="text-[11px] font-extrabold text-slate-100 font-sans">১০০টি রেফার একটিভ মেম্বার</p>
                          <p className="text-[8px] text-slate-400 font-bold">সুপার স্টার লিডার ক্যাটাগরি</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-amber-400 font-sans">৳ ৫০০.০০ / মাস</span>
                        <p className="text-[7.5px] uppercase text-slate-400 font-mono">Monthly Salary</p>
                      </div>
                    </div>

                    {/* Tier 3 Salary */}
                    <div className="bg-indigo-900/60 p-2.5 rounded-xl border border-indigo-700/50 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 font-black flex items-center justify-center text-[10px]">
                          👑
                        </div>
                        <div>
                          <p className="text-[11px] font-extrabold text-slate-100 font-sans">২০০টি রেফার একটিভ মেম্বার</p>
                          <p className="text-[8px] text-slate-400 font-bold">রয়্যাল পার্টনার এলিট টিম</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-rose-400 font-sans">৳ ৮০০.০০ / মাস</span>
                        <p className="text-[7.5px] uppercase text-slate-400 font-mono">Monthly Salary</p>
                      </div>
                    </div>

                    {/* Tier 4 Salary */}
                    <div className="bg-indigo-900/60 p-2.5 rounded-xl border border-indigo-700/50 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-400 font-black flex items-center justify-center text-[10px]">
                          💎
                        </div>
                        <div>
                          <p className="text-[11px] font-extrabold text-slate-100 font-sans">৫০০টি রেফার একটিভ মেম্বার</p>
                          <p className="text-[8px] text-slate-400 font-bold">হায়েস্ট লিজেন্ডারি গ্যারান্টি স্যালারি</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-pink-400 font-sans">৳ ১৫০০.০০ / মাস</span>
                        <p className="text-[7.5px] uppercase text-slate-400 font-mono">Monthly Salary</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-rose-500/5 border border-rose-100 p-3 rounded-2xl text-rose-900 text-xs leading-relaxed">
                  📢 <strong>রেফারেল কমিশন অফার:</strong> আপনার বন্ধুদের রেফার করুন। প্রতিটি সফল রেফারেলে পান সরাসরি ৳ ৫.০০ টাকা এবং তাদের আজীবনের আয়ের ১০% বোনাস ও মেম্বারশিপ কমিশন!
                </div>



              </div>
            )}
          </div>
        </div>
      </div>

      {/* === CATEGORY: PAY OUT === */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pl-1 select-none">
          <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
          <span className="text-[11px] font-black text-emerald-800 tracking-wider uppercase font-sans">PAY OUT</span>
        </div>

        <div className="space-y-2.5">
          <div className="bg-white rounded-3xl border border-sky-200/80 hover:border-sky-400 hover:shadow-md overflow-hidden transition-all group relative">
            <button 
              onClick={() => toggleSection('payout')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-sky-50/10 hover:to-transparent transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-400 shadow-md shadow-sky-200 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3">
                  <Wallet size={19} className="text-white relative z-10" />
                  <div className="absolute top-1 left-1.5 w-1.5 h-1 bg-white/40 rounded-sm"></div>
                </div>
                <div>
                  <h5 className="text-[14px] font-black tracking-tight text-slate-850 font-sans uppercase">Pay Out 💳</h5>
                  <p className="text-[10px] text-sky-600 font-extrabold mt-1 leading-none">টাকা তোলার রিকোয়েস্ট ও পূর্ববর্তী ট্রানজেকশন হিস্টোরি</p>
                </div>
              </div>
              <div className="text-slate-400 group-hover:text-blue-500 transition-colors">
                {expandedSection === 'payout' ? <ChevronDown size={17} className="stroke-[2.5px]" /> : <ChevronRight size={17} className="stroke-[2.5px]" />}
              </div>
            </button>

            {expandedSection === 'payout' && (
              <div className="p-4 border-t border-gray-50 bg-slate-50/40 space-y-4 animate-fade-in">
                
                {withdrawSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold mx-auto animate-bounce">✓</div>
                    <p className="font-bold text-xs">{withdrawSuccess}</p>
                    <button 
                      onClick={() => setWithdrawSuccess(null)}
                      className="text-[10px] bg-white border border-emerald-200 text-emerald-700 font-black px-3 py-1 rounded cursor-pointer"
                    >
                      আরেকটি উইথড্র রিকোয়েস্ট করুন
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleLocalWithdraw} className="space-y-3">
                    <div className="text-center font-bold text-slate-700 text-xs">ক্যাশআউট রিকোয়েস্ট (Instant Payout Gate)</div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {['bKash', 'Nagad', 'Rocket'].map((gateway) => (
                        <button 
                          key={gateway}
                          type="button"
                          onClick={() => setWithdrawMethod(gateway as any)}
                          className={`p-2.5 rounded-xl border text-center font-bold text-[10px] transition-all cursor-pointer ${
                            withdrawMethod === gateway 
                              ? gateway === 'bKash' ? 'border-pink-500 bg-pink-105/30 text-pink-600 bg-pink-50' :
                                gateway === 'Nagad' ? 'border-orange-500 bg-orange-105/30 text-orange-600 bg-orange-50' :
                                'border-indigo-500 bg-indigo-105/30 text-indigo-600 bg-indigo-50'
                              : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {gateway}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400">টাকার পরিমাণ (৳ ১০০ - ২৫,০০০):</label>
                        <input 
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="৳ ১০০"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400">১১ ডিজিট একাউন্ট নম্বর:</label>
                        <input 
                          type="text"
                          maxLength={11}
                          value={withdrawPhone}
                          onChange={(e) => setWithdrawPhone(e.target.value)}
                          placeholder="017XXXXXXXX"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                    {withdrawError && (
                      <div className="text-[10px] text-red-500 bg-red-50 border border-red-100 p-2 rounded-lg flex items-center gap-1">
                        <AlertCircle size={12} />
                        <span>{withdrawError}</span>
                      </div>
                    )}

                    <button 
                      type="submit"
                      className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2.5 font-extrabold rounded-xl shadow-xs cursor-pointer text-[11px]"
                    >
                      ক্যাশআউট রিকোয়েস্ট করুন (৳ CashOut)
                    </button>
                  </form>
                )}

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">PAYMENT TRANS HISTORY (লেনদেনের ইতিহাস)</p>
                  
                  {transactionHistory.filter(l => l.type.includes('withdraw') && (l.username === userState.username || l.userUid === userState.uid || !l.username)).length === 0 ? (
                    <div className="p-3 bg-white text-center text-slate-400 border border-dashed rounded-xl">
                      কোনো ক্যাশআউট ট্রানজেকশন প্রমান পাওয়া যায়নি।
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {transactionHistory.filter(l => l.type.includes('withdraw') && (l.username === userState.username || l.userUid === userState.uid || !l.username)).map((log) => (
                        <div key={log.id} className="p-2.5 bg-white border border-slate-100 rounded-xl flex justify-between items-center animate-fade-in">
                          <div>
                            <p className="font-extrabold text-slate-700 text-[11px] leading-tight">{log.title}</p>
                            <p className="text-[8px] text-slate-400">{log.date}</p>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <span className="text-[10px] font-extrabold text-rose-500">-৳ {log.amount.toFixed(2)}</span>
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded border ${
                              log.status === 'completed' ? 'bg-emerald-50 text-emerald-650 border-emerald-100 font-black text-emerald-700' :
                              log.status === 'failed' ? 'bg-rose-50 text-rose-650 border-rose-100 text-rose-650' :
                              'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                            }`}>
                              {log.status === 'completed' ? 'সফল হয়েছে / Success' :
                               log.status === 'failed' ? 'বাতিল / Rejected' :
                               'অপেক্ষমাণ / Pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* === CATEGORY: WORK & TASKS === */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pl-1 select-none">
          <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
          <span className="text-[11px] font-black text-emerald-800 tracking-wider uppercase font-sans">WORK & TASKS (আয় করার মাধ্যম)</span>
        </div>

        <div className="space-y-2.5">
          {/* A. DAILY MICRO JOBS BANNER (REDIRECT SYSTEM) */}
          <div className="bg-white rounded-3xl border border-emerald-200 hover:border-emerald-400 hover:shadow-md overflow-hidden transition-all group relative">
            <button 
              onClick={() => {
                alert("🚀 কাজ ডেস্কে নিয়ে যাওয়া হচ্ছে! অনুগ্রহ করে ডেইলি মাইক্রো জব সাবমিট করুন।");
                onNavigate('task');
              }}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-emerald-50/10 hover:to-transparent transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-md shadow-emerald-200 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6">
                  <Briefcase size={19} className="text-white relative z-10" />
                  <div className="absolute inset-1.5 bg-white/20 rounded-lg"></div>
                </div>
                <div>
                  <h5 className="text-[14px] font-black tracking-tight text-slate-850 font-sans uppercase">Daily Micro Jobs 💼</h5>
                  <p className="text-[10px] text-emerald-600 font-extrabold mt-1 leading-none">সহজ মাইক্রো ওয়ার্ক ট্যাক্সসমূহ সম্পন্ন করে রিয়াল ইনকাম</p>
                </div>
              </div>
              <div className="text-emerald-500 flex items-center gap-1.5 shrink-0">
                <span className="text-[8.5px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-sans tracking-wide">ACTIVE</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* B. TELEGRAM TASKS AND BONUS REDEEM CARD */}
          <div className="bg-white rounded-3xl border border-blue-200/80 hover:border-blue-400 hover:shadow-md overflow-hidden transition-all group relative">
            <button 
              onClick={() => {
                window.open('https://t.me/onlineincome7742', '_blank');
                toggleSection('telegram');
              }}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-blue-50/10 hover:to-transparent transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-sky-400 shadow-md shadow-blue-200 flex items-center justify-center transition-all group-hover:scale-110 group-hover:-rotate-12">
                  <Send size={19} className="text-white relative z-10 translate-x-[-1px] translate-y-[1px]" />
                  <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h5 className="text-[14px] font-black tracking-tight text-slate-850 font-sans uppercase">Telegram Channel ✈️</h5>
                  <p className="text-[10px] text-blue-600 font-extrabold mt-1 leading-none truncate max-w-[210px] md:max-w-none">টেলিগ্রাম চ্যানেলে জয়েন হয়ে অটো ইনকাম ও কুপন ক্লেইম করুন</p>
                </div>
              </div>
              <div className="text-slate-400 group-hover:text-blue-500 transition-colors">
                {expandedSection === 'telegram' ? <ChevronDown size={17} className="stroke-[2.5px]" /> : <ChevronRight size={17} className="stroke-[2.5px]" />}
              </div>
            </button>

            {expandedSection === 'telegram' && (
              <div className="p-4 border-t border-gray-50 bg-slate-50/40 space-y-4 animate-fade-in text-slate-700">
                
                <div className="space-y-2">
                  <div className="text-slate-700 font-bold px-1 text-xs">📢 নিচের টেলিগ্রাম চ্যানেলটিতে জয়েন হয়ে রিওয়ার্ড ক্লেইম করুন:</div>
                  
                  {/* Join Link 1 */}
                  <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-700 text-xs">১. CashHive স্পেশাল টেলিগ্রাম চ্যানেল</p>
                      <p className="text-[9px] text-sky-500 font-bold font-sans">পুরস্কার: ৳ ২.৫০ টাকা বোনাস</p>
                    </div>
                    {joinedChannel ? (
                      <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-600 font-black px-3 py-1.5 rounded-xl">সংগৃহীত ✓</span>
                    ) : (
                      <button 
                        onClick={() => {
                          window.open('https://t.me/onlineincome7742', '_blank');
                          handleTelegramJoin('channel', 2.50);
                        }}
                        className="text-[10px] bg-sky-500 hover:bg-sky-600 text-white font-extrabold px-3.5 py-1.5 rounded-xl cursor-pointer"
                      >
                        জয়েন করুন ৳
                      </button>
                    )}
                  </div>

                  {/* Join Link 2 */}
                  <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-700 text-xs">২. CashHive বাংলাদেশী আড্ডা গ্রুপ</p>
                      <p className="text-[9px] text-sky-500 font-bold font-sans">পুরস্কার: ৳ ১.৮০ টাকা বোনাস</p>
                    </div>
                    {joinedGroup ? (
                      <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-600 font-black px-3 py-1.5 rounded-xl">সংগৃহীত ✓</span>
                    ) : (
                      <button 
                        onClick={() => {
                          window.open('https://t.me/onlineincome7742', '_blank');
                          handleTelegramJoin('group', 1.80);
                        }}
                        className="text-[10px] bg-sky-500 hover:bg-sky-600 text-white font-extrabold px-3.5 py-1.5 rounded-xl cursor-pointer"
                      >
                        জয়েন করুন ৳
                      </button>
                    )}
                  </div>
                </div>

                {/* SECRET PROMO VOUCHERS MANAGER */}
                <div className="bg-white p-4 rounded-3xl border border-gray-100 space-y-3">
                  <div className="flex items-center gap-1 font-bold text-slate-800 text-xs">
                    <Award size={15} className="text-amber-500" />
                    <span>Secret Telegram Promo Code (বোনাস কোড ক্লেইম)</span>
                  </div>
                  
                  <p className="text-[10px] text-slate-500 leading-normal">
                    আমাদের টেলিগ্রাম চ্যানেলে প্রতিনিয়ত দেওয়া স্পেশাল সিক্রেট প্রোমো কুপন কোড (যেমন: <strong>CASHHIVE2026</strong> অথবা <strong>TASTE50</strong>) এখানে লিখে বোনাস ক্লেইম করুন!
                  </p>

                  <div className="flex gap-1">
                    <input 
                      type="text"
                      placeholder="কুপন কোড প্রবেশ করুন..."
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none uppercase font-mono font-black flex-grow"
                    />
                    <button 
                      onClick={submitPromoCode}
                      className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-black px-4 py-2.5 rounded-xl cursor-pointer text-xs flex items-center gap-1"
                    >
                      দাখিল
                    </button>
                  </div>

                  {promoError && (
                    <div className="text-[10px] text-red-500 bg-red-50 p-2 rounded-lg border border-red-100 font-medium">
                      ⚠️ {promoError}
                    </div>
                  )}

                  {promoSuccess && (
                    <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-100 whitespace-pre-wrap font-bold leading-normal">
                      🎉 {promoSuccess}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* C. MILESTONE BONUS JACKPOT CARD */}
          <div className="bg-white rounded-3xl border border-amber-200/80 hover:border-amber-400 hover:shadow-md overflow-hidden transition-all group relative">
            <button 
              onClick={() => toggleSection('milestone')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-amber-50/10 hover:to-transparent transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 shadow-md shadow-amber-200 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6">
                  <Trophy size={19} className="text-white relative z-10" />
                  <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h5 className="text-[14px] font-black tracking-tight text-slate-850 font-sans uppercase">Milestone Bonus 🏆</h5>
                  <p className="text-[10px] text-amber-600 font-extrabold mt-1 leading-none">রেফারেল মাইলস্টোন টার্গেট অর্জনের বিশেষ ক্যাশ বোনাস</p>
                </div>
              </div>
              <div className="text-slate-400 group-hover:text-amber-500 transition-colors">
                {expandedSection === 'milestone' ? <ChevronDown size={17} className="stroke-[2.5px]" /> : <ChevronRight size={17} className="stroke-[2.5px]" />}
              </div>
            </button>

            {expandedSection === 'milestone' && (
              <div className="p-4 border-t border-gray-50 bg-slate-50/40 space-y-4 animate-fade-in">
                
                <div className="bg-white p-3.5 rounded-2xl border border-gray-100 space-y-2">
                  <div className="flex justify-between text-xs font-black text-slate-700">
                    <span>আপনার বর্তমান ভ্যালিড রেফার</span>
                    <span className="text-emerald-600 font-mono">{userState.referralsCount} পার্টনার্স</span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-3.5 border border-slate-200 overflow-hidden relative">
                    <div 
                      className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (userState.referralsCount / 30) * 100)}%` }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-800 font-mono">
                      {Math.min(100, Math.floor((userState.referralsCount / 30) * 100))}% targeting Level 3
                    </span>
                  </div>
                  <p className="text-[9px] text-gray-400 text-center">নতুন টেস্ট পার্টনার রেফার করতে "My Team" জোন থেকে রেফারেল স্পনসর বাটনে চাপ দিন!</p>
                </div>

                <div className="space-y-2">
                  {/* Tier 1 */}
                  <div className="bg-white p-3.5 rounded-2xl border border-gray-100 flex justify-between items-center animate-fade-in">
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs text-slate-800">🥉 লেভেল ১ মাইলস্টোন: ৩ জন রেফার</p>
                      <p className="text-[10px] text-amber-600 font-bold">পুরস্কার বোনাস: ৳ ৩০.০০ টাকা</p>
                    </div>
                    {claimedMilestones.includes(1) ? (
                      <span className="text-[10px] bg-slate-100 text-slate-400 font-black px-3 py-1.5 rounded-xl border border-slate-100 cursor-not-allowed">ক্লেইমড ✓</span>
                    ) : userState.referralsCount >= 3 ? (
                      <button 
                        onClick={() => handleClaimMilestone(1, 3, 30.00)}
                        className="text-[10px] bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-3.5 py-1.5 rounded-xl cursor-pointer shadow-xs shadow-amber-500/10"
                      >
                        বোনাস ক্লেইম করুন ৳
                      </button>
                    ) : (
                      <span className="text-[9px] bg-rose-50 text-rose-500 border border-rose-100 font-bold px-3 py-1.5 rounded-xl font-sans">
                        {userState.referralsCount}/৩
                      </span>
                    )}
                  </div>

                  {/* Tier 2 */}
                  <div className="bg-white p-3.5 rounded-2xl border border-gray-100 flex justify-between items-center animate-fade-in">
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs text-slate-800">🥈 লেভেল ২ মাইলস্টোন: ১০ জন রেফার</p>
                      <p className="text-[10px] text-amber-600 font-bold">পুরস্কার বোনাস: ৳ ১২০.০০ টাকা</p>
                    </div>
                    {claimedMilestones.includes(2) ? (
                      <span className="text-[10px] bg-slate-100 text-slate-400 font-black px-3 py-1.5 rounded-xl border border-slate-100 cursor-not-allowed">ক্লেইমড ✓</span>
                    ) : userState.referralsCount >= 10 ? (
                      <button 
                        onClick={() => handleClaimMilestone(2, 10, 120.00)}
                        className="text-[10px] bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-3.5 py-1.5 rounded-xl cursor-pointer shadow-xs shadow-amber-500/10"
                      >
                        বোনাস ক্লেইম করুন ৳
                      </button>
                    ) : (
                      <span className="text-[9px] bg-rose-50 text-rose-500 border border-rose-100 font-bold px-3 py-1.5 rounded-xl font-sans">
                        {userState.referralsCount}/১০
                      </span>
                    )}
                  </div>

                  {/* Tier 3 */}
                  <div className="bg-white p-3.5 rounded-2xl border border-gray-100 flex justify-between items-center animate-fade-in">
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs text-slate-800">👑 লেভেল ৩ মাইলস্টোন: ৩০ জন রেফার</p>
                      <p className="text-[10px] text-amber-600 font-bold font-sans">পুরস্কার জ্যাকপট: ৳ ৫০০.০০ টাকা</p>
                    </div>
                    {claimedMilestones.includes(3) ? (
                      <span className="text-[10px] bg-slate-100 text-slate-400 font-black px-3 py-1.5 rounded-xl border border-slate-100 cursor-not-allowed">ক্লেইমড ✓</span>
                    ) : userState.referralsCount >= 30 ? (
                      <button 
                        onClick={() => handleClaimMilestone(3, 30, 500.00)}
                        className="text-[10px] bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-3.5 py-1.5 rounded-xl cursor-pointer shadow-xs shadow-amber-500/10"
                      >
                        বোনাস ক্লেইম করুন ৳
                      </button>
                    ) : (
                      <span className="text-[9px] bg-rose-50 text-rose-500 border border-rose-100 font-bold px-3 py-1.5 rounded-xl font-sans">
                        {userState.referralsCount}/৩০
                      </span>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* D. WORK HISTORY & CAPTCHA STATUS CHANNELS CARD */}
          <div className="bg-white rounded-3xl border border-violet-200/80 hover:border-violet-400 hover:shadow-md overflow-hidden transition-all group relative">
            <button 
              onClick={() => toggleSection('work_history')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-violet-50/10 hover:to-transparent transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-500 to-fuchsia-400 shadow-md shadow-violet-200 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6">
                  <History size={19} className="text-white relative z-10 animate-spin-slow" />
                  <div className="absolute inset-1.5 bg-white/10 rounded-lg"></div>
                </div>
                <div>
                  <h5 className="text-[14px] font-black tracking-tight text-slate-850 font-sans uppercase">Work History 📋</h5>
                  <p className="text-[10px] text-violet-650 font-extrabold mt-1 leading-none text-violet-600">আপনার সাবমিট করা কাজের প্রমান ও পূর্ববর্তী রিপোর্ট তালিকা</p>
                </div>
              </div>
              <div className="text-slate-400 group-hover:text-violet-500 transition-colors">
                {expandedSection === 'work_history' ? <ChevronDown size={17} className="stroke-[2.5px]" /> : <ChevronRight size={17} className="stroke-[2.5px]" />}
              </div>
            </button>

            {expandedSection === 'work_history' && (
              <div className="p-4 border-t border-gray-50 bg-slate-50/40 space-y-3 animate-fade-in">
                <div className="text-center font-bold text-slate-700 text-xs pb-1 border-b border-gray-105 border-gray-100">
                  📋 Job Log & Screenshot Submission Audits
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {tasks.filter(t => t.completed || t.adminStatus === 'pending').length === 0 && (
                    <div className="p-3 text-center bg-white text-slate-400 border border-dashed rounded-xl">
                      কোনো কাজ সম্পন্ন করেননি এখনো। টাস্ক হাব থেকে কাজ শুরু করুন!
                    </div>
                  )}

                  {tasks.filter(t => t.completed || t.adminStatus === 'pending').map((tsk) => {
                    const viewS = tsk.adminStatus || 'idle';
                    return (
                      <div key={tsk.id} className="bg-white p-3 rounded-2xl border border-slate-100 space-y-2 animate-fade-in">
                        <div className="flex justify-between items-start gap-1">
                          <div className="flex-1">
                            <p className="font-extrabold text-slate-800 text-[11px] leading-snug">{tsk.title}</p>
                            <span className="text-[8px] bg-slate-100 text-slate-500 font-mono px-1 py-0.2 rounded font-bold">JOB ID: {tsk.id}</span>
                          </div>
                          <div className="text-right flex flex-col items-end flex-shrink-0">
                            <span className="text-xs font-black text-violet-600 font-mono">৳{tsk.reward.toFixed(2)}</span>
                            <span className={`text-[8px] px-1.5 py-0.2 font-bold rounded border ${
                              viewS === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              viewS === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' :
                              'bg-gray-50 text-gray-400 border-gray-100'
                            }`}>
                              {viewS === 'approved' ? 'ভেরিফাইড (Approved)' : viewS === 'pending' ? 'অডিটে রয়েছে (Pending)' : 'সম্পন্ন'}
                            </span>
                          </div>
                        </div>

                        {tsk.proofScreenshot && (
                          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                            <img 
                              src={tsk.proofScreenshot} 
                              alt="Audit Screenshot" 
                              className="w-10 h-10 object-cover rounded-md border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="text-[9px] text-slate-500 font-bold">কাজের প্রমান (Receipt Link)</p>
                              <p className="text-[8px] text-emerald-600 font-medium">অটোমেটিক বট দ্বারা ১০ সেকেন্ডের রিয়েল-টাইম অ্যাডমিন ভেরিফিকেশন!</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2.5 LOGOUT INTERFACE PANEL BUTTON */}
      {onLogout && (
        <div className="pt-2.5 animate-fade-in">
          <button 
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to log out / sign out from your CashHive session?')) {
                onLogout();
              }
            }}
            className="w-full bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-700 hover:to-red-650 text-white font-sans py-4 rounded-3xl text-sm font-black tracking-wide shadow-md shadow-rose-200 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer duration-200 transform active:scale-[0.98] group"
          >
            <LogOut size={16} className="text-white shrink-0 group-hover:translate-x-0.5 transition-transform" />
            <span>LOGOUT FROM SESSION</span>
          </button>
        </div>
      )}

      {/* 3. CASHHIVE AUTHENTIC LEGIT CREATOR NOTE */}
      <div className="text-center py-4 bg-emerald-50/10 rounded-[24px] border border-emerald-200/40 space-y-1.5 px-4 font-medium text-slate-500 text-[10px]">
        <div className="flex items-center justify-center gap-1 text-slate-700 font-bold">
          <Heart size={11} className="text-red-500 fill-red-500 animate-pulse" />
          <span>ক্রাফটেড বাই CashHive প্ল্যাটফর্ম টিম ২০২৬</span>
        </div>
        <p className="leading-relaxed px-2">
          আমাদের মোবাইল আর্নিং নেটওয়ার্কে থাকার জন্য ধন্যবাদ। কোনো সমস্যার ক্ষেত্রে সরাসরি টেলিগ্রাম বটের মাধ্যমে সহয়তা বা পেমেন্ট সাপোর্ট অপশনে যোগাযোগ করুন।
        </p>
      </div>

    </div>
  );
}
