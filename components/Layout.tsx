import React, { useState } from 'react';
import Sidebar from './Sidebar.tsx';
import Header from './Header.tsx';
import QuickActions from './QuickActions';
import { Outlet, useLocation } from 'react-router-dom';

const getPageBackgroundClass = (pathname: string): string => {
  if (pathname.startsWith('/dashboard') || pathname === '/') return 'bg-energetic-green-light';
  if (pathname.startsWith('/family-profiles')) return 'bg-inclusive-orange-light';
  if (pathname.startsWith('/emergency')) return 'bg-urgent-red-light';
  if (pathname.startsWith('/documents')) return 'bg-trustworthy-blue-light';
  if (pathname.startsWith('/prescriptions')) return 'bg-therapeutic-purple-light';
  if (pathname.startsWith('/insurance')) return 'bg-secure-dark-blue-light';
  if (pathname.startsWith('/financial')) return 'bg-brand-teal-light';
  if (pathname.startsWith('/wellness')) return 'bg-vibrant-yellow-green-light';
  if (pathname.startsWith('/baby-care')) return 'bg-gentle-pastel-blue-light';
  if (pathname.startsWith('/womens-care')) return 'bg-empowering-pink-light';
  if (pathname.startsWith('/pregnancy')) return 'bg-nurturing-peach-light';
  if (pathname.startsWith('/wellness-rewards')) return 'bg-reward-gold-light';
  if (pathname.startsWith('/telehealth')) return 'bg-modern-teal-light';
  if (pathname.startsWith('/community')) return 'bg-engaging-magenta-light';
  if (pathname.startsWith('/settings')) return 'bg-sophisticated-grey-light';
  return 'bg-background'; // Default background
};

const Layout: React.FC = () => {
  const location = useLocation();
  const backgroundClass = getPageBackgroundClass(location.pathname);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex h-screen bg-background text-textPrimary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className={`flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 ${backgroundClass}`}>
          <Outlet key={refreshKey} />
        </main>
        
        {/* Quick Actions - only show on main pages, not auth pages */}
        {!location.pathname.includes('/login') && !location.pathname.includes('/register') && (
          <QuickActions onDataUpdate={() => setRefreshKey(prev => prev + 1)} />
        )}
      </div>
    </div>
  );
};

export default Layout;