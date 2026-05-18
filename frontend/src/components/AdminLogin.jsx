import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await api('/api/admin-login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password })
      });
      localStorage.setItem('userId', String(result.userId || ''));
      navigate('/admin');
    } catch (err) {
      setError(err.payload?.error || err.message || 'Admin login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tp-page-card tp-page-card-hover max-w-md p-10">
      <div className="tp-page-card-shine" />
      <div className="relative z-10">
        <div className="text-center mb-8">
          <h1 className="tp-brand-title text-4xl mb-3">Admin <span className="tp-brand-accent">System</span></h1>
          <p className="text-gray-500 font-medium">Restricted access area</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="tp-label">Admin Username</label>
            <input 
              type="text" 
              autoComplete="username"
              className="tp-input"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="tp-label">Password</label>
            <input 
              type="password" 
              className="tp-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="tp-btn-primary tp-btn-form mt-4 hover:-translate-y-1"
          >
            {isSubmitting ? 'Authenticating...' : 'Authenticate'}
          </button>

          {error ? (
            <div className="tp-alert-error">
              {error}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
