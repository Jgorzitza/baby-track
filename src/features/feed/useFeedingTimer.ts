import { useState, useEffect } from 'react';

const STORAGE_KEY = 'bbtrack_active_feed';

interface SavedFeedState {
  activeSide: 'left' | 'right' | null;
  leftSecondsAccumulated: number;
  rightSecondsAccumulated: number;
  currentSideStartTime: number | null;
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
    leftSecondsAccumulated: 0, 
    rightSecondsAccumulated: 0, 
    currentSideStartTime: null,
    lastUpdated: 0, 
    history: [] 
  };

  if (saved) {
    try {
      const state = JSON.parse(saved);
      return {
        ...defaultState,
        ...state,
        history: Array.isArray(state.history) ? state.history : []
      };
    } catch {
      return defaultState;
    }
  }
  return defaultState;
};

export const useFeedingTimer = () => {
  const [timerState, setTimerState] = useState<SavedFeedState>(getInitialState);
  
  // Initialize display time directly from state to avoid synchronous set in effect
  const [displayTime, setDisplayTime] = useState(() => {
    const now = Date.now();
    let left = timerState.leftSecondsAccumulated;
    let right = timerState.rightSecondsAccumulated;
    if (timerState.activeSide === 'left' && timerState.currentSideStartTime) {
      left += Math.floor((now - timerState.currentSideStartTime) / 1000);
    } else if (timerState.activeSide === 'right' && timerState.currentSideStartTime) {
      right += Math.floor((now - timerState.currentSideStartTime) / 1000);
    }
    return { left, right };
  });
  
  const { activeSide, leftSecondsAccumulated, rightSecondsAccumulated, currentSideStartTime, history } = timerState;

  useEffect(() => {
    if (!activeSide) {
      // Sync on next tick to avoid eslint-react warning
      const handle = requestAnimationFrame(() => {
        setDisplayTime({ left: leftSecondsAccumulated, right: rightSecondsAccumulated });
      });
      return () => cancelAnimationFrame(handle);
    }

    const interval = setInterval(() => {
      const now = Date.now();
      let left = leftSecondsAccumulated;
      let right = rightSecondsAccumulated;

      if (activeSide === 'left' && currentSideStartTime) {
        left += Math.floor((now - currentSideStartTime) / 1000);
      } else if (activeSide === 'right' && currentSideStartTime) {
        right += Math.floor((now - currentSideStartTime) / 1000);
      }

      setDisplayTime({ left, right });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSide, leftSecondsAccumulated, rightSecondsAccumulated, currentSideStartTime]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timerState));
  }, [timerState]);

  const toggleSide = (side: 'left' | 'right') => {
    const timestamp = Date.now();
    
    setTimerState(prev => {
      let newLeftAccum = prev.leftSecondsAccumulated;
      let newRightAccum = prev.rightSecondsAccumulated;

      if (prev.activeSide === 'left' && prev.currentSideStartTime) {
        newLeftAccum += Math.floor((timestamp - prev.currentSideStartTime) / 1000);
      } else if (prev.activeSide === 'right' && prev.currentSideStartTime) {
        newRightAccum += Math.floor((timestamp - prev.currentSideStartTime) / 1000);
      }

      const newActiveSide = prev.activeSide === side ? null : side;

      return {
        ...prev,
        activeSide: newActiveSide,
        leftSecondsAccumulated: newLeftAccum,
        rightSecondsAccumulated: newRightAccum,
        currentSideStartTime: newActiveSide ? timestamp : null,
        lastUpdated: timestamp,
        history: [...prev.history, { 
          side: prev.activeSide, 
          timestamp, 
          leftSeconds: prev.leftSecondsAccumulated, 
          rightSeconds: prev.rightSecondsAccumulated 
        }].slice(-10)
      };
    });
  };

  const undo = () => {
    setTimerState(prev => {
      if (prev.history.length === 0) return prev;
      const last = prev.history[prev.history.length - 1];
      const timestamp = Date.now();
      return {
        ...prev,
        activeSide: last.side,
        leftSecondsAccumulated: last.leftSeconds,
        rightSecondsAccumulated: last.rightSeconds,
        currentSideStartTime: last.side ? timestamp : null,
        lastUpdated: timestamp,
        history: prev.history.slice(0, -1)
      };
    });
  };

  const reset = () => {
    const now = Date.now();
    const defaultState: SavedFeedState = { 
      activeSide: null, 
      leftSecondsAccumulated: 0, 
      rightSecondsAccumulated: 0, 
      currentSideStartTime: null,
      lastUpdated: now, 
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
    leftSeconds: displayTime.left,
    rightSeconds: displayTime.right,
    toggleSide,
    undo,
    reset,
    formatTime,
    totalSeconds: displayTime.left + displayTime.right,
    canUndo: history.length > 0
  };
};
