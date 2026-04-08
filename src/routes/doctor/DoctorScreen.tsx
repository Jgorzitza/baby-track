import { useState } from 'react';
import { MapPin, HelpCircle, ChevronRight, Droplets, Moon, Baby, Heart, ChevronDown, ChevronUp, Clock, ClipboardList, AlertCircle } from 'lucide-react';
import { mockAppointments, mockFeeds, mockHealth, mockSleep, mockDiapers } from '../../lib/mockData';

export const DoctorScreen = () => {
  const [mode, setMode] = useState<'planning' | 'appointment'>('appointment');
  const [timeWindow, setTimeWindow] = useState<'24h' | '48h' | '7d'>('48h');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const appointment = mockAppointments.length > 0 ? mockAppointments[0] : null;

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const renderExpandedStats = (type: string) => {
    switch (type) {
      case 'feed-stats':
        return (
          <div className="text-xs text-muted" style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            {mockFeeds.slice(0, 3).map(f => (
              <div key={f.id} className="flex-row space-between" style={{ marginBottom: '4px' }}>
                <span>{f.feedType === 'breast' ? f.side : 'Bottle'}</span>
                <span>{f.amount ? `${f.amount}ml` : '15m'}</span>
              </div>
            ))}
          </div>
        );
      case 'sleep-stats':
        return (
          <div className="text-xs text-muted" style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            {mockSleep.slice(0, 2).map(s => (
              <div key={s.id} className="flex-row space-between" style={{ marginBottom: '4px' }}>
                <span>{new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span>{Math.floor((s.duration || 0) / 3600)}h {Math.floor(((s.duration || 0) % 3600) / 60)}m</span>
              </div>
            ))}
          </div>
        );
      case 'diaper-stats':
        return (
          <div className="text-xs text-muted" style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            {mockDiapers.slice(0, 3).map(d => (
              <div key={d.id} className="flex-row space-between" style={{ marginBottom: '4px' }}>
                <span>{d.diaperType}</span>
                <span>{new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        );
      case 'health-stats':
        return (
          <div className="text-xs text-muted" style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            {mockHealth.map(h => (
              <div key={h.id} className="flex-row space-between" style={{ marginBottom: '4px' }}>
                <span>{h.healthType}</span>
                <span>{h.value || h.medicationName}</span>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="doctor-screen">
      <div className="flex-row space-between" style={{ marginBottom: '1.25rem', gap: '0.5rem' }}>
        <button 
          className={`btn text-xs ${mode === 'appointment' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('appointment')}
          style={{ flex: 1, minHeight: 40 }}
        >
          Doctor Mode
        </button>
        <button 
          className={`btn text-xs ${mode === 'planning' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('planning')}
          style={{ flex: 1, minHeight: 40 }}
        >
          Planning
        </button>
      </div>

      {mode === 'appointment' ? (
        <div className="appointment-mode">
          {!appointment && (
            <div className="card" style={{ backgroundColor: 'var(--bg-card)', borderStyle: 'dashed' }}>
              <div className="flex-row" style={{ color: 'var(--text-muted)' }}>
                <AlertCircle size={20} />
                <span className="text-sm">No scheduled appointment. Showing current summary.</span>
              </div>
            </div>
          )}

          <div className="flex-row" style={{ justifyContent: 'center', marginBottom: '1.5rem', gap: '0.5rem' }}>
            {['24h', '48h', '7d'].map((w) => (
              <button 
                key={w}
                className={`btn text-xs ${timeWindow === w ? 'btn-primary' : 'btn-secondary'}`}
                style={{ height: 32, padding: '0 1rem', borderRadius: '20px' }}
                onClick={() => setTimeWindow(w as '24h' | '48h' | '7d')}
              >
                {w}
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
                    {(appointment?.questions || []).length > 0 ? (
                      appointment!.questions.map((q) => (
                        <li key={q} className="text-sm" style={{ marginBottom: '0.75rem' }}>{q}</li>
                      ))
                    ) : (
                      <p className="text-sm text-muted">No questions listed.</p>
                    )}
                  </ul>
                  <div className="flex-row" style={{ marginTop: '1rem' }}>
                    <input type="text" className="form-control" style={{ minHeight: 40, fontSize: '0.875rem' }} placeholder="Quick add question..." />
                    <button className="btn btn-secondary" style={{ height: 40, width: 40, padding: 0 }}>+</button>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted">{(appointment?.questions || []).length} questions ready for review.</div>
              )}
            </div>
          </section>

          <section style={{ marginTop: '1.5rem' }}>
            <h4>{timeWindow} Summary</h4>
            <div className="grid-2">
              {[
                { id: 'feed-stats', icon: <Droplets size={14} className="text-primary" />, label: 'Feeding', value: '14 Sessions', detail: 'Avg: 2h 45m' },
                { id: 'sleep-stats', icon: <Moon size={14} className="text-primary" />, label: 'Sleep', value: '16.5 Hours', detail: 'Longest: 4.5h' },
                { id: 'diaper-stats', icon: <Baby size={14} className="text-primary" />, label: 'Diapers', value: '12 Total', detail: '8 Wet, 4 Dirty' },
                { id: 'health-stats', icon: <Heart size={14} className="text-danger" />, label: 'Health', value: '1 Fever', detail: 'Max: 38.2°C' },
              ].map((stat) => (
                <div key={stat.id} className="card" onClick={() => toggleSection(stat.id)} style={{ padding: '1rem', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                  <div className="flex-row text-xs text-muted" style={{ marginBottom: '4px' }}>
                    {stat.icon} <span>{stat.label}</span>
                  </div>
                  <div className="font-bold">{stat.value}</div>
                  <div className="text-xs text-muted">{stat.detail}</div>
                  {expandedSection === stat.id && renderExpandedStats(stat.id)}
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
              {[...mockFeeds, ...mockHealth].slice(0, 5).map((entry, i, arr) => (
                <div key={entry.id} className="flex-row space-between" style={{ 
                  padding: '0.875rem 0.5rem', 
                  borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--border)' 
                }}>
                  <div className="flex-row">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.type === 'feed' ? 'var(--primary)' : 'var(--danger)' }} />
                    <div>
                      <div className="text-sm font-bold">
                        {entry.type === 'feed' ? `Breastfeed (${entry.side})` : `Health: ${entry.healthType}`}
                      </div>
                      <div className="text-xs text-muted">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                </div>
              ))}
            </div>
          </section>

          <div style={{ position: 'sticky', bottom: '1rem', zIndex: 10 }}>
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
              <input type="text" className="form-control" defaultValue={appointment?.provider || ''} placeholder="e.g. Dr. Smith" />
            </div>
            <div className="form-group">
              <label className="form-label">Date & Time</label>
              <input type="datetime-local" className="form-control" defaultValue={appointment?.dateTime.slice(0, 16) || ''} />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <div className="flex-row">
                <MapPin size={20} className="text-muted" />
                <input type="text" className="form-control" defaultValue={appointment?.location || ''} placeholder="Medical Center" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">General Notes</label>
              <textarea className="form-control" placeholder="Purpose of visit, things to mention..."></textarea>
            </div>
            <button className="btn btn-primary btn-block">Save Appointment</button>
          </div>
          
          <div className="card">
            <div className="flex-row">
              <HelpCircle className="text-primary" size={20} />
              <h4 style={{ margin: 0 }}>Questions for Doctor</h4>
            </div>
            <div style={{ marginTop: '1.25rem' }}>
              {(appointment?.questions || []).map((q) => (
                <div key={q} className="flex-row space-between card" style={{ padding: '0.875rem', marginBottom: '0.75rem', background: 'var(--bg)' }}>
                  <span className="text-sm">{q}</span>
                </div>
              ))}
              <div className="form-group">
                <input type="text" className="form-control" placeholder="Type a new question..." />
              </div>
              <button className="btn btn-secondary btn-block text-sm">
                Add to List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
