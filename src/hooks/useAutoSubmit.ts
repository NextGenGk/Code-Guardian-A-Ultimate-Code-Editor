
import { useEffect, useRef } from 'react';

interface UseAutoSubmitProps {
  code: string;
  onSubmit: () => void;
  isEnabled?: boolean;
}

export const useAutoSubmit = ({ code, onSubmit, isEnabled = true }: UseAutoSubmitProps) => {
  const lastSubmitTime = useRef<number>(0);
  const submitTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isEnabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User is switching away from the tab
        const now = Date.now();
        const timeSinceLastSubmit = now - lastSubmitTime.current;
        
        // Debounce: only submit if it's been more than 2 seconds since last submit
        if (timeSinceLastSubmit > 2000 && code.trim()) {
          // Clear any pending timeout
          if (submitTimeoutRef.current) {
            clearTimeout(submitTimeoutRef.current);
          }
          
          // Submit immediately when switching tabs
          onSubmit();
          lastSubmitTime.current = now;
          console.log('Auto-submitted code due to tab switch');
        }
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (code.trim()) {
        // Attempt to submit before page unload
        onSubmit();
        console.log('Auto-submitted code before page unload');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, [code, onSubmit, isEnabled]);
};
