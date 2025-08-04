import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom'; // Added Link
import { NAVIGATION_ITEMS } from '../constants.tsx';
import SearchIcon from './icons/SearchIcon.tsx';
import BellIcon from './icons/BellIcon.tsx';
import UserCircleIcon from './icons/UserCircleIcon.tsx';
import ChevronDownIcon from './icons/ChevronDownIcon.tsx';
import { useAuth } from '../contexts/AuthContext.tsx'; // Import useAuth

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, isAuthenticated } = useAuth(); // Get auth context
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getCurrentPageName = () => {
    const currentNavItem = NAVIGATION_ITEMS.find(item => location.pathname.startsWith(item.path));
     if (location.pathname === '/' || location.pathname === '/dashboard') return 'Dashboard';
    return currentNavItem ? currentNavItem.name : 'AroSense'; 
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/login'); // Redirect to login page after logout
  };


  return (
    <header className="h-20 bg-surface shadow-sm flex items-center justify-between px-6 border-b border-slate-200 print:hidden">
      <div>
        <h2 className="text-xl font-semibold text-textPrimary">{getCurrentPageName()}</h2>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-textSecondary" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-textSecondary focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-all duration-150"
          />
        </div>

        <button className="p-2 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          <BellIcon className="h-6 w-6 text-textSecondary" />
          {/* Notification badge example */}
          {/* <span className="absolute top-0 right-0 block h-2 w-2 transform translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 ring-2 ring-white" /> */}
        </button>

        {isAuthenticated && currentUser && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary"
            >
              <UserCircleIcon className="h-8 w-8 text-textSecondary" />
              <span className="hidden md:inline text-sm font-medium text-textPrimary">{currentUser.user_metadata.name || 'User'}</span>
              <ChevronDownIcon className={`h-4 w-4 text-textSecondary transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                <Link to="/family-profiles" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-textPrimary hover:bg-slate-100">Your Profile</Link>
                <Link to="/settings" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-textPrimary hover:bg-slate-100">Settings</Link>
                <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-textPrimary hover:bg-slate-100">Sign out</button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;