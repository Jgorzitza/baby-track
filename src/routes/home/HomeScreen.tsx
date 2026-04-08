import { useNavigate } from 'react-router-dom';
import { Play, Droplets, Baby, Thermometer, Pill, Stethoscope } from 'lucide-react';

export const HomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="home-screen">
      <div className="card">
        <div className="flex-row space-between">
          <div>
            <h3>Leo</h3>
            <p className="text-muted text-sm">2 weeks, 3 days old</p>
          </div>
          <div className="btn btn-secondary btn-icon">
            <Baby size={24} />
          </div>
        </div>
      </div>

      <section>
        <h4>Quick Actions</h4>
        <div className="grid-2">
          <button className="btn btn-secondary flex-col" onClick={() => navigate('/sleep')}>
            <Play size={20} />
            <span>Start Sleep</span>
          </button>
          <button className="btn btn-secondary flex-col" onClick={() => navigate('/diaper')}>
            <Baby size={20} />
            <span>Wet Diaper</span>
          </button>
          <button className="btn btn-secondary flex-col" onClick={() => navigate('/feed')}>
            <Droplets size={20} />
            <span>Feed Breast</span>
          </button>
          <button className="btn btn-secondary flex-col" onClick={() => navigate('/feed')}>
            <Droplets size={20} />
            <span>Feed Bottle</span>
          </button>
          <button className="btn btn-secondary flex-col" onClick={() => navigate('/health')}>
            <Thermometer size={20} />
            <span>Temp</span>
          </button>
          <button className="btn btn-secondary flex-col" onClick={() => navigate('/health')}>
            <Pill size={20} />
            <span>Medication</span>
          </button>
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <div className="flex-row space-between">
          <h4>Active Sessions</h4>
          <span className="text-sm text-primary">View All</span>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)', marginBottom: '0.5rem' }} onClick={() => navigate('/feed')}>
          <div className="flex-row space-between">
            <div className="flex-row">
              <Droplets size={18} className="text-primary" />
              <span>Feeding (Left)</span>
            </div>
            <span className="text-primary font-bold">12:45</span>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h4>Today's Summary</h4>
        <div className="grid-3">
          <div className="card text-center" style={{ padding: '0.75rem' }} onClick={() => navigate('/reports')}>
            <span className="text-muted text-xs block">Sleep</span>
            <div className="font-bold">8h 20m</div>
          </div>
          <div className="card text-center" style={{ padding: '0.75rem' }} onClick={() => navigate('/reports')}>
            <span className="text-muted text-xs block">Feeds</span>
            <div className="font-bold">6</div>
          </div>
          <div className="card text-center" style={{ padding: '0.75rem' }} onClick={() => navigate('/reports')}>
            <span className="text-muted text-xs block">Diapers</span>
            <div className="font-bold">5</div>
          </div>
        </div>
      </section>

      <div style={{ marginTop: '1rem' }}>
        <button className="btn btn-primary btn-block" onClick={() => navigate('/doctor')}>
          <Stethoscope size={20} />
          <span>Doctor Appointment Mode</span>
        </button>
      </div>
    </div>
  );
};
