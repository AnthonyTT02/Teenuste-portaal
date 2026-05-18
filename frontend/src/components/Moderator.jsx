import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import LanguageSwitcher from './LanguageSwitcher';

function Moderator() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [services, setServices] = useState([]);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
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

  const handleApprove = async (id) => {
    try {
      await api(`/api/moderator/approve-application/${id}`, { method: 'POST', body: JSON.stringify({ approve: true }) });
      setApplications(prev => prev.filter(a => a.id !== id));
    } catch { setError(t('approve_failed', 'Failed to approve application')); }
  };

  const handleReject = async (id) => {
    try {
      await api(`/api/moderator/approve-application/${id}`, { method: 'POST', body: JSON.stringify({ approve: false }) });
      setApplications(prev => prev.filter(a => a.id !== id));
    } catch { setError(t('reject_failed', 'Failed to reject application')); }
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="w-full max-w-5xl animate-fade-in-up">
      <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-2xl rounded-[2rem] p-5 sm:p-8 mt-4 sm:mt-8 relative overflow-hidden">

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-8">
          <div className="min-w-0">
            <h1 className="text-[36px] sm:text-4xl leading-tight font-extrabold text-gray-900 mb-1 break-words">{t('moderator_panel', 'Moderator Panel')}</h1>
            <p className="text-gray-500 leading-relaxed max-w-[15rem] sm:max-w-none">{t('moderator_subtitle', 'Review and approve worker applications')}</p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            <LanguageSwitcher className="shrink-0" />
            <button onClick={handleSignOut} className="ml-auto sm:ml-0 shrink-0 px-4 sm:px-5 py-2.5 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-500 font-bold text-sm transition-colors border border-gray-200/60 hover:border-red-200">
              {t('sign_out', 'Sign Out')}
            </button>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold">{error}</div>}

        {loading ? (
          <div className="text-center py-12 text-gray-400">{t('loading_apps', 'Loading applications...')}</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg font-medium">{t('no_pending_apps', 'No pending worker applications')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app.id} className="bg-white/60 border border-white/80 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start mb-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-brand/10 border border-gray-100 text-brand flex items-center justify-center text-xl font-bold flex-shrink-0">
                      {app.user?.profile_photo ? (
                        <img src={app.user.profile_photo} alt={app.user?.username || 'Profile'} className="w-full h-full object-cover" />
                      ) : (
                        <span>{(app.user?.username || '?')[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-bold text-gray-800 break-words">{app.government_name} {app.government_surname}</h3>
                      <p className="text-sm text-gray-500 break-words">@{app.user?.username} - {app.user?.phone}</p>
                    </div>
                  </div>
                  <span className="self-start shrink-0 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Pending</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="min-w-0"><p className="text-xs text-gray-500 uppercase mb-1">Isikukood</p><p className="font-semibold text-gray-800 break-all">{app.isikukood}</p></div>
                  <div className="min-w-0"><p className="text-xs text-gray-500 uppercase mb-1">Bank Account</p><p className="font-semibold text-gray-800 break-all">{app.bank_account}</p></div>
                  <div className="min-w-0"><p className="text-xs text-gray-500 uppercase mb-1">Email</p><p className="font-semibold text-gray-800 break-all">{app.email}</p></div>
                  <div className="sm:col-span-2 md:col-span-3 min-w-0">
                    <p className="text-xs text-gray-500 uppercase mb-1">Services</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(app.services) ? app.services : []).map(sid => {
                        const svc = services.find(s => s.id === Number(sid));
                        return svc ? <span key={sid} className="px-2 py-0.5 bg-brand/10 text-brand rounded-full text-xs font-semibold">{svc.name}</span> : null;
                      })}
                    </div>
                  </div>
                  <div className="min-w-0"><p className="text-xs text-gray-500 uppercase mb-1">Applied</p><p className="font-semibold text-gray-800">{new Date(app.created_at).toLocaleDateString()}</p></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleApprove(app.id)} className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors">Approve</button>
                  <button onClick={() => handleReject(app.id)} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors">Reject</button>
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
