import { useState, useEffect, useRef, ChangeEvent, DragEvent } from 'react';
import { 
  Check, ArrowRight, Play, Loader, Sparkles, RefreshCw, AlertCircle, 
  Crown, Share2, DownloadCloud, Image as ImageIcon, Upload, 
  ExternalLink, CheckCircle, Info, Zap, Trash2, ShieldAlert
} from 'lucide-react';
import { EarnTask, UserState } from '../types';
import { LanguageCode } from '../utils/language';

interface TaskViewProps {
  userState: UserState;
  tasks: EarnTask[];
  onCompleteTask: (taskId: string, reward: number, taskTitle: string) => void;
  onSubmitProof: (taskId: string, proofScreenshot: string, proofScreenshot2?: string) => void;
  language?: LanguageCode;
}

export default function TaskView({ userState, tasks, onCompleteTask, onSubmitProof, language }: TaskViewProps) {
  // Category tab state: 'vip' | 'social' | 'premium'
  const [activeCategory, setActiveCategory] = useState<'vip' | 'social' | 'premium'>('vip');
  
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Math Quiz local state
  const [mathNum1, setMathNum1] = useState(0);
  const [mathNum2, setMathNum2] = useState(0);
  const [mathOp, setMathOp] = useState<'+' | '-'>('+');
  const [mathInput, setMathInput] = useState('');
  const [mathError, setMathError] = useState(false);

  // Captcha local state
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  // Poll state
  const [selectedPollOption, setSelectedPollOption] = useState<string | null>(null);

  // Click / Social transition state
  const [visitTimer, setVisitTimer] = useState<number | null>(null);
  const [visitingState, setVisitingState] = useState<'idle' | 'countdown' | 'completed'>('idle');

  // Screenshot upload state for premium tasks
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofImage2, setProofImage2] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  // Fetch counts of pending tasks for badges
  const getTasksByCategory = (cat: 'vip' | 'social' | 'premium') => {
    return tasks.filter(t => 
      t.category === cat && 
      !t.completed && 
      t.adminStatus !== 'pending' && 
      t.adminStatus !== 'approved' && 
      t.adminStatus !== 'rejected'
    );
  };

  const getIncompleteCount = (cat: 'vip' | 'social' | 'premium') => {
    return tasks.filter(t => 
      t.category === cat && 
      !t.completed && 
      t.adminStatus !== 'pending' && 
      t.adminStatus !== 'approved' && 
      t.adminStatus !== 'rejected'
    ).length;
  };

  // Generate fresh math question
  const generateMathQuiz = () => {
    const num1 = Math.floor(Math.random() * 50) + 10;
    const num2 = Math.floor(Math.random() * 40) + 5;
    const op = Math.random() > 0.5 ? '+' as const : '-' as const;
    setMathNum1(num1);
    setMathNum2(num2);
    setMathOp(op);
    setMathInput('');
    setMathError(false);
  };

  // Generate fresh Captcha
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
    setCaptchaError(false);
  };

  // Initialize selected task states when clicked
  const startTask = (task: EarnTask) => {
    setSuccessMessage(null);
    setProofImage(null);
    setProofImage2(null);
    setActiveTaskId(task.id);
    if (task.type === 'math') {
      generateMathQuiz();
    } else if (task.type === 'captcha') {
      generateCaptcha();
    } else if (task.type === 'click' || task.type === 'social_link') {
      setVisitingState('idle');
      setVisitTimer(null);
    } else if (task.type === 'poll') {
      setSelectedPollOption(null);
    }
  };

  // Submit Math quiz answer
  const submitMath = (task: EarnTask) => {
    const correctAnswer = mathOp === '+' ? (mathNum1 + mathNum2) : (mathNum1 - mathNum2);
    if (parseInt(mathInput) === correctAnswer) {
      handleSuccess(task);
    } else {
      setMathError(true);
      setTimeout(() => setMathError(false), 2000);
    }
  };

  // Submit Captcha solution
  const submitCaptcha = (task: EarnTask) => {
    if (captchaInput.trim().toUpperCase() === captchaCode) {
      handleSuccess(task);
    } else {
      setCaptchaError(true);
      setTimeout(() => setCaptchaError(false), 2000);
    }
  };

  // Run countdown for visitor / social ad link task
  const runVisitTask = (seconds: number = 10) => {
    setVisitingState('countdown');
    setVisitTimer(seconds); // seconds visit limit
  };

  useEffect(() => {
    if (visitTimer === null) return;
    if (visitTimer === 0) {
      setVisitingState('completed');
      setVisitTimer(null);
      return;
    }

    const timer = setTimeout(() => {
      setVisitTimer(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [visitTimer]);

  const claimVisitReward = (task: EarnTask) => {
    handleSuccess(task);
  };

  // Submit poll answer
  const submitPoll = (task: EarnTask) => {
    if (selectedPollOption) {
      handleSuccess(task);
    }
  };

  // Handler for file upload / drag-and-drop
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readImageFile(file, 1);
    }
  };

  const handleFileChange2 = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readImageFile(file, 2);
    }
  };

  const readImageFile = (file: File, index: 1 | 2 = 1) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        if (index === 1) {
          setProofImage(event.target.result as string);
        } else {
          setProofImage2(event.target.result as string);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      readImageFile(file, 1);
    }
  };

  const handleDrop2 = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      readImageFile(file, 2);
    }
  };

  // Instantly apply a high quality simulated mobile screenshot receipt for quick iframe debugging
  const loadDemoScreenshot = () => {
    const demoScreenshots = [
      'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1510519138101-570d1dca3d66?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=400&q=80'
    ];
    setProofImage(demoScreenshots[0]);
    setProofImage2(demoScreenshots[1]);
  };

  // Submit premium proof file to App setup
  const submitPremiumProof = (task: EarnTask) => {
    if (!proofImage) return;
    
    // Save to App state
    onSubmitProof(task.id, proofImage, proofImage2 || undefined);
    
    if (task.category === 'vip') {
      setSuccessMessage(`প্রমাণ জমা হয়েছে! ⏳\nএটি সফলভাবে ৩ থেকে ৫ ঘণ্টার রিভিউ সেশনে যুক্ত হয়েছে। অ্যাডমিন প্যানেল থেকে আপনার স্ক্রিনশট যাচাই করার পর ব্যালেন্স যোগ করে দেওয়া হবে।`);
    } else if (task.category === 'social') {
      setSuccessMessage(`প্রমাণ জমা হয়েছে! ⏳\nসোশ্যাল টাস্কের প্রমাণটি এডমিন রিভিউ বোর্ডে পাঠানো হয়েছে। যাচাই করার সাথে সাথে আপনার একাউন্টে ব্যালেন্স যুক্ত হবে।`);
    } else {
      setSuccessMessage(`প্রমাণ জমা হয়েছে! ⏳\n১০-১২ সেকেন্ডের মধ্যে এডমিন অটোমেটিক ভেরিফাই করে পেমেন্ট যোগ করবে।`);
    }
    
    setTimeout(() => {
      setActiveTaskId(null);
      setSuccessMessage(null);
      setProofImage(null);
      setProofImage2(null);
    }, 5000);
  };

  // Give reward, update state, trigger callback, and animate success
  const handleSuccess = (task: EarnTask) => {
    onCompleteTask(task.id, task.reward, task.title);
    setSuccessMessage(`অভিনন্দন! আপনি সফলভাবে ${task.reward.toFixed(2)} টাকা ইনকাম করেছেন! 🎉`);
    setTimeout(() => {
      setActiveTaskId(null);
      setSuccessMessage(null);
    }, 3500);
  };

  const activeTask = tasks.find(t => t.id === activeTaskId);

  return (
    <div id="tasks_panel_wrapper" className="space-y-4 pb-12 animate-fade-in">
      
      {/* APP TITLE CARD */}
      <div className="bg-gradient-to-tr from-emerald-500 to-teal-600 p-4 rounded-3xl text-white shadow-md text-center space-y-1 relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <h4 id="task_page_title" className="text-15px font-extrabold flex items-center justify-center gap-1.5 uppercase tracking-wide">
          <Sparkles className="text-amber-300 animate-pulse fill-amber-300" size={17} />
          CashHive স্পেশাল টাস্ক হাব (Job Hub)
        </h4>
        <p className="text-[11px] text-emerald-100 font-medium">৩ ক্যাটাগরির কাজ সম্পন্ন করে ডেইলি ১০০০ টাকা পর্যন্ত ইনকাম করুন!</p>
      </div>

      {/* CATEGORY SELECTOR TABS */}
      {activeTaskId === null && (
        <div className="grid grid-cols-3 gap-2" id="task_tabs_container">
          
          {/* VIP TASK TAB */}
          <button
            onClick={() => setActiveCategory('vip')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center relative overflow-hidden cursor-pointer ${
              activeCategory === 'vip' 
                ? 'bg-amber-500/10 border-amber-500 text-amber-900 shadow-sm font-bold scale-[1.02]' 
                : 'bg-white border-slate-100 hover:border-amber-200 text-slate-500'
            }`}
          >
            <div className={`p-1.5 rounded-xl mb-1 ${activeCategory === 'vip' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600'}`}>
              <Crown size={18} />
            </div>
            <span className="text-[11px] font-extrabold block">VIP টাস্ক</span>
            <span className="text-[9px] text-amber-700 font-bold tracking-tight bg-amber-100 px-1.5 py-0.5 rounded-full mt-1">
              ৳ উচ্চ হার
            </span>
            {getIncompleteCount('vip') > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            )}
          </button>

          {/* SOCIAL TASK TAB */}
          <button
            onClick={() => setActiveCategory('social')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center relative overflow-hidden cursor-pointer ${
              activeCategory === 'social' 
                ? 'bg-sky-500/10 border-sky-500 text-sky-900 shadow-sm font-bold scale-[1.02]' 
                : 'bg-white border-slate-100 hover:border-sky-200 text-slate-500'
            }`}
          >
            <div className={`p-1.5 rounded-xl mb-1 ${activeCategory === 'social' ? 'bg-sky-500 text-white' : 'bg-sky-100 text-sky-600'}`}>
              <Share2 size={18} />
            </div>
            <span className="text-[11px] font-extrabold block">সোশ্যাল</span>
            <span className="text-[9px] text-sky-700 font-bold tracking-tight bg-sky-100 px-1.5 py-0.5 rounded-full mt-1">
              {getTasksByCategory('social').length} কাজ
            </span>
            {getIncompleteCount('social') > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
            )}
          </button>

          {/* PREMIUM TASK TAB */}
          <button
            onClick={() => setActiveCategory('premium')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center relative overflow-hidden cursor-pointer ${
              activeCategory === 'premium' 
                ? 'bg-violet-500/10 border-violet-500 text-violet-900 shadow-sm font-bold scale-[1.02]' 
                : 'bg-white border-slate-100 hover:border-violet-200 text-slate-500'
            }`}
          >
            <div className={`p-1.5 rounded-xl mb-1 ${activeCategory === 'premium' ? 'bg-violet-500 text-white' : 'bg-violet-100 text-violet-600'}`}>
              <DownloadCloud size={18} />
            </div>
            <span className="text-[11px] font-extrabold block">প্রিমিয়াম</span>
            <span className="text-[9px] text-violet-700 font-bold tracking-tight bg-violet-100 px-1.5 py-0.5 rounded-full mt-1">
              প্রুফ আপলোড
            </span>
            {getIncompleteCount('premium') > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-505 bg-violet-500"></span>
              </span>
            )}
          </button>

        </div>
      )}

      {/* DETAILED CATEGORY PROMO */}
      {activeTaskId === null && (
        <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2 theme-not-larp ${
          activeCategory === 'vip' ? 'bg-amber-500/5 border-amber-200 text-amber-800' :
          activeCategory === 'social' ? 'bg-sky-500/5 border-sky-200 text-sky-800' :
          'bg-violet-500/5 border-violet-200 text-violet-800'
        }`}>
          <div className="mt-0.5">
            <Info size={14} className="flex-shrink-0" />
          </div>
          <div>
            {activeCategory === 'vip' && (
              <p className="leading-relaxed">
                <strong>👑 ভিআইপি জোন কপাল খুলুন:</strong> এই টাস্কগুলোর মূল্য অনেক বেশি। আপনার অর্জিত রিওয়ার্ড বিকাশ বা নগদে তোলার দ্রুততম সুযোগ!
              </p>
            )}
            {activeCategory === 'social' && (
              <p className="leading-relaxed">
                <strong>📢 সোশ্যাল শেয়ার ও সাবস্ক্রাইব:</strong> এখানে অফুরন্ত কাজ পাবেন যেমন ইউটিউব সাবস্ক্রাইব এবং টেলিগ্রাম গ্রূপ জয়েন, রিওয়ার্ড সরাসরি ব্যালেন্সে জমা হবে।
              </p>
            )}
            {activeCategory === 'premium' && (
              <p className="leading-relaxed">
                <strong>🛡️ প্রিমিয়াম অ্যাপ ডাউনলোডার:</strong> আমাদের ক্লায়েন্টদের অ্যাপস ডাউনলোড এবং ইন্সটল করুন। সম্পন্ন করার পর স্ক্রিনশট প্রামাণ আপলোড করুন। আমাদের রোবট বা এডমিন ১০ সেকেন্ডে এটি পেমেন্ট রিলিজ করবে।
              </p>
            )}
          </div>
        </div>
      )}

      {activeTaskId === null ? (
        /* LIST OF ACTIVE CATEGORIZED TASKS */
        <div id="tasks_list_container" className="space-y-3">
          {getTasksByCategory(activeCategory).length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-dashed border-gray-200 text-center text-slate-400 text-xs">
              দুঃখিত! এই মুহূর্তে কোনো নতুন কাজ এভেইলেবল নেই। আবার পরে চেষ্টা করুন।
            </div>
          ) : (
            getTasksByCategory(activeCategory).map((task) => {
              const viewStatus = task.adminStatus || 'idle';
              
              return (
                <div 
                  key={task.id}
                  className={`bg-white p-4 rounded-3xl border transition-all ${
                    task.completed 
                      ? 'border-gray-200 bg-gray-50/70 opacity-90' 
                      : viewStatus === 'pending'
                        ? 'border-amber-300 bg-amber-50/10'
                        : activeCategory === 'vip' 
                          ? 'border-slate-100 hover:border-amber-200 shadow-xs'
                          : activeCategory === 'social'
                            ? 'border-slate-100 hover:border-sky-200 shadow-xs'
                            : 'border-slate-100 hover:border-violet-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      {task.logoUrl ? (
                        <img 
                          src={task.logoUrl} 
                          alt="Brand Logo" 
                          className="w-10 h-10 rounded-xl object-cover bg-slate-50 border border-slate-150 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          activeCategory === 'vip' 
                            ? 'bg-amber-100 text-amber-600' 
                            : activeCategory === 'social'
                              ? 'bg-sky-100 text-sky-600'
                              : 'bg-violet-100 text-violet-600'
                        }`}>
                          {task.title.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <span className="text-13px font-bold text-slate-800 flex items-center gap-1">
                            {activeCategory === 'vip' && <Crown size={13} className="text-amber-500 fill-amber-500 inline block" />}
                            {task.title}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                            task.difficulty === 'Easy' ? 'bg-green-50 text-green-600 border border-green-200' :
                            task.difficulty === 'Medium' ? 'bg-teal-50 text-teal-600 border border-teal-200' :
                            'bg-orange-50 text-orange-600 border border-orange-200'
                          }`}>
                            {task.difficulty}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed">{task.description}</p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 flex flex-col items-end">
                      <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">REWARD</span>
                      <span className={`text-sm font-extrabold ${
                        activeCategory === 'vip' ? 'text-amber-600' : 
                        activeCategory === 'social' ? 'text-sky-600' : 'text-violet-600'
                      }`}>
                        ৳ {task.reward.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Task Footnotes & Submitter Controls */}
                  <div className="mt-3.5 pt-3.5 border-t border-gray-50 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[9px] text-gray-400 font-mono tracking-tight bg-slate-50 px-2 py-0.5 rounded">
                      Job ID: {task.id}
                    </span>

                    {task.completed ? (
                      <span className="text-[11px] bg-green-50 text-green-600 border border-green-200 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-default">
                        <CheckCircle size={13} /> পেমেন্ট সম্পন্ন (Completed)
                      </span>
                    ) : viewStatus === 'pending' ? (
                      <span className="text-[11px] bg-amber-50 text-amber-600 border border-amber-200 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-default animate-pulse">
                        <Loader size={12} className="animate-spin" /> প্রমাণ যাচাইাধীন (Verifying...)
                      </span>
                    ) : (
                      <button 
                        onClick={() => startTask(task)}
                        className={`text-[11px] font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer ${
                          activeCategory === 'vip' ? 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white' :
                          activeCategory === 'social' ? 'bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white' :
                          'bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white'
                        }`}
                      >
                        শুরু করুন (Start Job) <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ACTIVE WORKSPACE AREA WITH FULL FORMS */
        <div id="active_task_workspace" className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-md">
          
          {/* Work area head */}
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100">
            <span className="text-[10px] font-mono font-bold text-gray-400 flex items-center gap-1">
              <Zap size={11} className="text-yellow-500" />
              ACTIVE MICRO JOB WORKSPACE
            </span>
            <button 
              onClick={() => setActiveTaskId(null)}
              className="text-xs text-red-400 hover:text-red-600 transition-colors font-bold flex items-center gap-0.5 cursor-pointer"
            >
              বাতিল করুন (Cancel)
            </button>
          </div>

          {/* Success layout overlay */}
          {successMessage ? (
            <div className="text-center py-6 space-y-3 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto animate-bounce border-2 border-emerald-200">
                <Check size={32} strokeWidth={3} />
              </div>
              <p className="text-xs md:text-sm font-semibold text-slate-800 leading-relaxed px-4 whitespace-pre-line bg-gray-50 p-3 rounded-2xl border border-gray-100">
                {successMessage}
              </p>
              <div className="text-[10px] text-slate-400 font-medium">ব্যালেন্স লোডার কনফিগার হচ্ছে...</div>
            </div>
          ) : (
            <>
              {activeTask && (
                <div className="space-y-4">
                  
                  {/* Task core stats metadata */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                        activeCategory === 'vip' ? 'bg-amber-100 text-amber-700' :
                        activeCategory === 'social' ? 'bg-sky-100 text-sky-700' : 'bg-violet-100 text-violet-700'
                      }`}>
                        {activeCategory} Category
                      </span>
                      <h5 className="text-[13px] font-bold text-slate-800 leading-tight">{activeTask.title}</h5>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed font-medium">{activeTask.description}</p>
                  </div>

                  {/* Payment reward banner */}
                  <div className="bg-emerald-50/50 rounded-2xl p-3.5 border border-emerald-100 flex justify-between items-center text-xs">
                    <span className="text-emerald-800 font-bold">টাস্ক বোনাস রেট (Task Payment):</span>
                    <span className="font-extrabold text-emerald-600 text-[15px]">৳ {activeTask.reward.toFixed(2)}</span>
                  </div>

                  {/* VIP Megajob Workspace */}
                  {activeTask.category === 'vip' && (
                    <div id="vip_task_workspace" className="space-y-4 pt-1 animate-fade-in">
                      
                      {/* Logo and Brand Title Header */}
                      <div className="flex items-center gap-3 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
                        {activeTask.logoUrl ? (
                          <img 
                            src={activeTask.logoUrl} 
                            alt="Merchant Brand" 
                            className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-amber-200 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0">
                            👑
                          </div>
                        )}
                        <div className="space-y-0.5">
                          <h6 className="text-xs font-black text-amber-950 uppercase tracking-wide">ভিআইপি ভেরিফাইড টাস্ক (VIP Verified Work)</h6>
                          <p className="text-[10px] text-amber-700 font-bold">এটি একটি হাই-পেইং ম্যানুয়াল রিভিউ কাজ। সঠিক প্রমাণ দিন।</p>
                        </div>
                      </div>

                      {/* Technical warnings/requirements cards */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1 font-bold text-slate-800">
                          <CheckCircle size={13} className="text-amber-500 fill-amber-500" />
                          <span>কাজটি করার সহজ নিয়মাবলী:</span>
                        </div>
                        <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11.5px] font-semibold text-slate-700">
                          <li>নিচের লিংকে ক্লিক করে ওয়েবসাইট/গ্রুপ ভিজিট বা জয়েন করুন।</li>
                          <li>কাজ সম্পন্ন হওয়ার পর পরিষ্কার স্ক্রিনশট নিন।</li>
                          <li>নিচের আপলোডার বক্সে আপনার নেওয়া স্ক্রিনশটটি আপলোড করুন।</li>
                          <li>ছবি আপলোড করে ক্লেইম করলে কাজটির প্রমাণ ৩ থেকে ৫ ঘণ্টার জন্য রিভিউতে থাকবে।</li>
                        </ol>
                      </div>

                      {/* URL Button transition */}
                      {activeTask.link && (
                        <div className="text-center pt-1.5 pb-1">
                          <a 
                            href={activeTask.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="no-underline bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-black px-6 py-3.5 rounded-2xl inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer animate-pulse"
                          >
                            <ExternalLink size={14} /> অফিশিয়াল লিঙ্কে প্রবেশ করুন (Open Link)
                          </a>
                        </div>
                      )}

                      {/* Screen Shot drop uploader zone */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 block uppercase">
                          স্ক্রিনশট প্রমাণ আপলোড (Provide Screenshot Proof):
                        </label>
                        
                        <div 
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center relative min-h-[140px] ${
                            isDragging 
                              ? 'border-amber-500 bg-amber-50' 
                              : proofImage 
                                ? 'border-emerald-300 bg-emerald-50/10' 
                                : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                          }`}
                        >
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />

                          {proofImage ? (
                            <div className="space-y-2 w-full">
                              <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded inline-flex items-center gap-1 mx-auto">
                                <Check size={12} /> স্ক্রিনশট সফলভাবে লোড হয়েছে
                              </div>
                              <img 
                                src={proofImage} 
                                alt="Uploaded Proof Screenshot" 
                                className="h-28 w-auto object-contain mx-auto rounded-xl shadow-xs border border-slate-200"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex gap-2 justify-center pt-1.5">
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                  }}
                                  className="text-[10px] bg-white border border-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                                >
                                  ছবি পরিবর্তন (Change)
                                </button>
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProofImage(null);
                                  }}
                                  className="text-[10px] bg-red-50 border border-red-200 text-red-600 font-bold px-3 py-1.5 rounded-lg hover:bg-red-100 flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 size={11} /> মুছুন (Clear)
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="p-3 bg-amber-50 text-amber-600 rounded-full inline-block">
                                <Upload size={20} className="stroke-[2.5px]" />
                              </div>
                              <p className="text-xs text-slate-600 font-semibold">
                                ড্রাগ করে ছাড়ুন অথবা ক্লিক করে ছবি সিলেক্ট করুন
                              </p>
                              <p className="text-[9px] text-slate-400">
                                Supports PNG, JPG, JPEG (Max 5MB)
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Helper auto placeholder for fast model preview verification with no friction */}
                        {!proofImage && (
                          <div className="text-center pt-1">
                            <button
                              type="button"
                              onClick={loadDemoScreenshot}
                              className="text-[10px] text-amber-650 bg-amber-50 hover:bg-amber-100 border border-amber-100 font-bold px-3.5 py-2 rounded-xl transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles size={11} className="text-yellow-600 animate-spin" style={{ animationDuration: '4s' }} />
                              <span>অটো জেনারেট ডেমো প্রুফ (Auto Screenshot)</span>
                            </button>
                            <p className="text-[9px] text-slate-400 mt-1">টেস্টিং সুবিধার জন্য ইমেজ ফাইল না থাকলে ডেস্কে সহজেই ডেমো প্রুফ ইন্টিগ্রেট করুন!</p>
                          </div>
                        )}
                      </div>

                      {/* Submission button */}
                      <button 
                        onClick={() => submitPremiumProof(activeTask)}
                        disabled={!proofImage}
                        className={`w-full py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          proofImage 
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <CheckCircle size={14} /> Submit VIP Proof (তথ্য জমা দিন)
                      </button>
                    </div>
                  )}

                  {/* Math Type job container */}
                  {activeTask.type === 'math' && activeTask.category !== 'vip' && (
                    <div id="math_quiz" className="space-y-4 pt-1">
                      <div className="text-center bg-gray-50 rounded-2xl py-6 border border-gray-100 relative overflow-hidden">
                        <span className="absolute top-2 right-2 text-[9px] font-mono text-gray-300">SECURE CALC</span>
                        <p className="text-3xl font-extrabold tracking-wider text-slate-800 font-mono">
                          {mathNum1} {mathOp} {mathNum2} = ?
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400">সঠিক উত্তরটি ইংরেজি সংখ্যায় লিখুন (Answer):</label>
                        <input 
                          type="number"
                          id="input_math_answer"
                          value={mathInput}
                          onChange={(e) => setMathInput(e.target.value)}
                          placeholder="আপনার উত্তর দিন..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                      </div>

                      {mathError && (
                        <div className="flex items-center gap-1.5 text-xs text-red-500 bg-red-50 p-2.5 rounded-xl border border-red-200 justify-center animate-shake">
                          <AlertCircle size={14} />
                          <span>ভুল উত্তর! আবার সঠিক অংকটি করুন।</span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button 
                          onClick={generateMathQuiz}
                          className="w-1/3 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 text-xs cursor-pointer"
                        >
                          <RefreshCw size={12} />
                          <span>অন্য অংক</span>
                        </button>
                        <button 
                          onClick={() => submitMath(activeTask)}
                          className="w-2/3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-extrabold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                        >
                          <span>সাবমিট উত্তর</span>
                          <Check size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Captcha Type job container */}
                  {activeTask.type === 'captcha' && activeTask.category !== 'vip' && (
                    <div id="captcha_quiz" className="space-y-4 pt-1">
                      <div className="bg-slate-900 rounded-2xl py-6 border border-slate-700 text-center relative overflow-hidden select-none">
                        <p className="text-3xl font-extrabold tracking-widest text-[#FFD700] underline decoration-wavy font-mono px-4">
                          {captchaCode}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400">কোডটি হুবহু বড় হাতের অক্ষরে লিখুন (Captcha Code):</label>
                        <input 
                          type="text"
                          id="input_captcha_answer"
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value)}
                          placeholder="কোডটি টাইপ করুন..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 uppercase font-bold"
                        />
                      </div>

                      {captchaError && (
                        <div className="flex items-center gap-1.5 text-xs text-red-500 bg-red-50 p-2.5 rounded-xl border border-red-200 justify-center animate-shake">
                          <AlertCircle size={14} />
                          <span>ভুল কোড! আবার লিখুন।</span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button 
                          onClick={generateCaptcha}
                          className="w-1/3 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 text-xs cursor-pointer"
                        >
                          <RefreshCw size={12} />
                          <span>রিফ্রেশ</span>
                        </button>
                        <button 
                          onClick={() => submitCaptcha(activeTask)}
                          className="w-2/3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-extrabold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                        >
                          <span>ভেরিফাই করুন</span>
                          <Check size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Click ad website and Social click category (Non-social, e.g. normal click ads) */}
                  {(activeTask.type === 'click' || activeTask.type === 'social_link') && activeTask.category !== 'vip' && activeTask.category !== 'social' && (
                    <div id="website_visit" className="space-y-4 pt-1 text-center">
                      {visitingState === 'idle' && (
                        <div className="space-y-4 py-4">
                          <div className="text-5xl animate-bounce">
                            {activeTask.type === 'social_link' ? '📢' : '🔗'}
                          </div>
                          
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
                            <p className="font-bold">কাজের নিয়মাবলী:</p>
                            <p>১. নিচে দেওয়া লিংকে ক্লিক করে আমাদের পার্টনার পেজে যান।</p>
                            <p>২. পেজে অন্তত ১০ সেকেন্ড অপেক্ষা বা শেয়ার করুন।</p>
                          </div>

                          <a 
                            href="https://t.me/CashHiveBot" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={() => runVisitTask(10)}
                            className={`no-underline inline-flex items-center gap-1.5 text-xs font-bold px-6 py-3.5 rounded-2xl text-white shadow-md cursor-pointer ${
                              activeCategory === 'vip' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-sky-500 hover:bg-sky-600'
                            }`}
                          >
                            <ExternalLink size={14} /> 
                            {activeTask.type === 'social_link' ? 'লিংক ভিজিট ও লাইক করুন (Go to Link)' : 'পার্টনার সাইট ভিজিট (Visit site)'}
                          </a>
                        </div>
                      )}

                      {visitingState === 'countdown' && (
                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-4">
                          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto"></div>
                          <div className="space-y-1">
                            <h6 className="text-[14px] font-bold text-slate-800">অপেক্ষা করুন (Checking timer)...</h6>
                            <p className="text-[11px] text-slate-500">লিংকটি ভ্যালিডেট করা হচ্ছে। পেজ রিফ্রেশ করবেন না।</p>
                          </div>
                          <div className="text-3xl font-extrabold text-emerald-600 font-mono bg-white px-5 py-2.5 rounded-2xl shadow-xs border inline-block">
                            {visitTimer} সেকেন্ড
                          </div>
                        </div>
                      )}

                      {visitingState === 'completed' && (
                        <div className="bg-emerald-50/50 border border-emerald-200 rounded-3xl p-6 space-y-4 animate-fade-in">
                          <div className="text-4xl">🎉</div>
                          <div className="space-y-1">
                            <h6 className="text-[14px] font-extrabold text-emerald-800">কার্যক্রমটি সনাক্ত করা হয়েছে!</h6>
                            <p className="text-[11px] text-emerald-700 font-medium">নিচের ক্লেইম বাটনে চাপ দিলে আপনার একাউন্টে টাকা যোগ হবে।</p>
                          </div>
                          <button 
                            onClick={() => claimVisitReward(activeTask)}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-extrabold py-3.5 rounded-2xl shadow-sm text-xs cursor-pointer"
                          >
                            বিকাশ/নগদ রেট ক্যাশ করুন (Claim Reward)
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Social Category Microjob Workspace with SKY BLUE THEMED SCREENSHOT PROOF */}
                  {activeTask.category === 'social' && (
                    <div id="social_task_workspace" className="space-y-4 pt-1 animate-fade-in text-slate-700">
                      
                      {/* Logo and Brand Title Header */}
                      <div className="flex items-center gap-3 bg-sky-500/5 p-4 rounded-2xl border border-sky-500/10">
                        {activeTask.logoUrl ? (
                          <img 
                            src={activeTask.logoUrl} 
                            alt="Merchant Brand" 
                            className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-sky-200 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0">
                            📱
                          </div>
                        )}
                        <div className="space-y-0.5">
                          <h6 className="text-xs font-black text-sky-950 uppercase tracking-wide">সোশ্যাল ও অ্যাপ মাইক্রোজব (Social & App Install Job)</h6>
                          <p className="text-[10px] text-sky-700 font-bold">নিচের অ্যাপটি ডাউনলোড করুন এবং আপনার কাজের অর্নিং/পেমেন্ট প্রুফ স্ক্রিনশট দিন।</p>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-[11px]">
                        <div className="flex items-center gap-1 font-bold text-slate-800">
                          <CheckCircle size={13} className="text-sky-500 fill-sky-500" />
                          <span>কাজটি করার সহজ নিয়মাবলী:</span>
                        </div>
                        <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11.5px] font-semibold text-slate-700">
                          <li>নিচের লিংকে ক্লিক করে অফিসিয়াল অ্যাপটি ডাউনলোড বা রেজিস্টার করুন।</li>
                          <li>অ্যাপে অ্যাকাউন্ট খুলে কোম্পানির নির্দেশিত কাজ বা অফার সম্পন্ন করুন।</li>
                          <li>কাজ শেষে অ্যাপের ভিতর থেকে অর্নিং হিস্টোরি, পেমেন্ট বা প্রুফ পেজের পরিষ্কার স্ক্রিনশট নিন।</li>
                          <li>নিচের আপলোডার বক্সে সেই স্ক্রিনশটটি আপলোড করে প্রমাণ সাবমিট করুন।</li>
                        </ol>
                      </div>

                      {/* Official Link Button */}
                      <div className="text-center pt-1.5 pb-1">
                        <a 
                          href={activeTask.link || "https://t.me/CashHiveBot"} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="no-underline bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-xs font-black px-6 py-3.5 rounded-2xl inline-flex items-center gap-1.5 shadow-md shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer animate-pulse"
                        >
                          <ExternalLink size={14} /> অফিশিয়াল অ্যাপ ডাউনলোড / কাজ শুরু করুন (Open App Link)
                        </a>
                      </div>

                      {/* Screen Shot double drop uploader zones */}
                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-400 block uppercase">
                          অ্যাপ ডাউনলোড ও কাজের প্রমাণ স্ক্রিনশট আপলোড (Provide 2 Screenshot Proofs):
                        </label>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Box 1: App download screenshot */}
                          <div className="space-y-1.5 text-left">
                            <span className="text-[10px] font-bold text-sky-800">১ম স্ক্রিনশট: ডাউনলোড ও রেজিস্ট্রেশন প্রমাণ</span>
                            <div 
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              onClick={() => fileInputRef.current?.click()}
                              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center relative min-h-[140px] ${
                                isDragging 
                                  ? 'border-sky-505 bg-sky-500/10' 
                                  : proofImage 
                                    ? 'border-emerald-300 bg-emerald-50/10' 
                                    : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50'
                              }`}
                            >
                              <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                              />

                              {proofImage ? (
                                <div className="space-y-1 w-full">
                                  <img 
                                    src={proofImage} 
                                    alt="Uploaded Proof Screenshot 1" 
                                    className="h-20 w-auto object-contain mx-auto rounded-xl shadow-xs border border-slate-200"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="flex gap-2 justify-center pt-1.5">
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRef.current?.click();
                                      }}
                                      className="text-[9px] bg-white border border-slate-200 text-slate-600 font-bold px-2 py-1 rounded-lg hover:bg-gray-50 flex items-center gap-0.5 cursor-pointer"
                                    >
                                      পরিবর্তন
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setProofImage(null);
                                      }}
                                      className="text-[9px] bg-red-50 border border-red-200 text-red-600 font-bold px-2 py-1 rounded-lg hover:bg-red-100 flex items-center gap-0.5 cursor-pointer"
                                    >
                                      মুছুন
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1 w-full flex flex-col items-center justify-center">
                                  <div className="p-2 bg-sky-50 text-sky-500 rounded-full inline-block">
                                    <Upload size={16} className="stroke-[2.5px]" />
                                  </div>
                                  <p className="text-[10px] text-slate-600 font-semibold mt-1">
                                    ক্লিক করে ১ম ফাইল দিন
                                  </p>
                                  <p className="text-[8px] text-slate-400">
                                    (App Install Status)
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Box 2: Working performance screenshot */}
                          <div className="space-y-1.5 text-left">
                            <span className="text-[10px] font-bold text-sky-800">২য় স্ক্রিনশট: কাজ/বোনাস অর্জনের ড্যাশবোর্ড প্রমাণ</span>
                            <div 
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop2}
                              onClick={() => fileInputRef2.current?.click()}
                              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center relative min-h-[140px] ${
                                isDragging 
                                  ? 'border-sky-505 bg-sky-500/10' 
                                  : proofImage2 
                                    ? 'border-emerald-300 bg-emerald-50/10' 
                                    : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50'
                              }`}
                            >
                              <input 
                                type="file" 
                                ref={fileInputRef2}
                                onChange={handleFileChange2}
                                accept="image/*"
                                className="hidden"
                              />

                              {proofImage2 ? (
                                <div className="space-y-1 w-full">
                                  <img 
                                    src={proofImage2} 
                                    alt="Uploaded Proof Screenshot 2" 
                                    className="h-20 w-auto object-contain mx-auto rounded-xl shadow-xs border border-slate-200"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="flex gap-2 justify-center pt-1.5">
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRef2.current?.click();
                                      }}
                                      className="text-[9px] bg-white border border-slate-200 text-slate-600 font-bold px-2 py-1 rounded-lg hover:bg-gray-50 flex items-center gap-0.5 cursor-pointer"
                                    >
                                      পরিবর্তন
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setProofImage2(null);
                                      }}
                                      className="text-[9px] bg-red-50 border border-red-200 text-red-600 font-bold px-2 py-1 rounded-lg hover:bg-red-100 flex items-center gap-0.5 cursor-pointer"
                                    >
                                      মুছুন
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1 w-full flex flex-col items-center justify-center">
                                  <div className="p-2 bg-sky-50 text-sky-500 rounded-full inline-block">
                                    <Upload size={16} className="stroke-[2.5px]" />
                                  </div>
                                  <p className="text-[10px] text-slate-600 font-semibold mt-1">
                                    ক্লিক করে ২য় ফাইল দিন
                                  </p>
                                  <p className="text-[8px] text-slate-400">
                                    (App Dashboard/Bonus Status)
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Helper auto placeholder for fast model preview verification with no friction */}
                        {(!proofImage || !proofImage2) && (
                          <div className="text-center pt-1">
                            <button
                              type="button"
                              onClick={loadDemoScreenshot}
                              className="text-[10px] text-sky-600 bg-sky-50 hover:bg-sky-100 border border-sky-100 font-extrabold px-3.5 py-2 rounded-xl transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles size={11} className="text-yellow-600 animate-spin" style={{ animationDuration: '4s' }} />
                              <span>উভয় ফটো অটো জেনারেট প্রুফ (Auto Generate Proofs)</span>
                            </button>
                            <p className="text-[9px] text-slate-400 mt-1">টেস্টিং সুবিধার জন্য অটোমেটিক দুটি ডেমো ছবি তৈরি করুন!</p>
                          </div>
                        )}
                      </div>

                      {/* Submission button */}
                      <button 
                        onClick={() => submitPremiumProof(activeTask)}
                        disabled={!proofImage}
                        className={`w-full py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          proofImage 
                            ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/25' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <CheckCircle size={14} /> Submit App Work Proof (কাজের প্রমান সাবমিট করুন)
                      </button>
                    </div>
                  )}

                  {/* Poll type active job */}
                  {activeTask.type === 'poll' && activeTask.category !== 'vip' && (
                    <div id="survey_poll" className="space-y-4 pt-1">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                        <span className="text-emerald-700 font-bold">জরিপ প্রশ্ন (Feedback Poll Question):</span>
                        <h6 className="text-slate-800 font-bold mt-1 text-[13px] leading-snug">
                          আমাদের CashHive এ আপনি কোন পেমেন্ট মেথড দিয়ে বেশি টাকা তুলতে পছন্দ করেন?
                        </h6>
                      </div>

                      <div className="flex flex-col gap-2">
                        {['bKash (বিকাশ পার্সোনাল)', 'Nagad (নগদ এজেন্ট/পার্সোনাল)', 'Rocket (রকেট পে)', 'Binance / CoinPay'].map((option) => (
                          <button 
                            key={option}
                            onClick={() => setSelectedPollOption(option)}
                            className={`w-full text-left py-3 px-4 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                              selectedPollOption === option 
                                ? 'bg-amber-100/30 border-amber-400 text-amber-900 shadow-xs' 
                                : 'bg-white border-gray-100 hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                selectedPollOption === option ? 'border-amber-500 bg-amber-500 text-white' : 'border-gray-300'
                              }`}>
                                {selectedPollOption === option && <Check size={8} strokeWidth={4} />}
                              </span>
                              <span>{option}</span>
                            </div>
                          </button>
                        ))}
                      </div>

                      <button 
                        onClick={() => submitPoll(activeTask)}
                        disabled={!selectedPollOption}
                        className={`w-full py-3.5 rounded-2xl font-bold transition-all text-xs flex items-center justify-center gap-1 cursor-pointer ${
                          selectedPollOption 
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <span>জরিপ সাবমিট করুন (Submit Survey)</span>
                        <Check size={14} />
                      </button>
                    </div>
                  )}

                  {/* PREMIUM APPLICATION DOWNLOAD WITH FILE SCREENSHOT PROOF */}
                  {activeTask.type === 'download' && activeTask.category !== 'vip' && (
                    <div id="premium_screenshot_workflow" className="space-y-4 pt-1">
                      
                      {/* Technical warnings/requirements cards */}
                      <div className="bg-violet-50/70 p-3.5 rounded-2xl border border-violet-100 space-y-1.5 text-[11px] text-violet-900">
                        <div className="flex items-center gap-1 font-bold text-violet-950">
                          <CheckCircle size={13} className="text-violet-600" />
                          <span>অ্যাপ ডাউনলোড করুন এবং প্রমাণ সাবমিট করুন</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 pl-1 line-clamp-3">
                          <li>নিচের দেওয়া লিঙ্কে ক্লিক করে অ্যাপটি ডাউনলোড ও ইনস্টল করুন।</li>
                          <li>অ্যাপে সাইনআপ করে আপনার ড্যাশবোর্ড বা প্রোফাইলের স্ক্রিনশট নিন।</li>
                          <li>ভুল বা ফেক প্রমাণ রিজেক্ট করা হবে। সঠিক ছবি আপলোড করুন।</li>
                        </ul>
                      </div>

                      {/* URL Button transition */}
                      <div className="text-center">
                        <a 
                          href="https://play.google.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="no-underline bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-xs font-bold px-5 py-3 rounded-xl inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <DownloadCloud size={14} /> গুগল প্লে স্টোর থেকে অ্যাপ ডাউনলোড (Download)
                        </a>
                      </div>

                      {/* Screen Shot drop uploader zone */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 block">
                          স্ক্রিনশট প্রমাণ আপলোড (Provide Screenshot Proof):
                        </label>
                        
                        <div 
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center relative min-h-[140px] ${
                            isDragging 
                              ? 'border-violet-500 bg-violet-50' 
                              : proofImage 
                                ? 'border-emerald-300 bg-emerald-50/10' 
                                : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50'
                          }`}
                        >
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />

                          {proofImage ? (
                            <div className="space-y-2 w-full">
                              <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded inline-flex items-center gap-1 mx-auto">
                                <Check size={12} /> স্ক্রিনশট সফলভাবে লোড হয়েছে
                              </div>
                              <img 
                                src={proofImage} 
                                alt="Uploaded Proof Screenshot" 
                                className="h-28 w-auto object-contain mx-auto rounded-xl shadow-xs border border-slate-200"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex gap-2 justify-center pt-1.5">
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                  }}
                                  className="text-[10px] bg-white border border-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                                >
                                  ছবি পরিবর্তন (Change)
                                </button>
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProofImage(null);
                                  }}
                                  className="text-[10px] bg-red-50 border border-red-200 text-red-600 font-bold px-3 py-1.5 rounded-lg hover:bg-red-100 flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 size={11} /> মুছুন (Clear)
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="p-3 bg-violet-50 text-violet-600 rounded-full inline-block">
                                <Upload size={20} className="stroke-[2.5px]" />
                              </div>
                              <p className="text-xs text-slate-600 font-semibold">
                                ড্রাগ করে ছাড়ুন অথবা ক্লিক করে ছবি সিলেক্ট করুন
                              </p>
                              <p className="text-[9px] text-slate-400">
                                Supports PNG, JPG, JPEG (Max 5MB)
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Helper auto placeholder for fast model preview verification with no friction */}
                        {!proofImage && (
                          <div className="text-center pt-1">
                            <button
                              type="button"
                              onClick={loadDemoScreenshot}
                              className="text-[10px] text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-100 font-bold px-3.5 py-2 rounded-xl transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles size={11} className="text-yellow-600" />
                              <span>অটো জেনারেট ডেমো প্রুফ (Auto Screenshot)</span>
                            </button>
                            <p className="text-[9px] text-slate-400 mt-1">টেস্টিং সুবিধার জন্য ইমেজ ফাইল না থাকলে ডেস্কে সহজেই ডেমো প্রুফ ইন্টিগ্রেট করুন!</p>
                          </div>
                        )}
                      </div>

                      {/* Submission button */}
                      <button 
                        onClick={() => submitPremiumProof(activeTask)}
                        disabled={!proofImage}
                        className={`w-full py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          proofImage 
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/25' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <CheckCircle size={14} /> Submit Screenshot (প্রমাণ জমা দিন)
                      </button>
                    </div>
                  )}

                </div>
              )}
            </>
          )}

        </div>
      )}

    </div>
  );
}
