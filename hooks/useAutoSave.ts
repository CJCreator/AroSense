import { useEffect, useRef, useState } from 'react';

interface UseAutoSaveOptions {
  key: string;
  delay?: number;
  onSave?: (data: any) => Promise<void>;
}

export const useAutoSave = <T>(data: T, options: UseAutoSaveOptions) => {
  const { key, delay = 2000, onSave } = options;
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Load saved data on mount
  const loadSavedData = (): T | null => {
    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  // Save data
  const saveData = async (dataToSave: T) => {
    setIsSaving(true);
    try {
      localStorage.setItem(`autosave_${key}`, JSON.stringify(dataToSave));
      if (onSave) await onSave(dataToSave);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Clear saved data
  const clearSavedData = () => {
    localStorage.removeItem(`autosave_${key}`);
    setLastSaved(null);
  };

  // Auto-save effect
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (data) saveData(data);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay]);

  return {
    isSaving,
    lastSaved,
    loadSavedData,
    clearSavedData,
    saveNow: () => saveData(data)
  };
};