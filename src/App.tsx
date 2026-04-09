import { useState, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AlertCircle, Baby, KeyRound, LoaderCircle, LogIn, Mail, Lock, RefreshCcw } from 'lucide-react';
import { Layout } from './components/layout/Layout';
import { AppProvider } from './lib/app-context';
import { useAppContext } from './lib/app-hooks';
import { useKeyboardResilience } from './lib/useKeyboardResilience';
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

const LoadingScreen = () => (
  <div className="auth-screen" style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
    <div className="card text-center" style={{ maxWidth: 420 }}>
      <LoaderCircle size={40} className="text-primary" style={{ margin: '0 auto 1rem auto', animation: 'spin 1s linear infinite' }} />
      <h2>Loading bbtrack</h2>
      <p className="text-muted text-sm" style={{ marginTop: '0.5rem' }}>
        Restoring your household and cached sessions.
      </p>
    </div>
  </div>
);

const ConfigErrorScreen = () => {
  const { configError } = useAppContext();
  return (
    <div className="auth-screen" style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <div className="card text-center" style={{ maxWidth: 460 }}>
        <div className="btn btn-secondary btn-icon" style={{ width: 72, height: 72, margin: '0 auto 1rem auto' }}>
          <AlertCircle size={32} className="text-danger" />
        </div>
        <h2>{configError?.title ?? 'Configuration Required'}</h2>
        <p className="text-muted text-sm" style={{ marginTop: '0.75rem' }}>
          {configError?.message ?? 'Set your environment variables before signing in.'}
        </p>
      </div>
    </div>
  );
};

const AuthScreen = () => {
  const { signIn, signUp, requestPasswordReset, actionError, clearActionError, isRefreshing } = useAppContext();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    clearActionError();
    setMessage(null);

    if (mode === 'signin') {
      await signIn(email, password);
      return;
    }

    if (mode === 'signup') {
      await signUp(email, password);
      return;
    }

    await requestPasswordReset(email);
    setMessage('Password reset email sent.');
  };

  return (
    <div className="auth-screen" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100dvh' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="btn btn-primary btn-icon" style={{ width: 80, height: 80, margin: '0 auto 1.25rem auto' }}>
          <Baby size={40} />
        </div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>bbtrack</h1>
        <p className="text-muted text-sm">Private newborn tracking for your household</p>
      </div>

      <div className="flex-row space-between" style={{ marginBottom: '0.75rem', gap: '0.5rem' }}>
        <button className={`btn ${mode === 'signin' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => setMode('signin')}>
          Sign In
        </button>
        <button className={`btn ${mode === 'signup' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => setMode('signup')}>
          Create Account
        </button>
      </div>

      <button className="btn btn-secondary btn-block" style={{ marginBottom: '1rem', minHeight: 44 }} onClick={() => setMode('reset')}>
        <RefreshCcw size={18} />
        <span>Reset Password</span>
      </button>

      <form
        className="card"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="flex-row">
            <Mail size={18} className="text-muted" />
            <input
              type="email"
              className="form-control"
              placeholder="parent@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>

        {mode !== 'reset' && (
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="flex-row">
              <Lock size={18} className="text-muted" />
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </div>
        )}

        {actionError && (
          <div className="card" style={{ background: 'rgba(255, 107, 107, 0.08)', marginBottom: '1rem' }}>
            <p className="text-sm" style={{ margin: 0, color: 'var(--danger)' }}>
              {actionError}
            </p>
          </div>
        )}

        {message && (
          <div className="card" style={{ background: 'rgba(102, 187, 106, 0.08)', marginBottom: '1rem' }}>
            <p className="text-sm" style={{ margin: 0, color: 'var(--success)' }}>
              {message}
            </p>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={isRefreshing} style={{ marginTop: '1rem', height: 56 }}>
          {mode === 'reset' ? <KeyRound size={20} /> : <LogIn size={20} />}
          <span>
            {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Email'}
          </span>
        </button>
      </form>
    </div>
  );
};

const ResetPasswordScreen = () => {
  const { updatePassword, actionError, clearActionError, isRefreshing } = useAppContext();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    clearActionError();
    setMessage(null);
    await updatePassword(password);
    setMessage('Password updated. You can return to the app.');
  };

  return (
    <div className="auth-screen" style={{ padding: '2rem', display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>
      <form
        className="card"
        style={{ width: '100%', maxWidth: 440 }}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <h2 style={{ marginBottom: '0.75rem' }}>Set New Password</h2>
        <p className="text-muted text-sm">Finish recovery and sign back in on this device.</p>
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label className="form-label">New Password</label>
          <input type="password" className="form-control" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
        {actionError && <p className="text-sm" style={{ color: 'var(--danger)' }}>{actionError}</p>}
        {message && <p className="text-sm" style={{ color: 'var(--success)' }}>{message}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={isRefreshing}>
          <KeyRound size={20} />
          <span>Update Password</span>
        </button>
      </form>
    </div>
  );
};

const ProtectedLayout = () => {
  const { authStatus, isLoading, configError } = useAppContext();

  if (configError) {
    return <ConfigErrorScreen />;
  }

  if (isLoading || authStatus === 'loading') {
    return <LoadingScreen />;
  }

  if (authStatus !== 'signed_in') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const SetupGate = ({ children }: { children: ReactNode }) => {
  const { household, baby } = useAppContext();

  if (!household) {
    return <Navigate to="/household" replace />;
  }

  if (!baby) {
    return <Navigate to="/baby" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { authStatus, configError, isLoading, household, baby } = useAppContext();

  useKeyboardResilience();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          configError ? (
            <ConfigErrorScreen />
          ) : authStatus === 'signed_in' ? (
            <Navigate to={household ? (baby ? '/' : '/baby') : '/household'} replace />
          ) : (
            <AuthScreen />
          )
        }
      />
      <Route path="/reset-password" element={<ResetPasswordScreen />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/household" element={household ? <Navigate to={baby ? '/' : '/baby'} replace /> : <HouseholdScreen />} />
        <Route path="/baby" element={household ? (baby ? <Navigate to="/" replace /> : <BabyProfileScreen />) : <Navigate to="/household" replace />} />
        <Route
          path="/"
          element={
            <SetupGate>
              <HomeScreen />
            </SetupGate>
          }
        />
        <Route
          path="/feed"
          element={
            <SetupGate>
              <FeedScreen />
            </SetupGate>
          }
        />
        <Route
          path="/sleep"
          element={
            <SetupGate>
              <SleepScreen />
            </SetupGate>
          }
        />
        <Route
          path="/diaper"
          element={
            <SetupGate>
              <DiaperScreen />
            </SetupGate>
          }
        />
        <Route
          path="/health"
          element={
            <SetupGate>
              <HealthScreen />
            </SetupGate>
          }
        />
        <Route
          path="/reports"
          element={
            <SetupGate>
              <ReportsScreen />
            </SetupGate>
          }
        />
        <Route
          path="/settings"
          element={
            <SetupGate>
              <SettingsScreen />
            </SetupGate>
          }
        />
        <Route
          path="/doctor"
          element={
            <SetupGate>
              <DoctorScreen />
            </SetupGate>
          }
        />
        <Route
          path="/doctor/questions"
          element={
            <SetupGate>
              <DoctorQuestionsScreen />
            </SetupGate>
          }
        />
        <Route
          path="/household/manage"
          element={
            <SetupGate>
              <HouseholdScreen />
            </SetupGate>
          }
        />
        <Route
          path="/timeline"
          element={
            <SetupGate>
              <MedicalTimelineScreen />
            </SetupGate>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to={isLoading ? '/login' : authStatus === 'signed_in' ? '/' : '/login'} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
