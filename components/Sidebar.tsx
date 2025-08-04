import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAVIGATION_ITEMS, APP_NAME } from '../constants.tsx';
import { NavItem } from '../types.ts';

const getActiveClasses = (path: string, currentPath: string): string => {
  const baseActiveStyle = 'shadow-sm font-semibold'; // Added font-semibold for active items
  const isActuallyActive = currentPath.startsWith(path) || (path === '/dashboard' && currentPath === '/');

  if (!isActuallyActive) {
    return 'text-textSecondary hover:bg-primary-light hover:text-primary-dark';
  }

  switch (path) {
    case '/dashboard': // energetic-green (#8BC34A)
      return `bg-energetic-green text-textPrimary ${baseActiveStyle}`;
    case '/family-profiles': // inclusive-orange (#FF9800)
      return `bg-inclusive-orange text-textPrimary ${baseActiveStyle}`;
    case '/emergency': // urgent-red (#F44336)
      return `bg-urgent-red text-black ${baseActiveStyle}`;
    case '/documents': // trustworthy-blue (#2196F3)
      return `bg-trustworthy-blue text-black ${baseActiveStyle}`;
    case '/prescriptions': // therapeutic-purple (#9C27B0)
      return `bg-therapeutic-purple text-white ${baseActiveStyle}`;
    case '/insurance': // secure-dark-blue (#1976D2)
      return `bg-secure-dark-blue text-white ${baseActiveStyle}`;
    case '/financial': // brand-teal (#00BCD4)
      return `bg-brand-teal text-textPrimary ${baseActiveStyle}`;
    case '/wellness': // vibrant-yellow-green (#CDDC39)
      return `bg-vibrant-yellow-green text-textPrimary ${baseActiveStyle}`;
    case '/baby-care': // gentle-pastel-blue (#90CAF9)
      return `bg-gentle-pastel-blue text-textPrimary ${baseActiveStyle}`;
    case '/womens-care': // empowering-pink (#E91E63)
      return `bg-empowering-pink text-black ${baseActiveStyle}`;
    case '/pregnancy': // nurturing-peach (#FFAB91)
      return `bg-nurturing-peach text-textPrimary ${baseActiveStyle}`;
    case '/wellness-rewards': // reward-gold (#FFD700)
      return `bg-reward-gold text-textPrimary ${baseActiveStyle}`;
    case '/telehealth': // modern-teal (#00838F)
      return `bg-modern-teal text-black ${baseActiveStyle}`;
    case '/community': // engaging-magenta (#E040FB)
      return `bg-engaging-magenta text-textPrimary ${baseActiveStyle}`;
    case '/settings': // sophisticated-grey (#757575)
      return `bg-sophisticated-grey text-white ${baseActiveStyle}`;
    default:
      // Fallback active style: primary bg (#06b6d4), text-textPrimary for contrast
      return `bg-primary text-textPrimary ${baseActiveStyle}`;
  }
};

const getActiveIconClasses = (path: string, currentPath: string): string => {
   const isActuallyActive = currentPath.startsWith(path) || (path === '/dashboard' && currentPath === '/');
   if (!isActuallyActive) {
    return 'text-slate-400 group-hover:text-primary-dark';
  }
  switch (path) {
    case '/dashboard': return 'text-textPrimary';
    case '/family-profiles': return 'text-textPrimary';
    case '/emergency': return 'text-black';
    case '/documents': return 'text-black';
    case '/prescriptions': return 'text-white';
    case '/insurance': return 'text-white';
    case '/financial': return 'text-textPrimary';
    case '/wellness': return 'text-textPrimary';
    case '/baby-care': return 'text-textPrimary';
    case '/womens-care': return 'text-black';
    case '/pregnancy': return 'text-textPrimary';
    case '/wellness-rewards': return 'text-textPrimary';
    case '/telehealth': return 'text-black';
    case '/community': return 'text-textPrimary';
    case '/settings': return 'text-white';
    default: return 'text-textPrimary'; // Fallback for general active icon (contrast with primary bg)
  }
};

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-surface text-textPrimary flex flex-col border-r border-slate-200 print:hidden">
      <div className="h-20 flex items-center justify-center border-b border-slate-200">
        <h1 className="text-2xl font-bold text-primary">{APP_NAME}</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAVIGATION_ITEMS.map((item: NavItem) => {
          const isActive = location.pathname.startsWith(item.path) || (item.path === '/dashboard' && location.pathname === '/');
          const navLinkClasses = getActiveClasses(item.path, location.pathname);
          const iconClasses = getActiveIconClasses(item.path, location.pathname);

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ease-in-out group ${navLinkClasses}`}
            >
              <item.icon className={`w-5 h-5 ${iconClasses}`} />
              <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.name}</span>
              {item.isNew && (
                <span 
                  className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/40 text-inherit' : 'bg-accent text-white' // Adjusted opacity for better visibility on colored bg
                  }`}
                >
                  New
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <p className="text-xs text-textSecondary text-center">&copy; {new Date().getFullYear()} {APP_NAME}</p>
      </div>
    </div>
  );
};

export default Sidebar;