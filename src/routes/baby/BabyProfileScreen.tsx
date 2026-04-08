import { Baby, Camera, Save, Calendar } from 'lucide-react';
import { mockBaby } from '../../lib/mockData';

export const BabyProfileScreen = () => {
  return (
    <div className="baby-profile-screen">
      <div className="card text-center" style={{ padding: '2rem 1.5rem' }}>
        <div className="btn btn-secondary btn-icon" style={{ width: 100, height: 100, margin: '0 auto 1.5rem auto', position: 'relative' }}>
          <Baby size={50} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', padding: '6px', borderRadius: '50%', color: 'white' }}>
            <Camera size={16} />
          </div>
        </div>
        <h2>{mockBaby.name}'s Profile</h2>
      </div>

      <section>
        <div className="card">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-control" defaultValue={mockBaby.name} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Birth Date</label>
            <div className="flex-row">
              <Calendar size={20} className="text-muted" />
              <input type="date" className="form-control" defaultValue={mockBaby.birthDate.split('T')[0]} />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Birth Weight (kg)</label>
              <input type="number" step="0.01" className="form-control" defaultValue={mockBaby.birthWeight} />
            </div>
            <div className="form-group">
              <label className="form-label">Birth Length (cm)</label>
              <input type="number" step="0.1" className="form-control" defaultValue={mockBaby.birthLength} />
            </div>
          </div>
        </div>
      </section>

      <div style={{ marginTop: '1rem' }}>
        <button className="btn btn-primary btn-block">
          <Save size={20} />
          <span>Save Profile</span>
        </button>
      </div>
    </div>
  );
};
