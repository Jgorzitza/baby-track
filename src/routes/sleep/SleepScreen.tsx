import { Play, Square, History, ChevronRight } from 'lucide-react';
import { useSleepTimer } from '../../features/sleep/useSleepTimer';

export const SleepScreen = () => {
  const { isAsleep, startTime, elapsed, toggleSleep, formatElapsed } = useSleepTimer();

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
