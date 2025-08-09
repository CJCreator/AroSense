import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from './icons/SearchIcon';
import { Card } from './ui/Card';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'page' | 'member' | 'document' | 'prescription';
  path: string;
  icon: string;
}

interface GlobalSearchProps {
  className?: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Mock search data - replace with actual search service
  const searchData: SearchResult[] = [
    { id: '1', title: 'Family Profiles', subtitle: 'Manage family members', type: 'page', path: '/family-profiles', icon: '👥' },
    { id: '2', title: 'Emergency Info', subtitle: 'Critical medical information', type: 'page', path: '/emergency', icon: '🚨' },
    { id: '3', title: 'Wellness Tools', subtitle: 'Track vitals and activities', type: 'page', path: '/wellness', icon: '❤️' },
    { id: '4', title: 'Baby Care', subtitle: 'Child health tracking', type: 'page', path: '/baby-care', icon: '👶' },
    { id: '5', title: 'Women\'s Care', subtitle: 'Reproductive health', type: 'page', path: '/womens-care', icon: '♀️' },
    { id: '6', title: 'Documents', subtitle: 'Medical records', type: 'page', path: '/documents', icon: '📄' },
    { id: '7', title: 'Prescriptions', subtitle: 'Medication tracking', type: 'page', path: '/prescriptions', icon: '💊' },
  ];

  useEffect(() => {
    if (query.length > 1) {
      const filtered = searchData.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setSelectedIndex(-1);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search health data..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-80 overflow-y-auto">
          <div ref={resultsRef} className="py-2">
            {results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 ${
                  index === selectedIndex ? 'bg-primary-50' : ''
                }`}
              >
                <span className="text-xl">{result.icon}</span>
                <div>
                  <div className="font-medium text-gray-900">{result.title}</div>
                  <div className="text-sm text-gray-500">{result.subtitle}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};