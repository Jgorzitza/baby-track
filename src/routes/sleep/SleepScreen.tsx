import { useState, useEffect } from 'react';
import { Play, Square, History, ChevronRight } from 'lucide-react';

const STORAGE_KEY = 'bbtrack_active_sleep';

interface SavedSleepState {
  isAsleep: boolean;
  startTime: string | null;
}

const getInitialSleepState = (): { isAsleep: boolean; startTime: Date | null; elapsed: number } => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const state: SavedSleepState = JSON.parse(saved);
    if (state.isAsleep && state.startTime) {
      const start = new Date(state.startTime);
      return {
        isAsleep: true,
        startTime: start,
        elapsed: Math.floor((new Date().getTime() - start.getTime()) / 1000)
      };
    }
  }
  return { isAsleep: false, startTime: null, elapsed: 0 };
};

export const SleepScreen = () => {
  const initialState = getInitialSleepState();
  const [isAsleep, setIsAsleep] = useState(initialState.isAsleep);
  const [startTime, setStartTime] = useState<Date | null>(initialState.startTime);
  const [elapsed, setElapsed] = useState(initialState.elapsed);

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
        setElapsed(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAsleep, startTime]);

  const toggleSleep = () => {
    if (isAsleep) {
      setIsAsleep(false);
      setStartTime(null);
      setElapsed(0);
      localStorage.removeItem(STORAGE_KEY);
    } else {
      setIsAsleep(true);
      const now = new Date();
      setStartTime(now);
      setElapsed(0);
    }
  };

  const formatElapsed = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + 'h ' : ''}${mins}m ${secs}s`;
  };

  return (
    <div className="sleep-screen">
      <div className="card text-center" style={{ padding: '2rem 1rem' }}>
        <div 
          className={`btn btn-icon ${isAsleep ? 'btn-primary' : 'btn-secondary'}`}
          style={{ width: 120, height: 120, margin: '0 auto 1.5rem auto' }}
          onClick={toggleSleep}
        >
          {isAsleep ? <Square size={48} /> : <Play size={48} />}
        </div>
        
        <h2>{isAsleep ? 'Leo is Asleep' : 'Leo is Awake'}</h2>
        {isAsleep && startTime && (
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              {formatElapsed(elapsed)}
            </div>
            <p className="text-muted text-sm">Started at {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        )}
        
        {!isAsleep && (
          <button className="btn btn-primary btn-block" style={{ marginTop: '1rem' }} onClick={toggleSleep}>
            Start Sleep Session
          </button>
        )}
      </div>

      <section style={{ marginTop: '1.5rem' }}>
        <div className="flex-row space-between">
          <h4>Last Sleep</h4>
          <span className="text-sm text-primary">View History</span>
        </div>
        <div className="card">
          <div className="flex-row space-between">
            <div className="flex-row">
              <History size={18} className="text-muted" />
              <div>
                <div className="font-bold">4h 30m</div>
                <div className="text-xs text-muted">12:30 AM - 5:00 AM</div>
              </div>
            </div>
            <ChevronRight size={20} className="text-muted" />
          </div>
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h4>Sleep Summary (Today)</h4>
        <div className="card">
          <div className="grid-2">
            <div>
              <div className="text-xs text-muted">Total Sleep</div>
              <div className="font-bold">8h 20m</div>
            </div>
            <div>
              <div className="text-xs text-muted">Day Sleep</div>
              <div className="font-bold">2h 15m</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
