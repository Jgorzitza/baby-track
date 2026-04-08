import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export const Layout = () => {
  const location = useLocation();
  
  // Map routes to titles
  const getTitle = (pathname: string) => {
    switch (pathname) {
      case '/': return 'bbtrack';
      case '/feed': return 'Feeding';
      case '/sleep': return 'Sleep';
      case '/diaper': return 'Diaper';
      case '/health': return 'Health';
      case '/reports': return 'Reports';
      case '/settings': return 'Settings';
      case '/doctor': return 'Doctor Appointment';
      default: return 'bbtrack';
    }
  };

  return (
    <>
      <header className="top-bar">
        {getTitle(location.pathname)}
      </header>
      <main>
        <Outlet />
      </main>
      <BottomNav />
    </>
  );
};
