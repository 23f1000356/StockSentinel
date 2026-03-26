import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';
import { useEffect, useState } from 'react';

function DashboardLayoutContent() {
  const [isNight, setIsNight] = useState(false);
  const { isOpen, close } = useSidebar();

  useEffect(() => {
    const read = () => setIsNight(localStorage.getItem('ui-theme') === 'night');
    read();
    window.addEventListener('storage', read);
    window.addEventListener('ui-theme-changed', read);
    return () => {
      window.removeEventListener('storage', read);
      window.removeEventListener('ui-theme-changed', read);
    };
  }, []);

  return (
    <div className={`flex h-screen ${isNight ? 'bg-[#0F1522]' : 'bg-[#F5F1EB]'} overflow-hidden`}>
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 z-[100] lg:hidden transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={close} 
        />
        <div 
          className={`absolute inset-y-0 left-0 w-72 bg-[#1E1E1E] shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <Sidebar />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 dashboard-page-animate page-title-strong page-pop-containers relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <DashboardLayoutContent />
    </SidebarProvider>
  );
}
