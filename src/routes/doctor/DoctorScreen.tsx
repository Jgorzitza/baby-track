import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Baby,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Clock,
  Droplets,
  Heart,
  MapPin,
  Moon,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { useDoctorSummary } from '../../lib/app-hooks';
import { formatElapsedClock } from '../../lib/time';

export const DoctorScreen = () => {
  const navigate = useNavigate();
  const {
    doctorSummary,
    doctorWindow,
    selectedDoctorAppointmentId,
    setSelectedDoctorAppointment,
    setDoctorWindow,
    saveDoctorAppointment,
    deleteDoctorAppointment,
    addDoctorQuestion,
    addDoctorNote,
  } = useDoctorSummary();
  const [mode, setMode] = useState<'planning' | 'appointment'>('appointment');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [provider, setProvider] = useState(doctorSummary.appointment?.provider ?? '');
  const [scheduledAt, setScheduledAt] = useState(doctorSummary.appointment?.scheduledAt?.slice(0, 16) ?? '');
  const [location, setLocation] = useState(doctorSummary.appointment?.location ?? '');
  const [planningNotes, setPlanningNotes] = useState(doctorSummary.appointment?.planningNotes ?? '');
  const [quickNote, setQuickNote] = useState('');
  const [questionDraft, setQuestionDraft] = useState('');
  const [planningMessage, setPlanningMessage] = useState<string | null>(null);
  const [visitMessage, setVisitMessage] = useState<string | null>(null);

  const syncPlanningFields = () => {
    setProvider(doctorSummary.appointment?.provider ?? '');
    setScheduledAt(doctorSummary.appointment?.scheduledAt?.slice(0, 16) ?? '');
    setLocation(doctorSummary.appointment?.location ?? '');
    setPlanningNotes(doctorSummary.appointment?.planningNotes ?? '');
  };

  const toggleSection = (id: string) => {
    setExpandedSection((current) => (current === id ? null : id));
  };

  const clearPlanningForm = () => {
    setProvider('');
    setScheduledAt('');
    setLocation('');
    setPlanningNotes('');
  };

  const handleCreateNewAppointment = async (): Promise<void> => {
    clearPlanningForm();
    setPlanningMessage(null);
    await setSelectedDoctorAppointment(null);
  };

  const handleSaveAppointment = async (): Promise<void> => {
    await saveDoctorAppointment({
      id: selectedDoctorAppointmentId ?? undefined,
      provider: provider.trim() || null,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      location: location.trim() || null,
      planningNotes: planningNotes.trim() || null,
      visitNotes: selectedDoctorAppointmentId ? (doctorSummary.appointment?.visitNotes ?? null) : null,
      status: scheduledAt ? 'planned' : 'unscheduled',
    });
    setPlanningMessage('Appointment saved.');
    setMode('appointment');
  };

  const handleDeleteAppointment = async (appointmentId: string): Promise<void> => {
    const nextAppointment = doctorSummary.appointments.filter((appointment) => appointment.id !== appointmentId)[0] ?? null;
    await deleteDoctorAppointment(appointmentId);
    setPlanningMessage('Appointment deleted.');
    if (selectedDoctorAppointmentId === appointmentId) {
      if (nextAppointment) {
        setProvider(nextAppointment.provider ?? '');
        setScheduledAt(nextAppointment.scheduledAt?.slice(0, 16) ?? '');
        setLocation(nextAppointment.location ?? '');
        setPlanningNotes(nextAppointment.planningNotes ?? '');
      } else {
        clearPlanningForm();
      }
    }
  };

  const handleAddQuestion = async (): Promise<void> => {
    const question = questionDraft.trim();
    if (!question) {
      return;
    }
    await addDoctorQuestion(question, selectedDoctorAppointmentId ?? undefined);
    setQuestionDraft('');
    setVisitMessage('Question added.');
    setExpandedSection('questions');
  };

  const handleAddQuickNote = async (): Promise<void> => {
    const note = quickNote.trim();
    if (!note) {
      return;
    }
    await addDoctorNote(note, selectedDoctorAppointmentId ?? undefined);
    setQuickNote('');
    setVisitMessage('Visit note saved.');
  };

  const appointmentHeading = doctorSummary.appointment?.provider ?? 'Doctor appointment';

  return (
    <div className="doctor-screen">
      <div className="flex-row space-between" style={{ marginBottom: '1.25rem', gap: '0.5rem' }}>
        <button className={`btn text-xs ${mode === 'appointment' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('appointment')} style={{ flex: 1, minHeight: 40 }}>
          Doctor Mode
        </button>
        <button
          className={`btn text-xs ${mode === 'planning' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            syncPlanningFields();
            setMode('planning');
          }}
          style={{ flex: 1, minHeight: 40 }}
        >
          Planning
        </button>
      </div>

      {mode === 'appointment' ? (
        <div className="appointment-mode">
          {!doctorSummary.appointment ? (
            <div className="card" style={{ backgroundColor: 'var(--bg-card)', borderStyle: 'dashed' }}>
              <div className="flex-row" style={{ color: 'var(--text-muted)' }}>
                <AlertCircle size={20} />
                <span className="text-sm">No scheduled appointment. Showing the latest doctor summary and unscheduled note/question tools.</span>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="flex-row space-between">
                <div>
                  <div className="text-xs text-muted">Selected Appointment</div>
                  <div className="font-bold">{appointmentHeading}</div>
                  <div className="text-xs text-muted">
                    {doctorSummary.appointment.scheduledAt
                      ? new Date(doctorSummary.appointment.scheduledAt).toLocaleString()
                      : 'Unscheduled visit note set'}
                  </div>
                </div>
                <button
                  className="btn btn-secondary text-xs"
                  style={{ minHeight: 40 }}
                  onClick={() => {
                    syncPlanningFields();
                    setMode('planning');
                  }}
                >
                  Edit
                </button>
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
                  {doctorSummary.questions.length > 0 ? (
                    <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                      {doctorSummary.questions.map((question) => (
                        <li key={question.id} className="text-sm" style={{ marginBottom: '0.75rem' }}>
                          {question.question}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted">No questions listed for this appointment yet.</p>
                  )}
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label">Add Question</label>
                    <textarea className="form-control" placeholder="What do you want to ask the doctor?" value={questionDraft} onChange={(event) => setQuestionDraft(event.target.value)} />
                  </div>
                  <div className="grid-2">
                    <button className="btn btn-primary" onClick={() => void handleAddQuestion()}>
                      <Plus size={18} />
                      <span>Add Question</span>
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate('/doctor/questions')}>
                      <ClipboardList size={18} />
                      <span>Manage Questions</span>
                    </button>
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
                      {stat.id === 'sleep-stats' && doctorSummary.timeline.find((item) => item.eventType === 'sleep') && <div>Latest sleep event: {doctorSummary.timeline.find((item) => item.eventType === 'sleep')?.summary}</div>}
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
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Quick Note during Visit</label>
                <textarea
                  className="form-control"
                  placeholder="Key symptoms, doctor guidance, follow-up items..."
                  value={quickNote}
                  onChange={(event) => setQuickNote(event.target.value)}
                />
              </div>
              <button className="btn btn-success btn-block" style={{ marginTop: '0.75rem', boxShadow: '0 8px 24px rgba(67, 160, 71, 0.3)' }} onClick={() => void handleAddQuickNote()}>
                <ClipboardList size={20} />
                <span>Save Quick Note</span>
              </button>
              {visitMessage && (
                <p className="text-xs text-success" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                  {visitMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="planning-mode">
          <div className="flex-row space-between" style={{ marginBottom: '0.75rem' }}>
            <h4>Appointments</h4>
            <button className="btn btn-secondary text-xs" style={{ minHeight: 40 }} onClick={() => void handleCreateNewAppointment()}>
              <Plus size={16} />
              <span>New Appointment</span>
            </button>
          </div>
          <div className="flex-col" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
            {doctorSummary.appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="card"
                style={{
                  textAlign: 'left',
                  border: appointment.id === selectedDoctorAppointmentId ? '2px solid var(--primary)' : '1px solid var(--border)',
                  marginBottom: 0,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setProvider(appointment.provider ?? '');
                  setScheduledAt(appointment.scheduledAt?.slice(0, 16) ?? '');
                  setLocation(appointment.location ?? '');
                  setPlanningNotes(appointment.planningNotes ?? '');
                  void setSelectedDoctorAppointment(appointment.id);
                }}
              >
                <div className="flex-row space-between">
                  <div>
                    <div className="font-bold">{appointment.provider ?? 'Unscheduled appointment'}</div>
                    <div className="text-xs text-muted">
                      {appointment.scheduledAt ? new Date(appointment.scheduledAt).toLocaleString() : 'No date set'}
                    </div>
                  </div>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', padding: 0 }}
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleDeleteAppointment(appointment.id);
                    }}
                  >
                    <Trash2 size={18} className="text-danger" />
                  </button>
                </div>
              </div>
            ))}
            {doctorSummary.appointments.length === 0 && (
              <div className="card" style={{ borderStyle: 'dashed', marginBottom: 0 }}>
                <p className="text-sm text-muted" style={{ margin: 0 }}>No appointments saved yet. Create one now or add notes/questions for an unscheduled visit.</p>
              </div>
            )}
          </div>

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
            <button className="btn btn-primary btn-block" onClick={() => void handleSaveAppointment()}>
              <Save size={18} />
              <span>Save Appointment</span>
            </button>
            {planningMessage && (
              <p className="text-xs text-success" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                {planningMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
