import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'bbtrack_active_feed';

interface SavedFeedState {
  activeSide: 'left' | 'right' | null;
  leftSeconds: number;
  rightSeconds: number;
  lastUpdated: number;
}

const getInitialState = (): SavedFeedState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const state: SavedFeedState = JSON.parse(saved);
    const now = Date.now();
    const diff = Math.floor((now - state.lastUpdated) / 1000);
    
    if (state.activeSide === 'left') {
      return { ...state, leftSeconds: state.leftSeconds + diff };
    } else if (state.activeSide === 'right') {
      return { ...state, rightSeconds: state.rightSeconds + diff };
    }
    return state;
  }
  return { activeSide: null, leftSeconds: 0, rightSeconds: 0, lastUpdated: 0 };
};

export const useFeedingTimer = () => {
  const initialState = getInitialState();
  const [activeSide, setActiveSide] = useState<'left' | 'right' | null>(initialState.activeSide);
  const [leftSeconds, setLeftSeconds] = useState(initialState.leftSeconds);
  const [rightSeconds, setRightSeconds] = useState(initialState.rightSeconds);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Save to localStorage whenever state changes
  useEffect(() => {
    const state: SavedFeedState = {
      activeSide,
      leftSeconds,
      rightSeconds,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [activeSide, leftSeconds, rightSeconds]);

  useEffect(() => {
    if (activeSide) {
      timerRef.current = setInterval(() => {
        if (activeSide === 'left') setLeftSeconds(s => s + 1);
        if (activeSide === 'right') setRightSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSide]);

  const toggleSide = (side: 'left' | 'right') => {
    if (activeSide === side) {
      setActiveSide(null);
    } else {
      setActiveSide(side);
    }
  };

  const reset = () => {
    setActiveSide(null);
    setLeftSeconds(0);
    setRightSeconds(0);
    localStorage.removeItem(STORAGE_KEY);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    activeSide,
    leftSeconds,
    rightSeconds,
    toggleSide,
    reset,
    formatTime,
    totalSeconds: leftSeconds + rightSeconds
  };
};
