import { BarChart2, Calendar, ChevronRight, Droplets, Moon, Baby, Heart, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Skeleton } from '../../components/ui/Skeleton';

export const ReportsScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const timelineItems = [
    { id: 't1', date: 'Today, Apr 2', event: 'Fever 38.2°C', time: '7:00 AM', color: 'var(--danger)' },
    { id: 't2', date: 'Yesterday, Apr 1', event: 'Mustard Diaper (Soft)', time: '9:15 AM', color: 'var(--success)' },
    { id: 't3', date: 'Mar 30', event: '2-Week Checkup (Planned)', time: '10:00 AM', color: 'var(--primary)' },
    { id: 't4', date: 'Mar 28', event: 'Longest Sleep: 5h', time: '1:00 AM', color: '#8b5cf6' },
  ];

  if (isLoading) {
    return (
      <div className="reports-screen">
        <Skeleton height={80} className="card" />
        <section>
          <Skeleton width="40%" height="1.25rem" style={{ marginBottom: '1rem' }} />
          <div className="flex-col" style={{ gap: '0.75rem' }}>
            <Skeleton height={64} className="card" style={{ marginBottom: 0 }} />
            <Skeleton height={64} className="card" style={{ marginBottom: 0 }} />
            <Skeleton height={64} className="card" style={{ marginBottom: 0 }} />
          </div>
        </section>
        <section style={{ marginTop: '1.5rem' }}>
          <Skeleton width="50%" height="1.25rem" style={{ marginBottom: '1rem' }} />
          <Skeleton height={160} className="card" />
        </section>
      </div>
    );
  }

  return (
    <div className="reports-screen">
      <div className="card" style={{ background: 'linear-gradient(135deg, #f8fbff, #e8f4ff)' }}>
        <div className="flex-row">
          <Calendar className="text-primary" size={24} />
          <div>
            <h3 style={{ marginBottom: 0 }}>Weekly Insights</h3>
            <p className="text-muted text-sm">March 27 - April 2, 2026</p>
          </div>
        </div>
      </div>

      <section>
        <h4>Activity Summaries</h4>
        <div className="flex-col" style={{ gap: '0.75rem' }}>
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="flex-row space-between">
              <div className="flex-row">
                <div className="btn btn-secondary btn-icon" style={{ backgroundColor: '#eef2ff', width: 40, height: 40 }}>
                  <Moon size={18} className="text-primary" />
                </div>
                <div>
                  <div className="font-bold text-sm">Sleep</div>
                  <div className="text-xs text-muted">14h 20m daily avg</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted" />
            </div>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <div className="flex-row space-between">
              <div className="flex-row">
                <div className="btn btn-secondary btn-icon" style={{ backgroundColor: '#fff1f2', width: 40, height: 40 }}>
                  <Droplets size={18} className="text-danger" />
                </div>
                <div>
                  <div className="font-bold text-sm">Feeding</div>
                  <div className="text-xs text-muted">8.5 sessions daily avg</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted" />
            </div>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <div className="flex-row space-between">
              <div className="flex-row">
                <div className="btn btn-secondary btn-icon" style={{ backgroundColor: '#f0fdf4', width: 40, height: 40 }}>
                  <Baby size={18} className="text-success" />
                </div>
                <div>
                  <div className="font-bold text-sm">Diapers</div>
                  <div className="text-xs text-muted">6.2 daily avg</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted" />
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h4>Health & Symptoms</h4>
        <div className="grid-2">
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="flex-row text-xs text-muted" style={{ marginBottom: '4px' }}>
              <Heart size={14} className="text-danger" /> <span>Medications</span>
            </div>
            <div className="font-bold">3 Doses</div>
            <div className="text-xs text-muted">Tylenol (Last: 7:15 AM)</div>
          </div>
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="flex-row text-xs text-muted" style={{ marginBottom: '4px' }}>
              <Activity size={14} className="text-warning" /> <span>Symptoms</span>
            </div>
            <div className="font-bold">2 Noted</div>
            <div className="text-xs text-muted">Fussy, Poor appetite</div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <div className="flex-row space-between" onClick={() => navigate('/timeline')}>
          <h4>Medical Timeline</h4>
          <span className="text-xs text-primary font-bold">View All</span>
        </div>
        <div className="card" style={{ padding: '0' }}>
          {timelineItems.map((item, i, arr) => (
            <div key={item.id} className="flex-row" style={{ 
              padding: '1rem', 
              borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--border)' 
            }}>
              <div style={{ width: '4px', height: '32px', backgroundColor: item.color, borderRadius: '2px', marginRight: '0.75rem' }} />
              <div style={{ flex: 1 }}>
                <div className="flex-row space-between">
                  <span className="text-xs text-muted font-bold">{item.date}</span>
                  <span className="text-xs text-muted">{item.time}</span>
                </div>
                <div className="text-sm font-bold" style={{ marginTop: '2px' }}>{item.event}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ marginTop: '1.5rem' }}>
        <button className="btn btn-secondary btn-block">
          <BarChart2 size={20} />
          <span>Detailed Trends</span>
        </button>
      </div>
    </div>
  );
};
