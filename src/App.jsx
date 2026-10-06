import { useEffect, useState } from 'react';
import Login from './components/Login.jsx';
import ProductList from './components/ProductList.jsx';
import { session, logout } from './api.js';

export default function App() {
  const [auth, setAuth] = useState(() => session.get());

  // The API layer fires this event when the session can no longer be refreshed
  useEffect(() => {
    const onLogout = () => setAuth(null);
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const handleLogin = (data) => {
    session.set({ user: data.user, tokens: data.tokens });
    setAuth(session.get());
  };

  const handleLogout = async () => {
    try {
      await logout(); // revokes the refresh token on the server
    } catch {
      /* even if the request fails, clear the local session */
    }
    session.clear();
    setAuth(null);
  };

  if (!auth) return <Login onLogin={handleLogin} />;
  return <ProductList user={auth.user} onLogout={handleLogout} />;
}
