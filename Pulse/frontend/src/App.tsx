import React, { useEffect, useState } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AuthUser, verifySession, logout } from './services/auth';

function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await verifySession();
      setAuthUser(user);
      setAuthChecked(true);
    })();
  }, []);

  const handleLogout = () => {
    logout();
    setAuthUser(null);
  };

  if (!authChecked) {
    return <div className="min-h-screen bg-void" />;
  }

  if (!authUser) {
    return <Login onAuthed={setAuthUser} />;
  }

  return <Dashboard user={authUser} onLogout={handleLogout} />;
}

export default App;
