import { useState } from 'react';
import { loginUser, getAuthErrorMessage } from '../services/authService.js';
import Logo from '../components/Logo.jsx';

export default function Login({ onSwitch }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError('Please enter both your email and password.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await loginUser(form.email.trim(), form.password);
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <div className="auth-brand">
          <Logo />
          <h1>Welcome to ChitChat!</h1>
          <p>Sign in to keep chatting with your classmates.</p>
        </div>

        {error && <p className="error-banner">{error}</p>}

        <label className="field">
          <span>Email</span>
          <input
            className="input"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            className="input"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
        </label>

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="muted small">
          New here?{' '}
          <button type="button" className="link-btn" onClick={onSwitch}>
            Create an account
          </button>
        </p>
      </form>
    </div>
  );
}