import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useFeedingTimer } from './features/feed/useFeedingTimer';
import { useSleepTimer } from './features/sleep/useSleepTimer';
import { DoctorScreen } from './routes/doctor/DoctorScreen';
import { DoctorQuestionsScreen } from './routes/doctor/DoctorQuestionsScreen';
import { MedicalTimelineScreen } from './routes/medical-timeline/MedicalTimelineScreen';
import * as mockData from './lib/mockData';

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
  it('DoctorScreen handles no scheduled appointment gracefully', () => {
    // Temporarily empty mock appointments
    const original = [...mockData.mockAppointments];
    // Mutating for scenario testing
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

  it('MedicalTimelineScreen renders dense daily data', () => {
    wrap(<MedicalTimelineScreen />);
    expect(screen.getByText(/First Smile!/i)).toBeInTheDocument();
    // Diaper counts in dense day
    expect(screen.getAllByText(/Diaper:/i).length).toBeGreaterThan(3);
  });
});
