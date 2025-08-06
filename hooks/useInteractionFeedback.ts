import { useState, useCallback } from 'react';
import { useToast } from '../components/ui/Toast';

interface FeedbackOptions {
  success?: string;
  error?: string;
  loading?: string;
  duration?: number;
}

export const useInteractionFeedback = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const withFeedback = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: FeedbackOptions = {}
  ): Promise<T | null> => {
    const {
      success = 'Action completed successfully',
      error = 'Something went wrong',
      loading = 'Processing...',
      duration = 3000
    } = options;

    setIsLoading(true);
    
    if (loading) {
      showToast(loading, 'info', 1000);
    }

    try {
      const result = await asyncFn();
      
      if (success) {
        showToast(success, 'success', duration);
      }
      
      return result;
    } catch (err) {
      console.error('Action failed:', err);
      showToast(error, 'error', duration);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const showSuccess = useCallback((message: string, duration = 3000) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message: string, duration = 3000) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showInfo = useCallback((message: string, duration = 3000) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  return {
    isLoading,
    withFeedback,
    showSuccess,
    showError,
    showInfo
  };
};

// Micro-interaction animations
export const useAnimations = () => {
  const bounceIn = 'animate-bounce-in';
  const fadeIn = 'animate-fade-in';
  const slideUp = 'animate-slide-up';
  const pulse = 'animate-pulse';
  const spin = 'animate-spin';

  return {
    bounceIn,
    fadeIn,
    slideUp,
    pulse,
    spin
  };
};