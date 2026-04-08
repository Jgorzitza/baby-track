import { useState, useEffect } from 'react';

const STORAGE_KEY = 'bbtrack_active_sleep';

interface SavedSleepState {
  isAsleep: boolean;
  startTime: string | null;
}

const getInitialSleepState = (): { isAsleep: boolean; startTime: Date | null; elapsed: number } => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const state: SavedSleepState = JSON.parse(saved);
      if (state.isAsleep && state.startTime) {
        const start = new Date(state.startTime);
        return {
          isAsleep: true,
          startTime: start,
          elapsed: Math.floor((new Date().getTime() - start.getTime()) / 1000)
        };
      }
    } catch {
      // Fallback
    }
  }
  return { isAsleep: false, startTime: null, elapsed: 0 };
};

export const useSleepTimer = () => {
  const [sleepState, setSleepState] = useState(getInitialSleepState);
  const { isAsleep, startTime, elapsed } = sleepState;

  // Save to localStorage
  useEffect(() => {
    const state: SavedSleepState = {
      isAsleep,
      startTime: startTime?.toISOString() || null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [isAsleep, startTime]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAsleep && startTime) {
      interval = setInterval(() => {
        setSleepState(prev => ({
          ...prev,
          elapsed: Math.floor((new Date().getTime() - (prev.startTime?.getTime() || Date.now())) / 1000)
        }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAsleep, startTime]);

  const toggleSleep = () => {
    if (isAsleep) {
      setSleepState({ isAsleep: false, startTime: null, elapsed: 0 });
      localStorage.removeItem(STORAGE_KEY);
    } else {
      setSleepState({ isAsleep: true, startTime: new Date(), elapsed: 0 });
    }
  };

  const formatElapsed = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + 'h ' : ''}${mins}m ${secs}s`;
  };

  return { isAsleep, startTime, elapsed, toggleSleep, formatElapsed };
};
