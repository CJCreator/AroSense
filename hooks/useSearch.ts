import { useState, useEffect, useMemo } from 'react';

interface SearchOptions {
  keys?: string[];
  threshold?: number;
  caseSensitive?: boolean;
}

export const useSearch = <T>(
  data: T[],
  query: string,
  options: SearchOptions = {}
) => {
  const { keys = [], threshold = 0.3, caseSensitive = false } = options;
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchableData = useMemo(() => {
    if (!keys.length) return data;
    
    return data.map(item => ({
      ...item,
      _searchText: keys
        .map(key => getNestedValue(item, key))
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
    }));
  }, [data, keys]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(data);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    const searchTerm = caseSensitive ? query : query.toLowerCase();
    
    const filtered = searchableData.filter(item => {
      const searchText = caseSensitive 
        ? (item as any)._searchText || ''
        : ((item as any)._searchText || '').toLowerCase();
      
      return searchText.includes(searchTerm);
    });

    setResults(filtered);
    setIsSearching(false);
  }, [query, searchableData, caseSensitive]);

  return { results, isSearching };
};

const getNestedValue = (obj: any, path: string): string => {
  return path.split('.').reduce((current, key) => current?.[key], obj) || '';
};