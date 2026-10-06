import { useState } from 'react';
import { login, register, errorMessage } from '../api.js';
import BeachScene from './BeachScene.jsx';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'register') {
        await register(form);
      }
      const data = await login(form.email, form.password);
      onLogin(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <BeachScene />
      <form className="card auth-card" onSubmit={submit}>
        <div className="brand">📦</div>
        <h1>Product Management</h1>
        <p className="muted">{mode === 'login' ? 'Sign in to manage your products' : 'Create an account to get started'}</p>

        {error && <div className="alert error">{error}</div>}

        {mode === 'register' && (
          <label>
            Username
            <input value={form.username} onChange={set('username')} placeholder="juandelacruz" required minLength={3} maxLength={100} autoComplete="username" />
          </label>
        )}
        <label>
          {mode === 'login' ? 'Email or username' : 'Email'}
          <input
            type={mode === 'login' ? 'text' : 'email'}
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={set('password')} placeholder="At least 8 characters" required minLength={mode === 'register' ? 8 : 1} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
        </label>

        <button className="btn primary block" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Register & Login'}
        </button>

        <p className="switch">
          {mode === 'login' ? (
            <>
              No account yet?{' '}
              <button type="button" className="link" onClick={() => { setMode('register'); setError(''); }}>Register</button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button type="button" className="link" onClick={() => { setMode('login'); setError(''); }}>Login</button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
