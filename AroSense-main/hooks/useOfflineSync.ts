import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/ui/Toast';

interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const { showToast } = useToast();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Connection restored', 'success', 2000);
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('Working offline', 'info', 3000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending actions from localStorage
    loadPendingActions();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPendingActions = () => {
    try {
      const stored = localStorage.getItem('arosense_offline_actions');
      if (stored) {
        setPendingActions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load pending actions:', error);
    }
  };

  const savePendingActions = (actions: OfflineAction[]) => {
    try {
      localStorage.setItem('arosense_offline_actions', JSON.stringify(actions));
    } catch (error) {
      console.error('Failed to save pending actions:', error);
    }
  };

  const queueAction = useCallback((type: string, data: any) => {
    const action: OfflineAction = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    setPendingActions(prev => {
      const updated = [...prev, action];
      savePendingActions(updated);
      return updated;
    });

    if (!isOnline) {
      showToast('Action saved for when you\'re back online', 'info', 2000);
    }

    return action.id;
  }, [isOnline, showToast]);

  const syncPendingActions = useCallback(async () => {
    if (!isOnline || pendingActions.length === 0) return;

    const actionsToSync = [...pendingActions];
    
    for (const action of actionsToSync) {
      try {
        // Simulate API call - replace with actual sync logic
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Remove successful action
        setPendingActions(prev => {
          const updated = prev.filter(a => a.id !== action.id);
          savePendingActions(updated);
          return updated;
        });
        
      } catch (error) {
        // Increment retry count
        setPendingActions(prev => {
          const updated = prev.map(a => 
            a.id === action.id 
              ? { ...a, retryCount: a.retryCount + 1 }
              : a
          );
          savePendingActions(updated);
          return updated;
        });
        
        console.error(`Failed to sync action ${action.id}:`, error);
      }
    }

    if (actionsToSync.length > 0) {
      showToast(`Synced ${actionsToSync.length} offline actions`, 'success', 2000);
    }
  }, [isOnline, pendingActions, showToast]);

  const clearPendingActions = useCallback(() => {
    setPendingActions([]);
    localStorage.removeItem('arosense_offline_actions');
  }, []);

  // Cache data for offline access
  const cacheData = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(`arosense_cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }, []);

  const getCachedData = useCallback((key: string, maxAge = 24 * 60 * 60 * 1000) => {
    try {
      const cached = localStorage.getItem(`arosense_cache_${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < maxAge) {
          return data;
        }
      }
    } catch (error) {
      console.error('Failed to get cached data:', error);
    }
    return null;
  }, []);

  return {
    isOnline,
    pendingActions: pendingActions.length,
    queueAction,
    syncPendingActions,
    clearPendingActions,
    cacheData,
    getCachedData
  };
};