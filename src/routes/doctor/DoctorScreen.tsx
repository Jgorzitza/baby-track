import { useState } from 'react';
import {
  MapPin,
  ChevronRight,
  Droplets,
  Moon,
  Baby,
  Heart,
  ChevronDown,
  ChevronUp,
  Clock,
  ClipboardList,
  AlertCircle,
} from 'lucide-react';
import { useDoctorSummary } from '../../lib/app-hooks';
import { formatElapsedClock } from '../../lib/time';

export const DoctorScreen = () => {
  const { doctorSummary, doctorWindow, setDoctorWindow, saveDoctorAppointment, addDoctorNote } = useDoctorSummary();
  const [mode, setMode] = useState<'planning' | 'appointment'>('appointment');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [provider, setProvider] = useState(doctorSummary.appointment?.provider ?? '');
  const [scheduledAt, setScheduledAt] = useState(doctorSummary.appointment?.scheduledAt?.slice(0, 16) ?? '');
  const [location, setLocation] = useState(doctorSummary.appointment?.location ?? '');
  const [planningNotes, setPlanningNotes] = useState(doctorSummary.appointment?.planningNotes ?? '');
  const [quickNote, setQuickNote] = useState('');

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="doctor-screen">
      <div className="flex-row space-between" style={{ marginBottom: '1.25rem', gap: '0.5rem' }}>
        <button className={`btn text-xs ${mode === 'appointment' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('appointment')} style={{ flex: 1, minHeight: 40 }}>
          Doctor Mode
        </button>
        <button className={`btn text-xs ${mode === 'planning' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('planning')} style={{ flex: 1, minHeight: 40 }}>
          Planning
        </button>
      </div>

      {mode === 'appointment' ? (
        <div className="appointment-mode">
          {!doctorSummary.appointment && (
            <div className="card" style={{ backgroundColor: 'var(--bg-card)', borderStyle: 'dashed' }}>
              <div className="flex-row" style={{ color: 'var(--text-muted)' }}>
                <AlertCircle size={20} />
                <span className="text-sm">No scheduled appointment. Showing current cached summary.</span>
              </div>
            </div>
          )}

          <div className="flex-row" style={{ justifyContent: 'center', marginBottom: '1.5rem', gap: '0.5rem' }}>
            {(['24h', '48h', '7d'] as const).map((windowLabel) => (
              <button
                key={windowLabel}
                className={`btn text-xs ${doctorWindow === windowLabel ? 'btn-primary' : 'btn-secondary'}`}
                style={{ height: 32, padding: '0 1rem', borderRadius: '20px' }}
                onClick={() => void setDoctorWindow(windowLabel)}
              >
                {windowLabel}
              </button>
            ))}
          </div>

          <section>
            <div className="flex-row space-between" onClick={() => toggleSection('questions')} style={{ marginBottom: '0.75rem', cursor: 'pointer' }}>
              <h4>Parent Questions</h4>
              {expandedSection === 'questions' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            <div className="card" style={{ padding: expandedSection === 'questions' ? '1.25rem' : '0.75rem' }}>
              {expandedSection === 'questions' ? (
                <>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                    {doctorSummary.questions.length > 0 ? (
                      doctorSummary.questions.map((question) => (
                        <li key={question.id} className="text-sm" style={{ marginBottom: '0.75rem' }}>
                          {question.question}
                        </li>
                      ))
                    ) : (
                      <p className="text-sm text-muted">No questions listed.</p>
                    )}
                  </ul>
                  <div className="text-xs text-muted" style={{ marginTop: '1rem' }}>
                    Open the dedicated questions screen to add or remove items.
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted">{doctorSummary.questions.length} questions ready for review.</div>
              )}
            </div>
          </section>

          <section style={{ marginTop: '1.5rem' }}>
            <h4>{doctorWindow} Summary</h4>
            <div className="grid-2">
              {[
                {
                  id: 'feed-stats',
                  icon: <Droplets size={14} className="text-primary" />,
                  label: 'Feeding',
                  value: `${doctorSummary.feedSessionCount} Sessions`,
                  detail: `${doctorSummary.questions.length} questions saved`,
                },
                {
                  id: 'sleep-stats',
                  icon: <Moon size={14} className="text-primary" />,
                  label: 'Sleep',
                  value: formatElapsedClock(doctorSummary.sleepTotalSeconds),
                  detail: 'Tracked from completed sessions',
                },
                {
                  id: 'diaper-stats',
                  icon: <Baby size={14} className="text-primary" />,
                  label: 'Diapers',
                  value: `${doctorSummary.diaperCounts.wet + doctorSummary.diaperCounts.dirty + doctorSummary.diaperCounts.both} Total`,
                  detail: `${doctorSummary.diaperCounts.wet} Wet, ${doctorSummary.diaperCounts.dirty} Dirty`,
                },
                {
                  id: 'health-stats',
                  icon: <Heart size={14} className="text-danger" />,
                  label: 'Health',
                  value: `${doctorSummary.temperatures.length} Temps`,
                  detail: `${doctorSummary.medications.length} meds, ${doctorSummary.symptoms.length} symptoms`,
                },
              ].map((stat) => (
                <div key={stat.id} className="card" onClick={() => toggleSection(stat.id)} style={{ padding: '1rem', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                  <div className="flex-row text-xs text-muted" style={{ marginBottom: '4px' }}>
                    {stat.icon} <span>{stat.label}</span>
                  </div>
                  <div className="font-bold">{stat.value}</div>
                  <div className="text-xs text-muted">{stat.detail}</div>
                  {expandedSection === stat.id && (
                    <div className="text-xs text-muted" style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                      {stat.id === 'health-stats' && doctorSummary.temperatures[0] && <div>Latest temp: {doctorSummary.temperatures[0].value}{doctorSummary.temperatures[0].unit}</div>}
                      {stat.id === 'sleep-stats' && doctorSummary.timeline[0] && <div>Latest sleep event: {doctorSummary.timeline.find((item) => item.eventType === 'sleep')?.summary ?? 'None'}</div>}
                      {stat.id === 'feed-stats' && doctorSummary.timeline.find((item) => item.eventType === 'feed') && <div>Latest feed: {doctorSummary.timeline.find((item) => item.eventType === 'feed')?.summary}</div>}
                      {stat.id === 'diaper-stats' && doctorSummary.timeline.find((item) => item.eventType === 'diaper') && <div>Latest diaper: {doctorSummary.timeline.find((item) => item.eventType === 'diaper')?.summary ?? 'Logged'}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginTop: '1.5rem' }}>
            <div className="flex-row space-between">
              <h4>Live Timeline</h4>
              <Clock size={16} className="text-muted" />
            </div>
            <div className="card" style={{ padding: '0.5rem' }}>
              {doctorSummary.timeline.slice(0, 5).map((entry, index, list) => (
                <div
                  key={entry.id}
                  className="flex-row space-between"
                  style={{
                    padding: '0.875rem 0.5rem',
                    borderBottom: index === list.length - 1 ? 'none' : '1px solid var(--border)',
                  }}
                >
                  <div className="flex-row">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.eventType === 'temperature' ? 'var(--danger)' : 'var(--primary)' }} />
                    <div>
                      <div className="text-sm font-bold">{entry.title}</div>
                      <div className="text-xs text-muted">{new Date(entry.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                </div>
              ))}
            </div>
          </section>

          <div style={{ position: 'sticky', bottom: '1rem', zIndex: 10 }}>
            <div className="card" style={{ marginBottom: '0.75rem', padding: '0.75rem' }}>
              <div className="flex-row">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Quick note during visit..."
                  value={quickNote}
                  onChange={(event) => setQuickNote(event.target.value)}
                />
                <button
                  className="btn btn-success"
                  style={{ minWidth: 56 }}
                  onClick={() => {
                    if (quickNote.trim().length === 0) return;
                    void addDoctorNote(quickNote.trim()).then(() => setQuickNote(''));
                  }}
                >
                  +
                </button>
              </div>
            </div>
            <button className="btn btn-success btn-block" style={{ boxShadow: '0 8px 24px rgba(67, 160, 71, 0.3)' }}>
              <ClipboardList size={20} />
              <span>Quick Note during Visit</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="planning-mode">
          <div className="card">
            <div className="form-group">
              <label className="form-label">Provider Name</label>
              <input type="text" className="form-control" value={provider} onChange={(event) => setProvider(event.target.value)} placeholder="e.g. Dr. Smith" />
            </div>
            <div className="form-group">
              <label className="form-label">Date & Time</label>
              <input type="datetime-local" className="form-control" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <div className="flex-row">
                <MapPin size={20} className="text-muted" />
                <input type="text" className="form-control" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Medical Center" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">General Notes</label>
              <textarea className="form-control" placeholder="Purpose of visit, things to mention..." value={planningNotes} onChange={(event) => setPlanningNotes(event.target.value)}></textarea>
            </div>
            <button
              className="btn btn-primary btn-block"
              onClick={() =>
                void saveDoctorAppointment({
                  id: doctorSummary.appointment?.id,
                  provider: provider || null,
                  scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
                  location: location || null,
                  planningNotes: planningNotes || null,
                  visitNotes: doctorSummary.appointment?.visitNotes ?? null,
                  status: scheduledAt ? 'planned' : 'unscheduled',
                })
              }
            >
              Save Appointment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
