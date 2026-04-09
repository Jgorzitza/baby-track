import { useState } from 'react';
import { ArrowLeft, ArrowUpDown, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../../lib/app-hooks';
import type { MedicalTimelineEvent } from '../../lib/types';

const filterOptions: Array<{ label: string; value: MedicalTimelineEvent['eventType'] | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Feed', value: 'feed' },
  { label: 'Sleep', value: 'sleep' },
  { label: 'Diaper', value: 'diaper' },
  { label: 'Health', value: 'temperature' },
  { label: 'Meds', value: 'medication' },
  { label: 'Symptoms', value: 'symptom' },
  { label: 'Growth', value: 'growth' },
  { label: 'Doctor', value: 'appointment' },
];

export const MedicalTimelineScreen = () => {
  const navigate = useNavigate();
  const { timeline } = useTimeline();
  const [eventFilter, setEventFilter] = useState<MedicalTimelineEvent['eventType'] | 'all'>('all');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  const visibleTimeline = timeline
    .filter((event) => {
      if (eventFilter === 'all') {
        return true;
      }
      if (eventFilter === 'temperature' || eventFilter === 'medication') {
        return event.eventType === eventFilter;
      }
      return event.eventType === eventFilter;
    })
    .sort((left, right) =>
      sortDirection === 'desc'
        ? right.occurredAt.localeCompare(left.occurredAt)
        : left.occurredAt.localeCompare(right.occurredAt)
    );

  return (
    <div className="medical-timeline-screen">
      <div className="flex-row space-between" style={{ marginBottom: '1.5rem' }}>
        <div className="flex-row" style={{ cursor: 'pointer' }} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span className="font-bold">Medical Timeline</span>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-icon"
          style={{ width: 40, height: 40 }}
          onClick={() => setSortDirection((current) => (current === 'desc' ? 'asc' : 'desc'))}
        >
          <ArrowUpDown size={18} className="text-muted" />
        </button>
      </div>

      <section style={{ marginBottom: '1rem' }}>
        <div className="flex-row" style={{ gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          <div className="btn btn-secondary btn-icon" style={{ width: 36, height: 36, flexShrink: 0 }}>
            <Filter size={16} />
          </div>
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`btn text-xs ${eventFilter === option.value ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minHeight: 36, padding: '0 0.875rem', whiteSpace: 'nowrap' }}
              onClick={() => setEventFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <div className="timeline-container">
        {visibleTimeline.map((event, index) => (
          <div key={event.id} className="flex-row" style={{ marginBottom: '1rem', alignItems: 'flex-start' }}>
            <div className="flex-col" style={{ alignItems: 'center', width: '48px' }}>
              <div className="btn btn-secondary btn-icon" style={{ width: 36, height: 36 }}>
                {event.title[0]}
              </div>
              {index < visibleTimeline.length - 1 && <div style={{ width: '2px', flex: 1, minHeight: '20px', backgroundColor: 'var(--border)', margin: '4px 0' }} />}
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

        {visibleTimeline.length === 0 && (
          <div className="card text-center">
            <p className="text-muted text-sm" style={{ margin: 0 }}>
              No medical events for the selected filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
