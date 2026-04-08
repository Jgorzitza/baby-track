import { ArrowLeft, Filter, Droplets, Moon, Baby, Heart, Calendar, LineChart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockFeeds, mockHealth, mockSleep, mockDiapers, mockAppointments } from '../../lib/mockData';
import { useState, useEffect } from 'react';
import { Skeleton } from '../../components/ui/Skeleton';

export const MedicalTimelineScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [now] = useState(() => new Date().toISOString());

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);
  
  // React Compiler handles memoization of this array.
  // We use the stable 'now' from state to satisfy purity rules.
  const allEvents = [
    ...mockFeeds.map(f => ({ 
      id: f.id, 
      timestamp: f.timestamp, 
      icon: <Droplets size={16} className="text-primary" />, 
      title: `Feed: ${f.feedType}`,
      notes: f.outcome ? `Outcome: ${f.outcome}` : undefined
    })),
    ...mockHealth.map(h => ({ 
      id: h.id, 
      timestamp: h.timestamp, 
      icon: h.healthType === 'growth' ? <LineChart size={16} className="text-success" /> : <Heart size={16} className="text-danger" />, 
      title: `${h.healthType.charAt(0).toUpperCase() + h.healthType.slice(1)}`,
      notes: h.medicationName ? `${h.medicationName} (${h.dosage})` : h.value ? `${h.value}${h.unit || ''}` : h.symptomName
    })),
    ...mockSleep.map(s => ({ 
      id: s.id, 
      timestamp: s.startTime, 
      icon: <Moon size={16} className="text-primary-dark" />, 
      title: 'Sleep',
      notes: s.duration ? `${Math.floor(s.duration / 3600)}h ${Math.floor((s.duration % 3600) / 60)}m` : 'In progress'
    })),
    ...mockDiapers.map(d => ({ 
      id: d.id, 
      timestamp: d.timestamp, 
      icon: <Baby size={16} className="text-success" />, 
      title: `Diaper: ${d.diaperType}`,
      notes: d.stoolColor ? `${d.stoolColor}, ${d.stoolConsistency}` : undefined
    })),
    ...mockAppointments.map(a => ({
      id: a.id,
      timestamp: a.dateTime,
      icon: <Calendar size={16} className="text-warning" />,
      title: `Appointment: ${a.provider}`,
      notes: a.notes
    })),
    {
      id: 'note-1',
      timestamp: now,
      icon: <Star size={16} className="text-accent" />,
      title: 'First Smile!',
      notes: 'Captured on camera today!'
    }
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (isLoading) {
    return (
      <div className="medical-timeline-screen">
        <Skeleton width="60%" height="1.5rem" style={{ marginBottom: '2rem' }} />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-row" style={{ marginBottom: '1rem', alignItems: 'flex-start' }}>
            <Skeleton width={36} height={36} borderRadius="50%" style={{ marginRight: '1rem' }} />
            <Skeleton height={80} style={{ flex: 1 }} />
          </div>
        ))}
      </div>
    );
  }

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
              {event.notes && <p className="text-xs" style={{ marginTop: '0.5rem', marginBottom: 0, color: 'var(--text)' }}>{event.notes}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
