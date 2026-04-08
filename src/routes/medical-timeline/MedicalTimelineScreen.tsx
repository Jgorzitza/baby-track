import { ArrowLeft, Filter, Droplets, Moon, Baby, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockFeeds, mockHealth, mockSleep, mockDiapers } from '../../lib/mockData';

export const MedicalTimelineScreen = () => {
  const navigate = useNavigate();
  
  const allEvents = [
    ...mockFeeds.map(f => ({ ...f, icon: <Droplets size={16} className="text-primary" />, title: `Feed: ${f.feedType}` })),
    ...mockHealth.map(h => ({ ...h, icon: <Heart size={16} className="text-danger" />, title: `Health: ${h.healthType}` })),
    ...mockSleep.map(s => ({ ...s, icon: <Moon size={16} className="text-primary-dark" />, title: 'Sleep' })),
    ...mockDiapers.map(d => ({ ...d, icon: <Baby size={16} className="text-success" />, title: `Diaper: ${d.diaperType}` })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="medical-timeline-screen">
      <div className="flex-row space-between" style={{ marginBottom: '1.5rem' }}>
        <div className="flex-row" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span className="font-bold">Medical Timeline</span>
        </div>
        <Filter size={20} className="text-muted" />
      </div>

      <div className="timeline-container">
        {allEvents.map((event, i) => (
          <div key={event.id} className="flex-row" style={{ marginBottom: '1rem', alignItems: 'flex-start' }}>
            <div className="flex-col" style={{ alignItems: 'center', width: '48px' }}>
              <div className="btn btn-secondary btn-icon" style={{ width: 36, height: 36 }}>
                {event.icon}
              </div>
              {i < allEvents.length - 1 && (
                <div style={{ width: '2px', flex: 1, minHeight: '20px', backgroundColor: 'var(--border)', margin: '4px 0' }} />
              )}
            </div>
            
            <div className="card" style={{ flex: 1, marginBottom: 0, padding: '0.875rem' }}>
              <div className="flex-row space-between">
                <span className="text-sm font-bold">{event.title}</span>
                <span className="text-xs text-muted">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="text-xs text-muted" style={{ marginTop: '2px' }}>
                {new Date(event.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </div>
              {event.notes && <p className="text-xs" style={{ marginTop: '0.5rem', marginBottom: 0 }}>{event.notes}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
