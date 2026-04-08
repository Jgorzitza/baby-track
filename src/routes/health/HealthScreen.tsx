import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Thermometer, Pill, Activity, LineChart, Check, ChevronRight, Calendar } from 'lucide-react';
import { HealthType } from '../../lib/types';
import { useUnitPrefs } from '../../lib/useUnitPrefs';

export const HealthScreen = () => {
  const navigate = useNavigate();
  const [healthType, setHealthType] = useState<HealthType>('temperature');
  const { prefs } = useUnitPrefs();

  return (
    <div className="health-screen">
      <div className="card">
        <h3>Log Health</h3>
        <div className="grid-2" style={{ margin: '1rem 0' }}>
          <button 
            className={`btn flex-col ${healthType === 'temperature' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ height: 100 }}
            onClick={() => setHealthType('temperature')}
          >
            <Thermometer size={24} />
            <span>Temp</span>
          </button>
          <button 
            className={`btn flex-col ${healthType === 'medication' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ height: 100 }}
            onClick={() => setHealthType('medication')}
          >
            <Pill size={24} />
            <span>Meds</span>
          </button>
          <button 
            className={`btn flex-col ${healthType === 'growth' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ height: 100 }}
            onClick={() => setHealthType('growth')}
          >
            <LineChart size={24} />
            <span>Growth</span>
          </button>
          <button 
            className={`btn flex-col ${healthType === 'symptom' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ height: 100 }}
            onClick={() => setHealthType('symptom')}
          >
            <Activity size={24} />
            <span>Symptom</span>
          </button>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          {healthType === 'temperature' && (
            <div className="form-group">
              <label className="form-label">Temperature (°{prefs.temp})</label>
              <input type="number" step="0.1" className="form-control" placeholder={prefs.temp === 'C' ? '37.0' : '98.6'} />
            </div>
          )}
          {healthType === 'medication' && (
            <>
              <div className="form-group">
                <label className="form-label">Medication Name</label>
                <input type="text" className="form-control" placeholder="e.g. Tylenol" />
              </div>
              <div className="form-group">
                <label className="form-label">Dosage</label>
                <input type="text" className="form-control" placeholder="e.g. 1.5ml" />
              </div>
            </>
          )}
          {healthType === 'growth' && (
            <>
              <div className="form-group">
                <label className="form-label">Weight ({prefs.weight})</label>
                <input type="number" step="0.01" className="form-control" placeholder={prefs.weight === 'kg' ? '3.4' : '7.5'} />
              </div>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input type="number" step="0.1" className="form-control" placeholder="51.0" />
              </div>
            </>
          )}
          {healthType === 'symptom' && (
            <div className="form-group">
              <label className="form-label">Symptom / Note</label>
              <textarea className="form-control" placeholder="Describe the symptom..."></textarea>
            </div>
          )}
        </div>

        <button className="btn btn-success btn-block" style={{ marginTop: '1rem', height: 56 }}>
          <Check size={20} />
          <span>Save Entry</span>
        </button>
      </div>

      {/* Appointment Entry Placeholder */}
      <section style={{ marginTop: '1.5rem' }}>
        <div className="card" style={{ borderStyle: 'dashed', background: 'var(--bg-card)' }} onClick={() => navigate('/doctor')}>
          <div className="flex-row">
            <div className="btn btn-secondary btn-icon" style={{ width: 40, height: 40 }}>
              <Calendar size={20} className="text-primary" />
            </div>
            <div>
              <div className="text-sm font-bold">Plan Doctor Appointment</div>
              <p className="text-xs text-muted" style={{ margin: 0 }}>Add questions and schedule visit</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <div className="flex-row space-between" onClick={() => navigate('/timeline')}>
          <h4>Recent Health Events</h4>
          <span className="text-sm text-primary">View Timeline</span>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--warning)', marginBottom: '0.5rem' }}>
          <div className="flex-row space-between text-sm">
            <div className="flex-row">
              <Thermometer size={16} className="text-warning" />
              <span>Fever: 38.2°C</span>
            </div>
            <span>7:00 AM</span>
          </div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="flex-row space-between text-sm">
            <div className="flex-row">
              <Pill size={16} className="text-primary" />
              <span>Tylenol (1.5ml)</span>
            </div>
            <span>7:15 AM</span>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h4>Growth Summary</h4>
        <div className="card">
          <div className="flex-row space-between">
            <div>
              <div className="text-xs text-muted">Last Weight</div>
              <div className="font-bold">3.8 {prefs.weight}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Change</div>
              <div className="text-success font-bold">+400g</div>
            </div>
            <ChevronRight size={20} className="text-muted" />
          </div>
        </div>
      </section>
    </div>
  );
};
