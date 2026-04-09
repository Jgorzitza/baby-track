import { Play, Square, History, ChevronRight } from 'lucide-react';
import { useSleepTimer } from '../../features/sleep/useSleepTimer';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../lib/app-hooks';
import { formatElapsedClock } from '../../lib/time';

export const SleepScreen = () => {
  const navigate = useNavigate();
  const { timeline, homeSummary, baby } = useAppContext();
  const { isAsleep, startTime, elapsed, toggleSleep, formatElapsed } = useSleepTimer();
  const lastSleep = timeline.find((event) => event.eventType === 'sleep');
  const babyName = baby?.name ?? 'Baby';

  return (
    <div className="sleep-screen">
      <div className="card text-center" style={{ padding: '2rem 1rem' }}>
        <div 
          className={`btn btn-icon ${isAsleep ? 'btn-primary' : 'btn-secondary'}`}
          style={{ width: 120, height: 120, margin: '0 auto 1.5rem auto' }}
          onClick={() => void toggleSleep()}
        >
          {isAsleep ? <Square size={48} /> : <Play size={48} />}
        </div>
        
        <h2>{isAsleep ? `${babyName} is Asleep` : `${babyName} is Awake`}</h2>
        {isAsleep && startTime && (
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              {formatElapsed(elapsed)}
            </div>
            <p className="text-muted text-sm">Started at {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        )}
        
        {!isAsleep && (
          <button className="btn btn-primary btn-block" style={{ marginTop: '1rem' }} onClick={() => void toggleSleep()}>
            Start Sleep Session
          </button>
        )}
      </div>

      <section style={{ marginTop: '1.5rem' }}>
        <div className="flex-row space-between" onClick={() => navigate('/timeline')} style={{ cursor: 'pointer' }}>
          <h4>Last Sleep</h4>
          <span className="text-sm text-primary">View History</span>
        </div>
        <div className="card">
          <div className="flex-row space-between">
            <div className="flex-row">
              <History size={18} className="text-muted" />
              <div>
                <div className="font-bold">{lastSleep?.summary ?? 'No sleep logged yet'}</div>
                <div className="text-xs text-muted">
                  {lastSleep ? new Date(lastSleep.occurredAt).toLocaleString() : 'Start a sleep session to track history'}
                </div>
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
              <div className="font-bold">{formatElapsedClock(homeSummary.todaySleepSeconds)}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Current Session</div>
              <div className="font-bold">{isAsleep ? formatElapsed(elapsed) : 'None'}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
