import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Thermometer, Pill, Activity, LineChart, Check, ChevronRight, Calendar } from 'lucide-react';
import { HealthType } from '../../lib/types';
import { useUnitPrefs } from '../../lib/useUnitPrefs';
import { useAppContext } from '../../lib/app-hooks';

export const HealthScreen = () => {
  const navigate = useNavigate();
  const { doctorSummary, logGrowth, logMedication, logSymptom, logTemperature } = useAppContext();
  const [healthType, setHealthType] = useState<HealthType>('temperature');
  const [value, setValue] = useState<string>('');
  const [medName, setMedName] = useState<string>('');
  const [dosage, setDosage] = useState<string>('');
  const [symptom, setSymptom] = useState<string>('');
  const [lengthValue, setLengthValue] = useState<string>('');
  const { prefs } = useUnitPrefs();

  const handleSave = () => {
    if (healthType === 'temperature' && value) {
      void logTemperature({ value: Number(value), unit: prefs.temp, notes: null }).then(() => navigate('/'));
      return;
    }
    if (healthType === 'medication' && medName && dosage) {
      void logMedication({ medicationName: medName, dosage, notes: null }).then(() => navigate('/'));
      return;
    }
    if (healthType === 'symptom' && symptom) {
      void logSymptom({ symptom, notes: null }).then(() => navigate('/'));
      return;
    }
    if (healthType === 'growth' && (value || lengthValue)) {
      void logGrowth({
        weight: value ? Number(value) : null,
        weightUnit: prefs.weight,
        length: lengthValue ? Number(lengthValue) : null,
        lengthUnit: 'cm',
        notes: null,
      }).then(() => navigate('/'));
    }
  };

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
              <input 
                type="number" 
                step="0.1" 
                className="form-control" 
                placeholder={prefs.temp === 'C' ? '37.0' : '98.6'} 
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          )}
          {healthType === 'medication' && (
            <>
              <div className="form-group">
                <label className="form-label">Medication Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Tylenol" 
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Dosage</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. 1.5ml" 
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                />
              </div>
            </>
          )}
          {healthType === 'growth' && (
            <>
              <div className="form-group">
                <label className="form-label">Weight ({prefs.weight})</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="form-control" 
                  placeholder={prefs.weight === 'kg' ? '3.4' : '7.5'} 
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input type="number" step="0.1" className="form-control" placeholder="51.0" value={lengthValue} onChange={(event) => setLengthValue(event.target.value)} />
              </div>
            </>
          )}
          {healthType === 'symptom' && (
            <div className="form-group">
              <label className="form-label">Symptom / Note</label>
              <textarea 
                className="form-control" 
                placeholder="Describe the symptom..."
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
              ></textarea>
            </div>
          )}
        </div>

        <button className="btn btn-success btn-block" style={{ marginTop: '1rem', height: 56 }} onClick={handleSave}>
          <Check size={20} />
          <span>Save Entry</span>
        </button>
      </div>

      {/* Appointment Entry Placeholder */}
      <section style={{ marginTop: '1.5rem' }}>
        <div className="card" style={{ borderStyle: 'dashed', background: 'var(--bg-card)', cursor: 'pointer' }} onClick={() => navigate('/doctor')}>
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
        <div className="flex-row space-between" onClick={() => navigate('/timeline')} style={{ cursor: 'pointer' }}>
          <h4>Recent Health Events</h4>
          <span className="text-sm text-primary">View Timeline</span>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--warning)', marginBottom: '0.5rem' }}>
          <div className="flex-row space-between text-sm">
            <div className="flex-row">
              <Thermometer size={16} className="text-warning" />
              <span>{doctorSummary.temperatures[0] ? `Temp: ${doctorSummary.temperatures[0].value}${doctorSummary.temperatures[0].unit}` : 'No temperature logs yet'}</span>
            </div>
            <span>{doctorSummary.temperatures[0] ? new Date(doctorSummary.temperatures[0].occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</span>
          </div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="flex-row space-between text-sm">
            <div className="flex-row">
              <Pill size={16} className="text-primary" />
              <span>{doctorSummary.medications[0] ? `${doctorSummary.medications[0].medicationName} (${doctorSummary.medications[0].dosage})` : 'No medication logs yet'}</span>
            </div>
            <span>{doctorSummary.medications[0] ? new Date(doctorSummary.medications[0].occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</span>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h4>Growth Summary</h4>
        <div className="card">
          <div className="flex-row space-between">
            <div>
              <div className="text-xs text-muted">Last Weight</div>
              <div className="font-bold">
                {doctorSummary.growthMeasurements[0]?.weight ?? '--'} {doctorSummary.growthMeasurements[0]?.weightUnit ?? prefs.weight}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted">Last Length</div>
              <div className="text-success font-bold">
                {doctorSummary.growthMeasurements[0]?.length ?? '--'} {doctorSummary.growthMeasurements[0]?.lengthUnit ?? 'cm'}
              </div>
            </div>
            <ChevronRight size={20} className="text-muted" />
          </div>
        </div>
      </section>
    </div>
  );
};
