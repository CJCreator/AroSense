import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAVIGATION_ITEMS, APP_NAME } from '../constants.tsx';
import { NavItem } from '../types.ts';

const getActiveClasses = (path: string, currentPath: string): string => {
  const isActuallyActive = currentPath.startsWith(path) || (path === '/dashboard' && currentPath === '/');

  if (!isActuallyActive) {
    return 'text-gray-600 hover:bg-gray-50 hover:text-gray-900';
  }

  // Modern gradient-based active states
  const activeStyles: Record<string, string> = {
    '/dashboard': 'bg-gradient-to-r from-energetic-green-500 to-energetic-green-600 text-white shadow-lg',
    '/family-profiles': 'bg-gradient-to-r from-inclusive-orange-500 to-inclusive-orange-600 text-white shadow-lg',
    '/emergency': 'bg-gradient-to-r from-urgent-red-500 to-urgent-red-600 text-white shadow-lg',
    '/documents': 'bg-gradient-to-r from-trustworthy-blue-500 to-trustworthy-blue-600 text-white shadow-lg',
    '/prescriptions': 'bg-gradient-to-r from-therapeutic-purple-500 to-therapeutic-purple-600 text-white shadow-lg',
    '/insurance': 'bg-gradient-to-r from-secure-dark-blue-500 to-secure-dark-blue-600 text-white shadow-lg',
    '/financial': 'bg-gradient-to-r from-brand-teal-500 to-brand-teal-600 text-white shadow-lg',
    '/wellness': 'bg-gradient-to-r from-vibrant-yellow-green-500 to-vibrant-yellow-green-600 text-white shadow-lg',
    '/baby-care': 'bg-gradient-to-r from-gentle-pastel-blue-500 to-gentle-pastel-blue-600 text-white shadow-lg',
    '/womens-care': 'bg-gradient-to-r from-empowering-pink-500 to-empowering-pink-600 text-white shadow-lg',
    '/pregnancy': 'bg-gradient-to-r from-nurturing-peach-500 to-nurturing-peach-600 text-white shadow-lg',
    '/wellness-rewards': 'bg-gradient-to-r from-reward-gold-500 to-reward-gold-600 text-white shadow-lg',
    '/telehealth': 'bg-gradient-to-r from-modern-teal-500 to-modern-teal-600 text-white shadow-lg',
    '/community': 'bg-gradient-to-r from-engaging-magenta-500 to-engaging-magenta-600 text-white shadow-lg',
    '/settings': 'bg-gradient-to-r from-sophisticated-grey-500 to-sophisticated-grey-600 text-white shadow-lg',
  };

  return activeStyles[path] || 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg';
};

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggle }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggle?.();
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 print:hidden shadow-sm`}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!isCollapsed && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            {APP_NAME}
          </h1>
        )}
        <button
          onClick={handleToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAVIGATION_ITEMS.map((item: NavItem) => {
          const isActive = location.pathname.startsWith(item.path) || (item.path === '/dashboard' && location.pathname === '/');
          const navLinkClasses = getActiveClasses(item.path, location.pathname);

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex items-center ${isCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3'} rounded-xl transition-all duration-200 group relative ${navLinkClasses}`}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              
              {!isCollapsed && (
                <>
                  <span className="font-medium text-sm truncate">{item.name}</span>
                  {item.isNew && (
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                      isActive ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-700'
                    }`}>
                      New
                    </span>
                  )}
                </>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                  {item.isNew && <span className="ml-1 text-primary-300">New</span>}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            &copy; {new Date().getFullYear()} {APP_NAME}
          </p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;