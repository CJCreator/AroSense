import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/ui/Toast';

interface HealthReminder {
  id: string;
  title: string;
  message: string;
  type: 'medication' | 'appointment' | 'vitals' | 'exercise' | 'hydration';
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  time: string;
  enabled: boolean;
  lastTriggered?: Date;
  nextDue: Date;
}

export const useHealthReminders = () => {
  const [reminders, setReminders] = useState<HealthReminder[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const { showToast } = useToast();

  useEffect(() => {
    // Load reminders from localStorage
    const savedReminders = localStorage.getItem('arosense_health_reminders');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Set up reminder checking interval
    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    }
    return false;
  };

  const addReminder = useCallback((reminder: Omit<HealthReminder, 'id' | 'nextDue'>) => {
    const newReminder: HealthReminder = {
      ...reminder,
      id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nextDue: calculateNextDue(reminder.frequency, reminder.time)
    };

    setReminders(prev => {
      const updated = [...prev, newReminder];
      localStorage.setItem('arosense_health_reminders', JSON.stringify(updated));
      return updated;
    });

    showToast(`${reminder.title} reminder added!`, 'success');
    return newReminder.id;
  }, [showToast]);

  const updateReminder = useCallback((id: string, updates: Partial<HealthReminder>) => {
    setReminders(prev => {
      const updated = prev.map(reminder => 
        reminder.id === id 
          ? { 
              ...reminder, 
              ...updates,
              nextDue: updates.frequency || updates.time 
                ? calculateNextDue(updates.frequency || reminder.frequency, updates.time || reminder.time)
                : reminder.nextDue
            }
          : reminder
      );
      localStorage.setItem('arosense_health_reminders', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders(prev => {
      const updated = prev.filter(reminder => reminder.id !== id);
      localStorage.setItem('arosense_health_reminders', JSON.stringify(updated));
      return updated;
    });
    showToast('Reminder deleted', 'info');
  }, [showToast]);

  const checkReminders = useCallback(() => {
    const now = new Date();
    
    reminders.forEach(reminder => {
      if (reminder.enabled && reminder.nextDue <= now) {
        triggerReminder(reminder);
        
        // Update next due date
        updateReminder(reminder.id, {
          lastTriggered: now,
          nextDue: calculateNextDue(reminder.frequency, reminder.time)
        });
      }
    });
  }, [reminders, updateReminder]);

  const triggerReminder = (reminder: HealthReminder) => {
    // Show toast notification
    showToast(reminder.message, 'info', 5000);

    // Show browser notification if permission granted
    if (notificationPermission === 'granted') {
      new Notification(reminder.title, {
        body: reminder.message,
        icon: '/favicon.ico',
        tag: reminder.id
      });
    }

    // Play notification sound (optional)
    if ('Audio' in window) {
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore audio play errors
        });
      } catch (error) {
        // Ignore audio errors
      }
    }
  };

  const calculateNextDue = (frequency: HealthReminder['frequency'], time: string): Date => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    const nextDue = new Date();
    nextDue.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, set for tomorrow
    if (nextDue <= now) {
      nextDue.setDate(nextDue.getDate() + 1);
    }
    
    switch (frequency) {
      case 'weekly':
        nextDue.setDate(nextDue.getDate() + 7);
        break;
      case 'monthly':
        nextDue.setMonth(nextDue.getMonth() + 1);
        break;
      case 'daily':
      default:
        // Already set for next occurrence
        break;
    }
    
    return nextDue;
  };

  const getUpcomingReminders = (limit = 5) => {
    return reminders
      .filter(r => r.enabled)
      .sort((a, b) => a.nextDue.getTime() - b.nextDue.getTime())
      .slice(0, limit);
  };

  const getRemindersByType = (type: HealthReminder['type']) => {
    return reminders.filter(r => r.type === type);
  };

  return {
    reminders,
    notificationPermission,
    requestNotificationPermission,
    addReminder,
    updateReminder,
    deleteReminder,
    getUpcomingReminders,
    getRemindersByType,
    checkReminders
  };
};