import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFeedingTimer } from './features/feed/useFeedingTimer';
import { useSleepTimer } from './features/sleep/useSleepTimer';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Core Business Logic: Timers & Persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-08T12:00:00Z'));
  });

  describe('useFeedingTimer', () => {
    it('should start and toggle sides correctly', () => {
      const { result } = renderHook(() => useFeedingTimer());
      
      act(() => { result.current.toggleSide('left'); });
      expect(result.current.activeSide).toBe('left');

      act(() => { vi.advanceTimersByTime(5000); });
      expect(result.current.leftSeconds).toBe(5);

      act(() => { result.current.toggleSide('right'); });
      expect(result.current.activeSide).toBe('right');
      expect(result.current.leftSeconds).toBe(5);
    });

    it('should persist state to localStorage', () => {
      const { result, rerender } = renderHook(() => useFeedingTimer());
      
      act(() => { 
        result.current.toggleSide('left');
      });
      
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      rerender();

      const saved = JSON.parse(window.localStorage.getItem('bbtrack_active_feed') || '{}');
      expect(saved.activeSide).toBe('left');
      expect(saved.leftSeconds).toBe(10);
    });
  });

  describe('useSleepTimer', () => {
    it('should toggle sleep state', () => {
      const { result } = renderHook(() => useSleepTimer());
      
      act(() => { result.current.toggleSleep(); });
      expect(result.current.isAsleep).toBe(true);
      expect(result.current.startTime).not.toBeNull();
    });

    it('should resume session from localStorage', () => {
      const startTime = new Date(Date.now() - 5000).toISOString();
      window.localStorage.setItem('bbtrack_active_sleep', JSON.stringify({
        isAsleep: true,
        startTime
      }));

      const { result } = renderHook(() => useSleepTimer());
      expect(result.current.isAsleep).toBe(true);
      expect(result.current.elapsed).toBeGreaterThanOrEqual(5);
    });
  });
});
