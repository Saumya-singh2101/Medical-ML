import React, { useEffect, useState } from 'react';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Education } from './pages/Education';
import { History } from './pages/History';
import { AuthUser, verifySession, logout } from './services/auth';

type Screen = 'landing' | 'login' | 'dashboard' | 'education' | 'history';

function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await verifySession();
      if (user) {
        setAuthUser(user);
        setScreen('dashboard');
      }
      setAuthChecked(true);
    })();
  }, []);

  const handleAuthed = (user: AuthUser) => {
    setAuthUser(user);
    setScreen('dashboard');
  };

  const handleLogout = () => {
    logout();
    setAuthUser(null);
    setScreen('landing');
  };

  if (!authChecked) return <div className="min-h-screen bg-void" />;

  if (screen === 'landing') return <Landing onEnter={() => setScreen('login')} />;

  if (screen === 'login' || !authUser) {
    return <Login onAuthed={handleAuthed} onBack={() => setScreen('landing')} />;
  }

  // Shared nav props for authenticated pages
  const navProps = {
    user: authUser,
    onLogout: handleLogout,
    currentScreen: screen,
    onNavigate: setScreen,
  };

  if (screen === 'education') return <Education {...navProps} />;
  if (screen === 'history') return <History {...navProps} />;

  return <Dashboard {...navProps} />;
}

export default App;
