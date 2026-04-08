import { User, Users, Bell, Shield, LogOut, ChevronRight, Settings2, Download } from 'lucide-react';
import { useUnitPrefs } from '../../lib/useUnitPrefs';
import { usePWAInstall } from '../../lib/usePWAInstall';

export const SettingsScreen = () => {
  const { prefs, updatePref } = useUnitPrefs();
  const { isInstallable, install } = usePWAInstall();

  return (
    <div className="settings-screen">
      <div className="card">
        <div className="flex-row">
          <div className="btn btn-secondary btn-icon" style={{ width: 64, height: 64 }}>
            <User size={32} />
          </div>
          <div>
            <h3 style={{ marginBottom: 0 }}>Parent Profile</h3>
            <p className="text-muted text-sm">jane.doe@example.com</p>
          </div>
        </div>
      </div>

      {isInstallable && (
        <section>
          <h4>App Shell</h4>
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white' }} onClick={install}>
            <div className="flex-row">
              <Download size={24} />
              <div>
                <div className="font-bold">Install bbtrack</div>
                <p className="text-xs" style={{ margin: 0, opacity: 0.9 }}>Add to home screen for a native experience</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section style={{ marginTop: isInstallable ? '1.5rem' : 0 }}>
        <h4>Household</h4>
        <div className="card">
          <div className="flex-row space-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <div className="flex-row">
              <Users size={20} className="text-muted" />
              <span>Manage Household</span>
            </div>
            <div className="flex-row">
              <span className="text-sm text-muted">2 Members</span>
              <ChevronRight size={20} className="text-muted" />
            </div>
          </div>
          <div className="flex-row space-between" style={{ paddingTop: '0.75rem' }}>
            <div className="flex-row">
              <Shield size={20} className="text-muted" />
              <span>Privacy & RLS</span>
            </div>
            <ChevronRight size={20} className="text-muted" />
          </div>
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <div className="flex-row">
          <Settings2 size={18} className="text-muted" />
          <h4>Unit Configuration</h4>
        </div>
        <div className="card">
          <div className="form-group" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <label className="form-label">Temperature</label>
            <div className="grid-2">
              <button 
                className={`btn btn-sm ${prefs.temp === 'C' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => updatePref('temp', 'C')}
                style={{ height: 40 }}
              >
                Celsius (°C)
              </button>
              <button 
                className={`btn btn-sm ${prefs.temp === 'F' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => updatePref('temp', 'F')}
                style={{ height: 40 }}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          <div className="form-group" style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
            <label className="form-label">Weight</label>
            <div className="grid-2">
              <button 
                className={`btn btn-sm ${prefs.weight === 'kg' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => updatePref('weight', 'kg')}
                style={{ height: 40 }}
              >
                Kilograms (kg)
              </button>
              <button 
                className={`btn btn-sm ${prefs.weight === 'lb' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => updatePref('weight', 'lb')}
                style={{ height: 40 }}
              >
                Pounds (lb)
              </button>
            </div>
          </div>

          <div className="form-group" style={{ paddingTop: '0.75rem' }}>
            <label className="form-label">Volume</label>
            <div className="grid-2">
              <button 
                className={`btn btn-sm ${prefs.volume === 'ml' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => updatePref('volume', 'ml')}
                style={{ height: 40 }}
              >
                Milliliters (ml)
              </button>
              <button 
                className={`btn btn-sm ${prefs.volume === 'oz' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => updatePref('volume', 'oz')}
                style={{ height: 40 }}
              >
                Ounces (oz)
              </button>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h4>General</h4>
        <div className="card">
          <div className="flex-row space-between">
            <div className="flex-row">
              <Bell size={20} className="text-muted" />
              <span>Notifications</span>
            </div>
            <ChevronRight size={20} className="text-muted" />
          </div>
        </div>
      </section>

      <div style={{ marginTop: '2rem' }}>
        <button className="btn btn-secondary btn-block" style={{ color: 'var(--danger)' }}>
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
      
      <p className="text-center text-xs text-muted" style={{ marginTop: '1.5rem' }}>
        bbtrack v0.1.0 (Alpha Prototype)
      </p>
    </div>
  );
};
