import { NavLink } from 'react-router-dom';
import { Home, Moon, Baby, Droplets, Heart, FileText, Settings } from 'lucide-react';

export const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={24} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/feed" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Droplets size={24} />
        <span>Feed</span>
      </NavLink>
      <NavLink to="/sleep" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Moon size={24} />
        <span>Sleep</span>
      </NavLink>
      <NavLink to="/diaper" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Baby size={24} />
        <span>Diaper</span>
      </NavLink>
      <NavLink to="/health" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Heart size={24} />
        <span>Health</span>
      </NavLink>
      <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <FileText size={24} />
        <span>Reports</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Settings size={24} />
        <span>Settings</span>
      </NavLink>
    </nav>
  );
};
