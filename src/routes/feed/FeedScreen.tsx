import { useState } from 'react';
import { useFeedingTimer } from '../../features/feed/useFeedingTimer';
import { Droplets, RotateCcw, Check, ChevronRight } from 'lucide-react';
import { FeedOutcome } from '../../lib/types';
import { useUnitPrefs } from '../../lib/useUnitPrefs';

export const FeedScreen = () => {
  const { activeSide, leftSeconds, rightSeconds, toggleSide, reset, formatTime, totalSeconds } = useFeedingTimer();
  const [outcome, setOutcome] = useState<FeedOutcome | ''>('');
  const [feedType, setFeedType] = useState<'breast' | 'bottle'>('breast');
  const { prefs } = useUnitPrefs();

  const outcomes: { label: string; value: FeedOutcome }[] = [
    { label: 'Good', value: 'good' },
    { label: 'Fair', value: 'fair' },
    { label: 'Poor', value: 'poor' },
    { label: 'Latch Issue', value: 'latch_issue' },
    { label: 'Sleepy', value: 'sleepy' },
    { label: 'Refused', value: 'refused' },
    { label: 'Spit-up', value: 'spit_up' },
  ];

  return (
    <div className="feed-screen">
      <div className="card">
        <div className="flex-row space-between" style={{ marginBottom: '1rem' }}>
          <div className="grid-2" style={{ flex: 1 }}>
            <button 
              className={`btn ${feedType === 'breast' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFeedType('breast')}
            >
              Breast
            </button>
            <button 
              className={`btn ${feedType === 'bottle' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFeedType('bottle')}
            >
              Bottle
            </button>
          </div>
        </div>

        {feedType === 'breast' ? (
          <>
            <div className="grid-2" style={{ margin: '1.5rem 0' }}>
              <button 
                className={`btn flex-col ${activeSide === 'left' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ height: 120 }}
                onClick={() => toggleSide('left')}
              >
                <span className="text-sm">Left Side</span>
                <span style={{ fontSize: '2rem', fontWeight: 700 }}>{formatTime(leftSeconds)}</span>
              </button>
              <button 
                className={`btn flex-col ${activeSide === 'right' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ height: 120 }}
                onClick={() => toggleSide('right')}
              >
                <span className="text-sm">Right Side</span>
                <span style={{ fontSize: '2rem', fontWeight: 700 }}>{formatTime(rightSeconds)}</span>
              </button>
            </div>

            <div className="flex-row space-between card" style={{ padding: '0.75rem' }}>
              <div className="flex-row text-muted">
                <RotateCcw size={18} onClick={reset} style={{ cursor: 'pointer' }} />
                <span>Reset</span>
              </div>
              <div className="font-bold">
                Total: {formatTime(totalSeconds)}
              </div>
            </div>
          </>
        ) : (
          <div className="form-group" style={{ margin: '1.5rem 0' }}>
            <label className="form-label">Amount ({prefs.volume})</label>
            <input type="number" className="form-control" placeholder="0" />
            <div className="grid-3" style={{ marginTop: '0.5rem' }}>
              <button className="btn btn-secondary text-sm" style={{ height: 40 }}>{prefs.volume === 'ml' ? '60' : '2'}</button>
              <button className="btn btn-secondary text-sm" style={{ height: 40 }}>{prefs.volume === 'ml' ? '90' : '3'}</button>
              <button className="btn btn-secondary text-sm" style={{ height: 40 }}>{prefs.volume === 'ml' ? '120' : '4'}</button>
            </div>
          </div>
        )}

        <section style={{ marginTop: '1.5rem' }}>
          <h4>Feed Outcome</h4>
          <div className="flex-row" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {outcomes.map(o => (
              <button 
                key={o.value}
                className={`btn text-sm ${outcome === o.value ? 'btn-primary' : 'btn-secondary'}`}
                style={{ whiteSpace: 'nowrap', minWidth: 'auto', height: 40 }}
                onClick={() => setOutcome(o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </section>

        <div style={{ marginTop: '1.5rem' }}>
          <button className="btn btn-success btn-block" style={{ height: 56 }}>
            <Check size={20} />
            <span>Finish Session</span>
          </button>
        </div>
      </div>

      <section style={{ marginTop: '1.5rem' }}>
        <div className="flex-row space-between">
          <h4>Recent History</h4>
          <ChevronRight size={20} className="text-muted" />
        </div>
        <div className="card">
          <div className="flex-row space-between text-sm">
            <div className="flex-row">
              <Droplets size={16} className="text-primary" />
              <span>Breast - Both</span>
            </div>
            <span>1h 20m ago</span>
          </div>
          <div className="text-muted text-xs" style={{ marginTop: '4px' }}>
            L: 15m, R: 16m • Outcome: Good
          </div>
        </div>
      </section>
    </div>
  );
};
