import { useState, useEffect } from 'react';
import { 
  Clipboard, 
  CheckCircle, 
  Sparkles, 
  X, 
  ShieldCheck, 
  Bell, 
  ArrowUpRight, 
  Users, 
  ListTodo, 
  Tv, 
  Gift, 
  Compass, 
  Trophy, 
  Calendar, 
  Check, 
  AlertCircle, 
  RotateCw,
  Banknote,
  Coins,
  UserPlus,
  PlayCircle,
  Zap,
  Flame,
  Inbox,
  Mail
} from 'lucide-react';
import { UserState } from '../types';
import { LanguageCode, LANGUAGE_OPTIONS, translations, translate } from '../utils/language';

interface HomeViewProps {
  userState: UserState;
  onNavigate: (tab: string) => void;
  onCopyReferral: () => void;
  copied: boolean;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onClaimDailyBonus: (reward: number, currentStreakIndex: number) => void;
  onSpinLuckyWheel: (reward: number) => void;
  appSettings: {
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
  };
}

export default function HomeView({ 
  userState, 
  onNavigate, 
  onCopyReferral, 
  copied,
  language,
  onLanguageChange,
  onClaimDailyBonus,
  onSpinLuckyWheel,
  appSettings
}: HomeViewProps) {
  const [showNotice, setShowNotice] = useState<boolean>(() => {
    // Check if the user has already closed the notice
    return localStorage.getItem('notice_has_been_closed_v1') !== 'true'; 
  });
  const [langOpen, setLangOpen] = useState<boolean>(false);

  // New states for Daily Bonus & Lucky Wheel
  const [showDailyModal, setShowDailyModal] = useState<boolean>(false);
  const [showWheelModal, setShowWheelModal] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [isInboxModalOpen, setIsInboxModalOpen] = useState<boolean>(false);
  const [readMessageIds, setReadMessageIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cashhive_read_message_ids_v1');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const allMessages = appSettings?.adminInboxMessages || [];
  const unreadMessagesCount = allMessages.filter(msg => !readMessageIds.includes(msg.id)).length;

  // New spinning logic states
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinRotation, setSpinRotation] = useState<number>(0);
  const [spinMessage, setSpinMessage] = useState<string | null>(null);
  const [spinWinReward, setSpinWinReward] = useState<number | null>(null);

  const t = (key: string, params?: Record<string, string | number>) => {
    return translate(language, key, params);
  };

  const formattedBalance = userState.balance.toFixed(2);

  return (
    <div id="home_view_wrapper" className="space-y-4 pb-12 animate-fade-in text-slate-800">
      
      {/* 1. EXQUISITE POPUP NOTICE BANNER - SHOWS UNTIL CLOSED */}
      {showNotice && (
        <div id="welcome_announcement_overlay" className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div 
            id="welcome_announcement_card" 
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-emerald-500/10 overflow-hidden relative transform transition-all animate-scale-up"
          >
            {/* Top Premium Color Stripe */}
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>

            {/* Close Button Header */}
            <div className="flex items-center justify-between p-4.5 pb-2 border-b border-gray-100">
              <span className="flex items-center gap-1.5 text-[11px] font-black tracking-wider text-emerald-600 uppercase">
                <Sparkles size={13} className="text-emerald-500 animate-spin" />
                {t('notice_title')}
              </span>
              <button 
                onClick={() => {
                  localStorage.setItem('notice_has_been_closed_v1', 'true');
                  setShowNotice(false);
                }}
                className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors cursor-pointer"
                title={t('notice_close')}
              >
                <X size={15} className="stroke-[2.5px]" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Powerful Positive Feedback Snip */}
              <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/70 p-3.5 rounded-2xl border border-emerald-100 flex gap-3 items-start">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                  <ShieldCheck size={18} className="stroke-[2.5px]" />
                </div>
                <div className="flex-1">
                  <h5 className="font-extrabold text-[12.5px] text-slate-800">
                    {t('notice_guarantee_title')}
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5 font-medium">
                    {t('notice_guarantee_desc')}
                  </p>
                </div>
              </div>

              {/* Main Bangla Notice text matches exactly the user prompt */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-gray-150 space-y-2">
                <div className="flex items-center gap-1 text-[9.5px] font-black text-slate-400 uppercase tracking-widest pl-0.5">
                  📢 OFFICIAL ANNOUNCEMENT
                </div>
                <p className="text-[12.5px] font-extrabold leading-relaxed text-slate-850 text-slate-800 font-sans">
                  {t('welcome_notice')}
                </p>
              </div>

              {/* Dismiss Action Button */}
              <button 
                onClick={() => {
                  localStorage.setItem('notice_has_been_closed_v1', 'true');
                  setShowNotice(false);
                }}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] text-white font-extrabold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
              >
                <span>{t('notice_read_close')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 2. TOP PROFILE SECTION (NEXT-LEVEL PRO PREMIUM CARD STYLE) */}
      <div 
        id="profile_card" 
        className="bg-gradient-to-br from-[#0bb574] via-[#09a066] to-[#058453] p-5 rounded-[28px] shadow-sm text-white border border-[#00cf85]/20 relative animate-scale-up"
      >
        {/* Top Header Row of Profile Card */}
        <div className="flex items-center justify-between w-full relative z-15">
          {/* User Image, Name, and Verification */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                id="user_avatar"
                src={userState.avatarSeed} 
                alt="Profile" 
                className="w-13 h-13 rounded-full border-2 border-white/90 object-cover shadow-sm bg-white"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#0bb574] rounded-full animate-pulse shadow-sm"></span>
            </div>
            
            <div className="space-y-0.5">
              <h3 id="user_display_name" className="text-[15px] sm:text-[16px] font-black tracking-tight leading-tight text-white flex items-center gap-1">
                {userState.name}
              </h3>
              <p id="user_username" className="text-[11.5px] text-emerald-100 font-extrabold leading-none pt-0.5">
                @{userState.username}
              </p>
              
              <div className="flex items-center gap-2 pt-1">
                {/* Beautiful Verified Translucent Capsule */}
                <span className="bg-white/20 text-white text-[9px] font-black tracking-tight px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10 leading-none">
                  <CheckCircle size={9} className="fill-white text-emerald-500 flex-shrink-0" />
                  <span>ভেরিফায়েড মেম্বার</span>
                </span>
                
                {/* User UID */}
                <span id="user_uid" className="text-[10px] text-emerald-150 font-semibold tracking-wider font-mono opacity-90">
                  UID: {userState.uid}
                </span>
              </div>
            </div>
          </div>

          {/* Top Right: Translucent Beautiful Language Switcher Pill */}
          <div className="flex flex-col items-end gap-1.5 self-start">
            <div className="relative">
              <button 
                type="button"
                id="lang_switch_dropdown_trigger"
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 bg-black/15 hover:bg-black/25 text-white px-2.5 py-1 rounded-full text-[10.5px] font-black border border-white/10 cursor-pointer transition-all active:scale-95 shadow-2xs"
              >
                <span className="text-xs">{LANGUAGE_OPTIONS.find(o => o.code === language)?.flag || '🇧🇩'}</span>
                <span>{LANGUAGE_OPTIONS.find(o => o.code === language)?.nativeName || 'বাংলা'}</span>
                <span className="text-[8px] opacity-80 pt-0.5">▼</span>
              </button>
              
              {langOpen && (
                <div className="absolute right-0 mt-1.5 w-32 bg-white text-slate-800 rounded-xl shadow-xl border border-gray-100 overflow-hidden flex flex-col z-35 animate-fade-in py-1 font-sans">
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        onLanguageChange(opt.code);
                        setLangOpen(false);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-left text-[11px] font-black hover:bg-[#eefbf6] transition-colors w-full cursor-pointer ${
                        language === opt.code ? 'text-[#0bb574] bg-[#eefbf6]/50' : 'text-slate-700'
                      }`}
                    >
                      <span className="text-sm">{opt.flag}</span>
                      <span className="flex-1">{opt.nativeName}</span>
                      {language === opt.code && <span className="text-[#0bb574] font-extrabold text-[10px]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lower/Middle Row: Balance Section centered beautifully in layout */}
        <div className="mt-5 pt-3.5 border-t border-white/10 flex justify-between items-center w-full">
          <div className="flex flex-col">
            <span className="text-[9.5px] text-emerald-150 uppercase tracking-wider font-extrabold opacity-90 leading-none">
              চলতি ব্যালেন্স (Available Balance)
            </span>
            <div id="balance_amount" className="text-[20px] sm:text-[23px] font-black tracking-tight flex items-center leading-none pt-1">
              ৳ {formattedBalance}
            </div>
          </div>
          
          <span className="bg-white/10 hover:bg-white/15 px-3.5 py-1.5 rounded-2xl text-[10.5px] font-black border border-white/10 select-none tracking-tight">
            PRO ACCOUNT
          </span>
        </div>
      </div>

      {/* DYNAMIC ADMIN INBOX CLICKABLE CARD WITH UNREAD COUNT BADGE */}
      {appSettings?.adminInboxEnabled && (
        <button
          type="button"
          onClick={() => {
            setIsInboxModalOpen(true);
            const allIds = allMessages.map(msg => msg.id);
            setReadMessageIds(allIds);
            localStorage.setItem('cashhive_read_message_ids_v1', JSON.stringify(allIds));
          }}
          className="w-full bg-linear-to-r from-rose-500/10 to-rose-200/5 hover:from-rose-500/15 border border-rose-200 p-4 rounded-3xl flex items-center justify-between gap-3 text-left transition-all active:scale-98 animate-fade-in cursor-pointer relative overflow-hidden group shadow-2xs mt-1"
        >
          {unreadMessagesCount > 0 && (
            <div className="absolute inset-0 bg-rose-500/5 animate-pulse rounded-3xl"></div>
          )}

          <div className="flex items-center gap-3 relative z-10 w-full">
            {/* Left side circular letter icon in light red/pink background circle */}
            <div className="w-10 h-10 rounded-full bg-[#f43f5e]/15 border border-[#f43f5e]/20 text-[#f43f5e] flex items-center justify-center relative flex-shrink-0 transition-transform group-hover:scale-105">
              <Mail size={18} className="animate-bounce" />
              
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-600 text-white text-[9.5px] font-black rounded-full flex items-center justify-center px-1.5 border border-white animate-pulse shadow-md font-mono">
                  {unreadMessagesCount}
                </span>
              )}
            </div>

            {/* Middle text segment layout */}
            <div className="flex-1">
              <h4 className="text-[12px] font-black text-rose-800 tracking-tight flex items-center gap-1.5">
                <span>বার্তা ইনবক্স (Admin Inbox Messages)</span>
                {unreadMessagesCount > 0 && (
                  <span className="bg-rose-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest animate-pulse font-sans">
                    NEW
                  </span>
                )}
              </h4>
              <p className="text-[9.5px] text-slate-500 font-semibold font-sans mt-0.5">
                {unreadMessagesCount > 0 
                  ? `আপনার কাছে ${unreadMessagesCount}টি নতুন নোটিশ ও গুরুত্বপূর্ণ নির্দেশনা এসেছে!`
                  : 'এডমিন প্যানেল থেকে পাঠানো সমস্ত নোটিশ ও আপডেট দেখতে এখানে ক্লিক করুন।'
                }
              </p>
            </div>

            {/* Right side Open Trigger Pill button */}
            <div className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/25 text-rose-600 font-extrabold text-[10.5px] px-3 py-1.5 rounded-full relative z-10 font-sans border border-rose-200">
              <span>এখানে খুলুন</span>
              <span className="transform group-hover:translate-x-1 transition-transform">➡️</span>
            </div>
          </div>
        </button>
      )}

      {/* QUICK ACTIONS HUB */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Withdraw Action (উইথড্র করুন - উড়ন্ত ক্যাশ টাকা ড্রয়িং) */}
        <button 
          id="btn_quick_withdraw"
          type="button"
          onClick={() => onNavigate('withdraw')}
          className="bg-white p-4.5 text-left rounded-3xl border border-rose-100/80 hover:border-rose-200 hover:shadow-md transition-all flex flex-col justify-between gap-5 cursor-pointer relative overflow-hidden group bg-gradient-to-br from-white to-rose-50/30 active:scale-95 animate-fade-in"
        >
          {/* Glowing flying money absolute background detail */}
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-rose-100/30 rounded-full blur-xl group-hover:bg-rose-200/40 transition-all"></div>

          <div className="flex justify-between items-start w-full relative z-10 font-sans">
            {/* Flying Cash (উড়ন্ত টাকা) Custom Layout with tilted Banknote and Arrow Up */}
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-400 shadow-md shadow-rose-200 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6">
              <Banknote size={20} className="text-white transform -rotate-12 absolute" />
              <ArrowUpRight size={14} className="text-yellow-200 animate-bounce absolute -top-1.5 -right-1.5 bg-rose-600 rounded-full border border-white p-0.2" />
              <div className="absolute top-1 left-1.5 w-1 h-1 bg-white/60 rounded-full animate-ping"></div>
              <div className="absolute bottom-1 right-2 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse"></div>
            </div>
            
            <span className="text-[8.5px] font-black uppercase tracking-widest text-rose-600 bg-rose-100/60 border border-rose-200/80 px-2 py-0.5 rounded-full font-mono">
              WITHDRAW
            </span>
          </div>
          <div className="space-y-0.5 relative z-10">
            <h4 className="text-[13px] font-black text-slate-800 leading-none flex items-center gap-1">
              Withdraw <span className="text-rose-500 animate-pulse">💸</span>
            </h4>
            <p className="text-[9.5px] text-gray-500 font-extrabold leading-tight">{t('quick_withdraw_sub')}</p>
          </div>
        </button>

        {/* Invite/Referrals Action (বন্ধুদের রেফার - দুইজন মানুষ দাঁড়িয়ে এবং টাকার লোগো) */}
        <button 
          id="btn_quick_referrals"
          type="button"
          onClick={() => setShowInviteModal(true)}
          className="bg-white p-4.5 text-left rounded-3xl border border-emerald-100/80 hover:border-emerald-250 hover:shadow-md transition-all flex flex-col justify-between gap-5 cursor-pointer relative overflow-hidden group bg-gradient-to-br from-white to-emerald-50/30 active:scale-95 animate-fade-in"
        >
          {/* Decorative glowing background details */}
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-emerald-100/30 rounded-full blur-xl group-hover:bg-emerald-200/40 transition-all"></div>

          <div className="flex justify-between items-start w-full relative z-10 font-sans">
            {/* Friends standing together with Money Sign */}
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-md shadow-emerald-200 flex items-center justify-center transition-all group-hover:scale-110">
              <Users size={18} className="text-white transform -translate-x-1" />
              <Coins size={11} className="text-yellow-300 absolute bottom-1 right-1.5 bg-emerald-700 rounded-full border border-white p-0.1 animate-pulse" />
            </div>

            <span className="text-[8.5px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100/60 border border-emerald-200/80 px-2 py-0.5 rounded-full font-mono">
              REFER & TEAM
            </span>
          </div>
          <div className="space-y-0.5 relative z-10">
            <h4 className="text-[13px] font-black text-slate-800 leading-none flex items-center gap-1">
              Invite Friend <span className="text-emerald-500">🤝</span>
            </h4>
            <p className="text-[9.5px] text-gray-500 font-extrabold leading-tight">{userState.referralsCount} {t('quick_invite_sub')}</p>
          </div>
        </button>
      </div>

      {/* DAILY BONUS & LUCKY WHEEL HUB */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Daily Bonus Button - ইনকাম লোগো পারফেক্টলি কাস্টমাইজড */}
        <button 
          id="btn_daily_bonus"
          type="button"
          onClick={() => setShowDailyModal(true)}
          className="bg-white p-4.5 text-left rounded-3xl border border-amber-200/80 hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between gap-5 cursor-pointer relative overflow-hidden group bg-gradient-to-br from-white to-amber-50/35 active:scale-95 animate-fade-in"
        >
          {/* Background glowing particles */}
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-amber-100/35 rounded-full blur-xl group-hover:bg-amber-200/40 transition-all"></div>

          <div className="flex justify-between items-start w-full relative z-10 font-sans">
            {/* Custom styled Gift and Income Sparks Logo */}
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 shadow-md shadow-amber-200 flex items-center justify-center transition-all group-hover:scale-110">
              <Gift size={20} className="text-white relative z-10" />
              <Sparkles size={11} className="text-yellow-250 absolute -top-1 -right-1 bg-amber-600 rounded-full p-0.2 border border-white animate-spin-slow" />
              <Zap size={9} className="text-yellow-300 absolute -bottom-1 -left-1 bg-orange-600 rounded-full p-0.2 animate-ping" />
            </div>

            <span className="text-[8.5px] font-black uppercase tracking-widest text-amber-700 bg-amber-100/70 border border-amber-200/80 px-2 py-0.5 rounded-full font-mono">
              DAILY BONUS
            </span>
          </div>
          <div className="space-y-0.5 relative z-10">
            <h4 className="text-[13px] font-black text-slate-800 leading-none flex items-center gap-1">
              Daily Bonus <span className="text-amber-500 animate-bounce">🎁</span>
            </h4>
            <p className="text-[9.5px] text-gray-500 font-extrabold leading-tight">{t('daily_bonus_sub')}</p>
          </div>
        </button>

        {/* Lucky Wheel Button - স্পিন লোগো পারফেক্টলি উজ্জ্বল কাস্টমাইজড */}
        <button 
          id="btn_lucky_wheel"
          type="button"
          onClick={() => setShowWheelModal(true)}
          className="bg-white p-4.5 text-left rounded-3xl border border-indigo-200/80 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between gap-5 cursor-pointer relative overflow-hidden group bg-gradient-to-br from-white to-indigo-50/35 active:scale-95 animate-fade-in"
        >
          {/* Background glowing element */}
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-indigo-100/35 rounded-full blur-xl group-hover:bg-indigo-300/30 transition-all"></div>

          <div className="flex justify-between items-start w-full relative z-10 font-sans">
            {/* Spinning Wheel Compass / Rotating visual */}
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-md shadow-indigo-200 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-90 duration-500">
              <Compass size={18} className="text-white relative z-10 animate-pulse" />
              <RotateCw size={11} className="text-yellow-200 absolute -top-1 -right-1 bg-indigo-600 rounded-full p-0.2 border border-white" />
              <div className="absolute inset-0 bg-white/10 rounded-lg scale-75 border border-dashed border-white/20"></div>
            </div>

            <span className="text-[8.5px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-100/70 border border-indigo-200/80 px-2 py-0.5 rounded-full font-mono">
              LUCKY SPIN
            </span>
          </div>
          <div className="space-y-0.5 relative z-10">
            <h4 className="text-[13px] font-black text-slate-800 leading-none flex items-center gap-1">
              Lucky Spin <span className="text-indigo-500">🎡</span>
            </h4>
            <p className="text-[9.5px] text-gray-500 font-extrabold leading-tight">{t('lucky_spin_sub')}</p>
          </div>
        </button>
      </div>

      {/* Task & Ad Shortcuts - এবং ঝলমলে ডিপ কালার সমৃদ্ধ ও সুন্দর টিভি লোগো */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* টাস্ক বাটন - ঝলমলে ডিপ কালার লাক্সারি গোল্ডেন শাইন */}
        <button 
          type="button"
          onClick={() => onNavigate('task')}
          className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white font-extrabold hover:from-slate-855 hover:to-indigo-900 active:scale-95 py-4 px-4 rounded-3xl border-2 border-emerald-400/40 shadow-lg shadow-emerald-900/10 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer text-xs group"
        >
          {/* Shininess dynamic absolute reflection */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/30 group-hover:scale-115 transition-transform">
            <Trophy size={20} className="text-white animate-bounce" />
          </div>

          <div className="text-center font-sans">
            <span className="block text-[12px] font-black tracking-tight flex items-center justify-center gap-1">
              {t('complete_tasks')} <span className="text-emerald-400">🎯</span>
            </span>
            <span className="block text-[8px] text-emerald-300/90 tracking-wide font-black uppercase mt-0.5 font-mono">
              ✨ HIGH PAYING TASKS ✨
            </span>
          </div>
        </button>

        {/* ভিডিও এডস বাটন - ঝলমলে এমারেল্ড ও টেলিভিশন লোগো */}
        <button 
          type="button"
          onClick={() => onNavigate('ads')}
          className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-extrabold hover:from-emerald-500 hover:to-teal-600 active:scale-95 py-4 px-4 rounded-3xl border-2 border-yellow-300/40 shadow-lg shadow-emerald-500/15 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer text-xs group"
        >
          {/* Shininess absolute layer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center shadow-md shadow-amber-400/30 group-hover:scale-115 transition-transform relative">
            <Tv size={20} className="text-slate-900" />
            <PlayCircle size={10} className="text-red-650 bg-white rounded-full absolute bottom-1 right-1 border border-slate-900 shadow-xs" />
          </div>

          <div className="text-center font-sans">
            <span className="block text-[12px] font-black tracking-tight flex items-center justify-center gap-1">
              {t('watch_video_ads')} <span className="text-yellow-300">📺</span>
            </span>
            <span className="block text-[8px] text-yellow-200/90 tracking-wide font-black uppercase mt-0.5 font-mono">
              ⚡ LIVE EARN ADS ⚡
            </span>
          </div>
        </button>
      </div>

      {/* 3. SOLID OFFICIAL FLAT CARD WITH COPY AND HIGH GLOWING BANNER */}
      <div 
        id="notice_n_referral_panel" 
        className="bg-white p-5 rounded-3xl border border-slate-200/80 space-y-4 shadow-xs"
      >
        {/* Welcome Text Title */}
        <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2">
          <Bell size={14} className="text-emerald-500 animate-bounce" />
          <span className="text-[12px] font-black text-slate-800 uppercase tracking-tight">
            {t('notice_title')}
          </span>
        </div>

        {/* Core Notice message requested by user */}
        <p className="text-[12.5px] leading-relaxed text-slate-700 font-bold bg-slate-50 p-4 rounded-2xl border border-slate-100">
          {t('welcome_notice')}
        </p>

        {/* Copy Referral link label */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
            {t('copy_referral_link')}
          </span>
          
          <div 
            id="referral_link_field"
            className="bg-slate-50 py-3.5 px-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-2 overflow-hidden"
          >
            <span className="text-[11px] font-mono text-slate-700 font-bold truncate select-all font-sans">
              {userState.referralLink}
            </span>
            <div className="flex-shrink-0">
              {copied ? (
                <span className="text-[9.5px] bg-emerald-500 text-white px-2 py-0.5 rounded-md font-black animate-pulse">
                  {t('copied_msg')}
                </span>
              ) : (
                <span className="text-[9.5px] text-slate-400 px-2 py-0.5 font-black uppercase tracking-wider">
                  LINK
                </span>
              )}
            </div>
          </div>

          {/* Copy Action Button */}
          <button 
            id="btn_copy_referral"
            onClick={onCopyReferral}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-1.5 transform active:scale-[0.98] cursor-pointer text-xs uppercase"
          >
            <Clipboard size={15} />
            <span>{t('refer_link_copy_btn')}</span>
          </button>
        </div>

      </div>

      {/* Empty space kept purposely for user customization as requested */}
      <div className="h-6"></div>

      {/* ==================== DAILY BONUS MODAL ==================== */}
      {showDailyModal && (
        <div id="daily_bonus_overlay" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in text-slate-800">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-amber-400/20 relative transform transition-all animate-scale-up">
            {/* Header background decoration */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white relative">
              <button 
                onClick={() => setShowDailyModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/15 hover:bg-black/35 w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} className="stroke-[2.5px]" />
              </button>
              <div className="flex items-center gap-2">
                <Gift className="text-yellow-300 animate-bounce" size={20} />
                <h4 className="text-sm font-black uppercase tracking-tight font-sans">{t('daily_bonus_title')}</h4>
              </div>
              <p className="text-[10px] text-amber-50/90 font-semibold mt-1 leading-relaxed">
                {t('daily_bonus_desc')}
              </p>
            </div>

            <div className="p-5 space-y-4">
              {/* Rewards Grid */}
              <div className="grid grid-cols-2 gap-2 font-sans">
                {[0.50, 1.50, 2.55, 3.50, 4.50, 5.50, 6.50].map((rewardVal, idx) => {
                  const currentStreakIndex = userState.dailyBonusStreakIndex || 0;
                  const isCurrent = idx === currentStreakIndex;
                  const isClaimed = idx < currentStreakIndex;

                  return (
                    <div 
                      key={idx}
                      className={`relative p-3 rounded-2xl flex flex-col justify-between overflow-hidden border transition-all ${
                        isCurrent 
                          ? 'bg-amber-50/80 border-amber-400 shadow-md ring-2 ring-amber-400/40' 
                          : isClaimed 
                            ? 'bg-emerald-50/50 border-emerald-100 opacity-80' 
                            : 'bg-slate-50 border-gray-100 opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-black text-slate-400 uppercase">{t('day')} {idx + 1}</span>
                        {isClaimed && (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                            <Check size={8} className="stroke-[3px]" />
                          </div>
                        )}
                        {isCurrent && (
                          <span className="text-[8px] font-black bg-amber-500 text-white px-1 py-0.2 rounded uppercase animate-bounce">
                            {t('active')}
                          </span>
                        )}
                      </div>
                      <div className="mt-2.5">
                        <span className={`text-[13px] font-black leading-none block ${
                          isCurrent ? 'text-amber-600 font-extrabold' : isClaimed ? 'text-emerald-600 line-through' : 'text-slate-500'
                        }`}>
                          ৳ {rewardVal.toFixed(2)}
                        </span>
                        <span className="text-[7.5px] font-semibold text-gray-400 uppercase mt-0.5 block leading-none">
                          {isClaimed ? t('claimed') : isCurrent ? t('claim') : t('locked')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action area */}
              {(() => {
                const todayStr = new Date().toISOString().split('T')[0];
                const hasClaimedToday = userState.lastDailyBonusClaimDate === todayStr;
                const currentStreakIndex = userState.dailyBonusStreakIndex || 0;
                const activeReward = [0.50, 1.50, 2.50, 3.50, 4.55, 5.50, 6.50][currentStreakIndex];

                return (
                  <div className="space-y-3">
                    {hasClaimedToday ? (
                      <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200/50 flex gap-2 items-start">
                        <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={14} />
                        <p className="text-[10px] text-amber-700 font-extrabold leading-normal">
                          {t('daily_bonus_already_claimed')}
                        </p>
                      </div>
                    ) : null}

                    <button
                      type="button"
                      disabled={hasClaimedToday}
                      onClick={() => {
                        onClaimDailyBonus(activeReward, currentStreakIndex);
                        alert(`${t('daily_bonus_alert_success')} (৳ ${activeReward.toFixed(2)})`);
                        setShowDailyModal(false);
                      }}
                      className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all transform active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${
                        hasClaimedToday 
                          ? 'bg-gray-100 text-gray-400 border border-gray-200 shadow-none' 
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 active:scale-95 shadow-amber-500/10'
                      }`}
                    >
                      <Calendar size={14} />
                      <span>{hasClaimedToday ? t('daily_bonus_claimed_btn') : t('daily_bonus_claim_btn', { amount: activeReward.toFixed(2) })}</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ==================== LUCKY WHEEL MODAL ==================== */}
      {showWheelModal && (
        <div id="lucky_wheel_overlay" className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in text-slate-800">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-indigo-400/20 relative transform transition-all animate-scale-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-650 p-5 text-white relative">
              <button 
                onClick={() => {
                  if (isSpinning) return;
                  setShowWheelModal(false);
                  setSpinMessage(null);
                  setSpinWinReward(null);
                }}
                disabled={isSpinning}
                className={`absolute top-4 right-4 text-white/80 hover:text-white bg-black/15 hover:bg-black/35 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  isSpinning ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <X size={15} className="stroke-[2.5px]" />
              </button>
              <div className="flex items-center gap-2">
                <Compass className={`text-yellow-300 ${isSpinning ? 'animate-spin' : ''}`} size={20} />
                <h4 className="text-sm font-black uppercase tracking-tight font-sans">{t('lucky_wheel_title')}</h4>
              </div>
              <p className="text-[10px] text-indigo-50/95 font-semibold mt-1 leading-relaxed font-sans">
                {t('lucky_wheel_desc')}
              </p>
            </div>

            <div className="p-5 flex flex-col items-center space-y-5">
              
              {/* Wheel Container */}
              <div className="relative w-64 h-64 flex items-center justify-center bg-slate-100 rounded-full p-2 border border-slate-200 shadow-inner">
                {/* Visual Pin Pointer at the Top */}
                <div className="absolute top-[-4px] left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center">
                  <div className="w-5 h-6 bg-red-500 rounded-t-full rounded-b-md shadow-md"></div>
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-500"></div>
                </div>

                {/* Spinning Wheel */}
                <div 
                  className="w-full h-full rounded-full bg-[#1e1b4b] relative shadow-2xl overflow-hidden"
                  style={{ 
                    transform: `rotate(${spinRotation}deg)`, 
                    transition: isSpinning ? 'transform 4.5s cubic-bezier(0.2, 1, 0.25, 1)' : 'none' 
                  }}
                >
                  {[
                    { val: language === 'BN' ? '৳ ১.০০ 💰' : t('wheel_slice_taka', { amount: '1.00' }) },
                    { val: t('wheel_slice_empty') },
                    { val: language === 'BN' ? '৳ ৩.৫০ 💰' : t('wheel_slice_taka', { amount: '3.50' }) },
                    { val: t('wheel_slice_empty') },
                    { val: language === 'BN' ? '৳ ৫.০০ 💰' : t('wheel_slice_taka', { amount: '5.00' }) },
                    { val: t('wheel_slice_empty') },
                    { val: t('wheel_slice_empty') },
                  ].map((slice, i) => {
                    const rotationAngle = i * (360 / 7);
                    // Alternating segment colors
                    const segmentBg = i === 0 ? '#fbbf24' : i === 2 ? '#34d399' : i === 4 ? '#22d3ee' : i % 2 === 0 ? '#4338ca' : '#1e1b4b';
                    return (
                      <div 
                        key={i}
                        className="absolute top-0 left-1/2 w-1/2 h-full origin-left flex items-center pl-7 font-sans text-[10px] font-black text-white"
                        style={{
                          transform: `rotate(${rotationAngle}deg)`,
                          clipPath: 'polygon(0 50%, 100% 15%, 100% 85%)',
                          background: segmentBg,
                          transformOrigin: 'left center',
                        }}
                      >
                        <span className="transform -rotate-90 origin-center translate-x-4 inline-block font-sans text-[8.5px] tracking-tight text-white drop-shadow-md select-none whitespace-nowrap">
                          {slice.val}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Golden Center Hub */}
                <div className="absolute inset-0 m-auto w-12 h-12 bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-200 rounded-full border-4 border-[#1e1b4b] flex flex-col items-center justify-center text-[8.5px] font-black text-slate-900 shadow-md z-20 select-none cursor-default font-sans">
                  <span>{t('wheel_center_text_1')}</span>
                  <span className="leading-none mt-0.5">{t('wheel_center_text_2')}</span>
                </div>
              </div>

              {/* Status & Messages area */}
              <div className="w-full text-center space-y-3 font-sans">
                {spinMessage ? (
                  <div className={`p-3 rounded-2xl border text-[11px] font-bold ${
                    spinWinReward !== null && spinWinReward > 0 
                      ? 'bg-emerald-50 border-emerald-250 text-emerald-800' 
                      : 'bg-rose-50 border-rose-150 text-rose-800'
                  }`}>
                    {spinMessage}
                  </div>
                ) : (
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-gray-150 text-[10px] text-slate-500 font-bold leading-normal font-sans">
                    ✨ আজকের জন্য আপনার ভাগ্য পরীক্ষা করতে নিচের স্পিন বাটনে আলতো চাপ দিন! প্রতিদিন ১ বার ফ্রি স্পিন করতে পারবেন।
                  </div>
                )}

                {(() => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const hasSpunToday = userState.lastLuckyWheelSpinDate === todayStr;

                  return (
                    <button
                      type="button"
                      disabled={isSpinning || hasSpunToday}
                      onClick={() => {
                        if (hasSpunToday) return;

                        setIsSpinning(true);
                        setSpinMessage(null);
                        setSpinWinReward(null);

                        // Spin calculation
                        const spinCount = userState.luckyWheelSpinCount || 0;
                        const cycleIndex = spinCount % 3;

                        let targetIndex = 1; // ফাঁকা slice
                        let rewardValue = 0.00;

                        if (cycleIndex === 0) {
                          targetIndex = 1; // ফাঁকা slice 1
                          rewardValue = 0.00;
                        } else if (cycleIndex === 1) {
                          targetIndex = 5; // ফাঁকা slice 5
                          rewardValue = 0.00;
                        } else {
                          targetIndex = 2; // ৳ ৩.৫০ slice
                          rewardValue = 3.50;
                        }

                        // Angle to center target sector under pinpoint
                        const sectorAngle = 360 / 7;
                        const targetAngle = 360 - (targetIndex * sectorAngle) - (sectorAngle / 2);

                        const newRot = spinRotation + 2160 + (targetAngle - (spinRotation % 360));
                        setSpinRotation(newRot);

                        setTimeout(() => {
                          onSpinLuckyWheel(rewardValue);
                          setSpinWinReward(rewardValue);
                          setIsSpinning(false);

                          if (rewardValue > 0) {
                            setSpinMessage(`${t('wheel_alert_success')} (৳ ${rewardValue.toFixed(2)})`);
                            alert(`${t('wheel_alert_success')} (৳ ${rewardValue.toFixed(2)})`);
                          } else {
                            setSpinMessage(t('wheel_alert_empty'));
                          }
                        }, 4500);
                      }}
                      className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all transform active:scale-98 flex items-center justify-center gap-1.5 shadow-md ${
                        hasSpunToday
                          ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none' 
                          : isSpinning
                            ? 'bg-indigo-300 text-indigo-100 cursor-wait shadow-none animate-pulse'
                            : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-650 text-white hover:from-indigo-700 hover:to-violet-700 active:scale-95 shadow-indigo-500/15 cursor-pointer'
                      }`}
                    >
                      <RotateCw size={14} className={isSpinning ? "animate-spin" : ""} />
                      <span>
                        {hasSpunToday 
                          ? t('wheel_spin_disabled') 
                          : isSpinning 
                            ? t('wheel_spinning') 
                            : t('wheel_spin_btn')}
                      </span>
                    </button>
                  );
                })()}

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== HOME INVITE FRIENDS MODAL ==================== */}
      {showInviteModal && (
        <div id="invite_friends_overlay" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in text-slate-800">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-blue-500/10 relative transform transition-all animate-scale-up">
            
            {/* Header Banner - High Glowing Banner */}
            <div className="bg-gradient-to-br from-indigo-700 via-blue-600 to-emerald-900 p-5 text-white relative text-center">
              <button 
                onClick={() => setShowInviteModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/15 hover:bg-black/35 w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer z-10"
              >
                <X size={15} className="stroke-[2.5px]" />
              </button>
              
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl mx-auto mb-2 border border-white/20 animate-bounce">
                🤝
              </div>
              
              <h4 className="text-sm font-black uppercase tracking-tight font-sans">বন্ধুদের আমন্ত্রণ জানান ও দল গঠন করুন</h4>
              <p className="text-[10px] text-blue-50/90 font-bold mt-1 max-w-[280px] mx-auto leading-relaxed">
                আপনার রেফারেল লিংকটি বন্ধুদের সাথে শেয়ার করুন এবং প্রতিটি সফল নিবন্ধনে পেয়ে যান সরাসরি ক্যাশ বোনাস!
              </p>
            </div>

            <div className="p-5 space-y-4">
              
              {/* Dynamic Referral Link Box Container */}
              <div className="space-y-2">
                <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
                  আপনার রেফারেল লিংক
                </span>
                
                <div className="bg-slate-50 py-3 px-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-1 overflow-hidden font-sans">
                  <span className="text-[11px] font-mono font-bold text-slate-700 truncate select-all">{userState.referralLink}</span>
                  <span className="text-[8.5px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-150 px-1.5 py-0.5 rounded-md flex-shrink-0 uppercase font-mono">LINK</span>
                </div>
              </div>

              {/* COPY BUTTON: Beautiful Blue Background Box */}
              <button 
                type="button"
                onClick={() => {
                  onCopyReferral();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black py-4 px-4 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Clipboard size={15} className="stroke-[2.5px]" />
                <span className="text-xs uppercase tracking-wide">
                  {copied ? 'রেফার লিংক অনুলিপি সফল! 🎉' : 'রেফার লিংক কপি করুন 🔗'}
                </span>
              </button>

              {/* DETAILED ALERT WARNINGS (সতর্কতা: ভুলভাবে রেফার করলে ক্ষতি রয়েছে) */}
              <div className="bg-rose-50 border border-rose-150 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-rose-700 font-extrabold text-xs">
                  <AlertCircle size={15} className="flex-shrink-0 animate-pulse text-rose-500" />
                  <span>গুরুত্বপূর্ণ সতর্কতা (Anti-Cheat Security Policy):</span>
                </div>
                <div className="text-[10.5px] text-rose-950 leading-relaxed space-y-1 font-bold">
                  <p>• <strong>একই মোবাইল ডিভাইসে</strong> নিজে নিজে নিজে আইডি তৈরি করে রেফারেল নেওয়ার চেষ্টা করবেন না।</p>
                  <p>• <strong>ভিপিএন (VPN) অথবা প্রক্সি</strong> ব্যবহার করে অসৎ উপায়ে ভুয়া রেফারেল জেনარეট করা সম্পূর্ণ নিষিদ্ধ।</p>
                  <p>• <strong>ভুলভাবে বা কৃত্রিম উপায়ে রেফার করলে</strong> রেফারকৃত একাউন্টসহ আপনার নিজস্ব একাউন্টটিও স্থায়ী বা সাময়িকভাবে ব্লক বা উইথড্র বন্ধ করা হবে।</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ==================== ADMIN INBOX MESSAGES MODAL ==================== */}
      {isInboxModalOpen && (
        <div id="admin_inbox_overlay" className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in text-slate-800">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-rose-500/20 relative transform transition-all animate-scale-up flex flex-col max-h-[85vh]">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 p-5 text-white relative flex-shrink-0">
              <button 
                onClick={() => setIsInboxModalOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/15 hover:bg-black/35 w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} className="stroke-[2.5px]" />
              </button>
              
              <div className="flex items-center gap-2">
                <Inbox className="text-yellow-300" size={20} />
                <h4 className="text-sm font-black uppercase tracking-tight font-sans">ইনবক্স নোটিফিকেশন ও বার্তা</h4>
              </div>
              <p className="text-[10px] text-rose-50/90 font-semibold mt-1 leading-relaxed">
                পেমেন্ট রিলিজ, সার্ভার আপগ্রেড, নতুন অফার ও গুরুত্বপূর্ণ অফিশিয়াল নোটিশগুলো এখানে পাবেন।
              </p>
            </div>

            {/* Scrollable Message List Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-grow bg-slate-50/50">
              {allMessages.length === 0 ? (
                <div className="text-center py-10 space-y-3.5">
                  <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto border border-rose-100">
                    <Mail size={24} className="text-rose-400 opacity-60" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-stone-800 text-xs font-stone-850 font-black">কোনো নোটিফিকেশন বার্তা নেই!</p>
                    <p className="text-stone-400 text-[10px] font-semibold">এডমিন প্যানেল থেকে নতুন বার্তা পাঠানো হলে তা এখানে আসবে।</p>
                  </div>
                </div>
              ) : (
                allMessages.map((msg, index) => (
                  <div 
                    key={msg.id || index}
                    className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs relative"
                  >
                    {/* Indicator */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-rose-600 tracking-wider uppercase font-sans flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                        অফিশিয়াল বার্তা #{allMessages.length - index}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">{msg.date}</span>
                    </div>

                    {msg.image && (
                      <div className="relative w-full h-36 overflow-hidden bg-slate-100 rounded-xl border border-slate-100">
                        <img 
                          src={msg.image} 
                          alt="Notice" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <p className="text-[12px] font-extrabold text-slate-700 leading-relaxed font-sans select-all">
                      {msg.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-slate-100 text-center flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsInboxModalOpen(false)}
                className="w-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-rose-500/10"
              >
                পড়েছি / বন্ধ করুন (Mark as Read)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
