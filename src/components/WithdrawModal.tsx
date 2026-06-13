import React, { useState } from 'react';
import { Send, CheckCircle, ShieldAlert, AlertCircle, Sparkles, Building, PhoneCall } from 'lucide-react';
import { UserState } from '../types';
import { LanguageCode } from '../utils/language';

interface WithdrawModalProps {
  userState: UserState;
  onWithdrawRequest: (amount: number, method: string, number: string) => boolean | string;
  onNavigateHome: () => void;
  language?: LanguageCode;
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

export default function WithdrawModal({ 
  userState, 
  onWithdrawRequest, 
  onNavigateHome,
  language,
  appSettings
}: WithdrawModalProps) {
  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const MIN_LIMIT = 100.00;
  const MAX_LIMIT = 25000.00;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const withdrawAmt = parseFloat(amount);

    if (!withdrawAmt || isNaN(withdrawAmt)) {
      setErrorMsg('অনুগ্রহ করে সঠিক টাকার পরিমাণ লিখুন।');
      return;
    }

    if (withdrawAmt < MIN_LIMIT) {
      setErrorMsg(`দুঃখিত! সর্বনিম্ন উইথড্র লিমিট ৳ ${MIN_LIMIT.toFixed(2)} টাকা।`);
      return;
    }

    if (withdrawAmt > MAX_LIMIT) {
      setErrorMsg(`দুঃখিত! সর্বোচ্চ উইথড্র লিমিট ৳ ${MAX_LIMIT.toLocaleString('en-US', { minimumFractionDigits: 2 })} টাকা।`);
      return;
    }

    if (withdrawAmt > userState.balance) {
      setErrorMsg('আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই!');
      return;
    }

    // Phone number regex check for Bangladeshi format (11 digits)
    const bdPhoneRegex = /^(01)[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(phoneNumber)) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল ব্যাংকিং নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }

    // Request withdrawal
    const result = onWithdrawRequest(withdrawAmt, method, phoneNumber);
    if (typeof result === 'string') {
      setErrorMsg(result);
    } else {
      setSuccessMsg(`আপনার উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে! আমাদের অ্যাডমিন প্যানেল ৫ থেকে ৬ ঘণ্টার মধ্যে ৳ ${withdrawAmt.toFixed(2)} টাকা পরিশোধ করবে।`);
      setAmount('');
      setPhoneNumber('');
    }
  };

  return (
    <div id="withdraw_panel_wrapper" className="space-y-4 pb-12 animate-fade-in text-xs">
      
      {/* GLOWING LIMITS BANNER AT THE TOP */}
      <div 
        id="withdraw_limits_glow_banner" 
        className="bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 p-4.5 rounded-2xl shadow-md border border-red-400/20 relative overflow-hidden animate-pulse shadow-rose-500/10 text-center"
      >
        {/* Subtle overlay decorative circle */}
        <div className="absolute top-[-20px] right-[-25px] w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        
        <h4 className="text-[13px] sm:text-[14px] font-black text-yellow-300 uppercase tracking-tight drop-shadow-sm font-sans">
          🔥 উইথড্র সীমা ঘোষণা (Strict Limits) 🔥
        </h4>
        <p className="text-[11px] sm:text-[12px] font-black text-white leading-relaxed mt-1 tracking-wide">
          সর্বনিম্ন উইথড্র ১০০ টাকা এবং সর্বোচ্চ উইথড্র ২৫,০০০ টাকা!
        </p>
        <span className="inline-block mt-1.5 text-[8.5px] bg-white/20 text-white px-2 py-0.5 rounded font-black tracking-widest uppercase font-mono">
          SECURE AUDITED PAYMENT
        </span>
      </div>

      {/* 1. BANK SELECTION CARD */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 space-y-4">
        <div className="text-center space-y-1">
          <h4 id="withdraw_page_title" className="text-sm font-extrabold text-slate-800 flex items-center justify-center gap-1.5">
            <Building size={16} className="text-emerald-500" />
            উইথড্র মেথড নির্বাচন করুন (Withdraw Gateway)
          </h4>
          <p className="text-[10px] text-gray-400">নিচের যেকোনো অনুমোদিত পেমেন্ট গেটওয়ের মাধ্যমে পেমেন্ট নিন।</p>
        </div>

        {/* Method Grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* bKash */}
          <button
            type="button"
            id="gateway_bkash"
            onClick={() => setMethod('bKash')}
            className={`py-3 px-2 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              method === 'bKash' 
                ? 'border-pink-500 bg-pink-50 text-pink-600 font-bold scale-[1.03] shadow-xs' 
                : 'border-gray-50 bg-gray-50/50 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-extrabold text-sm">৳</span>
            <span className="text-[10px] font-bold">bKash</span>
          </button>

          {/* Nagad */}
          <button
            type="button"
            id="gateway_nagad"
            onClick={() => setMethod('Nagad')}
            className={`py-3 px-2 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              method === 'Nagad' 
                ? 'border-orange-500 bg-orange-50 text-orange-600 font-bold scale-[1.03] shadow-xs' 
                : 'border-gray-50 bg-gray-50/50 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-extrabold text-sm">৳</span>
            <span className="text-[10px] font-bold">Nagad</span>
          </button>

          {/* Rocket */}
          <button
            type="button"
            id="gateway_rocket"
            onClick={() => setMethod('Rocket')}
            className={`py-3 px-2 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              method === 'Rocket' 
                ? 'border-indigo-500 bg-indigo-50 text-indigo-600 font-bold scale-[1.03] shadow-xs' 
                : 'border-gray-50 bg-gray-50/50 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-extrabold text-sm">৳</span>
            <span className="text-[10px] font-bold">Rocket</span>
          </button>
        </div>
      </div>

      {/* 2. FORM ACTION CARD */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 space-y-4">
        {successMsg ? (
          <div className="text-center py-4 space-y-3 animate-fade-in text-xs">
            <div className="w-12 h-12 bg-emerald-50 rounded-full border border-emerald-200 flex items-center justify-center text-emerald-500 mx-auto animate-bounce">
              <CheckCircle size={24} />
            </div>
            <p className="font-semibold text-slate-800 leading-relaxed px-2">
              {successMsg}
            </p>
            <button 
              onClick={onNavigateHome}
              className="mt-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-sm transition-all text-xs"
            >
              ড্যাশবোর্ডে ফিরে যান (Return Home)
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Account Balance Alert Info */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center flex flex-col gap-0.5 justify-center">
              <span className="text-gray-400 font-bold text-[10px] uppercase">YOUR NET BALANCE</span>
              <span className="text-lg font-black text-emerald-600">৳ {userState.balance.toFixed(2)}</span>
            </div>

            {/* Amount input */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-500 block">টাকার পরিমাণ (Withdraw Amount):</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-extrabold text-gray-400">৳</span>
                <input 
                  type="number"
                  id="withdraw_amount_input"
                  placeholder="৳ ১০০ থেকে ৳ ২৫,০০০"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <p className="text-[9px] text-gray-400">সর্বনিম্ন উইথড্র লিমিট ১০০.০০ টাকা এবং সর্বোচ্চ ২৫,০০০.০০ টাকা।</p>
            </div>

            {/* Mobile Banking Number */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-500 block">মোবাইল ব্যাংকিং নম্বর (Mobile Number):</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-[10px] font-extrabold text-gray-400">
                  <PhoneCall size={12} />
                </span>
                <input 
                  type="text"
                  maxLength={11}
                  id="withdraw_phone_input"
                  placeholder="017XXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono font-semibold"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1 text-red-500 bg-red-50 p-2.5 rounded-xl border border-red-200">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span className="font-medium text-[11px] leading-tight">{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit"
              id="submit_withdraw_btn"
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer"
            >
              <Send size={14} className="rotate-45" />
              <span>রিকোয়েস্ট সাবমিট করুন (Submit Request)</span>
            </button>

          </form>
        )}
      </div>

      {/* 3. SAFETY AND LEGIT DECLARATION */}
      <div className="bg-amber-50/50 p-4 rounded-3xl border border-amber-200/50 text-[10px] text-amber-800 leading-relaxed space-y-1">
        <div className="flex items-center gap-1 font-bold">
          <ShieldAlert size={14} className="text-amber-600" />
          <span>পেমেন্ট সতর্কতা নিয়মাবলী:</span>
        </div>
        <p>১. কোনো রকমের ভিপিএন (VPN) অথবা অ্যাড-ব্লকার ব্যবহার করে টাস্ক সম্পন্ন করার চেষ্টা প্রমানিত হলে একাউন্ট চিরতরে ব্যান হবে।</p>
        <p>২. একই ডিভাইসে একাধিক একাউন্ট চালালে কোনো রকম পূর্ব নোটিশ ছাড়াই উইথড্র বাতিল করা হবে।</p>
      </div>

    </div>
  );
}
