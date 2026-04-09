import { ArrowLeft, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../../lib/app-hooks';

export const MedicalTimelineScreen = () => {
  const navigate = useNavigate();
  const { timeline } = useTimeline();

  return (
    <div className="medical-timeline-screen">
      <div className="flex-row space-between" style={{ marginBottom: '1.5rem' }}>
        <div className="flex-row" style={{ cursor: 'pointer' }} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span className="font-bold">Medical Timeline</span>
        </div>
        <Filter size={20} className="text-muted" />
      </div>

      <div className="timeline-container">
        {timeline.map((event, index) => (
          <div key={event.id} className="flex-row" style={{ marginBottom: '1rem', alignItems: 'flex-start' }}>
            <div className="flex-col" style={{ alignItems: 'center', width: '48px' }}>
              <div className="btn btn-secondary btn-icon" style={{ width: 36, height: 36 }}>
                {event.title[0]}
              </div>
              {index < timeline.length - 1 && <div style={{ width: '2px', flex: 1, minHeight: '20px', backgroundColor: 'var(--border)', margin: '4px 0' }} />}
            </div>

            <div className="card" style={{ flex: 1, marginBottom: 0, padding: '0.875rem' }}>
              <div className="flex-row space-between">
                <span className="text-sm font-bold">{event.title}</span>
                <span className="text-xs text-muted">{new Date(event.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="text-xs text-muted" style={{ marginTop: '2px' }}>
                {new Date(event.occurredAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </div>
              {event.summary && <p className="text-xs" style={{ marginTop: '0.5rem', marginBottom: 0, color: 'var(--text)' }}>{event.summary}</p>}
            </div>
          </div>
        ))}

        {timeline.length === 0 && (
          <div className="card text-center">
            <p className="text-muted text-sm" style={{ margin: 0 }}>
              No medical events yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
