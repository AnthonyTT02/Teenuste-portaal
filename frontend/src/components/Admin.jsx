import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

function Admin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const authHeaders = { 'Content-Type': 'application/json', 'x-user-id': userId || '' };
  const afetch = (url, opts = {}) => fetch(url, { credentials: 'include', ...opts, headers: { ...authHeaders, ...(opts.headers || {}) } }).then(r => r.json());

  const [stats, setStats] = useState({ totalUsers: 0, activeWorkers: 0, totalOrders: 0 });
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [newService, setNewService] = useState({ name: '', price: '', description: '' });
  const [editingService, setEditingService] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
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

  const createService = async () => {
    if (!newService.name) return;
    const res = await afetch('/api/admin/services', { method: 'POST', body: JSON.stringify(newService) });
    if (res.ok) { setServices(prev => [...prev, res.service]); setNewService({ name: '', price: '', description: '' }); }
    else setError(res.error);
  };

  const updateService = async (id) => {
    if (!editingService) return;
    const res = await afetch(`/api/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(editingService) });
    if (res.ok) { setServices(prev => prev.map(s => s.id === id ? res.service : s)); setEditingService(null); }
  };

  const deleteService = async (id) => {
    if (!confirm('Delete this service?')) return;
    await afetch(`/api/admin/services/${id}`, { method: 'DELETE' });
    setServices(prev => prev.filter(s => s.id !== id));
  };

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

  return (
    <div className="w-full max-w-6xl animate-fade-in-up">
      <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-2xl rounded-[2rem] p-8 mt-8 relative">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-1">{t('admin_panel', 'Admin Dashboard')}</h1>
            <p className="text-gray-500">{t('admin_subtitle', 'Real-time platform management')}</p>
          </div>
          <div className="flex gap-3 items-center">
            <LanguageSwitcher />
            <button onClick={handleSignOut} className="px-5 py-2.5 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-500 font-bold text-sm transition-colors border border-gray-200/60 hover:border-red-200">
              {t('sign_out', 'Sign Out')}
            </button>
          </div>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold">{error}</div>}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {statCards.map(({ label, value, color }) => (
            <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-center border border-white/60`}>
              <p className="text-3xl font-extrabold mb-1">{loading ? '...' : value}</p>
              <p className="text-sm font-semibold opacity-70">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['users', 'services'].map(tKey => (
            <button key={tKey} onClick={() => setActiveTab(tKey)} className={`px-5 py-2 rounded-xl font-bold text-sm transition-colors capitalize ${activeTab === tKey ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t(tKey, tKey)} ({tKey === 'users' ? users.length : services.length})
            </button>
          ))}
        </div>

        {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> : (
          <>
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white/70 border border-white/60 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="border-b border-gray-100">
                    <tr>
                      {['ID', 'Username', 'Role', 'Status', 'Phone', 'Action'].map(h => (
                        <th key={h} className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-gray-50 hover:bg-white/50 transition-colors">
                        <td className="py-3 px-4 text-gray-400 text-sm">#{u.id}</td>
                        <td className="py-3 px-4 font-semibold text-gray-800">{u.username}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm capitalize">{u.role}</td>
                        <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.status === 'worker' ? 'bg-green-100 text-green-700' : u.status === 'moderator' ? 'bg-blue-100 text-blue-700' : u.status === 'support' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{u.status}</span></td>
                        <td className="py-3 px-4 text-gray-500 text-sm">{u.phone || '—'}</td>
                        <td className="py-3 px-4">
                          <button onClick={() => deleteUser(u.id)} className="text-red-500 hover:text-red-700 font-semibold text-sm transition-colors">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div>
                {/* Add service */}
                <div className="bg-white/70 border border-white/60 rounded-2xl p-5 mb-4">
                  <h3 className="font-bold text-gray-800 mb-3">{t('add_new_service', 'Add New Service')}</h3>
                  <div className="flex gap-3">
                    <input value={newService.name} onChange={e => setNewService(p => ({ ...p, name: e.target.value }))} placeholder={t('service_name', 'Service name')} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand" />
                    <input value={newService.price} onChange={e => setNewService(p => ({ ...p, price: e.target.value }))} placeholder={t('price_eur', 'Price €')} type="number" className="w-28 px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand" />
                    <button onClick={createService} className="px-5 py-2 bg-brand text-white font-bold rounded-xl text-sm hover:bg-brand-dark transition-colors">Add</button>
                  </div>
                </div>

                {/* Services list */}
                <div className="space-y-2">
                  {services.map(s => (
                    <div key={s.id} className="bg-white/70 border border-white/60 rounded-2xl p-4 flex items-center gap-4">
                      {editingService?.id === s.id ? (
                        <>
                          <input value={editingService.name} onChange={e => setEditingService(p => ({ ...p, name: e.target.value }))} className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand" />
                          <input value={editingService.price} onChange={e => setEditingService(p => ({ ...p, price: e.target.value }))} type="number" className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand" />
                          <button onClick={() => updateService(s.id)} className="px-4 py-1.5 bg-green-500 text-white font-bold rounded-lg text-sm">Save</button>
                          <button onClick={() => setEditingService(null)} className="px-4 py-1.5 bg-gray-100 text-gray-600 font-bold rounded-lg text-sm">Cancel</button>
                        </>
                      ) : (
                        <>
                          <p className="flex-1 font-semibold text-gray-800">{s.name}</p>
                          <p className="font-bold text-brand">€{Number(s.price).toFixed(2)}</p>
                          <button onClick={() => setEditingService({ id: s.id, name: s.name, price: s.price })} className="px-4 py-1.5 bg-gray-100 text-gray-600 font-semibold rounded-lg text-sm hover:bg-gray-200">Edit</button>
                          <button onClick={() => deleteService(s.id)} className="px-4 py-1.5 bg-red-50 text-red-500 font-semibold rounded-lg text-sm hover:bg-red-100">Delete</button>
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