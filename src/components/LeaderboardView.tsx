import { Trophy, TrendingUp, Sparkles, Award, Medal } from 'lucide-react';
import { LeaderboardUser } from '../types';
import { LanguageCode } from '../utils/language';

interface LeaderboardViewProps {
  currentUserName: string;
  currentUserUsername: string;
  currentUserBalance: number;
  initialLeaderboard: LeaderboardUser[];
  language?: LanguageCode;
}

export default function LeaderboardView({ 
  currentUserName, 
  currentUserUsername, 
  currentUserBalance, 
  initialLeaderboard,
  language
}: LeaderboardViewProps) {
  
  // Calculate dynamic integrated leaderboard including current user
  const otherUsers = initialLeaderboard.filter(user => !user.isCurrentUser);
  const integratedList = [
    ...otherUsers,
    {
      name: currentUserName,
      username: currentUserUsername,
      balance: currentUserBalance,
      isCurrentUser: true,
      rank: 0 // placeholder
    }
  ];

  // Sort integrated list by balance descending
  const sortedList = integratedList.sort((a, b) => b.balance - a.balance);

  // Assign correct rankings
  const rankedList = sortedList.map((user, idx) => ({
    ...user,
    rank: idx + 1
  }));

  // Find current user's profile
  const currentUserRanked = rankedList.find(u => u.isCurrentUser);

  return (
    <div id="leaderboard_panel_wrapper" className="space-y-4 pb-12 animate-fade-in">
      
      {/* 1. TROPHY HERO SECTION */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-3xl text-white text-center space-y-4 relative overflow-hidden border border-slate-700/50 shadow-xl">
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 w-16 h-16 bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-500/20 ring-4 ring-slate-800 animate-pulse">
          👑
        </div>

        <div className="space-y-1.5 relative z-10">
          <h4 id="leaderboard_title" className="text-[15px] font-black flex items-center justify-center gap-2 leading-none text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-white font-sans uppercase">
            <Sparkles size={16} className="text-yellow-400" />
            সেরা উপার্জনকারী (Leaderboard)
          </h4>
          <p className="text-[10.5px] text-gray-300 font-bold max-w-xs mx-auto leading-tight">
            লাইভ সর্বোচ্চ আয়কারী লিডারবোর্ড। নিয়মিত কাজ করে শীর্ষে থাকুন!
          </p>
        </div>

        {currentUserRanked && (
          <div className="relative z-10 grid grid-cols-2 gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs font-bold max-w-md mx-auto">
            <div className="text-center space-y-1">
              <p className="text-[9px] uppercase tracking-widest text-amber-400 font-mono">YOUR RANK</p>
              <p id="user_current_rank" className="text-2xl font-black text-white leading-tight font-sans">
                #{currentUserRanked.rank}
              </p>
            </div>
            <div className="absolute left-1/2 top-4 bottom-4 w-px bg-white/10"></div>
            <div className="text-center space-y-1">
              <p className="text-[9px] uppercase tracking-widest text-emerald-400 font-mono">TOTAL INCOME</p>
              <p id="user_current_balance" className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 leading-tight">
                ৳ {currentUserBalance.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. LEADERBOARD LIST CONTAINER */}
      <div id="leaderboard_list" className="bg-white rounded-3xl border border-gray-100 p-4 space-y-3">
        <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider px-2 border-b border-gray-50 pb-1.5">
          <span>RANK & USER</span>
          <span>BALANCE</span>
        </div>

        <div className="space-y-1.5">
          {rankedList.map((user) => {
            const isTop3 = user.rank <= 3;
            const topBadge = user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉';
            const topBg = 
              user.rank === 1 ? 'bg-yellow-50 border-yellow-100' : 
              user.rank === 2 ? 'bg-slate-50 border-slate-200' : 
              user.rank === 3 ? 'bg-orange-50 border-orange-100' : '';

            return (
              <div 
                key={user.rank}
                id={`rank_row_${user.rank}`}
                className={`flex items-center justify-between p-3 rounded-2xl border text-xs transition-transform ${
                  user.isCurrentUser 
                    ? 'border-emerald-500 bg-emerald-500/5 shadow-xs ring-1 ring-emerald-500/20' 
                    : isTop3 
                      ? `${topBg}` 
                      : 'border-gray-50/50 bg-gray-50/20 hover:bg-gray-50/50'
                }`}
              >
                {/* User info left side */}
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 flex items-center justify-center font-bold font-mono rounded-full text-xs">
                    {isTop3 ? (
                      <span className="text-lg">{topBadge}</span>
                    ) : (
                      <span className="text-gray-400">#{user.rank}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className={`font-bold ${user.isCurrentUser ? 'text-emerald-700 font-extrabold' : 'text-slate-700'}`}>
                        {user.name}
                      </p>
                      {user.isCurrentUser && (
                        <span className="text-[8px] bg-emerald-500 text-white font-extrabold px-1.5 py-0.5 rounded uppercase leading-none">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] ${user.isCurrentUser ? 'text-emerald-600/70' : 'text-gray-400'}`}>
                      @{user.username}
                    </p>
                  </div>
                </div>

                {/* Balance right side */}
                <div className="text-right">
                  <p className={`font-extrabold ${user.isCurrentUser ? 'text-emerald-600' : 'text-gray-800'}`}>
                    ৳ {user.balance.toFixed(2)}
                  </p>
                  <span className="text-[10px] text-gray-400 font-medium">৳ Taka</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER TIPS */}
      <div className="bg-emerald-50/40 p-4 rounded-3xl border border-emerald-100/50 text-[10px] text-emerald-700 leading-snug flex items-center gap-2">
        <Trophy size={16} className="text-yellow-500 flex-shrink-0" />
        <span>প্রতি সপ্তাহে সেরা ৩ জন টপ রেট টাস্কার পাবেন সরাসরি ক্যাশ জ্যাকপট বোনাস! বেশি বেশি কাজ করুন আর লিডারবোর্ডের শীর্ষে থাকুন।</span>
      </div>

    </div>
  );
}
