import { useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { useSyncStatus } from '../../lib/offline/sync-context';

export const Layout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const syncStatus = useSyncStatus();
  
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
        {children}
      </main>
      <BottomNav />
    </>
  );
};
