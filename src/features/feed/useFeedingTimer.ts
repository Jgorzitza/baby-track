import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'bbtrack_active_feed';

interface SavedFeedState {
  activeSide: 'left' | 'right' | null;
  leftSeconds: number;
  rightSeconds: number;
  lastUpdated: number;
  history: Array<{
    side: 'left' | 'right' | null;
    timestamp: number;
    leftSeconds: number;
    rightSeconds: number;
  }>;
}

const getInitialState = (): SavedFeedState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  const defaultState: SavedFeedState = { 
    activeSide: null, 
    leftSeconds: 0, 
    rightSeconds: 0, 
    lastUpdated: 0, 
    history: [] 
  };

  if (saved) {
    try {
      const state = JSON.parse(saved);
      const now = Date.now();
      const diff = Math.floor((now - (state.lastUpdated || now)) / 1000);
      
      // Merge with defaultState to handle missing fields (schema evolution)
      const merged: SavedFeedState = {
        ...defaultState,
        ...state,
        history: Array.isArray(state.history) ? state.history : []
      };

      if (merged.activeSide === 'left') {
        merged.leftSeconds += diff;
      } else if (merged.activeSide === 'right') {
        merged.rightSeconds += diff;
      }
      return merged;
    } catch {
      return defaultState;
    }
  }
  return defaultState;
};

export const useFeedingTimer = () => {
  // Use a lazy initializer for useState to avoid repeated getInitialState calls
  const [timerState, setTimerState] = useState<SavedFeedState>(getInitialState);
  
  const { activeSide, leftSeconds, rightSeconds, history } = timerState;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timerState));
  }, [timerState]);

  useEffect(() => {
    if (activeSide) {
      timerRef.current = setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          lastUpdated: Date.now(),
          leftSeconds: prev.activeSide === 'left' ? prev.leftSeconds + 1 : prev.leftSeconds,
          rightSeconds: prev.activeSide === 'right' ? prev.rightSeconds + 1 : prev.rightSeconds,
        }));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSide]);

  const toggleSide = (side: 'left' | 'right') => {
    setTimerState(prev => {
      const newActiveSide = prev.activeSide === side ? null : side;
      return {
        ...prev,
        activeSide: newActiveSide,
        lastUpdated: Date.now(),
        history: [...prev.history, { 
          side: prev.activeSide, 
          timestamp: Date.now(), 
          leftSeconds: prev.leftSeconds, 
          rightSeconds: prev.rightSeconds 
        }].slice(-10)
      };
    });
  };

  const undo = () => {
    setTimerState(prev => {
      if (prev.history.length === 0) return prev;
      const last = prev.history[prev.history.length - 1];
      return {
        ...prev,
        activeSide: last.side,
        leftSeconds: last.leftSeconds,
        rightSeconds: last.rightSeconds,
        lastUpdated: Date.now(),
        history: prev.history.slice(0, -1)
      };
    });
  };

  const reset = () => {
    const defaultState: SavedFeedState = { 
      activeSide: null, 
      leftSeconds: 0, 
      rightSeconds: 0, 
      lastUpdated: 0, 
      history: [] 
    };
    setTimerState(defaultState);
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
    undo,
    reset,
    formatTime,
    totalSeconds: leftSeconds + rightSeconds,
    canUndo: history.length > 0
  };
};
