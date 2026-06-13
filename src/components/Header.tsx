import { X, ChevronDown, MoreVertical } from 'lucide-react';

interface HeaderProps {
  appName?: string;
  onClose?: () => void;
}

export default function Header({ appName = 'CashHive', onClose }: HeaderProps) {
  return (
    <div id="app_header" className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 select-none">
      <div className="flex items-center gap-3">
        <button 
          id="header_close_btn"
          onClick={onClose} 
          className="p-1 text-gray-500 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          title="Close App"
        >
          <X size={20} />
        </button>
        
        <div id="header_title_wrapper" className="flex items-center gap-2">
          <span className="text-xl font-bold flex items-center gap-1.5 text-emerald-600 tracking-tight">
            <span id="logo_bee" className="animate-bounce">🐝</span>
            {appName}
            <span id="logo_bee_right" className="scale-x-[-1] inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>🐝</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          id="header_dropdown_arrow"
          className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-md transition-all flex items-center justify-center"
        >
          <ChevronDown size={20} />
        </button>
        <button 
          id="header_more_btn"
          className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-md transition-all flex items-center justify-center"
        >
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
}
