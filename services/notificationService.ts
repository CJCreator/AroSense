// Simple notification service using browser notifications and localStorage
import { validateUserId, sanitizeForLog } from '../utils/securityUtils';

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

const getStorageKey = () => {
    const key = process.env.REACT_APP_NOTIFICATION_STORAGE_KEY;
    if (!key) {
        throw new Error('REACT_APP_NOTIFICATION_STORAGE_KEY environment variable is required');
    }
    return key;
};

const getNotifications = (userId: string): Notification[] => {
    try {
        const validatedUserId = validateUserId(userId);
        const stored = localStorage.getItem(getStorageKey());
        const all = stored ? JSON.parse(stored) : [];
        return all.filter((n: Notification) => n.userId === validatedUserId);
    } catch (error) {
        console.error('Failed to get notifications:', sanitizeForLog(error));
        return [];
    }
};

const saveNotifications = (notifications: Notification[]) => {
    try {
        const stored = localStorage.getItem(getStorageKey());
        const all = stored ? JSON.parse(stored) : [];
        const filtered = all.filter((n: Notification) => !notifications.find(nn => nn.id === n.id));
        localStorage.setItem(getStorageKey(), JSON.stringify([...filtered, ...notifications]));
    } catch (error) {
        console.error('Failed to save notifications:', sanitizeForLog(error));
    }
};

export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
    return Promise.resolve(getNotifications(userId));
};

export const addNotification = async (userId: string, notification: Omit<Notification, 'id' | 'userId' | 'isRead' | 'createdAt'>): Promise<Notification> => {
    if (!validateUserId(userId)) throw new Error("Invalid user ID");
    
    const newNotification: Notification = {
        ...notification,
        id: crypto.randomUUID(),
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