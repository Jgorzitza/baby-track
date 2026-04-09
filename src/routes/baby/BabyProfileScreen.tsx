import { useState } from 'react';
import { Baby, Camera, Save, Calendar } from 'lucide-react';
import { useAppContext } from '../../lib/app-hooks';

export const BabyProfileScreen = () => {
  const { baby, saveBabyProfile, actionError, isRefreshing } = useAppContext();
  const [name, setName] = useState(baby?.name ?? '');
  const [birthDate, setBirthDate] = useState(baby?.birthDate.slice(0, 10) ?? '');
  const [birthWeight, setBirthWeight] = useState(baby?.birthWeight?.toString() ?? '');
  const [birthLength, setBirthLength] = useState(baby?.birthLength?.toString() ?? '');

  return (
    <div className="baby-profile-screen">
      <div className="card text-center" style={{ padding: '2rem 1.5rem' }}>
        <div className="btn btn-secondary btn-icon" style={{ width: 100, height: 100, margin: '0 auto 1.5rem auto', position: 'relative' }}>
          <Baby size={50} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', padding: '6px', borderRadius: '50%', color: 'white' }}>
            <Camera size={16} />
          </div>
        </div>
        <h2>{name || "Baby's"} Profile</h2>
      </div>

      {actionError && (
        <div className="card" style={{ background: 'rgba(255, 107, 107, 0.08)' }}>
          <p className="text-sm" style={{ margin: 0, color: 'var(--danger)' }}>
            {actionError}
          </p>
        </div>
      )}

      <section>
        <div className="card">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-control" value={name} onChange={(event) => setName(event.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Birth Date</label>
            <div className="flex-row">
              <Calendar size={20} className="text-muted" />
              <input type="date" className="form-control" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Birth Weight (kg)</label>
              <input type="number" step="0.01" className="form-control" value={birthWeight} onChange={(event) => setBirthWeight(event.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Birth Length (cm)</label>
              <input type="number" step="0.1" className="form-control" value={birthLength} onChange={(event) => setBirthLength(event.target.value)} />
            </div>
          </div>
        </div>
      </section>

      <div style={{ marginTop: '1rem' }}>
        <button
          className="btn btn-primary btn-block"
          disabled={isRefreshing || name.trim().length === 0 || birthDate.length === 0}
          onClick={() =>
            void saveBabyProfile({
              name: name.trim(),
              birthDate: new Date(`${birthDate}T00:00:00`).toISOString(),
              birthWeight: birthWeight.length > 0 ? Number(birthWeight) : null,
              birthLength: birthLength.length > 0 ? Number(birthLength) : null,
            })
          }
        >
          <Save size={20} />
          <span>Save Profile</span>
        </button>
      </div>
    </div>
  );
};
