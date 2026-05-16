import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useSidebar } from '../context/SidebarContext';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function Cabinet() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { openSidebar } = useSidebar();
  const userId = localStorage.getItem('userId');
  const userStatus = localStorage.getItem('userStatus');
  const isWorkerLocal = userStatus === 'worker' || localStorage.getItem('userRole') === 'worker' || localStorage.getItem('is_worker') === '1';

  const [user, setUser] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWorkerPopup, setShowWorkerPopup] = useState(false);
  const [ticketModal, setTicketModal] = useState(null);
  const [ticketMsg, setTicketMsg] = useState('');
  const [ticketSent, setTicketSent] = useState(false);
  const [ticketSentOrders, setTicketSentOrders] = useState(new Set());
  const [services, setServices] = useState([]);
  const [tab, setTab] = useState('active');
  const [hasPendingApp, setHasPendingApp] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const profilePhoto = user?.profile_photo;
  const profileStatus = user?.status || userStatus || 'user';

  useEffect(() => {
    if (!userId) { navigate('/'); return; }
    const newWorker = localStorage.getItem('newWorker');
    if (newWorker === 'true') { setShowWorkerPopup(true); localStorage.removeItem('newWorker'); }
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, svcRes, activeRes, completedRes, appRes] = await Promise.all([
        api(`/api/user/${userId}`),
        api('/api/services'),
        api(`/api/user/${userId}/orders/active`),
        api(`/api/user/${userId}/orders/completed`),
        api(`/api/worker/application-status/${userId}`)
      ]);
      setUser(userRes.user);
      setServices(svcRes.services || []);
      setActiveOrders(activeRes.orders || []);
      setCompletedOrders(completedRes.orders || []);
      setHasPendingApp(appRes.hasPending || false);
      // Pre-check which orders already have tickets
      const completedOrdersData = completedRes.orders || [];
      const sentSet = new Set();
      await Promise.all(completedOrdersData.map(async (o) => {
        try {
          const r = await api(`/api/support/tickets/check?userId=${userId}&orderId=${o.id}`);
          if (r.exists) sentSet.add(o.id);
        } catch {}
      }));
      setTicketSentOrders(sentSet);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSignOut = () => { localStorage.clear(); navigate('/'); };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setPhotoError('');
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Photo size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const photo = event.target.result;
      setPhotoUploading(true);
      try {
        await api(`/api/user/${userId}/photo`, {
          method: 'PUT',
          body: JSON.stringify({ photo })
        });
        setUser(prev => ({ ...prev, profile_photo: photo }));
      } catch (err) {
        setPhotoError(err.payload?.error || err.message || 'Photo upload failed.');
      } finally {
        setPhotoUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const completeOrder = async (orderId) => {
    await api(`/api/order/${orderId}/complete`, { method: 'POST' });
    fetchData();
  };

  const sendTicket = async () => {
    if (!ticketMsg.trim()) return;
    try {
      await api('/api/support/tickets', { method: 'POST', body: JSON.stringify({ userId, orderId: ticketModal, message: ticketMsg }) });
      setTicketSent(true);
      setTicketSentOrders(prev => new Set([...prev, ticketModal]));
      setTimeout(() => { setTicketModal(null); setTicketMsg(''); setTicketSent(false); }, 2000);
    } catch (err) {
      if (err.payload?.alreadyExists) {
        setTicketSentOrders(prev => new Set([...prev, ticketModal]));
        setTicketModal(null);
      }
    }
  };

  const getServiceNames = (servicesJson) => {
    try {
      const ids = JSON.parse(servicesJson || '[]');
      return ids.map(id => services.find(s => s.id === Number(id))?.name || `#${id}`).join(', ');
    } catch { return '—'; }
  };

  if (!userId) return null;

  return (
    <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05),0_0_80px_rgba(91,108,249,0.08)] p-8 overflow-hidden relative animate-fade-in-up">
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none opacity-50 rounded-[2.5rem]" />

      {showWorkerPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-10 shadow-2xl text-center max-w-sm mx-4 animate-fade-in-up">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Congratulations!</h2>
            <p className="text-gray-500 mb-6">You became a worker! You can now accept orders.</p>
            <button onClick={() => setShowWorkerPopup(false)} className="w-full py-3 bg-brand text-white font-bold rounded-2xl">Let's go!</button>
          </div>
        </div>
      )}

      {ticketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 animate-fade-in-up">
            <h2 className="text-xl font-extrabold text-gray-900 mb-4">Contact Support</h2>
            {ticketSent ? (
              <p className="text-green-600 font-bold text-center py-4">Ticket sent!</p>
            ) : (
              <>
                <textarea value={ticketMsg} onChange={e => setTicketMsg(e.target.value)} rows={4}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-brand mb-4"
                  placeholder="Describe your problem..." />
                <div className="flex gap-3">
                  <button onClick={() => setTicketModal(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl">Cancel</button>
                  <button onClick={sendTicket} className="flex-1 py-3 bg-brand text-white font-bold rounded-2xl">Send</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="pt-3">
            <h1 className="text-2xl font-black tracking-tighter text-[#111827] mt-2 mb-1">
              Teenuste<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">Portaal</span>
            </h1>
            <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">{t('greeting', { name: user?.username || '' })}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('cabinet')}</p>
          </div>
          <div className="flex gap-2 items-center pt-2">
            <LanguageSwitcher />
            <button onClick={handleSignOut} className="px-4 py-2 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-500 font-bold text-[13px] transition-colors border border-gray-200/60">{t('sign_out')}</button>
            <button onClick={openSidebar} className="p-2.5 rounded-full bg-brand/10 hover:bg-brand/20 transition-all text-brand border border-transparent">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-400">{t('loading')}</div>
        ) : (
          <>
            {/* Profile Card */}
            <div className="bg-white/60 border border-gray-100 rounded-3xl p-5 mb-4 shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <label className="relative w-12 h-12 rounded-2xl overflow-hidden bg-brand/10 border border-gray-100 text-brand flex items-center justify-center text-xl font-bold cursor-pointer transition-all hover:ring-4 hover:ring-brand/15">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt={user?.username || 'Profile'} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(user?.username || '?')[0].toUpperCase()}</span>
                  )}
                  {photoUploading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-[10px] font-bold text-brand">...</div>}
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" disabled={photoUploading} />
                </label>
                <div>
                  <h3 className="font-bold text-gray-900 text-[17px]">{user?.username}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand capitalize">{profileStatus}</span>
                </div>
              </div>
              {photoError && <p className="mb-3 text-xs font-semibold text-red-500">{photoError}</p>}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {user?.phone && <div><p className="text-xs text-gray-400 uppercase">Phone</p><p className="font-medium text-gray-700">{user.phone}</p></div>}
                {user?.email && <div><p className="text-xs text-gray-400 uppercase">Email</p><p className="font-medium text-gray-700">{user.email}</p></div>}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {['active', 'history'].map(tabKey => (
                <button key={tabKey} onClick={() => setTab(tabKey)} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors ${tab === tabKey ? 'bg-brand text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {tabKey === 'active' ? `${t('active_orders')} (${activeOrders.length})` : `${t('history')} (${completedOrders.length})`}
                </button>
              ))}
            </div>

            {/* Active Orders */}
            {tab === 'active' && (
              <div className="space-y-3 mb-4">
                {activeOrders.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No active orders.</p>
                ) : activeOrders.map(o => (
                  <div key={o.id} className="bg-white/70 border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-gray-800">{o.vehicleBrand} {o.vehicleModel}</p>
                        <p className="text-xs text-gray-500">{getServiceNames(o.services)}</p>
                      </div>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full capitalize">{o.status}</span>
                    </div>
                    {o.worker_user && <p className="text-sm text-gray-600 mb-1">Worker: {o.worker_user.government_name} {o.worker_user.government_surname}</p>}
                    {(o.worker_phone || o.worker_user?.phone) && <p className="text-xs text-gray-500 mb-1">Worker Phone: {o.worker_phone || o.worker_user?.phone}</p>}
                    {o.price && <p className="text-sm font-bold text-brand mb-1">Price: €{Number(o.price).toFixed(2)}</p>}
                    {o.paymentType && <p className="text-xs text-gray-400">Payment: {o.paymentType}</p>}
                    <button onClick={() => completeOrder(o.id)} className="mt-3 w-full py-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-colors">
                      Mark as Completed
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Order History */}
            {tab === 'history' && (
              <div className="space-y-3 mb-4">
                {completedOrders.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No completed orders yet.</p>
                ) : completedOrders.map(o => {
                  const workerName = o.worker_name || (o.worker_user ? `${o.worker_user.government_name || ''} ${o.worker_user.government_surname || ''}`.trim() : null);
                  const workerPhone = o.worker_phone || o.worker_user?.phone;
                  const alreadySubmitted = ticketSentOrders.has(o.id);
                  return (
                    <div key={o.id} className="bg-white/70 border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-800">{o.vehicleBrand} {o.vehicleModel}</p>
                          <p className="text-xs text-gray-500">{getServiceNames(o.services)}</p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Completed</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-1">{new Date(o.completed_at).toLocaleDateString()}</p>
                      {o.price && <p className="text-sm font-bold text-brand mb-1">Price: €{Number(o.price).toFixed(2)}</p>}
                      {workerName && <p className="text-xs text-gray-600 mb-1">Worker: {workerName}</p>}
                      {workerPhone && <p className="text-xs text-gray-500 mb-3">Worker Phone: {workerPhone}</p>}
                      {alreadySubmitted ? (
                        <div className="w-full py-2 text-center text-xs text-gray-400 border border-gray-100 rounded-xl bg-gray-50">
                          Support ticket submitted
                        </div>
                      ) : (
                        <button onClick={() => setTicketModal(o.id)} className="w-full py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm rounded-xl transition-colors">
                          Contact Support
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* CTA Buttons */}
            <button onClick={() => navigate('/request-help')} className="group relative w-full py-4 mt-2 overflow-hidden bg-brand rounded-2xl font-bold text-[17px] text-white shadow-[0_8px_20px_rgba(91,108,249,0.25)] hover:shadow-[0_15px_30px_rgba(91,108,249,0.4)] transform hover:-translate-y-1 active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-2">
              <div className="absolute inset-0 bg-gradient-to-r from-brand via-[#7482f6] to-brand opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10">{t('request_assistance')}</span>
            </button>

            {(isWorkerLocal || user?.is_worker) ? (
              <button onClick={() => navigate('/provider')} className="w-full py-3 mt-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-colors">
                {t('go_to_work')}
              </button>
            ) : hasPendingApp ? (
              <div className="w-full py-3 mt-3 border-2 border-amber-300 bg-amber-50 text-amber-700 font-bold rounded-2xl text-sm text-center">
                {t('app_pending')}
              </div>
            ) : (
              <button onClick={() => navigate('/provider-reg')} className="w-full py-3 mt-3 border-2 border-brand/30 text-brand hover:bg-brand/5 font-bold rounded-2xl transition-colors text-sm">
                {t('become_worker')}
              </button>
            )}
          </>
        )}
      </div>
  );
}
