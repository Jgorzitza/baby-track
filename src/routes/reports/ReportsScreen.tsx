import { BarChart2, Calendar, ChevronRight, Droplets, Moon, Baby } from 'lucide-react';

export const ReportsScreen = () => {
  const timelineItems = [
    { id: 't1', date: 'Today, Apr 2', event: 'Fever 38.2°C', time: '7:00 AM', color: 'var(--danger)' },
    { id: 't2', date: 'Yesterday, Apr 1', event: 'Mustard Diaper (Soft)', time: '9:15 AM', color: 'var(--success)' },
    { id: 't3', date: 'Mar 30', event: '2-Week Checkup (Planned)', time: '10:00 AM', color: 'var(--primary)' },
    { id: 't4', date: 'Mar 28', event: 'Longest Sleep: 5h', time: '1:00 AM', color: '#8b5cf6' },
  ];

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
        <div className="flex-col">
          <div className="card">
            <div className="flex-row space-between">
              <div className="flex-row">
                <div className="btn btn-secondary btn-icon" style={{ backgroundColor: '#eef2ff' }}>
                  <Moon size={20} className="text-primary" />
                </div>
                <div>
                  <div className="font-bold">Sleep</div>
                  <div className="text-xs text-muted">14h 20m daily avg</div>
                </div>
              </div>
              <ChevronRight size={20} className="text-muted" />
            </div>
          </div>

          <div className="card">
            <div className="flex-row space-between">
              <div className="flex-row">
                <div className="btn btn-secondary btn-icon" style={{ backgroundColor: '#fff1f2' }}>
                  <Droplets size={20} className="text-danger" />
                </div>
                <div>
                  <div className="font-bold">Feeding</div>
                  <div className="text-xs text-muted">8.5 sessions daily avg</div>
                </div>
              </div>
              <ChevronRight size={20} className="text-muted" />
            </div>
          </div>

          <div className="card">
            <div className="flex-row space-between">
              <div className="flex-row">
                <div className="btn btn-secondary btn-icon" style={{ backgroundColor: '#f0fdf4' }}>
                  <Baby size={20} className="text-success" />
                </div>
                <div>
                  <div className="font-bold">Diapers</div>
                  <div className="text-xs text-muted">6.2 daily avg</div>
                </div>
              </div>
              <ChevronRight size={20} className="text-muted" />
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h4>Medical Timeline</h4>
        <div className="card" style={{ padding: '0' }}>
          {timelineItems.map((item, i, arr) => (
            <div key={item.id} className="flex-row" style={{ 
              padding: '1.25rem', 
              borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--border)' 
            }}>
              <div style={{ width: '4px', height: '40px', backgroundColor: item.color, borderRadius: '2px', marginRight: '1rem' }} />
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

      <div style={{ marginTop: '1rem' }}>
        <button className="btn btn-secondary btn-block">
          <BarChart2 size={20} />
          <span>Detailed Trends</span>
        </button>
      </div>
    </div>
  );
};
