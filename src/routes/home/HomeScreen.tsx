import { useNavigate } from 'react-router-dom';
import { Play, Droplets, Baby, Thermometer, Pill, Stethoscope, Moon } from 'lucide-react';
import { useFeedingTimer } from '../../features/feed/useFeedingTimer';
import { useSleepTimer } from '../../features/sleep/useSleepTimer';

export const HomeScreen = () => {
  const navigate = useNavigate();
  const { activeSide, formatTime: formatFeedTime, totalSeconds: feedSeconds } = useFeedingTimer();
  const { isAsleep, formatElapsed: formatSleepTime, elapsed: sleepSeconds } = useSleepTimer();

  return (
    <div className="home-screen">
      <div className="card">
        <div className="flex-row space-between">
          <div>
            <h3>Leo</h3>
            <p className="text-muted text-sm">2 weeks, 3 days old</p>
          </div>
          <div className="btn btn-secondary btn-icon">
            <Baby size={24} />
          </div>
        </div>
      </div>

      <section>
        <h4>Quick Actions</h4>
        <div className="grid-2">
          <button className={`btn btn-secondary flex-col ${isAsleep ? 'active-session-indicator' : ''}`} onClick={() => navigate('/sleep')}>
            <Play size={20} />
            <span>{isAsleep ? 'Sleep Active' : 'Start Sleep'}</span>
          </button>
          <button className="btn btn-secondary flex-col" onClick={() => navigate('/diaper')}>
            <Baby size={20} />
            <span>Wet Diaper</span>
          </button>
          <button className={`btn btn-secondary flex-col ${activeSide ? 'active-session-indicator' : ''}`} onClick={() => navigate('/feed')}>
            <Droplets size={20} />
            <span>{activeSide ? 'Feed Active' : 'Feed Breast'}</span>
          </button>
          <button className="btn btn-secondary flex-col" onClick={() => navigate('/feed')}>
            <Droplets size={20} />
            <span>Feed Bottle</span>
          </button>
          <button className="btn btn-secondary flex-col" onClick={() => navigate('/health')}>
            <Thermometer size={20} />
            <span>Temp</span>
          </button>
          <button className="btn btn-secondary flex-col" onClick={() => navigate('/health')}>
            <Pill size={20} />
            <span>Medication</span>
          </button>
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <div className="flex-row space-between">
          <h4>Active Sessions</h4>
          <span className="text-sm text-primary">View All</span>
        </div>
        
        <div className="flex-col" style={{ gap: '0.75rem' }}>
          {activeSide && (
            <div className="card active-session-indicator" style={{ borderLeft: '4px solid var(--primary)', marginBottom: 0 }} onClick={() => navigate('/feed')}>
              <div className="flex-row space-between">
                <div className="flex-row">
                  <Droplets size={18} className="text-primary" />
                  <span>Feeding ({activeSide.toUpperCase()})</span>
                </div>
                <span className="text-primary font-bold">{formatFeedTime(feedSeconds)}</span>
              </div>
            </div>
          )}

          {isAsleep && (
            <div className="card active-session-indicator" style={{ borderLeft: '4px solid var(--primary-dark)', marginBottom: 0 }} onClick={() => navigate('/sleep')}>
              <div className="flex-row space-between">
                <div className="flex-row">
                  <Moon size={18} className="text-primary-dark" />
                  <span>Sleep Session</span>
                </div>
                <span className="text-primary-dark font-bold">{formatSleepTime(sleepSeconds)}</span>
              </div>
            </div>
          )}

          {!activeSide && !isAsleep && (
            <div className="card text-center" style={{ padding: '1rem' }}>
              <p className="text-muted text-sm" style={{ margin: 0 }}>No active timers</p>
            </div>
          )}
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h4>Today's Summary</h4>
        <div className="grid-3">
          <div className="card text-center" style={{ padding: '0.75rem' }} onClick={() => navigate('/reports')}>
            <span className="text-muted text-xs block">Sleep</span>
            <div className="font-bold">8h 20m</div>
          </div>
          <div className="card text-center" style={{ padding: '0.75rem' }} onClick={() => navigate('/reports')}>
            <span className="text-muted text-xs block">Feeds</span>
            <div className="font-bold">6</div>
          </div>
          <div className="card text-center" style={{ padding: '0.75rem' }} onClick={() => navigate('/reports')}>
            <span className="text-muted text-xs block">Diapers</span>
            <div className="font-bold">5</div>
          </div>
        </div>
      </section>

      <div style={{ marginTop: '1rem' }}>
        <button className="btn btn-primary btn-block" onClick={() => navigate('/doctor')}>
          <Stethoscope size={20} />
          <span>Doctor Appointment Mode</span>
        </button>
      </div>
    </div>
  );
};
