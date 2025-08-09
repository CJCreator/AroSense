import React, { useState } from 'react';
import Sidebar from './Sidebar.tsx';
import Header from './Header.tsx';
import QuickActions from './QuickActions';
import { Outlet, useLocation } from 'react-router-dom';

const Layout: React.FC = () => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main id="main-content" className="flex-1 overflow-x-hidden overflow-y-auto">
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