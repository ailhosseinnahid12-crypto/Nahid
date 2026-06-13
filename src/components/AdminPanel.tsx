import React, { useState } from 'react';
import { 
  Settings, Users, CheckCircle, XCircle, Plus, Trash, PlusCircle, Edit3, 
  TrendingUp, Tv, Send, Info, Lock, Shield, ArrowLeftRight, Clipboard, ChevronDown, Check, Coins, Award
} from 'lucide-react';
import { UserState, EarnTask, TransactionLog } from '../types';

interface AdminPanelProps {
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
  onUpdateSettings: (settings: {
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
  }) => void;
  tasks: EarnTask[];
  onAddTask: (task: EarnTask) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskReward: (taskId: string, reward: number) => void;
  allUsers: UserState[];
  onUpdateUserBalance: (username: string, changeAmount: number) => void;
  onUpdateUserStatus?: (username: string, status: 'active' | 'frozen' | 'suspended') => void;
  transactionHistory: TransactionLog[];
  onResolveWithdrawal: (txId: string, status: 'completed' | 'failed') => void;
  onResolveProof: (txId: string, status: 'approved' | 'rejected') => void;
  language: string;
  onNavigateBack?: () => void;
}

export default function AdminPanel({
  appSettings,
  onUpdateSettings,
  tasks,
  onAddTask,
  onDeleteTask,
  onUpdateTaskReward,
  allUsers,
  onUpdateUserBalance,
  onUpdateUserStatus,
  transactionHistory,
  onResolveWithdrawal,
  onResolveProof,
  language,
  onNavigateBack
}: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'tasks' | 'users' | 'withdrawals' | 'proofs'>('settings');

  // --- ADMIN SYSTEM SECURITY & BRUTE-FORCE SHIELD ---
  const [isPinAuthorized, setIsPinAuthorized] = useState<boolean>(() => {
    return sessionStorage.getItem('cashhive_admin_authorized_v2') === 'true';
  });
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [pinHide, setPinHide] = useState<boolean>(true);
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    return parseInt(localStorage.getItem('cashhive_admin_failed_v2') || '0', 10);
  });
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState<number>(0);
  const [newAdminPin, setNewAdminPin] = useState<string>('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState<boolean>(false);

  // Sync lockout countdown ticker
  React.useEffect(() => {
    const checkLockout = () => {
      const lockoutUntil = parseInt(localStorage.getItem('cashhive_admin_lockout_until_v2') || '0', 10);
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutTimeLeft(remaining);
      if (remaining > 0) {
        const timer = setTimeout(checkLockout, 1000);
        return () => clearTimeout(timer);
      }
    };
    checkLockout();
  }, [failedAttempts]);

  // Handle PIN code validation
  const handleVerifyPin = (pinToSubmit?: string) => {
    const finalPin = pinToSubmit !== undefined ? pinToSubmit : pinInput;
    const correctPin = localStorage.getItem('cashhive_admin_pin_v2') || '778810';

    // Verify lockout state first
    const lockoutUntil = parseInt(localStorage.getItem('cashhive_admin_lockout_until_v2') || '0', 10);
    if (Date.now() < lockoutUntil) {
      setPinError(`Brute-force protection active. Try again in ${lockoutTimeLeft}s.`);
      return;
    }

    if (finalPin === correctPin) {
      setIsPinAuthorized(true);
      sessionStorage.setItem('cashhive_admin_authorized_v2', 'true');
      localStorage.setItem('cashhive_admin_failed_v2', '0');
      setFailedAttempts(0);
      setPinInput('');
      setPinError('');
    } else {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      localStorage.setItem('cashhive_admin_failed_v2', nextFailed.toString());

      if (nextFailed >= 3) {
        const lockoutUntilTime = Date.now() + 60000; // 60 seconds lockout
        localStorage.setItem('cashhive_admin_lockout_until_v2', lockoutUntilTime.toString());
        setLockoutTimeLeft(60);
        setPinError('❌ পরপর ৩ বার ভুল পিনকোড! সুরক্ষার জন্য ৬০ সেকেন্ডের জন্য এক্সেস ব্লক করা হল।');
      } else {
        setPinError(`❌ ভুল নিরাপত্তা পিনকোড! আপনার আরো ${3 - nextFailed} বার চেষ্টা করার সুযোগ আছে।`);
      }
      setPinInput('');
    }
  };

  // Keyboard support for typing PIN
  React.useEffect(() => {
    if (isPinAuthorized) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lockoutTimeLeft > 0) return;
      if (e.key >= '0' && e.key <= '9') {
        if (pinInput.length < 6) {
          const newPin = pinInput + e.key;
          setPinInput(newPin);
          if (newPin.length === 6) {
            // Auto submit when 6 chars entered
            setTimeout(() => handleVerifyPin(newPin), 250);
          }
        }
      } else if (e.key === 'Backspace') {
        setPinInput(prev => prev.slice(0, -1));
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        setPinInput('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pinInput, isPinAuthorized, lockoutTimeLeft]);

  // App settings local inputs
  const [channelInput, setChannelInput] = useState(appSettings.telegramChannel);
  const [groupInput, setGroupInput] = useState(appSettings.telegramGroup);
  const [adRewardInput, setAdRewardInput] = useState(appSettings.adReward.toString());
  const [referralBonusInput, setReferralBonusInput] = useState(appSettings.referralBonus.toString());
  const [minWithdrawInput, setMinWithdrawInput] = useState(appSettings.minWithdraw.toString());
  const [dailyAdLimitInput, setDailyAdLimitInput] = useState((appSettings.dailyAdLimit ?? 20).toString());
  const [adsterraDirectLinkInput, setAdsterraDirectLinkInput] = useState(appSettings.adsterraDirectLink || '');
  const [adsterraScript1Input, setAdsterraScript1Input] = useState(appSettings.adsterraScript1 || '');
  const [adsterraScript2Input, setAdsterraScript2Input] = useState(appSettings.adsterraScript2 || '');
  
  const [adminInboxImageInput, setAdminInboxImageInput] = useState(appSettings.adminInboxImage || '');
  const [adminInboxMessageInput, setAdminInboxMessageInput] = useState(appSettings.adminInboxMessage || '');
  const [adminInboxEnabledInput, setAdminInboxEnabledInput] = useState(appSettings.adminInboxEnabled ?? true);

  const [newInboxImage, setNewInboxImage] = useState('');
  const [newInboxMessage, setNewInboxMessage] = useState('');

  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // New task form states
  const [adminTaskFilter, setAdminTaskFilter] = useState<'vip' | 'social' | 'premium'>('social');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskReward, setNewTaskReward] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'vip' | 'social' | 'premium'>('social');
  const [newTaskType, setNewTaskType] = useState<'math' | 'captcha' | 'click' | 'poll' | 'social_link' | 'download'>('social_link');
  const [newTaskDifficulty, setNewTaskDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [newTaskProofRequired, setNewTaskProofRequired] = useState(false);
  const [newTaskLink, setNewTaskLink] = useState('');
  const [newTaskLogoUrl, setNewTaskLogoUrl] = useState('');
  const [taskSuccess, setTaskSuccess] = useState(false);

  // User list search / modification states
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserState | null>(null);
  const [balanceChangeInput, setBalanceChangeInput] = useState('');
  const [userActionSuccess, setUserActionSuccess] = useState<string | null>(null);
  const [expandedWithdrawalId, setExpandedWithdrawalId] = useState<string | null>(null);

  // Handle settings update save
  const [inboxWriteSuccess, setInboxWriteSuccess] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      telegramChannel: channelInput,
      telegramGroup: groupInput,
      adReward: parseFloat(adRewardInput) || 0.50,
      referralBonus: parseFloat(referralBonusInput) || 5.00,
      minWithdraw: parseFloat(minWithdrawInput) || 20.00,
      dailyAdLimit: parseInt(dailyAdLimitInput, 10) || 20,
      adsterraDirectLink: adsterraDirectLinkInput,
      adsterraScript1: adsterraScript1Input,
      adsterraScript2: adsterraScript2Input,
      adminInboxImage: adminInboxImageInput,
      adminInboxMessage: adminInboxMessageInput,
      adminInboxEnabled: adminInboxEnabledInput,
      adminInboxMessages: appSettings.adminInboxMessages || []
    });
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  // Handle task submission
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskReward) return;

    const createdTask: EarnTask = {
      id: `task_custom_${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDesc || 'অ্যাসাইন্ড মাইক্রো ডিউট সম্পন্ন করে ক্যাশ ওয়ালেট জমা করুন।',
      reward: parseFloat(newTaskReward) || 2.00,
      type: newTaskType,
      category: newTaskCategory,
      completed: false,
      difficulty: newTaskDifficulty,
      proofRequired: newTaskProofRequired || newTaskCategory === 'premium' || newTaskCategory === 'social' || newTaskCategory === 'vip',
      adminStatus: 'idle',
      link: newTaskLink || 'https://t.me/CashHiveBot',
      logoUrl: newTaskLogoUrl || undefined
    };

    onAddTask(createdTask);
    setTaskSuccess(true);
    
    // reset form
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskReward('');
    setNewTaskLink('');
    setNewTaskLogoUrl('');
    setTimeout(() => setTaskSuccess(false), 3000);
  };

  // Balance adjust handler
  const handleAdjustBalance = (isAdd: boolean) => {
    if (!selectedUser || !balanceChangeInput) return;
    const amount = parseFloat(balanceChangeInput);
    if (isNaN(amount) || amount <= 0) return;

    const multiplier = isAdd ? 1 : -1;
    onUpdateUserBalance(selectedUser.username, amount * multiplier);
    
    // update current highlighted user state locally so it rerenders
    setSelectedUser(prev => prev ? {
      ...prev,
      balance: Math.max(0, prev.balance + (amount * multiplier))
    } : null);

    setUserActionSuccess(`সাফল্যজনকভাবে ব্যালেন্স ${isAdd ? 'যোগ' : 'কর্তন'} করা হয়েছে!`);
    setBalanceChangeInput('');
    setTimeout(() => setUserActionSuccess(null), 3000);
  };

  // Filter users
  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.uid.includes(userSearchQuery)
  );

  // Get pending withdrawals from history state
  const pendingWithdrawals = transactionHistory.filter(tx => tx.type === 'withdraw_pending' && tx.status === 'pending');

  // Get pending premium tasks proofs
  const pendingProofs = transactionHistory.filter(tx => 
    (tx.type === 'vip_proof' || tx.type === 'task') && 
    tx.status === 'pending' && 
    tx.proofScreenshot
  );

  if (!isPinAuthorized) {
    return (
      <div id="admin_lock_screen_container" className="bg-slate-950 min-h-[550px] rounded-[28px] border border-slate-900 shadow-2xl p-6 flex flex-col justify-between animate-fade-in text-white relative overflow-hidden font-sans">
        {/* Abstract safety ambient blur background */}
        <div className="absolute top-[-40px] left-[-40px] w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-40px] right-[-40px] w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top brand header */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-4 relative z-10 font-sans">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-500/15 text-rose-500 rounded-xl border border-rose-500/20">
              <Shield size={16} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-[12px] font-black uppercase tracking-wider bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent leading-none">CASHHIVE SECURE SHIELD</h4>
              <p className="text-[8.5px] text-slate-500 font-extrabold tracking-widest font-mono pt-1">LEVEL 5 KERNEL ACTIVE</p>
            </div>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black border border-emerald-500/25 px-2.5 py-1 rounded-full animate-pulse uppercase">
            SECURE ACCESS
          </span>
        </div>

        {/* Security Alert Details */}
        <div className="my-3 py-3.5 px-4 bg-slate-900/60 border border-slate-900 rounded-2xl space-y-2 relative z-10 text-left font-sans">
          <div className="flex items-start gap-2.5">
            <div className="p-1 bg-amber-500/10 text-amber-500 rounded-lg shrink-0 mt-0.5">
              <Info size={13} />
            </div>
            <div className="space-y-0.5 min-w-0">
              <h5 className="text-[11.5px] font-black text-slate-200 leading-tight">মেম্বার গেটওয়ে সুরক্ষাবান্ধব লকস্ক্রিন</h5>
              <p className="text-[9.5px] text-slate-450 leading-normal font-semibold">
                অনুমোদিত মালিক ছাড়া এই প্যানেলে অন্যের প্রবেশ সম্পূর্ণ নিষিদ্ধ। ভুল পিনকোড তিনবার দিলে নিরাপত্তা বিধিনিষেধ স্বয়ংক্রিয়ভাবে সক্রিয় হবে।
              </p>
            </div>
          </div>
          
          <div className="pt-2 border-t border-slate-900/60 flex justify-between text-[8px] font-mono text-slate-500 font-bold uppercase tracking-tight">
            <span>Operator: Nahid Hasan</span>
            <span className="truncate ml-2">ID: <strong className="text-slate-300">ailhosseinnahid12@gmail.com</strong></span>
          </div>
        </div>

        {/* PIN Bubble Visualizer */}
        <div className="space-y-4 my-2 text-center relative z-10 w-full font-sans">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">নিরাপত্তা কোড প্রদান করুন (Enter Secret PIN)</p>
          
          {/* Key Bubbles */}
          <div className="flex justify-center items-center gap-3.5 py-1.5">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const hasDigit = pinInput.length > index;
              return (
                <div 
                  key={index}
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                    hasDigit 
                      ? 'bg-rose-500 border-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.5)] scale-110' 
                      : 'border-slate-800 bg-slate-950'
                  }`}
                />
              );
            })}
          </div>

          {/* Dynamic Pin Feedback/Status Banner */}
          <div className="h-5 flex items-center justify-center">
            {pinError ? (
              <p className="text-[10px] text-rose-400 font-extrabold antialiased animate-pulse">
                {pinError}
              </p>
            ) : lockoutTimeLeft > 0 ? (
              <p className="text-[10.5px] text-amber-400 font-extrabold animate-pulse">
                ⏳ ব্রুট-ফোর্স প্রটেকশন সচল আছে। পুনরায় চেষ্টা করুন {lockoutTimeLeft}s পর।
              </p>
            ) : (
              <p className="text-[9.5px] text-[#00cf85] font-semibold tracking-wide">
                💡 পিন কোডটি আপনার অ্যাকাউন্টের ইউজারনেম (Hasan778810) এর শেষ ৬ ডিজিট।
              </p>
            )}
          </div>
        </div>

        {/* Custom Touch Keypad block */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto w-full my-3 relative z-10 select-none font-sans">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              disabled={lockoutTimeLeft > 0 || pinInput.length >= 6}
              onClick={() => {
                const nPin = pinInput + num;
                setPinInput(nPin);
                setPinError('');
                if (nPin.length === 6) {
                  setTimeout(() => handleVerifyPin(nPin), 250);
                }
              }}
              className="h-11 bg-slate-900/80 hover:bg-slate-800/90 active:bg-slate-700/90 border border-slate-900 rounded-xl text-sm font-black flex items-center justify-center cursor-pointer transition-all active:scale-95 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-inner"
            >
              {num}
            </button>
          ))}
          
          {/* Backspace/Clear, 0, submit */}
          <button
            type="button"
            onClick={() => {
              setPinInput('');
              setPinError('');
            }}
            className="h-11 bg-slate-950 hover:bg-slate-900 border border-slate-900 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center cursor-pointer text-slate-400 transition-all active:scale-95"
          >
            Clear
          </button>
          
          <button
            type="button"
            disabled={lockoutTimeLeft > 0 || pinInput.length >= 6}
            onClick={() => {
              const nPin = pinInput + '0';
              setPinInput(nPin);
              setPinError('');
              if (nPin.length === 6) {
                setTimeout(() => handleVerifyPin(nPin), 250);
              }
            }}
            className="h-11 bg-slate-900/80 hover:bg-slate-800/90 active:bg-slate-700/90 border border-slate-900 rounded-xl text-sm font-black flex items-center justify-center cursor-pointer transition-all active:scale-95 text-white disabled:opacity-40"
          >
            0
          </button>

          <button
            type="button"
            onClick={() => {
              setPinInput(prev => prev.slice(0, -1));
              setPinError('');
            }}
            className="h-11 bg-slate-950 hover:bg-slate-900 border border-slate-900 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center cursor-pointer text-slate-400 transition-all active:scale-95"
          >
            Delete
          </button>
        </div>

        {/* Footer controls */}
        <div className="border-t border-slate-900 pt-3 flex justify-between items-center relative z-10 mt-2 font-sans">
          {onNavigateBack && (
            <button
              type="button"
              onClick={onNavigateBack}
              className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              ← ফিরে যান (Exit)
            </button>
          )}

          <div className="flex items-center gap-1.5 text-slate-550 text-[8px] font-extrabold uppercase tracking-widest leading-none select-none">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
            <span>SYSTEM ENCRYPTED</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="admin_control_panel_layout" className="bg-[#fcfefe] min-h-[500px] rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in font-sans">
      
      {/* Dynamic Master Banner */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-emerald-950 p-6 text-white relative">
        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-full px-2.5 py-0.5 text-[8.5px] uppercase font-black tracking-wider leading-none">
          <Shield size={10} className="fill-emerald-400" />
          Master Admin Desk
        </div>
        
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-1 min-w-0">
            <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2 font-sans">
              <Settings className="animate-spin text-emerald-400 shrink-0" size={19} style={{ animationDuration: '6s' }} />
              <span className="truncate">অ্যাডমিন কন্ট্রোল সেন্ট্রাল</span>
            </h3>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans opacity-90 truncate">
              টাস্ক, ওয়েবসাইট ভিজিট জবস, মেম্বার ব্যালেন্স ও পেমেন্ট রিকোয়েস্ট নিয়ন্ত্রণ।
            </p>
          </div>
          {onNavigateBack && (
            <button
              type="button"
              onClick={onNavigateBack}
              className="bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 font-black text-[10px] sm:text-[11.5px] px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all shadow-md shrink-0 cursor-pointer"
            >
              <span>ইউজার প্যানেল 🔙</span>
            </button>
          )}
        </div>

        {/* Global Key Stats Indicator */}
        <div className="grid grid-cols-4 gap-1.5 mt-5">
          <button 
            type="button" 
            onClick={() => setActiveSubTab('settings')}
            className={`p-2.5 rounded-2xl border text-center transition-all ${
              activeSubTab === 'settings' 
                ? 'bg-emerald-500 text-white border-emerald-400 font-extrabold shadow-sm' 
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5 font-semibold'
            }`}
          >
            <p className="text-[8px] opacity-75 uppercase tracking-wider">SETTINGS</p>
            <p className="text-13px font-bold">সার্ভার সেটিংস</p>
          </button>

          <button 
            type="button" 
            onClick={() => setActiveSubTab('tasks')}
            className={`p-2.5 rounded-2xl border text-center transition-all ${
              activeSubTab === 'tasks' 
                ? 'bg-emerald-500 text-white border-emerald-400 font-extrabold shadow-sm' 
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5 font-semibold'
            }`}
          >
            <p className="text-[8px] opacity-75 uppercase tracking-wider">TASKS ({tasks.length})</p>
            <p className="text-13px font-bold">টাস্ক কন্ট্রোল</p>
          </button>

          <button 
            type="button" 
            onClick={() => setActiveSubTab('users')}
            className={`p-2.5 rounded-2xl border text-center transition-all ${
              activeSubTab === 'users' 
                ? 'bg-emerald-500 text-white border-emerald-400 font-extrabold shadow-sm' 
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5 font-semibold'
            }`}
          >
            <p className="text-[8px] opacity-75 uppercase tracking-wider">USERS ({allUsers.length})</p>
            <p className="text-13px font-bold">ইউজার ফ্যামিলি</p>
          </button>

          <button 
            type="button" 
            onClick={() => setActiveSubTab('withdrawals')}
            className={`p-2.5 rounded-2xl border text-center transition-all ${
              activeSubTab === 'withdrawals' 
                ? 'bg-emerald-500 text-white border-emerald-400 font-extrabold shadow-sm relative' 
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5 font-semibold relative'
            }`}
          >
            {pendingWithdrawals.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-bounce shadow-md">
                {pendingWithdrawals.length}
              </span>
            )}
            <p className="text-[8px] opacity-75 uppercase tracking-wider">WITHDRAW ({pendingWithdrawals.length})</p>
            <p className="text-13px font-bold">পেমেন্ট লিস্ট</p>
          </button>
        </div>

        {/* Extra subtab for reviewing proof */}
        <div className="flex justify-end mt-3">
          <button 
            type="button"
            onClick={() => setActiveSubTab('proofs')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] border ${
              activeSubTab === 'proofs'
                ? 'bg-amber-500 text-white border-amber-400 font-black shadow-sm'
                : 'bg-white/5 text-slate-300 hover:text-white border-white/5 font-medium'
            }`}
          >
            <span>📸 প্রুফ সাবমিশন রিভিউ ডেস্ক</span>
            {pendingProofs.length > 0 && (
              <span className="bg-red-500 text-white font-black text-[8px] px-1.5 py-0.5 rounded-full animate-pulse">
                {pendingProofs.length} pending
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Working Space Area */}
      <div className="p-5">
        
        {/* ==================== 1. SERVER CONFIGURATION SETTINGS ==================== */}
        {activeSubTab === 'settings' && (
          <form id="admin_settings_pane" onSubmit={handleSaveSettings} className="space-y-4 animate-fade-in text-slate-700">
            <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2.5">
              <Settings size={16} className="text-slate-500" />
              <h4 className="text-[13px] font-black text-slate-800">১. জেনারেল গ্লোবাল সেটিংস (Custom Config)</h4>
            </div>

            {settingsSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3 rounded-2xl flex items-center gap-2 text-xs font-bold font-sans animate-fade-in shadow-inner">
                <CheckCircle size={15} /> সফলভাবে সম্পূর্ণ সিস্টেম সেটিংস আপডেট হয়ে সেভ হয়েছে!
              </div>
            )}

            <div className="space-y-3">
              {/* Telegram Links */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div id="form_group_telegram_channel" className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">অফিসিয়াল টেলিগ্রাম চ্যানেল লিংক</label>
                  <input 
                    type="url"
                    value={channelInput}
                    onChange={(e) => setChannelInput(e.target.value)}
                    placeholder="https://t.me/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono text-slate-800"
                  />
                  <p className="text-[9px] text-gray-400 leading-none">টেলিগ্রাম টাস্ক-এ ক্লিক করলে ব্যবহারকারীকে এই চ্যানেলে নিয়ে যাবে।</p>
                </div>

                <div id="form_group_telegram_group" className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">সাপোর্ট গ্রুপ লিংক</label>
                  <input 
                    type="url"
                    value={groupInput}
                    onChange={(e) => setGroupInput(e.target.value)}
                    placeholder="https://t.me/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono text-slate-800"
                  />
                  <p className="text-[9px] text-gray-400 leading-none">যেকোনো প্রকার সাপোর্ট বা চ্যাট করার জন্য বরাদ্দ গ্রুপ লিংক।</p>
                </div>
              </div>

              {/* Financial Constants */}
              <div id="form_row_financial_constants" className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">প্রতি ভিডিও বিজ্ঞাপন প্রাইস (৳)</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={adRewardInput}
                    onChange={(e) => setAdRewardInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-extrabold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">প্রতি রেফারে ক্যাশ বোনাস (৳)</label>
                  <input 
                    type="number"
                    step="0.1"
                    min="0"
                    value={referralBonusInput}
                    onChange={(e) => setReferralBonusInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-extrabold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">সর্বনিম্ন উত্তোলন (৳)</label>
                  <input 
                    type="number"
                    step="1"
                    min="5"
                    value={minWithdrawInput}
                    onChange={(e) => setMinWithdrawInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-extrabold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">দৈনিক অ্যাড দেখার লিমিট</label>
                  <input 
                    type="number"
                    step="1"
                    min="1"
                    max="100"
                    value={dailyAdLimitInput}
                    onChange={(e) => setDailyAdLimitInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-extrabold text-slate-800"
                  />
                </div>
              </div>

              {/* Adsterra Configuration */}
              <div id="form_group_adsterra_config" className="bg-indigo-50/55 border border-indigo-100 rounded-2.5xl p-4 mt-2 space-y-3">
                <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-[10.5px] uppercase tracking-wider border-b border-indigo-100 pb-2">
                  <Tv size={14} className="text-indigo-600 animate-pulse" />
                  <span>Adsterra Monetization Hub (অ্যাডস্টেরা মনিটাইজেশন ৩-ইন-১ সেটআপ)</span>
                </div>

                {/* Direct Link Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-indigo-950 uppercase tracking-wider block">১. ডিরেক্ট লিঙ্ক (Adsterra Direct Link URL)</label>
                  <input 
                    type="url"
                    value={adsterraDirectLinkInput}
                    onChange={(e) => setAdsterraDirectLinkInput(e.target.value)}
                    placeholder="https://www.effectivecpmnetwork.com/..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500 font-mono text-slate-800"
                  />
                  <p className="text-[9.5px] text-indigo-900/70 leading-relaxed font-semibold">
                    💡 <strong>নির্দেশনা:</strong> ব্যবহারকারী যখন <strong>"Show Ad"</strong> বাটনে ক্লিক করবে, তখন এই লিঙ্কটি নতুন ট্যাবে রিয়েল ট্রাফিক লোড করবে এবং আপনার Adsterra ব্যালেন্সে হাই-সিপিএম ডলার জমা হবে।
                  </p>
                </div>

                {/* Script Unit 1 Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-indigo-950 uppercase tracking-wider block">২. স্ক্রিপ্ট অ্যাড ১ / সোশ্যাল বার (Adsterra Script 1 URL)</label>
                  <input 
                    type="text"
                    value={adsterraScript1Input}
                    onChange={(e) => setAdsterraScript1Input(e.target.value)}
                    placeholder="https://pl28714174.effectivecpmnetwork.com/..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500 font-mono text-slate-800"
                  />
                  <p className="text-[9.5px] text-indigo-900/70 leading-relaxed font-semibold">
                    💡 <strong>নির্দেশনা:</strong> সোশ্যাল বার বা ব্যানার ইউনিটের স্ক্রিপ্ট কোড থেকে শুধু <code>src="..."</code> এর ভেতরের অংশটুকু (https://...) কপি করে এখানে বসান। এটি অ্যাপের ব্যাকগ্রাউন্ডে সবসময় সচল থাকবে।
                  </p>
                </div>

                {/* Script Unit 2 Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-indigo-950 uppercase tracking-wider block">৩. স্ক্রিপ্ট অ্যাড ২ / পপআন্ডার বা অন্যান্য (Adsterra Script 2 URL)</label>
                  <input 
                    type="text"
                    value={adsterraScript2Input}
                    onChange={(e) => setAdsterraScript2Input(e.target.value)}
                    placeholder="https://pl28714169.effectivecpmnetwork.com/..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500 font-mono text-slate-800"
                  />
                  <p className="text-[9.5px] text-indigo-900/70 leading-relaxed font-semibold">
                    💡 <strong>নির্দেশনা:</strong> আপনার দ্বিতীয় স্ক্রিপ্ট অ্যাড বা পপআন্ডার স্ক্রিপ্ট লিঙ্কটি এখানে দিন। এটি ব্যবহারকারীদের অজান্তেই হাই রেভিনিউ ট্রাফিক তৈরি করবে।
                  </p>
                </div>
              </div>

              {/* Dynamic Admin Inbox Notice Form Group */}
              <div id="form_group_admin_inbox_config" className="bg-rose-50/50 border border-slate-200 rounded-2.5xl p-4 mt-2 space-y-4">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold text-[10.5px] uppercase tracking-wider border-b border-rose-150 pb-2">
                  <Send size={14} className="text-rose-600 animate-pulse" />
                  <span>রিয়েল-টাইম এডমিন ইনবক্স ও নোটিশ কেন্দ্র (Admin Announcement Hub)</span>
                </div>

                {/* Enable Switcher */}
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div>
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block font-sans">ইনবক্স সিস্টেমের স্থিতি (Inbox Feature System)</label>
                    <p className="text-[9px] text-gray-400 font-semibold font-sans">এটি অন থাকলে ব্যবহারকারীর হোম পেজে ইনবক্স বাটন এবং নোটিফিকেশন ব্যাজ দেখা যাবে।</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdminInboxEnabledInput(!adminInboxEnabledInput)}
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer ${
                      adminInboxEnabledInput ? 'bg-rose-500' : 'bg-slate-300'
                    }`}
                  >
                    <span 
                      className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform transform shadow-md ${
                        adminInboxEnabledInput ? 'translate-x-[20px]' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Composing Area */}
                <div className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-3 shadow-xs">
                  <h5 className="text-[10px] font-black uppercase text-rose-800 tracking-wider">📤 নতুন ইমেইল / বার্তা পাঠান (Compose Notification)</h5>
                  
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-slate-500">১. সংযুক্ত নোটিশ ইমেজ লিংক (Optional Image URL)</label>
                    <input 
                      type="url"
                      value={newInboxImage}
                      onChange={(e) => setNewInboxImage(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500 font-mono text-slate-800 placeholder:normal-case"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-slate-500">২. বার্তা বা নোটিশের বিবরণ (Required Notification Message)</label>
                    <textarea 
                      value={newInboxMessage}
                      onChange={(e) => setNewInboxMessage(e.target.value)}
                      placeholder="এখানে আপনার বার্তাটি টাইপ করুন যা ব্যবহারকারীর ইনবক্সে জমা হবে..."
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500 text-slate-800 placeholder:normal-case font-bold"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!newInboxMessage.trim()) return;
                      const now = new Date();
                      const formattedDate = 'আজকে ' + now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
                      const newMsgObj = {
                        id: 'msg_' + Date.now(),
                        image: newInboxImage.trim() || undefined,
                        message: newInboxMessage.trim(),
                        date: formattedDate
                      };
                      const updatedMsgs = [newMsgObj, ...(appSettings.adminInboxMessages || [])];
                      onUpdateSettings({
                        ...appSettings,
                        adminInboxMessages: updatedMsgs
                      });
                      setNewInboxImage('');
                      setNewInboxMessage('');
                      setInboxWriteSuccess('সফলভাবে নতুন নোটিশ ব্যবহারকারীদের ইনবক্সে পাঠানো হয়েছে!');
                      setTimeout(() => setInboxWriteSuccess(null), 3000);
                    }}
                    disabled={!newInboxMessage.trim()}
                    className="w-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-extrabold py-2 px-4 rounded-xl text-[10px] uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <span>⚡ নতুন মেগা বার্তা ইনবক্সে পাঠান (Send Notice)</span>
                  </button>

                  {inboxWriteSuccess && (
                    <p className="text-[9.5px] font-bold text-center text-emerald-600 bg-emerald-50 py-1.5 px-2 rounded-lg animate-fade-in">
                      ✅ {inboxWriteSuccess}
                    </p>
                  )}
                </div>

                {/* Sent Messages List */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex justify-between px-1">
                    <span>ইতিপূর্বে পাঠানো বার্তা সমূহ ({appSettings.adminInboxMessages?.length || 0})</span>
                    <span className="text-[9px] text-gray-400 capitalize">Real-time Delivery</span>
                  </h5>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {(!appSettings.adminInboxMessages || appSettings.adminInboxMessages.length === 0) ? (
                      <div className="text-center py-6 bg-white rounded-2xl border border-slate-150 text-[10px] text-slate-400 font-bold">
                        ইনবক্সে কোনো নোটিফিকেশন বার্তা পাঠানো হয়নি!
                      </div>
                    ) : (
                      appSettings.adminInboxMessages.map((msg) => (
                        <div key={msg.id} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex gap-3 items-start relative group">
                          {msg.image && (
                            <img 
                              src={msg.image} 
                              alt="Thumbnail" 
                              className="w-11 h-11 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div className="flex-grow space-y-1">
                            <p className="text-[10px] font-bold text-slate-800 leading-normal pr-5">{msg.message}</p>
                            <span className="text-[8px] font-bold text-gray-400 block font-mono">{msg.date}</span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              const updatedMsgs = (appSettings.adminInboxMessages || []).filter(m => m.id !== msg.id);
                              onUpdateSettings({
                                ...appSettings,
                                adminInboxMessages: updatedMsgs
                              });
                              setInboxWriteSuccess('নোটিফিকেশন বার্তাটি মুছে ফেলা হয়েছে।');
                              setTimeout(() => setInboxWriteSuccess(null), 3000);
                            }}
                            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-full transition-colors absolute top-1.5 right-1.5 cursor-pointer"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Security Key / Pin customized option */}
              <div id="form_group_admin_pin_security" className="bg-slate-900 border border-slate-800 rounded-[24px] p-5 mt-4 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-rose-450 font-bold text-[11px] uppercase tracking-wider border-b border-white/5 pb-2.5">
                  <Lock size={14} className="text-rose-400 animate-pulse" />
                  <span>৪. অ্যাডমিন সিকিউরিটি পিনকোড সেটিংস (Change Admin PIN)</span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-350 uppercase tracking-wider block">নতুন ৬-ডিজিটের অ্যাডমিন সিকিউরিটি পিন (6-Digit Security PIN)</label>
                    <div className="flex gap-2">
                      <input 
                        type="password"
                        maxLength={6}
                        pattern="\d{6}"
                        value={newAdminPin}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setNewAdminPin(val);
                        }}
                        placeholder="৬ সংখ্যার নতুন পিনকোড দিন (যেমন: ৭৭৮৮১০)"
                        className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-rose-500 font-mono text-center text-white placeholder:text-slate-600 placeholder:normal-case font-extrabold tracking-widest"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newAdminPin.length !== 6) {
                            alert('❌ অনুগ্রহ করে পিনকোডটি অবশ্যই ৬ সংখ্যার দিন!');
                            return;
                          }
                          localStorage.setItem('cashhive_admin_pin_v2', newAdminPin);
                          setPinChangeSuccess(true);
                          setNewAdminPin('');
                          setTimeout(() => setPinChangeSuccess(false), 3000);
                        }}
                        className="bg-rose-600 hover:bg-rose-700 active:bg-rose-850 text-white font-extrabold text-[10.5px] px-4 rounded-xl cursor-pointer select-none"
                      >
                        আপডেট করুন
                      </button>
                    </div>
                    {pinChangeSuccess && (
                      <p className="text-[9.5px] font-bold text-center text-emerald-400 bg-emerald-950/40 p-2 border border-emerald-900/60 rounded-xl mt-2 animate-fade-in">
                        🎉 অভিনন্দন! নতুন অ্যাডমিন সিকিউরিটি পিনকোড সফলভাবে পরিবর্তন করা হয়েছে এবং মেমোরিতে সেভ হয়েছে!
                      </p>
                    )}
                    <span className="text-[9px] text-slate-400 font-semibold block leading-relaxed pt-1">
                      💡 আপনি আপনার সুবিধামত ৬-ডিজিটের পিনকোড সেভ করতে পারবেন। পরবর্তী সময়ে কন্ট্রোল প্যানেলে প্রবেশ করতে এই পিনটি ব্যবহার করতে হবে। (ডিফল্ট কোড: <strong>৭৭৮৮১০</strong>)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold py-3 rounded-xl transition-all shadow-md shadow-emerald-600/10 cursor-pointer text-xs"
            >
              সেটিংস প্যাচ সংরক্ষণ করুন (Save Configuration)
            </button>
          </form>
        )}

        {/* ==================== 2. ADD & MANAGE CUSTOM TASKS ==================== */}
        {activeSubTab === 'tasks' && (
          <div id="admin_tasks_pane" className="space-y-4 animate-fade-in text-slate-700">
            
            {/* Elegant Segmented Category Controls for Admin Task Pane */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setAdminTaskFilter('social');
                  setNewTaskCategory('social');
                }}
                className={`py-2 px-1 text-[11px] font-black rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                  adminTaskFilter === 'social'
                    ? 'bg-sky-500 text-white shadow-sm font-black scale-[1.01]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>📢 সোশ্যাল টাস্ক</span>
                <span className="text-[8px] opacity-75">(Social Microjobs)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminTaskFilter('vip');
                  setNewTaskCategory('vip');
                }}
                className={`py-2 px-1 text-[11px] font-black rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                  adminTaskFilter === 'vip'
                    ? 'bg-amber-500 text-white shadow-sm font-black scale-[1.01]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>👑 ভিআইপি টাস্ক</span>
                <span className="text-[8px] opacity-75">(VIP Megajobs)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminTaskFilter('premium');
                  setNewTaskCategory('premium');
                }}
                className={`py-2 px-1 text-[11px] font-black rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                  adminTaskFilter === 'premium'
                    ? 'bg-purple-600 text-white shadow-sm font-black scale-[1.01]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>💎 প্রিমিয়াম কাজ</span>
                <span className="text-[8px] opacity-75">(Premium Tasks)</span>
              </button>
            </div>

            {/* Create Task Panel */}
            <form onSubmit={handleCreateTask} className="bg-slate-50/50 p-4 rounded-3xl border border-slate-200/50 space-y-4">
              <div className="flex items-center gap-1.5">
                <PlusCircle size={16} className="text-emerald-600" />
                <h4 className="text-[12px] font-black text-slate-800">
                  {adminTaskFilter === 'social' ? '📢 নতুন সোশ্যাল টাস্ক যুক্ত করুন (Social Form)' :
                   adminTaskFilter === 'vip' ? '👑 নতুন ভিআইপি টাস্ক যুক্ত করুন (VIP Form)' :
                   '💎 নতুন প্রিমিয়াম কাজ যুক্ত করুন (Premium Form)'}
                </h4>
              </div>

              {taskSuccess && (
                <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl border border-emerald-100 font-bold text-[10px] flex items-center gap-1 animate-pulse">
                  <Check /> অভিনন্দন! নতুন {adminTaskFilter === 'social' ? 'সোশ্যাল টাস্ক' : adminTaskFilter === 'vip' ? 'ভিআইপি টাস্ক' : 'প্রিমিয়াম টাস্ক'} সফলভাবে প্ল্যাটফর্মে লাইভ করা হয়েছে!
                </div>
              )}

              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 block uppercase">
                      {adminTaskFilter === 'social' ? 'অ্যাপের নাম / টাইটেল (যেমন: bKash App Download & Signup)' : 'টাস্ক টাইটেল / নাম (Task Title)'}
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder={adminTaskFilter === 'social' ? 'যেমন: bKash App Download & Register' : 'যেমন: YouTube Subscribe...'}
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 font-semibold"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 block uppercase">পেমেন্ট বোনাস রিওয়ার্ড (৳ Payout Amount)</label>
                    <input 
                      type="number"
                      step="0.1"
                      required
                      placeholder="যেমন: 5.50"
                      value={newTaskReward}
                      onChange={(e) => setNewTaskReward(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-extrabold text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 block uppercase font-black">
                    {adminTaskFilter === 'social' ? 'সোশ্যাল কাজের নিয়মরীতি / নিয়মাবলী (Rules - ২টি স্ক্রিনশট প্রুফ দেওয়ার নিয়মাবলী)' : 'টাস্ক বিবরণ / নির্দেশাবলী (Directives)'}
                  </label>
                  <textarea 
                    rows={2}
                    placeholder={adminTaskFilter === 'social' ? '১. নিচের লিংকে ক্লিক করে অ্যাপ ইন্সটল করুন। ২. একাউন্ট খুলে ১ নম্বর স্ক্রিনশট নিন। ৩. কাজের ড্যাশবোর্ড থেকে ২ নম্বর স্ক্রিনশট নিয়ে আপলোড করুন।' : 'ব্যবহারকারীকে কি করতে হবে সুস্পষ্টভাবে লিখুন...'}
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 leading-normal"
                  />
                </div>

                {/* New: Custom tasks external action Link URL */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 block uppercase">
                    {adminTaskFilter === 'social' ? 'অফিশিয়াল অ্যাপ ডাউনলোড / ভিজিট লিঙ্ক (App Action Link URL)' : 'কাজের ওয়েবসাইট বা জয়েনিং লিংক (Task Link URL)'}
                  </label>
                  <input 
                    type="url"
                    placeholder="যেমন: https://play.google.com/store/apps/details?id=com.company.app"
                    value={newTaskLink}
                    onChange={(e) => setNewTaskLink(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 font-semibold"
                  />
                  <p className="text-[8.5px] text-gray-400">
                    {adminTaskFilter === 'social' ? 'মেম্বাররা এই লিঙ্ক থেকে প্রথম অ্যাপটি ইন্সটল করবে এবং দুইবার স্ক্রিনশট প্রমাণ দিবে।' : 'মেম্বাররা এই লিংকে গিয়ে কাজ সম্পন্ন করবে এবং প্রমাণ স্বরূপ স্ক্রিনশট নিবে।'}
                  </p>
                </div>

                {/* New: Brand custom logo URL & selections */}
                <div className="space-y-2 bg-white/60 p-3 rounded-2xl border border-dashed border-slate-200">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase block">লোগো / ব্র্যান্ড বা অ্যাপ আইকন ইমেজ লিঙ্ক (Logo UI URL)</label>
                    <input 
                      type="url"
                      placeholder="পছন্দের যেকোনো লোগো ইমেজ ইউআরএল (যেমন Apple, Google) পেস্ট করুন..."
                      value={newTaskLogoUrl}
                      onChange={(e) => setNewTaskLogoUrl(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 font-mono text-slate-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8.5px] font-black text-slate-400 uppercase block">সহজেই লোগো সেট করুন (Preset Brand Logos):</span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { name: 'Apple 🍏', url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=120&q=80' },
                        { name: 'Google 🔍', url: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=120&q=80' },
                        { name: 'Facebook 👥', url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=120&q=80' },
                        { name: 'YouTube 📺', url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=120&q=80' },
                        { name: 'Telegram ✈️', url: 'https://images.unsplash.com/photo-1614680376739-414d95ff43df?auto=format&fit=crop&w=120&q=80' },
                        { name: 'Website 🌐', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=120&q=80' }
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setNewTaskLogoUrl(preset.url)}
                          className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-700 hover:text-emerald-700 hover:border-emerald-250 transition-all cursor-pointer"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase block font-black">কাজের ধরণ (Action Type)</label>
                    <select 
                      value={newTaskType}
                      onChange={(e: any) => setNewTaskType(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-850 font-bold focus:outline-none"
                    >
                      <option value="download">App Download & Install (সোশ্যাল অ্যাপ)</option>
                      <option value="social_link">Social Join / Share (গ্রুপ জয়েন)</option>
                      <option value="click">Website Visit Portal (ওয়েবসাইট ভিজিট)</option>
                      <option value="captcha">Solved Captcha Code</option>
                      <option value="math">Mathematical Quiz</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase block">কঠিনতা স্তর (Difficulty)</label>
                    <select 
                      value={newTaskDifficulty}
                      onChange={(e: any) => setNewTaskDifficulty(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-850 font-bold focus:outline-none"
                    >
                      <option value="Easy">সহজ (Easy)</option>
                      <option value="Medium">মাঝারি (Medium)</option>
                      <option value="Hard">জটিল (Hard)</option>
                    </select>
                  </div>
                </div>

                {newTaskCategory !== 'premium' && newTaskCategory !== 'social' && (
                  <div className="flex items-center gap-2 pt-1">
                    <input 
                      type="checkbox"
                      id="admin_proof_req"
                      checked={newTaskProofRequired}
                      onChange={(e) => setNewTaskProofRequired(e.target.checked)}
                      className="w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer"
                    />
                    <label htmlFor="admin_proof_req" className="text-[10px] font-semibold text-slate-600 cursor-pointer">
                      টাস্ক কমপ্লিট সেশনের জন্য প্রমান স্ক্রিনশট বাধ্যতামূলক করুন। (Proof Required)
                    </label>
                  </div>
                )}
                
                {(newTaskCategory === 'social' || newTaskCategory === 'premium') && (
                  <div className="bg-sky-50 text-[10px] text-sky-800 px-3 py-2 rounded-xl flex items-center gap-1.5 border border-sky-100 font-bold">
                    <CheckCircle size={12} className="text-sky-600 shrink-0" />
                    <span>দ্রষ্টব্য: সোশ্যাল এবং প্রিমিয়াম ক্যাটাগরির কাজে ইউজারদের প্রুফ হিসেবে স্ক্রিনশট আপলোড সেশন অটো-লকড করা থাকে।</span>
                  </div>
                )}
              </div>

              <input type="hidden" value={newTaskCategory} />

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold py-2.5 rounded-xl transition-all text-xs cursor-pointer shadow-md"
              >
                আর্নিং টাস্কটি লাইভ পাবলিশ করুন 🚀
              </button>
            </form>

            {/* List and manage current active tasks filtered by active tab */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pl-1">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block font-black">
                  বর্তমানে রানিং {adminTaskFilter === 'social' ? 'সোশ্যাল টাস্কসমূহ' : adminTaskFilter === 'vip' ? 'ভিআইপি টাস্কসমূহ' : 'প্রিমিয়াম টাস্কসমূহ'} ({tasks.filter(t => t.category === adminTaskFilter).length})
                </span>
                <span className="text-[9px] text-slate-400">মুছতে ডিলিট আইকনে চাপ দিন</span>
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {tasks.filter(t => t.category === adminTaskFilter).length === 0 ? (
                  <div className="bg-slate-50 border border-slate-150 p-6 text-center rounded-2xl text-[10.5px] italic text-slate-400 font-bold">
                    এই ক্যাটাগরিতে বর্তমানে কোনো রানিং টাস্ক নেই! উপরে ফর্মটি পূরণ করে যুক্ত করুন।
                  </div>
                ) : (
                  tasks.filter(t => t.category === adminTaskFilter).map(task => (
                    <div key={task.id} className="bg-white p-3 rounded-2xl border border-gray-150 flex items-center justify-between gap-3 shadow-xs">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-slate-800 truncate">{task.title}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                            task.category === 'vip' 
                              ? 'bg-amber-100 text-amber-700' 
                              : task.category === 'premium' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-sky-100 text-sky-800'
                          }`}>
                            {task.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate leading-tight">{task.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-emerald-600">৳ {task.reward.toFixed(2)} টাকা</span>
                          <span className="text-[8px] text-slate-400">{task.difficulty} | {task.proofRequired ? 'Screenshot Proof Required' : 'Auto Verification' }</span>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 active:bg-red-100 rounded-xl transition-colors cursor-pointer shrink-0"
                        title="টাস্ক মুছুন"
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* ==================== 3. USER MANAGEMENT & BALANCES ==================== */}
        {activeSubTab === 'users' && (
          <div id="admin_users_pane" className="space-y-4 animate-fade-in text-slate-700">
            
            <div className="flex items-center gap-1.5">
              <Users size={16} className="text-slate-500" />
              <h4 className="text-[12px] font-black text-slate-800">৩. নিবন্ধিত ইউজার ফ্যামিলি কন্ট্রোল ডেস্ক</h4>
            </div>

            {/* Quick search input */}
            <div className="relative">
              <input 
                type="text"
                placeholder="ইউজারনেম, পুরো নাম অথবা ইউজার আইডি টাইপ করুন..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 font-semibold placeholder-slate-400"
              />
              <span className="absolute top-2.5 right-3 text-gray-400 text-xs">🔍</span>
            </div>

            {userActionSuccess && (
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 p-2 text-[10px] font-black rounded-lg text-center animate-bounce">
                {userActionSuccess}
              </div>
            )}

            {/* Selected User Tweak Panel */}
            {selectedUser ? (
              <div className="bg-white p-4 rounded-3xl border-2 border-emerald-500/30 space-y-3.5 shadow-sm relative animate-fade-in">
                <button 
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-3 right-3 text-[10px] text-gray-400 hover:text-red-500 font-extrabold cursor-pointer"
                >
                  [বন্ধ করুন ✖]
                </button>

                <div className="flex items-center gap-3">
                  <img 
                    src={selectedUser.avatarSeed} 
                    alt="Selected User Profile Avatar" 
                    className="w-10 h-10 rounded-full object-cover bg-slate-100 border border-slate-200"
                  />
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-800 leading-none">{selectedUser.name}</h5>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">@{selectedUser.username} | UID: {selectedUser.uid}</p>
                    <p className="text-[9px] bg-emerald-50 border border-emerald-100 text-emerald-700 w-fit rounded px-1 mt-1 font-bold">
                      ব্যালেন্স: ৳ {selectedUser.balance.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Adjust money form */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 space-y-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase">ইউজারের ব্যালেন্স সংশোধন (Add / Subtract Cash)</span>
                  <div className="flex gap-1.5">
                    <input 
                      type="number"
                      step="0.1"
                      placeholder="টাকার সংখ্যা প্রবেশ করুন..."
                      value={balanceChangeInput}
                      onChange={(e) => setBalanceChangeInput(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-extrabold focus:outline-none flex-grow"
                    />
                    <button 
                      type="button"
                      onClick={() => handleAdjustBalance(true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs cursor-pointer"
                    >
                      + যোগ করুন
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleAdjustBalance(false)}
                      className="bg-red-500 hover:bg-red-600 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs cursor-pointer"
                    >
                      - বিয়োগ করুন
                    </button>
                  </div>
                  <p className="text-[8.5px] text-gray-400 leading-tight">৳ সংখ্যা লিখুন (যেমন ৫ অথবা ১০ টাকা)। যোগ বা বিয়োগ সরাসরি ইউজারের মেন স্ক্রিনে আপডেট হবে।</p>
                </div>

                {/* User Account Status Toggle Panel */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase">একাউন্ট স্ট্যাটাস (Account Status Control)</span>
                    <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-black select-none ${
                      (selectedUser.accountStatus || 'active') === 'active' ? 'bg-emerald-100 text-emerald-700 bg-emerald-50' :
                      (selectedUser.accountStatus || 'active') === 'frozen' ? 'bg-amber-100 text-amber-700 bg-amber-50' :
                      'bg-red-100 text-red-700 bg-red-50'
                    }`}>
                      {(selectedUser.accountStatus || 'active').toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button 
                      type="button"
                      onClick={() => {
                        if (onUpdateUserStatus) {
                          onUpdateUserStatus(selectedUser.username, 'active');
                          setSelectedUser(prev => prev ? { ...prev, accountStatus: 'active' } : null);
                          alert('মেম্বার একাউন্ট সফলভাবে সক্রিয় করা হয়েছে!');
                        }
                      }}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-extrabold cursor-pointer transition-all border ${
                        (selectedUser.accountStatus || 'active') === 'active' 
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs font-black' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      সক্রিয় (Active)
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        if (onUpdateUserStatus) {
                          onUpdateUserStatus(selectedUser.username, 'frozen');
                          setSelectedUser(prev => prev ? { ...prev, accountStatus: 'frozen' } : null);
                          alert('মেম্বার একাউন্ট সফলভাবে ফ্রিজ করা হয়েছে! কাজ করলেও কোনো টাকা যোগ হবে না।');
                        }
                      }}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-extrabold cursor-pointer transition-all border ${
                        (selectedUser.accountStatus || 'active') === 'frozen' 
                          ? 'bg-amber-500 border-amber-600 text-white shadow-xs font-black' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      ফ্রিজ (Freeze)
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        if (onUpdateUserStatus) {
                          onUpdateUserStatus(selectedUser.username, 'suspended');
                          setSelectedUser(prev => prev ? { ...prev, accountStatus: 'suspended' } : null);
                          alert('মেম্বার একাউন্ট সফলভাবে সাসপেন্ড করা হয়েছে! সে অ্যাপে প্রবেশ করতে পারবে না।');
                        }
                      }}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-extrabold cursor-pointer transition-all border ${
                        (selectedUser.accountStatus || 'active') === 'suspended' 
                          ? 'bg-red-500 border-red-600 text-white shadow-xs font-black' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      সাসপেন্ড (Suspend)
                    </button>
                  </div>
                  <p className="text-[8.5px] text-gray-400 leading-tight">
                    <strong>Freeze:</strong> কাজ সচল থাকবে টাকা যোগ হবে না। <strong>Suspend:</strong> পুরো উইন্ডো ব্লক হবে।
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100 text-[10px] text-slate-650 leading-relaxed font-sans">
                💡 <strong>মাস্টার টিপস:</strong> তালিকায় যেকোনো মেম্বার/ইউজারের নামের ওপর ক্লিক করলে তাদের ব্যালেন্স সরাসরি যোগ, বিয়োগ বা বৃদ্ধি করার ব্যালেন্স কন্ট্রোলার প্যানেল ওপেন হবে।
              </div>
            )}

            {/* List users query result */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase pl-1 block">নিবন্ধিত মেম্বারদের তালিকা ({filteredUsers.length})</span>
              
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {filteredUsers.map(user => (
                  <button 
                    key={user.username}
                    type="button"
                    onClick={() => setSelectedUser(user)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      selectedUser?.username === user.username 
                        ? 'bg-[#eefbf6] border-emerald-400 shadow-sm' 
                        : 'bg-white hover:bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img 
                        src={user.avatarSeed} 
                        alt="User Profile Entry" 
                        className="w-8 h-8 rounded-full object-cover bg-slate-50 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-800 text-xs truncate leading-none">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate font-sans">@{user.username} | {user.referralsCount} রেফ.</p>
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0 font-mono">
                      <p className="font-black text-slate-800 text-[11.5px] font-mono">৳ {user.balance.toFixed(2)}</p>
                      <span className="text-[8.5px] bg-slate-100 px-1 py-0.5 rounded text-gray-500 block text-right mt-0.5 font-sans">টাস্ক: {user.tasksCompletedCount}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ==================== 4. PENDING WITHDRAWALS PROCESSING ==================== */}
        {activeSubTab === 'withdrawals' && (
          <div id="admin_withdrawals_pane" className="space-y-4 animate-fade-in text-slate-700">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Coins size={16} className="text-slate-500 animate-bounce" />
                <h4 className="text-[12px] font-black text-slate-800">৪. উইথড্র পেমেন্ট ক্যাশআউট রিকোয়েস্ট সমূহ</h4>
              </div>
              <span className="text-[9.5px] bg-red-100 text-red-600 font-black px-2 py-0.5 rounded-full animate-pulse">
                {pendingWithdrawals.length} রিকোয়েস্ট পেন্ডিং
              </span>
            </div>

            {pendingWithdrawals.length === 0 ? (
              <div className="bg-slate-50 text-center py-10 rounded-2xl border border-gray-150 space-y-2">
                <span className="text-2xl block">🎉</span>
                <p className="text-xs font-black text-slate-800">কোনো উইথড্র রিকোয়েস্ট পেন্ডিং নেই!</p>
                <p className="text-[10.5px] text-gray-400">মেম্বাররা উইথড্র রিকোয়েস্ট দিলে সাথে সাথে এই টেবিলে জমা হবে।</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {pendingWithdrawals.map(tx => {
                  const user = allUsers.find(u => u.username === tx.username || u.uid === tx.userUid);
                  const isExpanded = expandedWithdrawalId === tx.id;
                  const userHistory = transactionHistory.filter(h => h.username === tx.username);
                  const taskScreenshots = userHistory.filter(h => h.proofScreenshot);

                  return (
                    <div 
                      key={tx.id} 
                      className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                        isExpanded ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-md' : 'border-slate-200 hover:border-slate-350 shadow-xs'
                      }`}
                    >
                      {/* Condensed Header */}
                      <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase text-white ${
                              tx.withdrawMethod === 'bKash' ? 'bg-pink-500' :
                              tx.withdrawMethod === 'Nagad' ? 'bg-orange-500' :
                              'bg-indigo-500'
                            }`}>
                              {tx.withdrawMethod || 'gateway'}
                            </span>
                            <span className="text-xs font-black text-slate-800 animate-slide-in">
                              {tx.userFullName || 'Unknown Member'}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-gray-500 font-mono pt-1">
                            UID: <span className="text-emerald-600 font-bold">{tx.userUid || 'N/A'}</span> @{tx.username} | তারিখ: {tx.date}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between">
                          <span className="text-sm font-black font-sans text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-2.5 py-1">
                            ৳ {tx.amount.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setExpandedWithdrawalId(isExpanded ? null : tx.id)}
                            className="bg-slate-800 text-white font-black hover:bg-slate-700 text-[10px] px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1 shrink-0"
                          >
                            {isExpanded ? 'বন্ধ করুন ✕' : 'ওর প্রোফাইল ও কাজ দেখুন 🔍'}
                          </button>
                        </div>
                      </div>

                      {/* Display the account phone inside header to keep it always visible */}
                      <div className="p-3 px-4 border-t border-gray-100 flex items-center justify-between gap-2 text-xs bg-white">
                        <span className="text-slate-500 font-medium">মোবাইল ব্যাংকিং নম্বর:</span>
                        <span className="font-mono font-black text-slate-800 bg-[#eefbf6] text-emerald-700 px-2.5 py-0.5 rounded-lg border border-emerald-100 select-all tracking-wider">
                          {tx.withdrawPhone || 'Unknown Number'}
                        </span>
                      </div>

                      {/* COLLAPSIBLE DETAILED PROFILE & VERIFICATION SECTION */}
                      {isExpanded && (
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-fade-in text-xs">
                          
                          {/* 1. SUBLIME MEMBERSHIP STATS & PROFILE BLOCK */}
                          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="font-bold text-slate-705 text-slate-700">👤 মেম্বার প্রোফাইল রিভিউ (Member Identity)</span>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                !user ? 'bg-gray-100 text-gray-500' :
                                user.accountStatus === 'frozen' ? 'bg-amber-100 text-amber-700 font-black animate-pulse' :
                                user.accountStatus === 'suspended' ? 'bg-red-100 text-red-650' :
                                'bg-green-105 text-green-700 bg-green-50'
                              }`}>
                                {!user ? 'NOT REGISTERED' : user.accountStatus?.toUpperCase() || 'ACTIVE'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center items-center text-center">
                                <span className="text-[9px] text-gray-400 font-black uppercase">CURRENT BAL</span>
                                <span className="text-[13px] font-black text-emerald-600">৳ {user?.balance.toFixed(2) || '0.00'}</span>
                              </div>
                              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center items-center text-center">
                                <span className="text-[9px] text-gray-400 font-black uppercase">TASKS DONE</span>
                                <span className="text-[13px] font-black text-indigo-600">{user?.tasksCompletedCount || 0} টি</span>
                              </div>
                              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center items-center text-center">
                                <span className="text-[9px] text-gray-400 font-black uppercase font-sans">ADS WATCHED</span>
                                <span className="text-[13px] font-black text-sky-600">{user?.adsWatchedCount || 0} টি</span>
                              </div>
                              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center items-center text-center">
                                <span className="text-[9px] text-gray-400 font-black uppercase font-sans">REFERRALS</span>
                                <span className="text-[13px] font-black text-amber-600">{user?.referralsCount || 0} জন</span>
                              </div>
                            </div>

                            {/* 🔍 Dynamic Auditing Insight Report */}
                            <div className="bg-indigo-50/35 p-3.5 rounded-2xl border border-indigo-100 space-y-2 mt-2 text-[11px]">
                              <p className="font-extrabold text-slate-800 flex items-center gap-1">
                                <span className="text-indigo-650 font-sans">🕵️</span> মেম্বার ওয়ার্ক ভেরিফিকেশন চেক (System Trust & Honesty Audit):
                              </p>
                              <div className="space-y-1 text-slate-700 leading-relaxed font-semibold">
                                <p className="flex justify-between items-center bg-white/70 p-1.5 rounded-lg">
                                  <span className="text-slate-500">চলতি ওয়ালেট ব্যালেন্স:</span>
                                  <span className="text-slate-900 font-black">৳ {user?.balance.toFixed(2) || '0.00'} BDT</span>
                                </p>
                                <p className="flex justify-between items-center bg-white/70 p-1.5 rounded-lg">
                                  <span className="text-slate-500">মোট এডস উপভোগ করেছেন:</span>
                                  <span className="text-indigo-600 font-black">{user?.adsWatchedCount || 0} টি</span>
                                </p>
                                <p className="flex justify-between items-center bg-white/70 p-1.5 rounded-lg">
                                  <span className="text-slate-500">মোট কমপ্লিট করা টাস্ক:</span>
                                  <span className="text-emerald-600 font-black">{user?.tasksCompletedCount || 0} টি</span>
                                </p>
                                <p className="flex justify-between items-center bg-white/70 p-1.5 rounded-lg">
                                  <span className="text-slate-500">মোট টিম রেফারেল:</span>
                                  <span className="text-amber-600 font-black">{user?.referralsCount || 0} জন</span>
                                </p>

                                {/* Trigger system fraud flags */}
                                {(!user?.tasksCompletedCount || user.tasksCompletedCount === 0) && (tx.amount >= 150) ? (
                                  <div className="bg-amber-50 text-amber-700 p-2.5 rounded-xl border border-amber-200 mt-1.5 leading-relaxed">
                                    ⚠️ <strong>সতর্কতা:</strong> এই মেম্বার কোনো কাজের মাইক্রো টাস্ক সম্পন্ন করেনি কিন্তু ৳{tx.amount} টাকার অলরেডি উইথড্র রিকোয়েস্ট পাঠিয়েছে! দয়া করে স্ক্রিনশটে ওর সততা বা ভিপিএন অপব্যবহার ভালোভাবে দেখে সিদ্ধান্ত নিন।
                                  </div>
                                ) : (
                                  <div className="bg-emerald-50 text-emerald-800 p-2 rounded-xl border border-emerald-150 mt-1.5 leading-tight flex items-center gap-1.5 font-bold">
                                    <span>✓</span> <strong>সততা যাচাই রিপোর্ট:</strong> কোনো মেজর প্রতারণা বা ইনঅ্যাক্টিভিটি অসঙ্গতি ধরা পড়েনি।
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* User status trigger buttons - Anti-Cheat security controls */}
                            {user && onUpdateUserStatus && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                                <span className="text-[10px] text-slate-500 font-bold block pr-1">অ্যাকাউন্ট ভেরিফিকেশন অ্যাকশন:</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`আপনি কি সত্যিই @${user.username} এর অ্যাকাউন্ট একটিভ বা সচল করতে চান?`)) {
                                      onUpdateUserStatus(user.username, 'active');
                                    }
                                  }}
                                  className="bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 px-2 py-1 rounded-lg text-[9px] font-black cursor-pointer"
                                >
                                  ✅ সচল করুন (Active)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`আপনি কি সত্যিই @${user.username} এর অ্যাকাউন্ট সাময়িক ফ্রিজ করতে চান? প্রতারণা ঠেকাতে এর উইথড্র বাতিল করা সহজ হবে।`)) {
                                      onUpdateUserStatus(user.username, 'frozen');
                                    }
                                  }}
                                  className="bg-red-50 text-red-650 border border-red-200 hover:bg-red-100 px-2 py-1 rounded-lg text-[9px] font-black cursor-pointer animate-pulse"
                                >
                                  ❄️ ফ্রিজ করুন (Freeze)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`আপনি কি সত্যিই @${user.username} এর অ্যাকাউন্ট সাসপেন্ড করতে চান?`)) {
                                      onUpdateUserStatus(user.username, 'suspended');
                                    }
                                  }}
                                  className="bg-slate-150 text-slate-700 border border-slate-300 hover:bg-slate-200 px-2 py-1 rounded-lg text-[9px] font-black cursor-pointer"
                                >
                                  🚫 সাসপেন্ড (Suspend)
                                </button>
                              </div>
                            )}
                          </div>

                          {/* 2. SECURITY FLOW SCREENSHOT & WORK HISTORIES CHECKER */}
                          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                            <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                              <span className="font-bold text-slate-700 flex items-center gap-1">
                                🕵️ ওর কাজের কার্যক্রম ও সততা রিপোর্ট (Work Activity Tracker)
                              </span>
                              <span className="text-[9px] text-slate-400 font-bold font-mono">
                                Total {userHistory.length} actions logged
                              </span>
                            </div>

                            {/* Payout Ticket Slip Screenshot mockup dynamically matching cashout */}
                            <div className="bg-sky-950 text-sky-100 p-4 rounded-2xl shadow-inner space-y-2.5 relative overflow-hidden font-mono text-[10.5px]">
                              <div className="absolute top-[-30px] right-[-30px] w-20 h-20 bg-sky-800/40 rounded-full blur-xl animate-pulse"></div>
                              <div className="flex justify-between items-center border-b border-sky-800 pb-1.5">
                                <span className="font-black text-sky-400">💰 CASHOUT PROOF RECEIPT</span>
                                <span className="text-[8px] bg-red-550/20 text-red-400 px-1.5 py-0.2 rounded border border-red-500 animate-pulse">PENDING AUDIT</span>
                              </div>
                              <div className="space-y-1 z-10 relative">
                                <p className="flex justify-between"><span>User UID:</span> <span className="text-white font-bold">{tx.userUid || 'N/A'}</span></p>
                                <p className="flex justify-between"><span>Name:</span> <span className="text-white">{tx.userFullName || 'N/A'}</span></p>
                                <p className="flex justify-between"><span>Withdraw Gateway:</span> <span className="text-yellow-400 font-extrabold">{tx.withdrawMethod} (Personal Mobile Pay)</span></p>
                                <p className="flex justify-between"><span>Receiving A/C No:</span> <span className="text-emerald-400 font-bold tracking-widest">{tx.withdrawPhone}</span></p>
                                <p className="flex justify-between"><span>Amount Withdrawn:</span> <span className="text-white font-extrabold text-xs">BDT {tx.amount.toFixed(2)} ৳</span></p>
                              </div>
                              <div className="border-t border-dashed border-sky-850 pt-2 text-center text-[7.5px] text-sky-450 font-bold uppercase tracking-wider">
                                GENERATED VERIFIED ID TICKET SECURE PLATFORM
                              </div>
                            </div>

                            {/* Completed Task Proof Images if they uploaded any screenshot */}
                            {taskScreenshots.length > 0 && (
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-purple-650 block">📸 মেম্বারের সাবমিট করা কাজের প্রমাণ স্ক্রিনশট গ্যালারি:</label>
                                <div className="grid grid-cols-2 gap-2">
                                  {taskScreenshots.map((log, index) => (
                                    <div key={log.id} className="bg-slate-50 border border-slate-150 rounded-xl overflow-hidden p-1.5 space-y-1 relative">
                                      {log.proofScreenshot && (
                                        <a href={log.proofScreenshot} target="_blank" rel="noreferrer" className="block relative h-28 group">
                                          <img 
                                            src={log.proofScreenshot} 
                                            alt={`Task Proof ${index + 1}`} 
                                            className="w-full h-full object-cover rounded-lg border border-gray-100"
                                            referrerPolicy="no-referrer"
                                          />
                                          <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-center text-[7.5px] text-white">
                                            পূর্ণ স্ক্রিন দেখুন 🔍
                                          </div>
                                        </a>
                                      )}
                                      <p className="text-[8px] font-black text-slate-700 tracking-tight truncate leading-tight pt-1">
                                        {log.title}
                                      </p>
                                      <p className="text-[7.5px] text-emerald-600 font-mono">
                                        যোগ হয়েছে: ৳ {log.amount.toFixed(2)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Scannable scroll of user session activities */}
                            <div className="space-y-1.5">
                              <label className="text-[10.5px] font-black text-slate-700 block mt-1.5">📋 এই মেম্বারের করা সর্বশেষ কাজ সমূহ (Task Verification Trail):</label>
                              {userHistory.length === 0 ? (
                                <div className="p-3 bg-slate-50 text-center text-slate-400 rounded-xl border border-dashed text-[10px]">
                                  কোনো সেশন কাজ হিস্ট্রি পাওয়া যায়নি।
                                </div>
                              ) : (
                                <div className="space-y-1 max-h-[150px] overflow-y-auto border border-slate-100 rounded-xl divide-y bg-slate-50/50 pr-1 select-none font-sans">
                                  {userHistory.slice(0, 15).map(lg => (
                                    <div key={lg.id} className="p-2 flex justify-between items-center gap-2 bg-white text-[10px]">
                                      <div className="min-w-0">
                                        <p className="font-extrabold text-slate-800 truncate tracking-tight">{lg.title}</p>
                                        <p className="text-[8px] text-slate-400 font-mono">{lg.date} | ID: {lg.id}</p>
                                      </div>
                                      <div className="text-right flex-shrink-0 flex items-center gap-1.5">
                                        <span className={`font-black ${lg.type.includes('withdraw') ? 'text-rose-500' : 'text-emerald-500'}`}>
                                          {lg.type.includes('withdraw') ? '-' : '+'}৳ {lg.amount.toFixed(2)}
                                        </span>
                                        <span className={`text-[7px] font-black px-1 rounded-sm ${
                                          lg.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                          'bg-amber-50 text-amber-600 border border-amber-100'
                                        }`}>
                                          {lg.status === 'completed' ? 'Success' : 'Pending'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 3. VERIFICATION AND ACTION TRIGGER CONTROL GROUP */}
                          <div className="bg-white p-3.5 rounded-2xl border border-amber-200 bg-amber-50/25 space-y-2.5">
                            <p className="text-[11px] font-black text-amber-800 leading-tight">
                              ⚠️ পেমেন্ট করার সিদ্ধান্ত:
                            </p>
                            <p className="text-[10px] text-slate-600 leading-relaxed font-semibold">
                              ব্যবহারকারীর শেষ ১০-১২ টি কাজের সত্যতা যাচাই পূর্বক বিকাশ/নগদের প্রমাণ পেলে ও কোনো প্রকার ভিপিএন প্রতারণা বা একাধিক একাউন্ট প্রমাণিত না হলে কেবল তখনই অনুমোদন করার অনুরোধ করা যাচ্ছে।
                            </p>

                            <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                              <button 
                                type="button"
                                onClick={() => {
                                  if (confirm(`আপনি কি সত্যিই ${tx.withdrawPhone} নম্বরে পাঠানো ৳ ${tx.amount.toFixed(2)} পেমেন্টটি অনুমোদন করতে চান?`)) {
                                    onResolveWithdrawal(tx.id, 'completed');
                                    setExpandedWithdrawalId(null);
                                  }
                                }}
                                className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-extrabold py-3 px-3 rounded-xl text-[10.5px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
                              >
                                <CheckCircle size={13} /> পেমেন্ট সাকসেস করুন (Approve)
                              </button>
                              <button 
                                type="button"
                                onClick={() => {
                                  if (confirm(`আপনি কি সত্যিই এই পেমেন্ট রিকোয়েস্টটি রিজেক্ট করতে চান? বাতিল করলে টাকা বাউন্স হিসেবে গণ্য হবে।`)) {
                                    onResolveWithdrawal(tx.id, 'failed');
                                    setExpandedWithdrawalId(null);
                                  }
                                }}
                                className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-extrabold py-3 px-3 rounded-xl text-[10.5px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
                              >
                                <XCircle size={13} /> বাউন্স / রিজেক্ট করুন (Reject)
                              </button>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ==================== 5. SUBMITTED PROOFS REVIEW DESK ==================== */}
        {activeSubTab === 'proofs' && (
          <div id="admin_proofs_pane" className="space-y-4 animate-fade-in text-slate-700">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clipboard size={16} className="text-slate-500" />
                <h4 className="text-[12px] font-black text-slate-800">৫. কাজের সাবমিট করা প্রুফ রিভিউ বোর্ড (Proofs Desk)</h4>
              </div>
              <span className="text-[9.5px] bg-purple-100 text-purple-700 font-black px-2 py-0.5 rounded-full">
                {pendingProofs.length} টি পেন্ডিং প্রুফ
              </span>
            </div>

            {pendingProofs.length === 0 ? (
              <div className="bg-slate-50 text-center py-10 rounded-2xl border border-gray-150 space-y-2">
                <span className="text-2xl block">📸</span>
                <p className="text-xs font-black text-slate-800">রিভিউ করার জন্য কোনো স্ক্রিনশট প্রুফ পেন্ডিং নেই!</p>
                <p className="text-[10.5px] text-gray-400">মেম্বাররা স্ক্রিনশট সহ কোনো কাজ সাবমিট করলে এখানে জমা হবে।</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {pendingProofs.map(tx => (
                  <div key={tx.id} className="bg-white p-4 rounded-3xl border border-slate-250 space-y-3.5 shadow-sm">
                    <div className="flex items-center justify-between gap-1.5">
                      <div>
                        <h6 className="font-extrabold text-[12px] text-slate-800 tracking-tight leading-tight">{tx.title}</h6>
                        <span className="text-[9.5px] text-indigo-500 font-bold bg-indigo-50 px-1.5 py-0.5 rounded leading-none block w-fit mt-1">
                          রিওয়ার্ড: ৳ {tx.amount.toFixed(2)} টাকা
                        </span>
                      </div>
                      <span className="text-[9.5px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg font-bold font-sans">
                        UID: @{tx.username || 'হাসান৭৭৮৮১০'}
                      </span>
                    </div>

                    {/* Submitted screenshot detail box */}
                    <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-150">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">সাবমিট করা প্রমাণ (Uploaded Screenshots):</p>
                      
                      <div className={`grid gap-2 ${tx.proofScreenshot2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        <div className="space-y-1">
                          {tx.proofScreenshot2 && <span className="text-[8.5px] font-bold text-slate-500 uppercase px-1">১ম প্রুফ (Install St.)</span>}
                          <div className="relative group cursor-pointer overflow-hidden rounded-xl border border-gray-150 bg-white p-1 flex items-center justify-center min-h-[140px]">
                            <img 
                              src={tx.proofScreenshot} 
                              alt="Submitted user proof screenshot upload" 
                              className="w-full max-h-52 object-contain rounded-lg hover:scale-[1.02] transition-transform"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>

                        {tx.proofScreenshot2 && (
                          <div className="space-y-1">
                            <span className="text-[8.5px] font-bold text-slate-500 uppercase px-1">২য় প্রুফ (Dashboard St.)</span>
                            <div className="relative group cursor-pointer overflow-hidden rounded-xl border border-gray-150 bg-white p-1 flex items-center justify-center min-h-[140px]">
                              <img 
                                src={tx.proofScreenshot2} 
                                alt="Submitted user proof screenshot 2 upload" 
                                className="w-full max-h-52 object-contain rounded-lg hover:scale-[1.02] transition-transform"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action controls */}
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        type="button"
                        onClick={() => {
                          onResolveProof(tx.id, 'approved');
                          alert(`সাফল্যজনকভাবে টাস্ক [${tx.title}] অনুমোদন করা হয়েছে এবং ইউজারের ব্যালেন্স ক্যাশ ৳${tx.amount} টাকা ক্রেডিট করা হয়েছে!`);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-2 px-3 rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
                      >
                        <CheckCircle size={11} /> প্রুফ সঠিক, অনুমোদন (Approve)
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          onResolveProof(tx.id, 'rejected');
                          alert(`প্রুফটি বাতিল করা হয়েছে।`);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white font-extrabold py-2 px-3 rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
                      >
                        <XCircle size={11} /> প্রুফ ভুল, বাতিল (Reject)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
