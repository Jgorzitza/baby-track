import { useEffect, useState } from 'react';
import { User, Users, Bell, Shield, LogOut, ChevronRight, Settings2, Download, RefreshCcw } from 'lucide-react';
import { useUnitPrefs } from '../../lib/useUnitPrefs';
import { usePWAInstall } from '../../lib/usePWAInstall';
import { useAppContext } from '../../lib/app-hooks';

export const SettingsScreen = () => {
  const { prefs, updatePref } = useUnitPrefs();
  const { isInstallable, install, installState, installError, showManualInstallHint, manualInstallMessage } = usePWAInstall();
  const { profile, household, members, signOut, syncStatus, refreshData } = useAppContext();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
  );

  useEffect(() => {
    if (typeof Notification === 'undefined') {
      return;
    }

    const syncPermission = () => {
      setNotificationPermission(Notification.permission);
    };

    window.addEventListener('focus', syncPermission);
    return () => window.removeEventListener('focus', syncPermission);
  }, []);

  const requestNotifications = async (): Promise<void> => {
    if (typeof Notification === 'undefined') {
      setNotificationPermission('unsupported');
      return;
    }
    const nextPermission = await Notification.requestPermission();
    setNotificationPermission(nextPermission);
  };

  return (
    <div className="settings-screen">
      <div className="card">
        <div className="flex-row">
          <div className="btn btn-secondary btn-icon" style={{ width: 64, height: 64 }}>
            <User size={32} />
          </div>
          <div>
            <h3 style={{ marginBottom: 0 }}>Parent Profile</h3>
            <p className="text-muted text-sm">{profile?.email ?? 'Signed in parent'}</p>
          </div>
        </div>
      </div>

      {(isInstallable || showManualInstallHint) && (
        <section>
          <h4>App Shell</h4>
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              color: 'white',
            }}
          >
            <div className="flex-row">
              <Download size={24} />
              <div>
                <div className="font-bold">Install bbtrack</div>
                <p className="text-xs" style={{ margin: 0, opacity: 0.9 }}>
                  {isInstallable ? 'Add to home screen for a native experience' : manualInstallMessage}
                </p>
              </div>
            </div>
            {isInstallable && (
              <button type="button" className="btn btn-secondary btn-block" style={{ marginTop: '0.75rem' }} onClick={install}>
                <Download size={18} />
                <span>Show Install Prompt</span>
              </button>
            )}
          </div>
          {(installError || installState === 'dismissed') && isInstallable && (
            <p className="text-xs" style={{ marginTop: '0.5rem', color: 'var(--danger)' }}>
              {installError}
            </p>
          )}
        </section>
      )}

      <section style={{ marginTop: isInstallable || showManualInstallHint ? '1.5rem' : 0 }}>
        <h4>Sync</h4>
        <div className="card">
          <div className="flex-row space-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div className="font-bold text-sm">{syncStatus.message}</div>
              <div className="text-xs text-muted">
                {syncStatus.pendingCount > 0 ? `${syncStatus.pendingCount} pending change(s)` : 'All queued changes are clear'}
              </div>
            </div>
            <button className="btn btn-secondary" style={{ minHeight: 40 }} onClick={() => void refreshData()}>
              <RefreshCcw size={16} />
              <span>Refresh</span>
            </button>
          </div>
          <div className="text-xs text-muted" style={{ paddingTop: '0.75rem' }}>
            Last synced: {syncStatus.lastSyncedAt ? new Date(syncStatus.lastSyncedAt).toLocaleString() : 'Not yet'}
          </div>
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h4>Household</h4>
        <div className="card">
          <div className="flex-row space-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <div className="flex-row">
              <Users size={20} className="text-muted" />
              <span>{household?.name ?? 'Manage Household'}</span>
            </div>
            <div className="flex-row">
              <span className="text-sm text-muted">{members.length} Member{members.length === 1 ? '' : 's'}</span>
              <ChevronRight size={20} className="text-muted" />
            </div>
          </div>
          <div className="flex-row space-between" style={{ paddingTop: '0.75rem' }}>
            <div className="flex-row">
              <Shield size={20} className="text-muted" />
              <span>Invite Code</span>
            </div>
            <span className="text-sm font-bold">{household?.inviteCode ?? 'Pending'}</span>
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
              <button className={`btn ${prefs.temp === 'C' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updatePref('temp', 'C')} style={{ height: 40 }}>
                Celsius (°C)
              </button>
              <button className={`btn ${prefs.temp === 'F' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updatePref('temp', 'F')} style={{ height: 40 }}>
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          <div className="form-group" style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
            <label className="form-label">Weight</label>
            <div className="grid-2">
              <button className={`btn ${prefs.weight === 'kg' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updatePref('weight', 'kg')} style={{ height: 40 }}>
                Kilograms (kg)
              </button>
              <button className={`btn ${prefs.weight === 'lb' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updatePref('weight', 'lb')} style={{ height: 40 }}>
                Pounds (lb)
              </button>
            </div>
          </div>

          <div className="form-group" style={{ paddingTop: '0.75rem', marginBottom: 0 }}>
            <label className="form-label">Volume</label>
            <div className="grid-2">
              <button className={`btn ${prefs.volume === 'ml' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updatePref('volume', 'ml')} style={{ height: 40 }}>
                Milliliters (ml)
              </button>
              <button className={`btn ${prefs.volume === 'oz' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updatePref('volume', 'oz')} style={{ height: 40 }}>
                Ounces (oz)
              </button>
            </div>
          </div>

          <div className="form-group" style={{ paddingTop: '0.75rem', marginBottom: 0 }}>
            <label className="form-label">Height</label>
            <div className="grid-2">
              <button className={`btn ${prefs.length === 'cm' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updatePref('length', 'cm')} style={{ height: 40 }}>
                Centimeters (cm)
              </button>
              <button className={`btn ${prefs.length === 'in' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updatePref('length', 'in')} style={{ height: 40 }}>
                Inches (in)
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
            <button type="button" className="btn btn-secondary text-xs" style={{ minHeight: 40 }} onClick={() => void requestNotifications()}>
              {notificationPermission === 'granted' ? 'Enabled' : notificationPermission === 'denied' ? 'Blocked' : notificationPermission === 'unsupported' ? 'Unavailable' : 'Enable'}
            </button>
          </div>
          <p className="text-xs text-muted" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
            {notificationPermission === 'granted'
              ? 'Browser notifications are enabled on this device.'
              : notificationPermission === 'denied'
                ? 'Notifications are blocked in the browser. Re-enable them from site settings.'
                : notificationPermission === 'unsupported'
                  ? 'This browser does not support notification prompts for bbtrack.'
                  : 'Allow browser notifications so bbtrack can use them when reminder flows are added.'}
          </p>
        </div>
      </section>

      <div style={{ marginTop: '2rem' }}>
        <button className="btn btn-secondary btn-block" style={{ color: 'var(--danger)' }} onClick={() => void signOut()}>
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>

      <p className="text-center text-xs text-muted" style={{ marginTop: '1.5rem' }}>
        bbtrack v0.2.0
      </p>
    </div>
  );
};
