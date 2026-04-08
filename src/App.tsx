import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomeScreen } from './routes/home/HomeScreen';
import { FeedScreen } from './routes/feed/FeedScreen';
import { SleepScreen } from './routes/sleep/SleepScreen';
import { DiaperScreen } from './routes/diaper/DiaperScreen';
import { HealthScreen } from './routes/health/HealthScreen';
import { ReportsScreen } from './routes/reports/ReportsScreen';
import { SettingsScreen } from './routes/settings/SettingsScreen';
import { DoctorScreen } from './routes/doctor/DoctorScreen';
import { HouseholdScreen } from './routes/household/HouseholdScreen';
import { BabyProfileScreen } from './routes/baby/BabyProfileScreen';
import { DoctorQuestionsScreen } from './routes/doctor/DoctorQuestionsScreen';
import { MedicalTimelineScreen } from './routes/medical-timeline/MedicalTimelineScreen';
import { useState } from 'react';
import { LogIn, Mail, Lock, Baby } from 'lucide-react';
import { useKeyboardResilience } from './lib/useKeyboardResilience';

// Simplified Auth Screen
const AuthScreen = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="auth-screen" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100dvh' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="btn btn-primary btn-icon" style={{ width: 80, height: 80, margin: '0 auto 1.5rem auto' }}>
          <Baby size={40} />
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>bbtrack</h1>
        <p className="text-muted">Private newborn tracking for your family</p>
      </div>

      <div className="card">
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="flex-row">
            <Mail size={18} className="text-muted" />
            <input type="email" className="form-control" placeholder="parent@example.com" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="flex-row">
            <Lock size={18} className="text-muted" />
            <input type="password" className="form-control" placeholder="••••••••" />
          </div>
        </div>
        <button className="btn btn-primary btn-block" onClick={onLogin} style={{ marginTop: '1rem', height: 56 }}>
          <LogIn size={20} />
          <span>Sign In</span>
        </button>
      </div>

      <p className="text-center text-sm text-muted" style={{ marginTop: '2rem' }}>
        No account? <span className="text-primary font-bold">Join a household</span>
      </p>
    </div>
  );
};

// Protected Route Component
const ProtectedLayout = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Layout><Outlet /></Layout>;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('bbtrack_auth') === 'true';
  });

  useKeyboardResilience();

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('bbtrack_auth', 'true');
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <AuthScreen onLogin={handleLogin} />
        } />

        {/* Protected Routes */}
        <Route element={<ProtectedLayout isAuthenticated={isAuthenticated} />}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/feed" element={<FeedScreen />} />
          <Route path="/sleep" element={<SleepScreen />} />
          <Route path="/diaper" element={<DiaperScreen />} />
          <Route path="/health" element={<HealthScreen />} />
          <Route path="/reports" element={<ReportsScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/doctor" element={<DoctorScreen />} />
          <Route path="/doctor/questions" element={<DoctorQuestionsScreen />} />
          <Route path="/household" element={<HouseholdScreen />} />
          <Route path="/baby" element={<BabyProfileScreen />} />
          <Route path="/timeline" element={<MedicalTimelineScreen />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
