import React, { useState, useEffect } from 'react';
import { 
  Play, Sparkles, Check, Star, Loader, Tv, ShieldAlert, AlertCircle, 
  Tv2, Volume2, ShieldCheck, Hourglass, Coins, CheckCircle2, Trophy 
} from 'lucide-react';
import { UserState } from '../types';
import { LanguageCode, translate } from '../utils/language';

interface AdsViewProps {
  userState: UserState;
  onWatchAd: (reward: number) => void;
  language?: LanguageCode;
  appSettings?: {
    telegramChannel: string;
    telegramGroup: string;
    adReward: number;
    referralBonus: number;
    minWithdraw: number;
    dailyAdLimit: number;
    adsterraDirectLink: string;
    adsterraScript1: string;
    adsterraScript2: string;
  };
}

export default function AdsView({ userState, onWatchAd, language, appSettings }: AdsViewProps) {
  const t = (key: string, params?: Record<string, string | number>) => {
    return translate(language || 'BN', key, params);
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [adTimer, setAdTimer] = useState<number | null>(null);
  const [canClaim, setCanClaim] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [resetCountdown, setResetCountdown] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const lastReset = userState.lastAdResetTime || now;
      const targetTime = lastReset + 24 * 60 * 60 * 1000;
      const remainingMs = targetTime - now;

      if (remainingMs <= 0) {
        setResetCountdown('');
      } else {
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
        if (language === 'BN') {
          setResetCountdown(`${hours} ঘণ্টা ${minutes} মিনিট ${seconds} সেকেন্ড`);
        } else {
          setResetCountdown(`${hours}h ${minutes}m ${seconds}s`);
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [userState.lastAdResetTime, language]);
  
  // Custom video sponsor brands for dynamic simulation
  const [adBrand, setAdBrand] = useState({ 
    name: '', 
    slogan: '', 
    logo: '💼', 
    color: 'from-blue-600 to-indigo-700',
    videoTopic: 'মোবাইল রিচার্জ ও ক্যাশব্যাক অফার'
  });

  const AD_BRANDS = [
    { 
      name: 'bKash Limited', 
      slogan: 'বিকাশ অ্যাপে ক্যাশআউট চার্জ এখন আরও কম! আজই লেনদেন করুন।', 
      logo: '৳', 
      color: 'from-pink-500 via-rose-600 to-pink-500',
      videoTopic: 'Instant Send Money & Cashback offers'
    },
    { 
      name: 'Nagad Digital', 
      slogan: 'নগদ-এ লাভ বেশি! খরচ কম, ইন্টারেস্ট রেট সবথেকে বেশি।', 
      logo: '৳', 
      color: 'from-orange-500 via-red-650 to-amber-600',
      videoTopic: 'Government Primary Education Stipend'
    },
    { 
      name: 'Daraz BD', 
      slogan: 'দারাজ অনলাইন শপিং-এ ফ্রি ডেলিভারি ভাউচার সংগ্রহ করুন এক্ষুণি!', 
      logo: '🛍️', 
      color: 'from-orange-500 via-yellow-500 to-rose-500',
      videoTopic: 'Mega Discount Shopping Campaign'
    },
    { 
      name: 'Foodpanda Bangladesh', 
      slogan: 'ঝটপট খাবার অর্ডার করুন এবং ৫০% পর্যন্ত সরাসরি ছাড় উপভোগ করুন!', 
      logo: '🐼', 
      color: 'from-rose-500 to-pink-600',
      videoTopic: 'Free Delivery food vouchers'
    },
    { 
      name: 'TaskGo Premium Network', 
      slogan: 'টেলিগ্রাম বটের সাহায্যে ঘরে বসেই নিশ্চিন্তে নির্ভরযোগ্য আয়ের মাধ্যম!', 
      logo: '⚡', 
      color: 'from-emerald-500 via-teal-600 to-cyan-650',
      videoTopic: 'Micro jobs and secure crypto payouts'
    }
  ];

  // Daily watch limit dynamically read from admin panel settings
  const DAILY_LIMIT = appSettings?.dailyAdLimit ?? 20;
  const progressPercent = Math.min(100, Math.floor((userState.adsWatchedCount / DAILY_LIMIT) * 100));

  // Trigger ad play sequence
  const triggerWatchAd = () => {
    if (userState.adsWatchedCount >= DAILY_LIMIT) {
      alert(t('ad_limit_reached_alert'));
      return;
    }

    // Open real Adsterra Direct Link in a new tab so physical traffic is credited to their publisher account!
    try {
      const linkToOpen = appSettings?.adsterraDirectLink || 'https://www.profitablecpmrate.com/cbeeed17d86649248783bbb90b94a04';
      window.open(linkToOpen, '_blank');
    } catch (err) {
      console.warn("Ad block or popup blocked:", err);
    }

    const brand = AD_BRANDS[Math.floor(Math.random() * AD_BRANDS.length)];
    setAdBrand(brand);
    setIsPlaying(true);
    setIsBuffering(true);
    setCanClaim(false);
    setRewardClaimed(false);

    // Dynamic buffering simulator (1.8s) before starting ad countdown
    setTimeout(() => {
      setIsBuffering(false);
      setAdTimer(12); // 12 seconds countdown during dynamic tracking
    }, 1800);
  };

  // Timer countdown handler
  useEffect(() => {
    if (adTimer === null) return;
    if (adTimer === 0) {
      setCanClaim(true);
      setAdTimer(null);
      return;
    }

    const timer = setTimeout(() => {
      setAdTimer(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [adTimer]);

  // Claim/Collect reward handler
  const claimReward = () => {
    const rewardVal = appSettings?.adReward || 0.50;
    onWatchAd(rewardVal); // Dynamic reward credited!
    setRewardClaimed(true);

    // Audio beep simulation for confirmation
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // high pitched clean check sound
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // Ignored if browser limits audio autoplay
    }

    // Dynamic success modal timeout before closing
    setTimeout(() => {
      setIsPlaying(false);
      setRewardClaimed(false);
      setCanClaim(false);
    }, 2500);
  };

  return (
    <div id="ads_tab_root_container" className="space-y-5 pb-16 animate-fade-in text-xs max-w-md mx-auto">
      
      {!isPlaying ? (
        /* AD INDEX DASHBOARD (SCREENSHOT FIDELITY LAYOUT WITH PRESTIGE STYLING) */
        <div 
          id="premium_ads_hub_main_card" 
          className="bg-gradient-to-b from-[#1b1248] via-[#0f0a2e] to-[#0a0720] rounded-[36px] p-6 text-white shadow-2xl border border-indigo-500/25 relative overflow-hidden"
        >
          {/* Subtle Background Glowing Spheres */}
          <div className="absolute top-[-80px] left-[-80px] w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-[-60px] right-[-60px] w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          {/* 1. BRAND HUB HEADER */}
          <div className="flex items-center gap-3.5 relative z-10 border-b border-indigo-500/15 pb-4">
            <div className="w-[54px] h-[54px] bg-[#1d1655] rounded-2xl flex items-center justify-center border-2 border-emerald-500/30 overflow-hidden shadow-lg shadow-emerald-500/10 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-[#00e395]/15 to-transparent"></div>
              {/* Custom dynamic screen icon */}
              <Tv2 size={24} className="text-[#00e395] drop-shadow-[0_0_8px_rgba(0,227,149,0.5)]" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 id="premium_ads_title_bengali" className="text-[17px] font-black tracking-tight font-sans text-white flex items-center gap-1.5 leading-tight">
                  {t('premium_ads_hub')}
                </h4>
                <span className="bg-emerald-500/10 border border-emerald-500/40 text-[#00e395] font-extrabold text-[8px] tracking-wide px-1.5 py-0.5 rounded uppercase font-sans">
                  PRO VIEW
                </span>
              </div>
              <p className="text-[10.5px] text-indigo-200/80 font-medium font-sans">
                {t('earn_ad_title')}
              </p>
            </div>
          </div>

          {/* 2. PROGRESS METER (আজকের কাজের অগ্রগতি) */}
          <div id="watched_progress_container" className="mt-5 bg-[#170f3f] rounded-2.5xl p-4 border border-indigo-500/10 space-y-2.5 relative z-10">
            <div className="flex justify-between items-center text-[11.5px] font-bold">
              <span className="text-slate-250 font-sans tracking-tight text-indigo-100/90">{t('daily_progress')}</span>
              <span className="text-[#00e395] font-mono font-extrabold text-xs">{progressPercent}%</span>
            </div>
            
            {/* Elegant glowing slider track */}
            <div className="w-full bg-[#0a0624] h-3.5 rounded-full p-[3px] border border-indigo-950 flex items-center">
              <div 
                className="bg-gradient-to-r from-emerald-500 via-[#00e395] to-teal-400 h-full rounded-full transition-all duration-750 relative shadow-[0_0_10px_rgba(0,227,149,0.3)]"
                style={{ width: `${progressPercent}%` }}
              >
                {/* Micro visual tip glint */}
                {progressPercent > 0 && (
                  <span className="absolute right-0 top-0 h-full w-2 bg-white/40 rounded-full animate-pulse"></span>
                )}
              </div>
            </div>

            {/* Real-time automated 24h reset countdown tracker */}
            {resetCountdown && (
              <div id="rest_timer_row" className="flex items-center justify-between text-[10px] text-indigo-200/50 font-bold pt-1 border-t border-indigo-950">
                <span className="flex items-center gap-1 font-sans">
                  <Hourglass size={11} className="text-[#00e395] animate-pulse" />
                  {language === 'BN' ? 'ডেইলি লিমিট রিসেট হতে বাকি:' : 'Next limit reset in:'}
                </span>
                <span className="text-[#00e395] font-mono font-extrabold tracking-tight">{resetCountdown}</span>
              </div>
            )}
          </div>

          {/* 3. DYNAMIC STATS GRID (3 COLUMNS PERFECTLY MATCHING SCREENSHOT) */}
          <div id="stats_metrics_grid" className="grid grid-cols-3 gap-2.5 mt-4 relative z-10">
            {/* Col 1: Watched */}
            <div className="bg-[#170f3f] rounded-2xl border border-indigo-500/10 py-3.5 px-1.5 text-center transition-all hover:border-indigo-500/20">
              <p className="text-[10px] text-indigo-200/70 font-semibold tracking-tight uppercase">{t('ads_watched')}</p>
              <p id="watched_hits" className="text-15px font-black mt-1 text-white font-sans">
                {userState.adsWatchedCount} {language === 'BN' ? 'বার' : 'Times'}
              </p>
            </div>

            {/* Col 2: Remaining */}
            <div className="bg-[#170f3f] rounded-2xl border border-indigo-500/10 py-3.5 px-1.5 text-center transition-all hover:border-indigo-500/20">
              <p className="text-[10px] text-indigo-200/70 font-semibold tracking-tight uppercase">{t('ads_remaining')}</p>
              <p id="remaining_hits" className="text-15px font-black mt-1 text-[#00e395] font-sans">
                {Math.max(0, DAILY_LIMIT - userState.adsWatchedCount)} {language === 'BN' ? 'বার' : 'Times'}
              </p>
            </div>

            {/* Col 3: Total */}
            <div className="bg-[#170f3f] rounded-2xl border border-indigo-500/10 py-3.5 px-1.5 text-center transition-all hover:border-indigo-500/20">
              <p className="text-[10px] text-indigo-200/70 font-semibold tracking-tight uppercase">{t('ads_total')}</p>
              <p className="text-15px font-black mt-1 text-indigo-100/90 font-sans">
                {DAILY_LIMIT} {language === 'BN' ? 'বার' : 'Times'}
              </p>
            </div>
          </div>

          {/* 4. DASHED REWARD BOX */}
          <div className="mt-5 relative z-10">
            <div className="border border-dashed border-emerald-500/45 bg-emerald-550/10 bg-emerald-500/5 rounded-2.5xl p-4 text-center select-all shadow-[inset_0_2px_12px_rgba(0,227,149,0.05)]">
              <p className="text-[#00e395] text-[13px] font-black tracking-wide flex items-center justify-center gap-1.5">
                <Coins size={14} className="animate-spin text-emerald-400" />
                {language === 'BN' ? 'প্রতি এড রিওয়ার্ড মূল্য: ৳' : 'Ad Reward Reward Value: ৳'}{(appSettings?.adReward ?? 0.50).toFixed(2)}
              </p>
            </div>
          </div>

          {/* 5. INSTRUCTION / GUIDELINE BENGALI TEXT */}
          <p className="mt-5 text-[10.5px] text-indigo-200/60 leading-relaxed text-center font-sans tracking-wide px-1.5 relative z-10">
            {t('ad_desc')}
          </p>

          {/* 6. DYNAMIC SHOOT ACTION BUTTON */}
          <div className="mt-5 relative z-10 text-center">
            {userState.adsWatchedCount >= DAILY_LIMIT ? (
              <div className="bg-red-500/10 text-red-400 py-3.5 px-4 rounded-2xl border border-red-500/25 flex items-center gap-2 justify-center text-center font-bold">
                <ShieldAlert size={14} className="text-red-400 flex-shrink-0" />
                <span className="text-[11px]">{t('ads_exhausted')}</span>
              </div>
            ) : (
              <>
                <button 
                  id="show_ad_action_trigger_btn"
                  onClick={triggerWatchAd}
                  className="w-full bg-[#00e395] hover:bg-[#00f5a0] text-slate-900 font-extrabold py-3.5 px-6 rounded-2.5xl shadow-[0_4px_24px_rgba(0,227,149,0.3)] hover:shadow-[0_4px_30px_rgba(0,227,149,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 text-13px uppercase tracking-wide transform active:scale-[0.98]"
                >
                  <Play size={15} className="fill-slate-900 text-slate-900 translate-x-0.5" />
                  <span>{t('show_ad')}</span>
                </button>
                <p className="text-[9px] text-[#00e395]/45 mt-2 font-bold tracking-wider uppercase">
                  📡 Adsterra Smart Traffic Safe-Route Active
                </p>
              </>
            )}
          </div>

          {/* Visual Safety Badges under card */}
          <div className="flex items-center justify-center gap-5 text-[9px] text-indigo-300/40 font-bold uppercase tracking-wider mt-5 pt-4 border-t border-indigo-500/10">
            <span className="flex items-center gap-1">
              <ShieldCheck size={11} className="text-emerald-500" /> High Yield
            </span>
            <span className="flex items-center gap-1">
              <Star size={11} className="text-amber-400 fill-amber-400" /> Super Fast
            </span>
          </div>

        </div>
      ) : (
        /* CINEMATIC VIDEO SCREEN */
        <div 
          id="cinematic_video_fullscreen_curtain"
          className="bg-gradient-to-b from-[#0b0825] via-[#100c35] to-[#04030f] rounded-[36px] overflow-hidden border border-[#00e395]/20 shadow-2xl min-h-[460px] flex flex-col relative animate-fade-in"
        >
          {/* Header Bar */}
          <div className="p-4 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between relative z-10">
            <span className="text-[9.5px] font-mono tracking-widest text-[#00e395] bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
              {t('hd_sponsor_casting')}
            </span>
            
            {isBuffering ? (
              <span className="text-[10px] text-indigo-300 font-mono font-bold animate-pulse flex items-center gap-1">
                <Loader size={11} className="animate-spin text-teal-400" /> {t('buffering')}
              </span>
            ) : adTimer !== null ? (
              <span className="text-[10.5px] bg-[#22185c] px-3 py-1 rounded-full text-emerald-400 font-mono font-extrabold flex items-center gap-1 shadow-sm border border-emerald-500/20">
                <Hourglass size={12} className="animate-spin text-emerald-300" />
                {t('remaining_seconds', { seconds: adTimer })}
              </span>
            ) : (
              <span className="text-[10px] bg-emerald-500 text-slate-900 px-[10px] py-0.5 rounded-full font-black animate-bounce uppercase tracking-wider">
                {t('ready')}
              </span>
            )}
          </div>

          {/* Interactive Simulated Dynamic Video Screen Content */}
          <div className="py-8 px-6 text-center space-y-4 my-auto relative z-10 flex flex-col items-center justify-center">
            {isBuffering ? (
              <div className="space-y-4 animate-pulse">
                <div className="w-[72px] h-[72px] rounded-full border-4 border-t-emerald-400 border-indigo-950/50 flex items-center justify-center animate-spin mx-auto">
                  <Play size={20} className="text-emerald-400 animate-pulse fill-emerald-400 translate-x-0.5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-indigo-200">{t('server_connecting')}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{t('media_loading')}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in w-full font-sans">
                {/* Dynamic Brand Splash Logo */}
                <div className={`w-20 h-20 bg-gradient-to-br ${adBrand.color} rounded-2.5xl flex items-center justify-center text-4xl font-black shadow-2xl mx-auto border-2 border-white/10 animate-wave`}>
                  {adBrand.logo}
                </div>

                <div className="space-y-1 bg-black/30 p-4 rounded-2xl border border-white/5 max-w-xs mx-auto">
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-extrabold px-1.5 py-0.2 rounded border border-emerald-500/35 uppercase">
                    {adBrand.videoTopic}
                  </span>
                  <h6 className="text-[17px] font-black text-white tracking-tight mt-1 font-sans">
                    {adBrand.name}
                  </h6>
                  <p className="text-[11px] text-indigo-200 leading-normal font-sans">
                    {adBrand.slogan}
                  </p>
                </div>
                
                {/* Real-time streaming audio graphic wave */}
                <div className="flex justify-center items-center gap-1.2 pt-2 opacity-70">
                  <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-1.5 h-8 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-6 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                  <span className="w-1.5 h-10 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  <span className="w-1.5 h-5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></span>
                </div>
              </div>
            )}
          </div>

          {/* Cinematic claim control dock */}
          <div className="p-4 border-t border-white/5 bg-black/60 backdrop-blur-md relative z-10 flex flex-col items-center">
            {isBuffering ? (
              <div className="text-[10px] text-indigo-200/60 flex items-center gap-1.5 py-2">
                <Loader size={12} className="animate-spin text-teal-400" />
                <span>{t('generator_loading')}</span>
              </div>
            ) : adTimer !== null ? (
              <div className="text-[10.5px] text-indigo-200/85 flex items-center gap-1.5 py-2 font-medium">
                <AlertCircle size={12} className="text-amber-400 animate-pulse animate-bounce" />
                <span>{t('view_ad_carefully')}</span>
              </div>
            ) : rewardClaimed ? (
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold py-3.5 px-6 rounded-2xl text-center w-full animate-fade-in flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 size={18} className="text-white fill-white/10" />
                <span className="text-[12px]">৳{(appSettings?.adReward ?? 0.50).toFixed(2)} {t('ad_reward_credited')}</span>
              </div>
            ) : (
              <button 
                onClick={claimReward}
                className="w-full bg-[#00e395] hover:bg-[#00f5a0] text-slate-900 font-black py-4 rounded-2.5xl shadow-[0_4px_20px_rgba(0,227,149,0.3)] text-12px cursor-pointer animate-bounce flex items-center justify-center gap-1 font-sans"
              >
                <Coins size={14} className="animate-spin" />
                <span>{t('collect_reward_btn')}</span>
              </button>
            )}
          </div>

        </div>
      )}

      {/* SECURITY / TRUSTED NOTES BOX */}
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl text-[10.5px] text-gray-400 leading-relaxed text-center font-sans shadow-xs mt-1 text-slate-500 font-medium">
        💡 <strong>{t('user_support_title')}:</strong> {t('user_support_desc')}
      </div>

    </div>
  );
}
