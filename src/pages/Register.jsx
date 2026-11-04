import { useState } from 'react';
import { registerUser, getAuthErrorMessage } from '../services/authService.js';
import Logo from '../components/Logo.jsx';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ displayName, email, password }) {
  if (!displayName.trim()) return 'Please enter a display name.';
  if (displayName.trim().length > 50) return 'Display name must be 50 characters or fewer.';
  if (!EMAIL_PATTERN.test(email.trim())) return 'Please enter a valid email address.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return '';
}

export default function Register({ onSwitch }) {
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await registerUser({
        displayName: form.displayName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
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
          <h1>Create your account</h1>
          <p>Join Chit Chat in a few seconds.</p>
        </div>

        {error && <p className="error-banner">{error}</p>}

        <label className="field">
          <span>Display name</span>
          <input
            className="input"
            name="displayName"
            value={form.displayName}
            onChange={handleChange}
            autoComplete="nickname"
          />
        </label>

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
          <span>Password (min. 6 characters)</span>
          <input
            className="input"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </label>

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Register'}
        </button>

        <p className="muted small">
          Already registered?{' '}
          <button type="button" className="link-btn" onClick={onSwitch}>
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
}