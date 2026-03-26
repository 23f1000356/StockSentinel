import { Outlet } from 'react-router';
import { UserSidebar } from './UserSidebar';
import { Navbar } from './Navbar';
import { AppProvider } from '../context/AppContext';
import { useEffect, useState } from 'react';

export function UserLayout() {
  const [isNight, setIsNight] = useState(false);
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
    <div className={`flex h-screen ${isNight ? 'bg-[#0F1522]' : 'bg-[#F5F1EB]'}`}>
      <UserSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 dashboard-page-animate page-title-strong page-pop-containers">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
