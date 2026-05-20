// frontend/src/components/Settings.jsx defines a React UI component and documents the state, handlers, and render flow used by this screen.
// Imports React hooks used to manage component state and lifecycle behavior.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Imports the shared API client functions used to communicate with the backend.
import { api } from '../api';
// Imports ../context/SidebarContext so this file can use its exported functionality.
import { useSidebar } from '../context/SidebarContext';
// Imports React hooks used to manage component state and lifecycle behavior.
import { useTranslation } from 'react-i18next';

// Settings renders the settings screen and connects its UI behavior.
export default function Settings() {
  // The translation hook provides localized labels and lets the component react to language changes.
  const { t } = useTranslation();
  const { openSidebar } = useSidebar();
  // This navigation helper redirects the user after successful actions or role-based decisions.
  const navigate = useNavigate();
  // This value is read from localStorage to restore existing session or preference data.
  const userId = localStorage.getItem('userId');
  // Stores the user value so the UI can update when it changes.
  const [user, setUser] = useState(null);
  // Stores the editingUsername value so the UI can update when it changes.
  const [editingUsername, setEditingUsername] = useState(false);
  // Stores the usernameDraft value so the UI can update when it changes.
  const [usernameDraft, setUsernameDraft] = useState('');
  // Stores the usernameSaving value so the UI can update when it changes.
  const [usernameSaving, setUsernameSaving] = useState(false);
  // Stores the usernameError value so the UI can update when it changes.
  const [usernameError, setUsernameError] = useState('');

  // useEffect keeps this component behavior synchronized with its dependencies.
  useEffect(() => {
    if (!userId) { navigate('/'); return; }
    api(`/api/user/${userId}`)
      .then(res => setUser(res.user))
      .catch(err => console.error(err));
  }, [userId]);

  // startUsernameEdit contains reusable logic for this file.
  const startUsernameEdit = () => {
    setUsernameDraft(user?.username || '');
    setUsernameError('');
    setEditingUsername(true);
  };

  // cancelUsernameEdit contains reusable logic for this file.
  const cancelUsernameEdit = () => {
    setUsernameDraft(user?.username || '');
    setUsernameError('');
    setEditingUsername(false);
  };

  // saveUsername performs the related data change and keeps the UI or database in sync.
  const saveUsername = async (e) => {
    e.preventDefault();
    const nextUsername = usernameDraft.trim();

    if (!nextUsername) {
      setUsernameError(t('username_required', { defaultValue: 'Username is required' }));
      return;
    }

    if (nextUsername === user?.username) {
      setEditingUsername(false);
      setUsernameError('');
      return;
    }

    setUsernameSaving(true);
    setUsernameError('');

    // The try block wraps operations that may fail, such as API requests or browser storage updates.
    try {
      // This API call sends data to the backend or retrieves data needed by the component.
      const res = await api(`/api/user/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ username: nextUsername })
      });
      setUser(res.user || { ...user, username: nextUsername });
      setEditingUsername(false);
    } catch (err) {
      const message = err.payload?.error || err.message || 'Failed to update username';
      setUsernameError(message === 'Username already taken'
        ? t('username_taken', { defaultValue: 'Username already taken' })
        : message);
    } finally {
      setUsernameSaving(false);
    }
  };

  // Renders the JSX markup for this component.
  return (
    <div className="tp-page-card tp-page-card-hover max-w-2xl p-8 md:p-12">
      {/* This container groups related UI elements and keeps the layout consistent. */}
      <div className="tp-page-card-shine"></div>

      <div className="relative z-10">
        {/* This container groups related UI elements and keeps the layout consistent. */}
        <div className="flex justify-between items-center mb-8">
          {/* This container groups related UI elements and keeps the layout consistent. */}
          <h1 className="tp-brand-title">
            Teenuste<span className="tp-brand-accent">Portaal</span>
          </h1>
          <div className="flex gap-2">
            {/* This container groups related UI elements and keeps the layout consistent. */}
            <button
              type="button"
              onClick={openSidebar}
              className="tp-icon-btn"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-[#111827] mb-6 tracking-tight">
          {t('menu_settings')}
        </h2>

        <div className="space-y-4">
          {/* This container groups related UI elements and keeps the layout consistent. */}
          <div className="tp-panel">
            {/* This container groups related UI elements and keeps the layout consistent. */}
            <div className="flex justify-between items-center mb-3">
              {/* This container groups related UI elements and keeps the layout consistent. */}
              <h3 className="font-semibold text-gray-900">{t('profile')}</h3>
            </div>
            <div className="space-y-3">
              {/* This container groups related UI elements and keeps the layout consistent. */}
              <div>
                {/* This container groups related UI elements and keeps the layout consistent. */}
                {editingUsername ? (
                  <form onSubmit={saveUsername} className="space-y-3">
                    {/* This form groups related fields and connects the submit button to the matching handler. */}
                    <div>
                      {/* This container groups related UI elements and keeps the layout consistent. */}
                      <label className="tp-label-sm uppercase text-gray-400" htmlFor="settings-username">
                        {t('username')}
                      </label>
                      <input
                        id="settings-username"
                        type="text"
                        value={usernameDraft}
                        onChange={(e) => {
                          setUsernameDraft(e.target.value);
                          setUsernameError('');
                        }}
                        className="tp-input-compact mt-1"
                        autoComplete="username"
                        disabled={usernameSaving}
                        autoFocus
                      />
                    </div>
                    {usernameError && (
                      <p className="text-xs font-semibold text-red-500">{usernameError}</p>
                    )}
                    <div className="flex gap-2">
                      {/* This container groups related UI elements and keeps the layout consistent. */}
                      <button
                        type="submit"
                        disabled={usernameSaving}
                        className="tp-btn-primary tp-btn-sm"
                      >
                        {usernameSaving ? t('saving', { defaultValue: 'Saving...' }) : t('save')}
                      </button>
                      <button
                        type="button"
                        onClick={cancelUsernameEdit}
                        disabled={usernameSaving}
                        className="tp-btn-secondary tp-btn-sm"
                      >
                        {t('cancel', { defaultValue: 'Cancel' })}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-between items-center">
                    {/* This container groups related UI elements and keeps the layout consistent. */}
                    <div>
                      {/* This container groups related UI elements and keeps the layout consistent. */}
                      <p className="text-xs text-gray-400 uppercase">{t('username')}</p>
                      <p className="font-medium text-gray-700">{user?.username}</p>
                    </div>
                    <button
                      type="button"
                      onClick={startUsernameEdit}
                      className="tp-text-link"
                    >
                      {t('edit')}
                    </button>
                  </div>
                )}
              </div>
              {user?.phone && (
                <div className="flex justify-between items-center">
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  <div>
                    {/* This container groups related UI elements and keeps the layout consistent. */}
                    <p className="text-xs text-gray-400 uppercase">{t('phone')}</p>
                    <p className="font-medium text-gray-700">{user.phone}</p>
                  </div>
                </div>
              )}
              {user?.email && (
                <div className="flex justify-between items-center">
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  <div>
                    {/* This container groups related UI elements and keeps the layout consistent. */}
                    <p className="text-xs text-gray-400 uppercase">{t('email')}</p>
                    <p className="font-medium text-gray-700">{user.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
  );
}
