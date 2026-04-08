import { NavLink } from 'react-router-dom';
import { Home, Moon, Baby, Droplets, Heart, FileText, Settings } from 'lucide-react';

export const BottomNav = () => {
  const navItems = [
    { icon: Home, label: 'Home', target: '/' },
    { icon: Droplets, label: 'Feed', target: '/feed' },
    { icon: Moon, label: 'Sleep', target: '/sleep' },
    { icon: Baby, label: 'Diaper', target: '/diaper' },
    { icon: Heart, label: 'Health', target: '/health' },
    { icon: FileText, label: 'Reports', target: '/reports' },
    { icon: Settings, label: 'Settings', target: '/settings' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map(({ icon: Icon, label, target }) => (
        <NavLink 
          key={target}
          to={target} 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Icon size={24} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
