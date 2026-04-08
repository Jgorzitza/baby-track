import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useFeedingTimer } from './features/feed/useFeedingTimer';
import { useSleepTimer } from './features/sleep/useSleepTimer';
import { DoctorScreen } from './routes/doctor/DoctorScreen';
import { DoctorQuestionsScreen } from './routes/doctor/DoctorQuestionsScreen';
import { MedicalTimelineScreen } from './routes/medical-timeline/MedicalTimelineScreen';
import { HomeScreen } from './routes/home/HomeScreen';
import * as mockData from './lib/mockData';
import { useKeyboardResilience } from './lib/useKeyboardResilience';

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

const wrap = (ui: React.ReactNode) => render(<BrowserRouter>{ui}</BrowserRouter>);

const KeyboardHarness = () => {
  useKeyboardResilience();
  return <div>keyboard-harness</div>;
};

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
      // We might need to wait for the interval tick
      expect(result.current.leftSeconds).toBe(5);

      act(() => { result.current.toggleSide('right'); });
      expect(result.current.activeSide).toBe('right');
      expect(result.current.leftSeconds).toBe(5);
    });

    it('should implement undo last action', () => {
      const { result } = renderHook(() => useFeedingTimer());
      
      act(() => { result.current.toggleSide('left'); });
      act(() => { vi.advanceTimersByTime(5000); });
      act(() => { result.current.toggleSide('left'); }); // Pause
      
      expect(result.current.activeSide).toBeNull();
      expect(result.current.leftSeconds).toBe(5);
      
      act(() => { result.current.undo(); });
      expect(result.current.activeSide).toBe('left');
      expect(result.current.leftSeconds).toBe(5);
    });
  });

  describe('useSleepTimer', () => {
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

describe('UI Scenario Verification', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.className = '';
  });

  it('HomeScreen shows an active feed session from persisted state', () => {
    vi.useFakeTimers();
    const mockTime = new Date('2026-04-08T12:00:00Z').getTime();
    vi.setSystemTime(mockTime);
    
    window.localStorage.setItem(
      'bbtrack_active_feed',
      JSON.stringify({
        activeSide: 'left',
        leftSecondsAccumulated: 30,
        rightSecondsAccumulated: 0,
        currentSideStartTime: mockTime - 5000, // Started 5s ago
        lastUpdated: mockTime - 5000,
        history: [],
      })
    );

    wrap(<HomeScreen />);
    
    // Fast-forward 1s to trigger any effects
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/Feed Active/i)).toBeInTheDocument();
    expect(screen.getByText(/Feeding \(LEFT\)/i)).toBeInTheDocument();
    // 30 accum + 5 initial drift + 1 advanced = 36
    expect(screen.getByText('00:36')).toBeInTheDocument();
  });

  it('HomeScreen shows an active sleep session from persisted state', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-08T12:00:00Z'));
    window.localStorage.setItem(
      'bbtrack_active_sleep',
      JSON.stringify({
        isAsleep: true,
        startTime: new Date(Date.now() - 300000).toISOString(),
      })
    );

    wrap(<HomeScreen />);
    act(() => {
      vi.advanceTimersByTime(900);
    });

    expect(screen.getByText(/Sleep Active/i)).toBeInTheDocument();
    expect(screen.getByText(/Sleep Session/i)).toBeInTheDocument();
  });

  it('DoctorScreen handles no scheduled appointment gracefully', () => {
    // Temporarily empty mock appointments
    const original = [...mockData.mockAppointments];
    mockData.mockAppointments.splice(0, mockData.mockAppointments.length);
    
    wrap(<DoctorScreen />);
    expect(screen.getByText(/No scheduled appointment/i)).toBeInTheDocument();
    
    // Restore
    mockData.mockAppointments.push(...original);
  });

  it('DoctorQuestionsScreen handles empty questions gracefully', () => {
    const original = [...mockData.mockAppointments];
    mockData.mockAppointments.splice(0, mockData.mockAppointments.length);

    wrap(<DoctorQuestionsScreen />);
    expect(screen.getByText(/No questions listed yet/i)).toBeInTheDocument();

    mockData.mockAppointments.push(...original);
  });

  it('DoctorQuestionsScreen renders the full long question list', () => {
    wrap(<DoctorQuestionsScreen />);

    for (const question of mockData.mockAppointments[0].questions) {
      expect(screen.getByText(question)).toBeInTheDocument();
    }
  });

  it('MedicalTimelineScreen renders dense daily data', () => {
    vi.useFakeTimers();
    wrap(<MedicalTimelineScreen />);
    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(screen.getByText(/First Smile!/i)).toBeInTheDocument();
    // Diaper counts in dense day
    expect(screen.getAllByText(/Diaper:/i).length).toBeGreaterThan(3);
  });

  it('applies keyboard resilience behavior for a mobile-sized viewport', () => {
    const listeners = new Set<() => void>();
    const scrollIntoViewMock = vi.fn();
    const visualViewportMock = {
      height: 844,
      addEventListener: vi.fn((event: string, handler: () => void) => {
        if (event === 'resize') listeners.add(handler);
      }),
      removeEventListener: vi.fn((event: string, handler: () => void) => {
        if (event === 'resize') listeners.delete(handler);
      }),
    };

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      writable: true,
      value: 844,
    });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: visualViewportMock,
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoViewMock,
    });

    render(<KeyboardHarness />);
    expect(document.body).not.toHaveClass('keyboard-open');

    act(() => {
      visualViewportMock.height = 500;
      listeners.forEach((listener) => listener());
    });

    expect(document.body).toHaveClass('keyboard-open');
    expect(scrollIntoViewMock).toHaveBeenCalled();

    act(() => {
      visualViewportMock.height = 844;
      listeners.forEach((listener) => listener());
    });

    expect(document.body).not.toHaveClass('keyboard-open');
  });
});
