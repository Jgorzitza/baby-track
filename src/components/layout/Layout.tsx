import { useLocation } from 'react-router-dom';
import { ReactNode, useState } from 'react';
import { Download } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { useSyncStatus } from '../../lib/offline/sync-context';
import { usePWAInstall } from '../../lib/usePWAInstall';

export const Layout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const syncStatus = useSyncStatus();
  const { isInstallable, install, installError, showManualInstallHint, manualInstallMessage, isInstalled } = usePWAInstall();
  const [isInstallBannerDismissed, setIsInstallBannerDismissed] = useState(false);
  const showInstallBanner = !isInstalled && !isInstallBannerDismissed && (isInstallable || showManualInstallHint);
  
  const getTitle = (pathname: string) => {
    switch (pathname) {
      case '/': return 'bbtrack';
      case '/feed': return 'Feeding';
      case '/sleep': return 'Sleep';
      case '/diaper': return 'Diaper';
      case '/health': return 'Health';
      case '/reports': return 'Reports';
      case '/settings': return 'Settings';
      case '/doctor': return 'Doctor Mode';
      case '/doctor/questions': return 'Questions';
      case '/household': return 'Household';
      case '/baby': return 'Baby Profile';
      case '/timeline': return 'Medical Timeline';
      default: return 'bbtrack';
    }
  };

  return (
    <>
      <header className="top-bar">
        <div className="sync-status">
          <div className="sync-indicator"></div>
          <span>{syncStatus.message}</span>
        </div>
        <div>{getTitle(location.pathname)}</div>
      </header>
      <main>
        {showInstallBanner && (
          <div
            className="card"
            style={{
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #f0f7ff, #e6f0ff)',
            }}
          >
            <div className="flex-row space-between" style={{ alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div className="flex-row" style={{ marginBottom: '0.35rem' }}>
                  <Download size={18} className="text-primary" />
                  <strong>Install bbtrack</strong>
                </div>
                <p className="text-xs text-muted" style={{ margin: 0 }}>
                  {isInstallable ? 'Add bbtrack to your home screen for a native app feel.' : manualInstallMessage}
                </p>
                {installError && (
                  <p className="text-xs" style={{ margin: '0.5rem 0 0', color: 'var(--danger)' }}>
                    {installError}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="btn btn-secondary text-xs"
                style={{ minHeight: 40 }}
                onClick={() => setIsInstallBannerDismissed(true)}
              >
                Dismiss
              </button>
            </div>
            {isInstallable && (
              <button
                type="button"
                className="btn btn-primary btn-block"
                style={{ marginTop: '0.75rem' }}
                onClick={install}
              >
                <Download size={18} />
                <span>Install App</span>
              </button>
            )}
          </div>
        )}
        {children}
      </main>
      <BottomNav />
    </>
  );
};
