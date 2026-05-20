// frontend/src/components/Moderator.jsx defines a React UI component and documents the state, handlers, and render flow used by this screen.
// Imports React because this file renders JSX components.
import React, { useState, useEffect } from 'react';
// Imports React hooks used to manage component state and lifecycle behavior.
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// Imports the shared API client functions used to communicate with the backend.
import { api } from '../api';
// Imports ./LanguageSwitcher so this file can use its exported functionality.
import LanguageSwitcher from './LanguageSwitcher';

// Moderator renders the moderator screen and connects its UI behavior.
function Moderator() {
  // The translation hook provides localized labels and lets the component react to language changes.
  const { t } = useTranslation();
  // This navigation helper redirects the user after successful actions or role-based decisions.
  const navigate = useNavigate();
  // Stores the applications value so the UI can update when it changes.
  const [applications, setApplications] = useState([]);
  // Stores the loading value so the UI can update when it changes.
  const [loading, setLoading] = useState(true);
  // Stores the error value so the UI can update when it changes.
  const [error, setError] = useState('');
  // Stores the services value so the UI can update when it changes.
  const [services, setServices] = useState([]);

  // useEffect keeps this component behavior synchronized with its dependencies.
  useEffect(() => { fetchAll(); }, []);

  // fetchAll loads the required data and returns it to the caller.
  const fetchAll = async () => {
    // The try block wraps operations that may fail, such as API requests or browser storage updates.
    try {
      setLoading(true);
      const [appsRes, svcRes] = await Promise.all([
        api('/api/moderator/pending-applications'),
        api('/api/services')
      ]);
      setApplications(appsRes.applications || []);
      setServices(svcRes.services || []);
    } catch (err) {
      setError(err.message || t('load_apps_failed', 'Failed to load applications'));
    } finally { setLoading(false); }
  };

  // handleApprove handles the related user action and updates the component state or API data.
  const handleApprove = async (id) => {
    // The try block wraps operations that may fail, such as API requests or browser storage updates.
    try {
      // This API call sends data to the backend or retrieves data needed by the component.
      await api(`/api/moderator/approve-application/${id}`, { method: 'POST', body: JSON.stringify({ approve: true }) });
      setApplications(prev => prev.filter(a => a.id !== id));
    } catch { setError(t('approve_failed', 'Failed to approve application')); }
  };

  // handleReject handles the related user action and updates the component state or API data.
  const handleReject = async (id) => {
    // The try block wraps operations that may fail, such as API requests or browser storage updates.
    try {
      // This API call sends data to the backend or retrieves data needed by the component.
      await api(`/api/moderator/approve-application/${id}`, { method: 'POST', body: JSON.stringify({ approve: false }) });
      setApplications(prev => prev.filter(a => a.id !== id));
    } catch { setError(t('reject_failed', 'Failed to reject application')); }
  };

  // handleSignOut handles the related user action and updates the component state or API data.
  const handleSignOut = () => {
    localStorage.clear();
    navigate('/');
  };

  // Renders the JSX markup for this component.
  return (
    <div className="w-full max-w-5xl">
      {/* This container groups related UI elements and keeps the layout consistent. */}
      <div className="tp-page-card p-5 sm:p-8 mt-4 sm:mt-8">
        {/* This container groups related UI elements and keeps the layout consistent. */}

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-8">
          {/* This container groups related UI elements and keeps the layout consistent. */}
          <div className="min-w-0">
            {/* This container groups related UI elements and keeps the layout consistent. */}
            <h1 className="text-[36px] sm:text-4xl leading-tight font-extrabold text-gray-900 mb-1 break-words">{t('moderator_panel', 'Moderator Panel')}</h1>
            <p className="text-gray-500 leading-relaxed max-w-[15rem] sm:max-w-none">{t('moderator_subtitle', 'Review and approve worker applications')}</p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            {/* This container groups related UI elements and keeps the layout consistent. */}
            <LanguageSwitcher className="shrink-0" />
            {/* This button triggers the main action for this part of the screen. */}
            <button onClick={handleSignOut} className="tp-btn-ghost-danger tp-btn-md ml-auto sm:ml-0 shrink-0">
              {t('sign_out', 'Sign Out')}
            </button>
          </div>
        </div>

        {error && <div className="tp-alert-error mb-6">{error}</div>}

        {loading ? (
          <div className="text-center py-12 text-gray-400">{t('loading_apps', 'Loading applications...')}</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            {/* This container groups related UI elements and keeps the layout consistent. */}
            <p className="text-gray-500 text-lg font-medium">{t('no_pending_apps', 'No pending worker applications')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* This container groups related UI elements and keeps the layout consistent. */}
            {applications.map(app => (
              <div key={app.id} className="bg-white/60 border border-white/80 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                {/* This container groups related UI elements and keeps the layout consistent. */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start mb-4">
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  <div className="flex items-center gap-4 min-w-0">
                    {/* This container groups related UI elements and keeps the layout consistent. */}
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-brand/10 border border-gray-100 text-brand flex items-center justify-center text-xl font-bold flex-shrink-0">
                      {/* This container groups related UI elements and keeps the layout consistent. */}
                      {app.user?.profile_photo ? (
                        <img src={app.user.profile_photo} alt={app.user?.username || 'Profile'} className="w-full h-full object-cover" />
                      ) : (
                        <span>{(app.user?.username || '?')[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      {/* This container groups related UI elements and keeps the layout consistent. */}
                      <h3 className="text-xl font-bold text-gray-800 break-words">{app.government_name} {app.government_surname}</h3>
                      <p className="text-sm text-gray-500 break-words">@{app.user?.username} - {app.user?.phone}</p>
                    </div>
                  </div>
                  <span className="self-start shrink-0 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Pending</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  <div className="min-w-0"><p className="text-xs text-gray-500 uppercase mb-1">Isikukood</p><p className="font-semibold text-gray-800 break-all">{app.isikukood}</p></div>
                  <div className="min-w-0"><p className="text-xs text-gray-500 uppercase mb-1">Bank Account</p><p className="font-semibold text-gray-800 break-all">{app.bank_account}</p></div>
                  <div className="min-w-0"><p className="text-xs text-gray-500 uppercase mb-1">Email</p><p className="font-semibold text-gray-800 break-all">{app.email}</p></div>
                  <div className="sm:col-span-2 md:col-span-3 min-w-0">
                    {/* This container groups related UI elements and keeps the layout consistent. */}
                    <p className="text-xs text-gray-500 uppercase mb-1">Services</p>
                    <div className="flex flex-wrap gap-2">
                      {/* This container groups related UI elements and keeps the layout consistent. */}
                      {(Array.isArray(app.services) ? app.services : []).map(sid => {
                        const svc = services.find(s => s.id === Number(sid));
                        return svc ? <span key={sid} className="px-2 py-0.5 bg-brand/10 text-brand rounded-full text-xs font-semibold">{svc.name}</span> : null;
                      })}
                    </div>
                  </div>
                  <div className="min-w-0"><p className="text-xs text-gray-500 uppercase mb-1">Applied</p><p className="font-semibold text-gray-800">{new Date(app.created_at).toLocaleDateString()}</p></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* This button triggers the main action for this part of the screen. */}
                  <button onClick={() => handleApprove(app.id)} className="tp-btn-success tp-btn-md flex-1">Approve</button>
                  {/* This button triggers the main action for this part of the screen. */}
                  <button onClick={() => handleReject(app.id)} className="tp-btn-danger tp-btn-md flex-1">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Moderator;
