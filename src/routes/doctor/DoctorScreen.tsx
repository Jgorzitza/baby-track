import { useState } from 'react';
import { Stethoscope, MapPin, HelpCircle, ChevronRight, Droplets, Moon, Baby, Heart } from 'lucide-react';
import { mockAppointments, mockFeeds, mockHealth } from '../../lib/mockData';

export const DoctorScreen = () => {
  const [mode, setMode] = useState<'planning' | 'appointment'>('appointment');
  const appointment = mockAppointments[0];

  return (
    <div className="doctor-screen">
      <div className="flex-row space-between" style={{ marginBottom: '1.25rem' }}>
        <button 
          className={`btn text-sm ${mode === 'appointment' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('appointment')}
          style={{ flex: 1 }}
        >
          Appointment Mode
        </button>
        <button 
          className={`btn text-sm ${mode === 'planning' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('planning')}
          style={{ flex: 1 }}
        >
          Planning
        </button>
      </div>

      {mode === 'appointment' ? (
        <div className="appointment-mode">
          <div className="card" style={{ background: 'linear-gradient(135deg, #f8fbff, #e8f4ff)' }}>
            <div className="flex-row">
              <Stethoscope className="text-primary" size={24} />
              <div>
                <h3 style={{ marginBottom: 0 }}>Dr. Visit Summary</h3>
                <p className="text-muted text-sm">Last 48 Hours Insights</p>
              </div>
            </div>
          </div>

          <section>
            <h4>Parent Questions</h4>
            <div className="card">
              <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                {appointment.questions.map((q) => (
                  <li key={q} className="text-sm" style={{ marginBottom: '0.5rem' }}>{q}</li>
                ))}
              </ul>
              <button className="btn btn-secondary btn-block text-sm" style={{ marginTop: '0.75rem', height: 40 }}>
                Add Question
              </button>
            </div>
          </section>

          <section style={{ marginTop: '1.5rem' }}>
            <h4>Last 48h Stats</h4>
            <div className="grid-2">
              <div className="card">
                <div className="flex-row text-xs text-muted" style={{ marginBottom: '4px' }}>
                  <Droplets size={14} /> <span>Feeding</span>
                </div>
                <div className="font-bold">14 Sessions</div>
                <div className="text-xs text-muted">Avg: 2h 45m apart</div>
              </div>
              <div className="card">
                <div className="flex-row text-xs text-muted" style={{ marginBottom: '4px' }}>
                  <Moon size={14} /> <span>Sleep</span>
                </div>
                <div className="font-bold">16.5 Hours</div>
                <div className="text-xs text-muted">Longest: 4.5h</div>
              </div>
              <div className="card">
                <div className="flex-row text-xs text-muted" style={{ marginBottom: '4px' }}>
                  <Baby size={14} /> <span>Diapers</span>
                </div>
                <div className="font-bold">12 Total</div>
                <div className="text-xs text-muted">8 Wet, 4 Dirty</div>
              </div>
              <div className="card">
                <div className="flex-row text-xs text-muted" style={{ marginBottom: '4px' }}>
                  <Heart size={14} /> <span>Health</span>
                </div>
                <div className="font-bold">1 Fever</div>
                <div className="text-xs text-muted">Max: 38.2°C</div>
              </div>
            </div>
          </section>

          <section style={{ marginTop: '1.5rem' }}>
            <h4>Recent Timeline</h4>
            <div className="card" style={{ padding: '0.75rem' }}>
              {[...mockFeeds, ...mockHealth].slice(0, 4).map((entry, i, arr) => (
                <div key={entry.id} className="flex-row space-between" style={{ 
                  padding: '0.75rem 0', 
                  borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--border)' 
                }}>
                  <div className="flex-row">
                    {entry.type === 'feed' ? <Droplets size={16} className="text-primary" /> : <Heart size={16} className="text-danger" />}
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
              <button className="btn btn-secondary btn-block text-xs" style={{ marginTop: '0.5rem', height: 32 }}>
                Expand Full Timeline
              </button>
            </div>
          </section>
        </div>
      ) : (
        <div className="planning-mode">
          <div className="card">
            <div className="form-group">
              <label className="form-label">Provider Name</label>
              <input type="text" className="form-control" defaultValue={appointment.provider} />
            </div>
            <div className="form-group">
              <label className="form-label">Date & Time</label>
              <input type="datetime-local" className="form-control" defaultValue={appointment.dateTime.slice(0, 16)} />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <div className="flex-row">
                <MapPin size={20} className="text-muted" />
                <input type="text" className="form-control" defaultValue={appointment.location} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">General Notes</label>
              <textarea className="form-control" rows={3} defaultValue={appointment.notes}></textarea>
            </div>
            <button className="btn btn-primary btn-block">Save Appointment</button>
          </div>
          
          <div className="card">
            <div className="flex-row">
              <HelpCircle className="text-primary" size={20} />
              <h4 style={{ margin: 0 }}>Questions for Doctor</h4>
            </div>
            <div style={{ marginTop: '1rem' }}>
              {appointment.questions.map((q) => (
                <div key={q} className="flex-row space-between card" style={{ padding: '0.75rem', marginBottom: '0.5rem' }}>
                  <span className="text-sm">{q}</span>
                </div>
              ))}
              <input type="text" className="form-control" placeholder="Type a new question..." />
              <button className="btn btn-secondary btn-block text-sm" style={{ marginTop: '0.5rem' }}>
                Add to List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
