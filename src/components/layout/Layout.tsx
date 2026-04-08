import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export const Layout = () => {
  const location = useLocation();
  
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
      default: return 'bbtrack';
    }
  };

  return (
    <>
      <header className="top-bar">
        <div className="sync-status">
          <div className="sync-indicator"></div>
          <span>Offline Ready</span>
        </div>
        <div>{getTitle(location.pathname)}</div>
      </header>
      <main>
        <Outlet />
      </main>
      <BottomNav />
    </>
  );
};
