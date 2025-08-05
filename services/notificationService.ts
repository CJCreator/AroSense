// Simple notification service using browser notifications and localStorage
import { validateUserId } from '../utils/securityUtils';

interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'reminder' | 'alert' | 'info';
    scheduledFor: string;
    isRead: boolean;
    createdAt: string;
}

const STORAGE_KEY = 'arosense_notifications';

const getNotifications = (userId: string): Notification[] => {
    if (!validateUserId(userId)) return [];
    
    const stored = localStorage.getItem(STORAGE_KEY);
    const all = stored ? JSON.parse(stored) : [];
    return all.filter((n: Notification) => n.userId === userId);
};

const saveNotifications = (notifications: Notification[]) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const all = stored ? JSON.parse(stored) : [];
    const filtered = all.filter((n: Notification) => !notifications.find(nn => nn.id === n.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...filtered, ...notifications]));
};

export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
    return Promise.resolve(getNotifications(userId));
};

export const addNotification = async (userId: string, notification: Omit<Notification, 'id' | 'userId' | 'isRead' | 'createdAt'>): Promise<Notification> => {
    if (!validateUserId(userId)) throw new Error("Invalid user ID");
    
    const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        userId,
        isRead: false,
        createdAt: new Date().toISOString()
    };
    
    const existing = getNotifications(userId);
    saveNotifications([...existing, newNotification]);
    
    return newNotification;
};

export const markAsRead = async (userId: string, notificationId: string): Promise<void> => {
    if (!validateUserId(userId)) throw new Error("Invalid user ID");
    
    const notifications = getNotifications(userId);
    const updated = notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
    );
    saveNotifications(updated);
};

export const scheduleReminder = async (userId: string, title: string, message: string, scheduledFor: string): Promise<Notification> => {
    return addNotification(userId, {
        title,
        message,
        type: 'reminder',
        scheduledFor
    });
};