import { Search, Bell, User, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

export function Navbar() {
  const { user } = useStore();
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ui-theme');
    const night = saved === 'night';
    setIsNight(night);
    document.documentElement.classList.toggle('dark', night);
  }, []);

  const toggleTheme = () => {
    const next = !isNight;
    setIsNight(next);
    localStorage.setItem('ui-theme', next ? 'night' : 'day');
    document.documentElement.classList.toggle('dark', next);
    window.dispatchEvent(new Event('ui-theme-changed'));
  };

  return (
    <header className={`${isNight ? 'bg-[#1B1F2A] border-[#2B3242]' : 'bg-[#F5F1EB] border-gray-200'} border-b px-6 py-4`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className={`w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#C89B5A] ${
                isNight ? 'bg-[#22293A] border-[#3A465E] text-white placeholder:text-gray-400' : 'bg-white border-gray-200'
              }`}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-colors ${isNight ? 'hover:bg-[#22293A]' : 'hover:bg-white'}`}
            title={isNight ? 'Switch to day mode' : 'Switch to night mode'}
          >
            {isNight ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>

          <button className={`relative p-2 rounded-xl transition-colors ${isNight ? 'hover:bg-[#22293A]' : 'hover:bg-white'}`}>
            <Bell className={`w-5 h-5 ${isNight ? 'text-gray-200' : 'text-gray-600'}`} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className={`flex items-center gap-3 pl-4 border-l ${isNight ? 'border-[#3A465E]' : 'border-gray-300'}`}>
            <div className="w-10 h-10 bg-[#C89B5A] rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm">
              <p className={`font-semibold ${isNight ? 'text-white' : 'text-gray-900'}`}>{user?.name ?? 'Admin User'}</p>
              <p className={`${isNight ? 'text-gray-300' : 'text-gray-500'}`}>{user?.email ?? 'admin@example.com'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
