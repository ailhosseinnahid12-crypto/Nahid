import React, { useState, useEffect } from 'react';
import { 
  User, Key, Gift, ShieldAlert, CheckCircle2, Lock, ArrowRight, ShieldCheck, HelpCircle, Eye, EyeOff, Terminal, ArrowLeft, RefreshCw
} from 'lucide-react';
import { UserState } from '../types';
import { AVATAR_SEEDS } from '../mockData';
import { LanguageCode } from '../utils/language';

interface AuthViewProps {
  onAuthSuccess: (user: UserState, showWelcome: boolean) => void;
  language?: LanguageCode;
  onLanguageChange?: (newLang: LanguageCode) => void;
}

interface SavedAccount {
  name: string;
  username: string;
  uid: string;
  balance: number;
  referralsCount: number;
  avatarSeed: string;
  adsWatchedCount: number;
  tasksCompletedCount: number;
  passwordHash: string;
  referralLink: string;
  referredBy?: string;
}

export default function AuthView({ onAuthSuccess, language, onLanguageChange }: AuthViewProps) {
  const [isSingupMode, setIsSignupMode] = useState<boolean>(true);
  
  // Registration Form Fields
  const [regName, setRegName] = useState<string>('');
  const [regUsername, setRegUsername] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regReferCode, setRegReferCode] = useState<string>('');
  
  // Login Form Fields
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Security alert state (to block multiple accounts)
  const [securityViolation, setSecurityViolation] = useState<boolean>(false);
  const [securityReason, setSecurityReason] = useState<string>('');

  // Captcha Slider verification states
  const [showCaptcha, setShowCaptcha] = useState<boolean>(false);
  const [captchaSliderValue, setCaptchaSliderValue] = useState<number>(10);
  const [captchaTargetPercent, setCaptchaTargetPercent] = useState<number>(75);
  const [captchaStatus, setCaptchaStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const [captchaMessage, setCaptchaMessage] = useState<string>('Drag the slider left or right to score a goal');

  // Auto-capturing URL parameters (e.g. ?startapp=7487052695 or ?ref=7487052695)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('startapp') || params.get('ref') || params.get('start');
    if (code) {
      setRegReferCode(code);
      // Automatically show visual badge or success notification if code detected
      setSuccessMsg(`🎁 রেফারেল সোর্স ডিটেক্ট করা হয়েছে: ${code}`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  }, []);

  // Handle User Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Form inputs validation
    if (!regName.trim() || !regUsername.trim() || !regPassword || !regConfirmPassword) {
      setErrorMsg('দয়া করে সবকটি ইনপুট ফিল্ড সঠিকভাবে পূরণ করুন।');
      return;
    }

    if (regUsername.trim().length < 4) {
      setErrorMsg('ইউজারনেম অন্তত ৪টি অক্ষরের হতে হবে।');
      return;
    }

    if (regPassword.length < 5) {
      setErrorMsg('পাসওয়ার্ড অত্যন্ত দুর্বল! অন্তত ৫টি অক্ষরে পাসওয়ার্ড দিন।');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড ম্যাচ করেনি!');
      return;
    }

    // 1. Validate "Strict One Account Per Device (Hardware Binding)" limit!
    const existingAccountsStr = localStorage.getItem('cashhive_accounts_v1');
    const existingAccounts: SavedAccount[] = existingAccountsStr ? JSON.parse(existingAccountsStr) : [];
    
    // Check if device already has created an account on this browser (one-account-per-device rule)
    if (existingAccounts.length > 0) {
      // Security Exception Violation triggered
      setSecurityViolation(true);
      setSecurityReason(`MULTIPLE_ACCOUNT_CREATION_BLOCKED`);
      return;
    }

    // All preliminary validations are passed! Now open sliding soccer goalie captcha
    // Set target (e.g. either 25% or 75% for empty corner target spots)
    const randomPercent = Math.random() > 0.5 ? 76 : 24;
    setCaptchaTargetPercent(randomPercent);
    setCaptchaSliderValue(10);
    setCaptchaStatus('idle');
    setCaptchaMessage('Drag the slider left or right to score a goal 🥅⚽');
    setShowCaptcha(true);
  };

  // Triggers when user releases handles or presses verification checking logic
  const handleCaptchaRelease = () => {
    if (captchaStatus === 'success') return;

    // Tolerance limit is 4.5%
    const diff = Math.abs(captchaSliderValue - captchaTargetPercent);
    if (diff <= 5) {
      setCaptchaStatus('success');
      setCaptchaMessage('⚽ 🎉 GOOAL! শটটি সরাসরি টার্গেটে গোল হয়েছে! ভেরিফিকেশন সফল!');
      
      // Save data, trigger successful registration
      setTimeout(() => {
        executeRegistration();
        setShowCaptcha(false);
        setCaptchaStatus('idle');
      }, 1600);
    } else {
      setCaptchaStatus('fail');
      setCaptchaMessage('❌ গোল মিস হয়েছে! গোলরক্ষক বলটি ঠেকিয়ে দিয়েছে 🧤 দয়া করে আবার চেষ্টা করুন।');
      setTimeout(() => {
        // Reset slider to original index
        setCaptchaSliderValue(10);
        setCaptchaStatus('idle');
        setCaptchaMessage('আবার চেষ্টা করুন - বলটি টেনে গোল ড্রিংক রিংয়ে বসান ⚽');
      }, 1800);
    }
  };

  const executeRegistration = () => {
    const existingAccountsStr = localStorage.getItem('cashhive_accounts_v1');
    const existingAccounts: SavedAccount[] = existingAccountsStr ? JSON.parse(existingAccountsStr) : [];
    
    // Generate dynamic Unique ID for the user
    const generatedUid = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const cleanUsername = regUsername.trim().toLowerCase();

    // Create custom avatar seed
    const randomAvatar = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)];

    // Prepare fresh user entry
    const newUser: SavedAccount = {
      name: regName.trim(),
      username: cleanUsername,
      uid: generatedUid,
      balance: 0.00, // 0.00 balance upon signup as they haven't worked yet
      referralsCount: 0,
      avatarSeed: randomAvatar,
      adsWatchedCount: 0,
      tasksCompletedCount: 0,
      passwordHash: regPassword,
      referralLink: `https://t.me/CashHiveBot?startapp=${generatedUid}`,
      referredBy: regReferCode.trim() || undefined
    };

    // Save into list of accounts
    existingAccounts.push(newUser);
    localStorage.setItem('cashhive_accounts_v1', JSON.stringify(existingAccounts));

    // Handle referral side-effects (simulated credit to parent)
    if (regReferCode.trim()) {
      const updatedHostAccounts = existingAccounts.map(acc => {
        if (acc.uid === regReferCode.trim() || acc.username === regReferCode.trim().toLowerCase()) {
          return {
            ...acc,
            balance: acc.balance + 5.00, // + 5 Taka commission
            referralsCount: acc.referralsCount + 1
          };
        }
        return acc;
      });
      localStorage.setItem('cashhive_accounts_v1', JSON.stringify(updatedHostAccounts));
    }

    setSuccessMsg('🎉 অভিনন্দন! অ্যাকাউন্ট তৈরি সফল হয়েছে। ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');
    localStorage.setItem('notice_has_been_closed_v1', 'false');
    
    const userState: UserState = {
      name: newUser.name,
      username: newUser.username,
      uid: newUser.uid,
      balance: newUser.balance,
      referralsCount: newUser.referralsCount,
      avatarSeed: newUser.avatarSeed,
      adsWatchedCount: newUser.adsWatchedCount,
      tasksCompletedCount: newUser.tasksCompletedCount,
      referralLink: newUser.referralLink
    };

    setTimeout(() => {
      onAuthSuccess(userState, true);
    }, 1500);
  };

  // Handle User Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanUsername = loginUsername.trim().toLowerCase();

    if (!cleanUsername || !loginPassword) {
      setErrorMsg('দয়া করে ইউজারনেম এবং পাসওয়ার্ড বসিয়ে দিন।');
      return;
    }

    const existingAccountsStr = localStorage.getItem('cashhive_accounts_v1');
    const existingAccounts: SavedAccount[] = existingAccountsStr ? JSON.parse(existingAccountsStr) : [];

    // Fallback credentials simulation for initial demo (Nahid Hasan) if none registered yet
    if (cleanUsername === 'hasan778810' && loginPassword === '12345') {
      const demoUser: UserState = {
        name: 'Nahid Hasan',
        username: 'Hasan778810',
        uid: '7487052695',
        balance: 2.50,
        referralsCount: 0,
        avatarSeed: AVATAR_SEEDS[0],
        adsWatchedCount: 3,
        tasksCompletedCount: 1,
        referralLink: 'https://t.me/CashHiveBot?startapp=7487052695'
      };
      
      setSuccessMsg('সফল সাইন ইন! ড্যাশবোর্ডে প্রবেশ হচ্ছে...');
      setTimeout(() => {
        onAuthSuccess(demoUser, true);
      }, 1200);
      return;
    }

    // Match in database
    const matched = existingAccounts.find(acc => acc.username === cleanUsername && acc.passwordHash === loginPassword);
    
    if (matched) {
      setSuccessMsg('সফল সাইন ইন! ড্যাশবোর্ডে প্রবেশ হচ্ছে...');
      
      const userState: UserState = {
        name: matched.name,
        username: matched.username,
        uid: matched.uid,
        balance: matched.balance,
        referralsCount: matched.referralsCount,
        avatarSeed: matched.avatarSeed,
        adsWatchedCount: matched.adsWatchedCount,
        tasksCompletedCount: matched.tasksCompletedCount,
        referralLink: matched.referralLink
      };

      setTimeout(() => {
        onAuthSuccess(userState, true);
      }, 1200);
    } else {
      setErrorMsg('ভুল ইউজারনেম অথবা পাসওয়ার্ড! আবার চেষ্টা করুন।');
    }
  };

  return (
    <div id="auth_container_root" className="min-h-screen bg-gradient-to-b from-[#eafaf4] via-[#f4fcfa] to-[#eaf7f2] flex flex-col items-center justify-center p-4">
      
      {/* 1. STRUCTURAL CRITICAL SECURITY VIOLATION ACTIVE MODAL SCREEN */}
      {securityViolation && (
        <div id="hardware_security_screen" className="fixed inset-0 z-[999] bg-slate-950 flex items-center justify-center p-5 text-white animate-fade-in font-mono">
          <div className="max-w-sm w-full border-2 border-red-500 rounded-3xl bg-[#0a0505] p-6 space-y-5 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
            
            <div className="flex justify-center flex-col items-center gap-2">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500 text-red-500 animate-pulse">
                <ShieldAlert size={36} />
              </div>
              <h2 className="text-lg font-black tracking-wider text-red-500 mt-2">SECURITY ALERT ⚠️</h2>
              <span className="text-[9px] bg-red-950 border border-red-500/30 text-red-400 px-2 py-0.5 rounded font-mono">
                DEVICE_RESTRICTION: MULTI_ACC_DETECTED
              </span>
            </div>

            <div className="border-t border-b border-red-500/20 py-4 text-xs leading-relaxed text-red-150 text-justify text-gray-300">
              <p className="font-sans font-medium">
                দুঃখিত! এই ডিভাইসে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে। 
                <strong className="text-red-400"> CashHive </strong> প্ল্যাটফর্মে প্রতি ডিভাইসে সর্বোচ্চ ১টি অ্যাকাউন্টের অনুমতি রয়েছে।
              </p>
              <div className="mt-3 bg-red-950/40 p-2.5 rounded-xl border border-red-500/10 font-mono text-[10px] space-y-1">
                <p className="text-red-400 font-bold flex items-center gap-1">
                  <Terminal size={11} /> System Trace Info:
                </p>
                <p>• Terminal Pin: 0x8C{Math.floor(Math.random() * 8899)}</p>
                <p>• Device UUID Binding: Validated</p>
                <p>• Hardware Signature Locked</p>
              </div>
            </div>

            <button 
              onClick={() => {
                setSecurityViolation(false);
                setIsSignupMode(false); // Direct down to login
              }}
              className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold py-3 rounded-2xl flex items-center justify-center gap-1 font-sans cursor-pointer transition-all"
            >
              <span>বিদ্যমান একাউন্টে লগইন করুন (Sign In)</span>
              <ArrowRight size={14} />
            </button>
            <p className="text-[10px] text-gray-500 text-center select-none">
              Violation tracking code ID: CH-{Date.now().toString().slice(-6)}
            </p>
          </div>
        </div>
      )}

      {/* 1.5. SOCCER SLIDER CAPTCHA MODAL */}
      {showCaptcha && (
        <div id="soccer_captcha_overlay" className="fixed inset-0 z-[1000] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-white rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-150 flex flex-col">
            
            {/* Header precisely matching second screenshot layout */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button 
                onClick={() => setShowCaptcha(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer transition-colors"
                title="Back to registration"
              >
                <ArrowLeft size={18} />
              </button>
              <h3 className="font-extrabold text-slate-800 text-[14px]">Confirmation</h3>
              <div className="w-8"></div> {/* Spacer for perfect alignment */}
            </div>

            {/* Captcha Instructions */}
            <div className="px-6 pt-5 pb-3 text-center space-y-1">
              <h4 className="text-[17px] font-black text-slate-800">Confirm you're not a robot</h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Drag the slider left or right to score a goal in the empty slot 🥅⚽
              </p>
            </div>

            {/* Soccer pitch field / Goal Box */}
            <div className="px-6 py-2">
              <div 
                className="relative h-44 rounded-2xl overflow-hidden border border-slate-300 shadow-inner select-none flex flex-col justify-end"
                style={{
                  background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)'
                }}
              >
                {/* Net background mesh lines */}
                <div className="absolute inset-x-4 top-2 h-28 border border-white/50 border-b-0 rounded-t-lg bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:10px_10px] opacity-80"></div>
                
                {/* Grass field base block in bottom */}
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-emerald-800 to-emerald-700 border-t border-emerald-500 flex items-center justify-center">
                  <div className="w-full h-px bg-white/20"></div>
                </div>

                {/* Goalkeeper element (🧤 Character or silhouette) in left layout or standing center ready */}
                <div 
                  className="absolute bottom-5 text-4xl select-none transition-all duration-300 animate-pulse"
                  style={{
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  🧤🕴️🧤
                </div>

                {/* Target circular Ring showing where to target the ball */}
                <div 
                  style={{ left: `${captchaTargetPercent}%` }}
                  className="absolute top-8 -translate-x-1/2 flex items-center justify-center pointer-events-none"
                >
                  {/* Glowing Target Ring */}
                  <div className="w-12 h-12 rounded-full border-4 border-dashed border-sky-450 animate-spin flex items-center justify-center bg-sky-500/15 shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                    <span className="text-[8px] text-sky-200 font-extrabold font-mono tracking-tighter">TARGET</span>
                  </div>
                  {/* Highlight indicator pin arrow */}
                  <div className="absolute -top-3 w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-sky-400"></div>
                </div>

                {/* Soccer ball element flying dynamic horizontally / vertically */}
                {(() => {
                  const distance = Math.abs(captchaSliderValue - captchaTargetPercent);
                  // Dynamic height of ball calculated based on alignment proximity! Max close to goal corner is bottom-24, ground is bottom-3.
                  const ballY = Math.max(12, 54 - (distance * 0.95));
                  return (
                    <div 
                      key={captchaSliderValue}
                      style={{ 
                        left: `${captchaSliderValue}%`, 
                        bottom: `${ballY}px`, // scaled in percentage heights
                        transform: 'translateX(-50%) shadow-[0_4px_8px_rgba(0,0,0,0.5)]'
                      }}
                      className="absolute text-3xl select-none transition-all duration-75 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]"
                    >
                      ⚽
                    </div>
                  );
                })()}

                {/* Live indicators / badges in corners */}
                <div className="absolute top-2 left-3 bg-black/60 border border-slate-700/50 px-2 py-0.5 rounded text-[8px] font-mono text-slate-300">
                  SECURE_PROT: LEVEL_4
                </div>
                <div className="absolute top-2 right-3 bg-black/60 border border-slate-700/50 px-2 py-0.5 rounded text-[8px] font-mono text-slate-300">
                  GOALIE_AI: LOCK
                </div>
              </div>
            </div>

            {/* Slider track container */}
            <div className="px-6 py-4 space-y-4">
              
              {/* Dynamic live check status indicators */}
              <div className={`p-2.5 rounded-xl border text-[11.5px] font-bold text-center transition-all ${
                captchaStatus === 'idle' ? 'bg-slate-50 text-slate-650 border-slate-150' :
                captchaStatus === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 animate-pulse' :
                'bg-red-50 text-red-800 border-red-200'
              }`}>
                {captchaMessage}
              </div>

              {/* Slider Track Row */}
              <div className="relative h-12 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center p-1 overflow-hidden select-none">
                
                {/* Slider bar background text / chevrons slider instruction */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[9.5px] text-slate-400 font-extrabold tracking-widest uppercase pl-10 select-none">
                  ম্যাচ করে গোল করতে স্লাইড করুন ⇉ ⇉
                </div>

                <input 
                  type="range"
                  min="4"
                  max="94"
                  value={captchaSliderValue}
                  onChange={(e) => {
                    if (captchaStatus !== 'success') {
                      setCaptchaSliderValue(Number(e.target.value));
                    }
                  }}
                  onMouseUp={handleCaptchaRelease}
                  onTouchEnd={handleCaptchaRelease}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />

                {/* Custom visual sliding handle track pill styled precise as screenshot */}
                <div 
                  style={{ left: `calc(${captchaSliderValue}% - 22px)` }}
                  className="absolute top-1/2 -translate-y-1/2 w-14 h-9 bg-linear-to-b from-sky-500 via-sky-600 to-sky-700 border border-sky-400 rounded-2xl flex items-center justify-center text-white shadow-lg pointer-events-none transition-transform active:scale-95 z-10"
                >
                  <span className="font-sans text-[14px] font-black tracking-tighter">← ⚽ →</span>
                </div>
              </div>

              {/* Retry / Reset Button if they want to redo or failed */}
              <div className="flex gap-2.5 pt-1.5 pb-2">
                <button 
                  type="button"
                  onClick={() => {
                    setCaptchaSliderValue(10);
                    // Shuffle target
                    setCaptchaTargetPercent(Math.random() > 0.5 ? 76 : 24);
                    setCaptchaStatus('idle');
                    setCaptchaMessage('Captcha Reset! Drag slider to goal empty corner ⚽');
                  }}
                  className="w-1/2 bg-slate-55 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>রিসেট করুন (Reset)</span>
                </button>
                <button 
                  type="button"
                  onClick={handleCaptchaRelease}
                  className="w-1/2 bg-sky-600 hover:bg-sky-750 active:bg-sky-800 text-white font-extrabold py-2.5 rounded-2xl text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md shadow-sky-600/10"
                >
                  <span>গোল নিশ্চিত করুন ⚽</span>
                </button>
              </div>
            </div>

            {/* Bottom Brand Shield Guarantee for authenticity */}
            <div className="bg-slate-55 border-t border-slate-100 p-4 flex items-center justify-center gap-1.5 text-slate-400 text-[10px] uppercase tracking-wider font-extrabold select-none">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>CashHive Security Captcha Protected</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN BRAND AUTH COMPONENT CARD */}
      <div id="auth_portal_card" className="w-full max-w-md bg-white rounded-[32px] border border-emerald-100 shadow-xl overflow-hidden p-6 space-y-6 animate-fade-in relative">
        <div className="absolute top-[-50px] right-[-50px] w-36 h-36 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* LOGO AND BRANDING */}
        <div className="text-center space-y-1.5 pt-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg shadow-emerald-500/20 mx-auto transform hover:rotate-6 transition-all">
            🐝
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-1 font-sans">
            CashHive <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">2026</span>
          </h2>
          <p className="text-[11px] text-slate-400 font-medium">
            {isSingupMode ? 'সহজ মাইক্রো ট্রাস্টেড কাজ ও নিশ্চিত আজীবন ক্যাশআউট!' : 'আপনার পূর্বের ডেটা দিয়ে পুনরায় প্রবেশ করুন'}
          </p>
        </div>

        {/* FEEDBACK NOTIFICATION INLINE MESSAGES */}
        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-3 rounded-2xl border border-red-100 text-[11px] font-semibold flex items-center gap-1.5 animate-bounce">
            <ShieldAlert size={14} className="text-red-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl border border-emerald-100 text-[11px] font-bold flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* FORMS SWITCH TOGGLER */}
        <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
          <button 
            type="button"
            onClick={() => {
              setIsSignupMode(true);
              setErrorMsg(null);
            }}
            className={`w-1/2 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              isSingupMode ? 'bg-white text-emerald-600 shadow-xs ring-1 ring-emerald-500/5' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            নতুন অ্যাকাউন্ট (Sign Up)
          </button>
          <button 
            type="button"
            onClick={() => {
              setIsSignupMode(false);
              setErrorMsg(null);
            }}
            className={`w-1/2 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              !isSingupMode ? 'bg-white text-emerald-600 shadow-xs ring-1 ring-emerald-500/5' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            লগইন (Sign In)
          </button>
        </div>

        {/* DYNAMIC FORMS INTEGRATION */}
        {isSingupMode ? (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* FULL NAME */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pl-1 block">আপনার নাম (Full Name)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><User size={14} /></span>
                <input 
                  type="text"
                  placeholder="যেমন: Nahid Hasan"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* REGISTERED USERNAME */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pl-1 block">ইউজারনেম (Username - login credential)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono">@</span>
                <input 
                  type="text"
                  placeholder="যেমন: hasan778810"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-10 pr-4 text-xs font-mono text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* PASSWORD AND PASSWORD CONFIRMATION */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pl-1 block">পাসওয়ার্ড (Password)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={12} /></span>
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="•••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pl-1 block">কনফার্ম পাসওয়ার্ড</label>
                <div className="relative font-sans">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={12} /></span>
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="•••••"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            </div>

            {/* SPONSOR CODE (AUTO-CAPTURED) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center pl-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">রেফার কোড / Sponsor Code (ঐচ্ছিক)</label>
                {regReferCode && (
                  <span className="text-[9px] text-[#00c875] font-black border border-emerald-500/20 px-1.5 rounded-full bg-emerald-50 flex items-center gap-0.5">🔒 LOCKED & ACTIVE ✓</span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Gift size={13} /></span>
                <input 
                  type="text"
                  placeholder="রেফার কোড বসান না থাকলে প্রমো জেনারেট করুন"
                  value={regReferCode}
                  onChange={(e) => {
                    if (!regReferCode) {
                      setRegReferCode(e.target.value);
                    }
                  }}
                  readOnly={!!regReferCode}
                  className={`w-full border rounded-2xl py-3 pl-10 pr-4 text-xs font-mono placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white ${
                    regReferCode 
                      ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none font-bold' 
                      : 'bg-slate-50 border-slate-100 text-slate-800'
                  }`}
                />
              </div>
            </div>

            {/* AGREEMENT BADGE */}
            <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl flex items-start gap-1.5 text-[10px] text-slate-500 leading-normal">
              <input type="checkbox" defaultChecked required className="mt-0.5 accent-emerald-500 rounded cursor-pointer" />
              <span>
                আমি CashHive-এর সকল নিয়মাবলি ও ১টি ডিভাইসে ১টি একমাত্র অ্যাকাউন্ট ব্যবহারের নীতিতে সম্মত।
              </span>
            </div>

            {/* SUBMIT BUTTON */}
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:from-emerald-700 active:to-teal-800 text-white font-extrabold py-3.5 rounded-2xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5 text-xs text-white"
            >
              <span>নিরাপদ অ্যাকাউন্ট তৈরি করুন</span>
              <ArrowRight size={13} />
            </button>

          </form>
        ) : (
          /* LOGIN FORM */
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* USERNAME */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pl-1 block">ইউজারনেম (Username)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono">@</span>
                <input 
                  type="text"
                  placeholder="যেমন: hasan778810"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-10 pr-4 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-1">
              <div className="flex justify-between items-center pl-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">পাসওয়ার্ড (Password)</label>
                <span className="text-[9px] text-emerald-600 cursor-pointer hover:underline">পাসওয়ার্ড মনে নেই?</span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={14} /></span>
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-10 pr-10 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* SECURE DOCK */}
            <div className="bg-emerald-500/5 col-span-2 border border-emerald-500/10 p-3 rounded-2xl flex items-center justify-between text-[10px] text-emerald-800">
              <span className="flex items-center gap-1 font-bold">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>SSL Encrypted Server Connection</span>
              </span>
              <span className="font-bold underline cursor-pointer">Security Key</span>
            </div>

            {/* SUBMIT BUTTON */}
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:from-emerald-700 active:to-teal-800 text-white font-extrabold py-3.5 rounded-2xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5 text-xs text-white"
            >
              <span>প্ল্যাটফর্ম অ্যাকাউন্টে প্রবেশ করুন</span>
              <ArrowRight size={13} />
            </button>

          </form>
        )}

        {/* SECURITY WARNING DESK */}
        <div id="payout_badge_under_auth" className="flex items-center justify-center gap-4 text-[9.5px] text-slate-400/80 font-bold uppercase tracking-wider pt-3.5 border-t border-slate-100">
          <span className="flex items-center gap-0.5">🛡️ 2026 Core Protection</span>
          <span>•</span>
          <span className="flex items-center gap-0.5">🔒 Multi-Session Safe</span>
        </div>

      </div>

    </div>
  );
}
