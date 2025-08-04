import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx'; // Import useAuth to get current user

function useLocalStorage<T>(
    keySuffix: string, 
    initialValue: T, 
    scopeToUser: boolean = true // Default to scoping keys to user
): [T, React.Dispatch<React.SetStateAction<T>>] {
    
    const auth = useAuth();
    const userId = auth.currentUser?.id;

    // Determine the actual key based on whether it should be user-scoped
    const getDynamicKey = () => {
        return scopeToUser && userId ? `${userId}_${keySuffix}` : keySuffix;
    };
    
    const [storedValue, setStoredValue] = useState<T>(() => {
        // Initial load needs to use the key that might become dynamic AFTER auth context loads.
        // So, we defer the key generation until we have userId or know it's not needed.
        // For initial render before auth context is ready, it might read a global key if scopeToUser is true but userId is not yet available.
        // This is generally okay if initialValue is a sensible default.
        const dynamicKey = getDynamicKey();
        try {
            const item = window.localStorage.getItem(dynamicKey);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error("Error reading from localStorage:", dynamicKey, error);
            return initialValue;
        }
    });

    // Effect to re-initialize storedValue if userId changes (e.g., on login/logout)
    // and the key is user-scoped.
    useEffect(() => {
        if (scopeToUser) { // Only re-evaluate if the key is user-scoped
            const dynamicKey = getDynamicKey();
            try {
                const item = window.localStorage.getItem(dynamicKey);
                const newValue = item ? JSON.parse(item) : initialValue;
                setStoredValue(newValue);
            } catch (error) {
                console.error("Error re-reading from localStorage on auth change:", dynamicKey, error);
                setStoredValue(initialValue);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, keySuffix, scopeToUser]); // initialValue is not needed here as it's a fallback

    const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
        const dynamicKey = getDynamicKey();
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(dynamicKey, JSON.stringify(valueToStore));
        } catch (error) {
            console.error("Error writing to localStorage:", dynamicKey, error);
        }
    };
    
    return [storedValue, setValue];
}

export default useLocalStorage;