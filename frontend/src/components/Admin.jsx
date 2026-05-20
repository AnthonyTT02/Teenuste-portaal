// frontend/src/components/Admin.jsx defines a React UI component and documents the state, handlers, and render flow used by this screen.
// Imports React because this file renders JSX components.
import React, { useEffect, useState } from 'react';
// Imports React hooks used to manage component state and lifecycle behavior.
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// Imports ./LanguageSwitcher so this file can use its exported functionality.
import LanguageSwitcher from './LanguageSwitcher';

// Admin renders the admin screen and connects its UI behavior.
function Admin() {
  // The translation hook provides localized labels and lets the component react to language changes.
  const { t } = useTranslation();
  // This navigation helper redirects the user after successful actions or role-based decisions.
  const navigate = useNavigate();
  // This value is read from localStorage to restore existing session or preference data.
  const userId = localStorage.getItem('userId');
  const authHeaders = { 'Content-Type': 'application/json', 'x-user-id': userId || '' };
  // afetch contains reusable logic for this file.
  const afetch = (url, opts = {}) => fetch(url, { credentials: 'include', ...opts, headers: { ...authHeaders, ...(opts.headers || {}) } }).then(r => r.json());

  // Stores the stats value so the UI can update when it changes.
  const [stats, setStats] = useState({ totalUsers: 0, activeWorkers: 0, totalOrders: 0 });
  // Stores the users value so the UI can update when it changes.
  const [users, setUsers] = useState([]);
  // Stores the services value so the UI can update when it changes.
  const [services, setServices] = useState([]);
  // Stores the activeTab value so the UI can update when it changes.
  const [activeTab, setActiveTab] = useState('users');
  // Stores the loading value so the UI can update when it changes.
  const [loading, setLoading] = useState(true);
  // Stores the newService value so the UI can update when it changes.
  const [newService, setNewService] = useState({ name: '', price: '', description: '' });
  // Stores the editingService value so the UI can update when it changes.
  const [editingService, setEditingService] = useState(null);
  // Stores the error value so the UI can update when it changes.
  const [error, setError] = useState('');

  // useEffect keeps this component behavior synchronized with its dependencies.
  useEffect(() => { fetchAll(); }, []);

  // fetchAll loads the required data and returns it to the caller.
  const fetchAll = async () => {
    setLoading(true);
    // The try block wraps operations that may fail, such as API requests or browser storage updates.
    try {
      const [statsRes, usersRes, svcRes] = await Promise.all([
        afetch('/api/admin/stats'),
        afetch('/admin/users'),
        afetch('/api/admin/services'),
      ]);
      if (statsRes.ok) setStats(statsRes);
      if (usersRes.ok) setUsers(usersRes.users || []);
      if (svcRes.ok) setServices(svcRes.services || []);
    } catch (e) { setError('Failed to load data'); }
    setLoading(false);
  };

  // deleteUser performs the related data change and keeps the UI or database in sync.
  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    const res = await afetch(`/admin/users/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== id));
      setStats(prev => ({ ...prev, totalUsers: Math.max(0, prev.totalUsers - 1) }));
    } else {
      setError(res.error || 'Failed to delete user');
    }
  };

  // createService performs the related data change and keeps the UI or database in sync.
  const createService = async () => {
    if (!newService.name) return;
    const res = await afetch('/api/admin/services', { method: 'POST', body: JSON.stringify(newService) });
    if (res.ok) { setServices(prev => [...prev, res.service]); setNewService({ name: '', price: '', description: '' }); }
    else setError(res.error);
  };

  // updateService performs the related data change and keeps the UI or database in sync.
  const updateService = async (id) => {
    if (!editingService) return;
    const res = await afetch(`/api/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(editingService) });
    if (res.ok) { setServices(prev => prev.map(s => s.id === id ? res.service : s)); setEditingService(null); }
  };

  // deleteService performs the related data change and keeps the UI or database in sync.
  const deleteService = async (id) => {
    if (!confirm('Delete this service?')) return;
    await afetch(`/api/admin/services/${id}`, { method: 'DELETE' });
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // handleSignOut handles the related user action and updates the component state or API data.
  const handleSignOut = () => {
    afetch('/admin/logout', { method: 'POST' });
    localStorage.clear();
    navigate('/');
  };

  const statCards = [
    { label: t('total_users', 'Total Users'), value: stats.totalUsers, color: 'from-blue-500/10 to-blue-500/5 text-blue-600' },
    { label: t('active_workers', 'Active Workers'), value: stats.activeWorkers, color: 'from-green-500/10 to-green-500/5 text-green-600' },
    { label: t('total_orders', 'Total Orders'), value: stats.totalOrders, color: 'from-purple-500/10 to-purple-500/5 text-purple-600' },
  ];
  // statusBadgeClass contains reusable logic for this file.
  const statusBadgeClass = (status) => (
    status === 'worker' ? 'bg-green-100 text-green-700'
      : status === 'moderator' ? 'bg-blue-100 text-blue-700'
        : status === 'support' ? 'bg-purple-100 text-purple-700'
          : status === 'admin' ? 'bg-gray-200 text-gray-700'
            : 'bg-gray-100 text-gray-600'
  );

  // Renders the JSX markup for this component.
  return (
    <div className="w-full max-w-6xl">
      {/* This container groups related UI elements and keeps the layout consistent. */}
      <div className="tp-page-card p-5 sm:p-8 mt-4 sm:mt-8">
        {/* This container groups related UI elements and keeps the layout consistent. */}

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-8">
          {/* This container groups related UI elements and keeps the layout consistent. */}
          <div className="min-w-0">
            {/* This container groups related UI elements and keeps the layout consistent. */}
            <h1 className="text-[36px] sm:text-4xl leading-tight font-extrabold text-gray-900 mb-1 break-words">{t('admin_panel', 'Admin Dashboard')}</h1>
            <p className="text-gray-500 leading-relaxed max-w-[13rem] sm:max-w-none">{t('admin_subtitle', 'Real-time platform management')}</p>
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

        {error && <div className="tp-alert-error mb-4">{error}</div>}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          {/* This container groups related UI elements and keeps the layout consistent. */}
          {statCards.map(({ label, value, color }) => (
            <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-4 sm:p-6 text-center border border-white/60 min-w-0`}>
              {/* This container groups related UI elements and keeps the layout consistent. */}
              <p className="text-3xl font-extrabold mb-1">{loading ? '...' : value}</p>
              <p className="text-xs sm:text-sm font-semibold opacity-70 leading-snug break-words">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-6 sm:flex">
          {/* This container groups related UI elements and keeps the layout consistent. */}
          {['users', 'services'].map(tKey => (
            <button key={tKey} onClick={() => setActiveTab(tKey)} className={`tp-tab ${activeTab === tKey ? 'tp-tab-active' : ''}`}>
              {t(tKey, tKey)} ({tKey === 'users' ? users.length : services.length})
            </button>
          ))}
        </div>

        {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> : (
          <>
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white/70 border border-white/60 rounded-2xl overflow-hidden">
                {/* This container groups related UI elements and keeps the layout consistent. */}
                <table className="hidden sm:table w-full text-left">
                  <thead className="border-b border-gray-100">
                    <tr>
                      {['ID', 'Username', 'Status', 'Phone', 'Action'].map(h => (
                        <th key={h} className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-gray-50 hover:bg-white/50 transition-colors">
                        <td className="py-3 px-4 text-gray-400 text-sm">#{u.id}</td>
                        <td className="py-3 px-4 font-semibold text-gray-800">{u.username}</td>
                        <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusBadgeClass(u.status)}`}>{u.status}</span></td>
                        <td className="py-3 px-4 text-gray-500 text-sm">{u.phone || '—'}</td>
                        <td className="py-3 px-4">
                          {/* This button triggers the main action for this part of the screen. */}
                          <button onClick={() => deleteUser(u.id)} className="tp-text-link-danger">{t('delete', 'Delete')}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="sm:hidden divide-y divide-gray-100">
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  {users.map(u => (
                    <div key={u.id} className="p-4">
                      {/* This container groups related UI elements and keeps the layout consistent. */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        {/* This container groups related UI elements and keeps the layout consistent. */}
                        <div className="min-w-0">
                          {/* This container groups related UI elements and keeps the layout consistent. */}
                          <p className="text-xs font-bold text-gray-400">#{u.id}</p>
                          <p className="font-bold text-gray-900 break-words">{u.username}</p>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ${statusBadgeClass(u.status)}`}>{u.status}</span>
                      </div>
                      <div className="flex items-end justify-between gap-3">
                        {/* This container groups related UI elements and keeps the layout consistent. */}
                        <div className="min-w-0">
                          {/* This container groups related UI elements and keeps the layout consistent. */}
                          <p className="text-xs font-bold text-gray-400 uppercase">Phone</p>
                          <p className="text-sm font-medium text-gray-600 break-words">{u.phone || '-'}</p>
                        </div>
                        {/* This button triggers the main action for this part of the screen. */}
                        <button onClick={() => deleteUser(u.id)} className="tp-text-link-danger shrink-0">{t('delete', 'Delete')}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div>
                {/* Add service */}
                <div className="bg-white/70 border border-white/60 rounded-2xl p-5 mb-4">
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  <h3 className="font-bold text-gray-800 mb-3">{t('add_new_service', 'Add New Service')}</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_7rem_auto]">
                    {/* This input keeps its value connected to component state. */}
                    <input value={newService.name} onChange={e => setNewService(p => ({ ...p, name: e.target.value }))} placeholder={t('service_name', 'Service name')} className="tp-input-compact min-w-0" />
                    {/* This input keeps its value connected to component state. */}
                    <input value={newService.price} onChange={e => setNewService(p => ({ ...p, price: e.target.value }))} placeholder={t('price_eur', 'Price €')} type="number" className="tp-input-compact min-w-0" />
                    {/* This button triggers the main action for this part of the screen. */}
                    <button onClick={createService} className="tp-btn-primary tp-btn-sm w-full sm:w-auto">{t('add', 'Add')}</button>
                  </div>
                </div>

                {/* Services list */}
                <div className="space-y-2">
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  {services.map(s => (
                    <div key={s.id} className="bg-white/70 border border-white/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      {/* This container groups related UI elements and keeps the layout consistent. */}
                      {editingService?.id === s.id ? (
                        <>
                          {/* This input keeps its value connected to component state. */}
                          <input value={editingService.name} onChange={e => setEditingService(p => ({ ...p, name: e.target.value }))} className="tp-input-compact min-w-0 sm:flex-1" />
                          {/* This input keeps its value connected to component state. */}
                          <input value={editingService.price} onChange={e => setEditingService(p => ({ ...p, price: e.target.value }))} type="number" className="tp-input-compact min-w-0 sm:w-24" />
                          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
                            {/* This button triggers the main action for this part of the screen. */}
                            <button onClick={() => updateService(s.id)} className="tp-btn-success tp-btn-sm">{t('save', 'Save')}</button>
                            {/* This button triggers the main action for this part of the screen. */}
                            <button onClick={() => setEditingService(null)} className="tp-btn-secondary tp-btn-sm">{t('cancel', 'Cancel')}</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="min-w-0 sm:flex-1">
                            {/* This container groups related UI elements and keeps the layout consistent. */}
                            <p className="font-semibold text-gray-800 break-words">{s.name}</p>
                            {s.description && <p className="text-xs text-gray-500 break-words mt-1">{s.description}</p>}
                          </div>
                          <p className="font-bold text-brand">€{Number(s.price).toFixed(2)}</p>
                          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
                            {/* This button triggers the main action for this part of the screen. */}
                            <button onClick={() => setEditingService({ id: s.id, name: s.name, price: s.price })} className="tp-btn-secondary tp-btn-sm">{t('edit', 'Edit')}</button>
                            {/* This button triggers the main action for this part of the screen. */}
                            <button onClick={() => deleteService(s.id)} className="tp-btn-danger-soft tp-btn-sm">{t('delete', 'Delete')}</button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Admin;
