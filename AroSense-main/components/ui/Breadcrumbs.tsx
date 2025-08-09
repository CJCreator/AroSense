import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  actions?: React.ReactNode;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '', actions }) => {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from current path if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/dashboard' }];
    
    const pathMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'family-profiles': 'Family Profiles',
      'emergency': 'Emergency Info',
      'documents': 'Documents',
      'prescriptions': 'Prescriptions',
      'wellness': 'Wellness Tools',
      'baby-care': 'Baby Care',
      'womens-care': "Women's Care",
      'pregnancy': 'Pregnancy Tracker',
      'settings': 'Settings',
    };
    
    pathSegments.forEach((segment, index) => {
      const label = pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      const href = index === pathSegments.length - 1 ? undefined : `/${pathSegments.slice(0, index + 1).join('/')}`;
      breadcrumbs.push({ label, href });
    });
    
    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            
            {item.href ? (
              <Link
                to={item.href}
                className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className="flex items-center space-x-1 text-gray-800 font-medium">
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
      {actions && <div className="flex items-center space-x-2">{actions}</div>}
    </div>
  );
};

export default Breadcrumbs;