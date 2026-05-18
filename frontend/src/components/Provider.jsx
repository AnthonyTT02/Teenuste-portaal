import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const NARVA_LOCATION = [59.3797, 28.1791];
const CENTER = [0, 0];
const MAP_START_ZOOM = 2;
const WORKER_ZOOM = 16;

function WorkerLocationAnimator({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;
    map.setView(CENTER, MAP_START_ZOOM, { animate: true });
    const timer = setTimeout(() => {
      map.flyTo(position, WORKER_ZOOM, { animate: true, duration: 2.8 });
    }, 350);
    return () => clearTimeout(timer);
  }, [map, position]);

  return null;
}

/**
 * Provider Component
 * The professional Worker Dashboard (Self-Employed).
 * Enables approved roadside specialists to:
 * 1. Toggle online/offline status dynamically (notifying customers of availability).
 * 2. Select and manage individual service specialities (e.g. Towing, Fuel Delivery).
 * 3. Track current GPS/map dispatch location.
 * 4. Manage active assigned rescue requests and mark them as complete.
 */
function Provider() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [worker, setWorker] = useState(null);
  const [workerServices, setWorkerServices] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [activeOrders, setActiveOrders] = useState([]);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [allServices, setAllServices] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [savingServices, setSavingServices] = useState(false);
  const [workerLocation, setWorkerLocation] = useState(NARVA_LOCATION);
  const [locationStatus, setLocationStatus] = useState('');

  useEffect(() => {
    if (!userId) { navigate('/'); return; }
    fetchWorkerData();
    api('/api/services').then(r => setAllServices(r.services || [])).catch(() => { });
  }, [userId]);

  const fetchWorkerData = async () => {
    try {
      setLoading(true);
      const res = await api(`/api/worker/${userId}`);
      setWorker(res.user);
      if (Number.isFinite(Number(res.user.worker_lat)) && Number.isFinite(Number(res.user.worker_lng))) {
        setWorkerLocation([Number(res.user.worker_lat), Number(res.user.worker_lng)]);
      }
      setWorkerServices(res.services || []);
      setSelectedServiceIds((res.services || []).map(s => s.id));
      setIsOnline(res.user.worker_online === 1);
      const ordersRes = await api(`/api/user/${userId}/orders/active?role=worker`);
      setActiveOrders((ordersRes.orders || []).filter(o => o.worker_user_id === Number(userId)));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const resolveWorkerLocation = (showStatus = true) => new Promise((resolve) => {
    if (!navigator.geolocation) {
      if (showStatus) setLocationStatus('Location unavailable, showing Narva.');
      resolve(NARVA_LOCATION);
      return;
    }

    if (showStatus) setLocationStatus('Finding your location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = [position.coords.latitude, position.coords.longitude];
        if (showStatus) setLocationStatus('Location found.');
        resolve(nextLocation);
      },
      () => {
        if (showStatus) setLocationStatus('Location unavailable, showing Narva.');
        resolve(NARVA_LOCATION);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });

  const toggleOnline = async () => {
    setToggling(true);
    try {
      const newState = !isOnline;
      let nextLocation = workerLocation;
      if (newState) {
        nextLocation = await resolveWorkerLocation();
        setWorkerLocation(nextLocation);
      } else {
        setLocationStatus('');
      }
      await api('/api/worker/online', {
        method: 'PATCH',
        body: JSON.stringify({ userId: Number(userId), isOnline: newState, lat: nextLocation[0], lng: nextLocation[1] })
      });
      setIsOnline(newState);
    } catch (e) { console.error(e); }
    setToggling(false);
  };

  useEffect(() => {
    if (!isOnline || !userId) return undefined;

    const saveWorkerLocation = async () => {
      try {
        const nextLocation = await resolveWorkerLocation(false);
        setWorkerLocation(nextLocation);
        await api('/api/worker/location', {
          method: 'PATCH',
          body: JSON.stringify({ userId: Number(userId), lat: nextLocation[0], lng: nextLocation[1] })
        });
      } catch (e) {
        console.error(e);
      }
    };

    saveWorkerLocation();
    const intervalId = setInterval(saveWorkerLocation, 5000);
    return () => clearInterval(intervalId);
  }, [isOnline, userId]);

  const toggleServiceId = (id) => {
    setSelectedServiceIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const saveServices = async () => {
    setSavingServices(true);
    try {
      await api(`/api/worker/${userId}/services`, { method: 'PUT', body: JSON.stringify({ serviceIds: selectedServiceIds }) });
      await fetchWorkerData();
      setShowServicesModal(false);
    } catch (e) { console.error(e); }
    setSavingServices(false);
  };

  const handleSignOut = () => { localStorage.clear(); navigate('/'); };

  if (loading) {
    return (
      <div className="w-full max-w-lg mt-8 flex items-center justify-center py-16">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mt-8 relative">
      {/* Services Modal */}
      {showServicesModal && (
        <div className="tp-modal-backdrop">
          <div className="tp-modal max-w-sm p-8">
            <h2 className="text-xl font-extrabold text-gray-900 mb-4">Manage My Services</h2>
            <div className="space-y-2 mb-6">
              {allServices.map(s => (
                <button key={s.id} type="button" onClick={() => toggleServiceId(s.id)}
                  className={`tp-choice gap-3 p-3 rounded-xl ${selectedServiceIds.includes(s.id) ? 'tp-choice-active' : ''}`}>
                  <div className="flex items-center min-w-0">
                    <div className={`tp-choice-check rounded-md mr-3 ${selectedServiceIds.includes(s.id) ? 'tp-choice-check-active' : ''}`}>
                      {selectedServiceIds.includes(s.id) && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                    <p className="font-semibold text-gray-800 text-sm truncate">{s.name}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-brand/10 text-brand rounded-full text-xs font-semibold flex-shrink-0">€{Number(s.price || 0).toFixed(2)}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowServicesModal(false)} className="tp-btn-secondary flex-1 py-3">Cancel</button>
              <button onClick={saveServices} disabled={savingServices} className="tp-btn-primary flex-1 py-3">
                {savingServices ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="tp-page-card p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-brand/10 border border-white text-brand flex items-center justify-center text-xl font-bold shadow-sm flex-shrink-0">
              {worker?.profile_photo ? (
                <img src={worker.profile_photo} alt={worker?.username || 'Worker'} className="w-full h-full object-cover" />
              ) : (
                <span>{(worker?.username || '?')[0].toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Worker Hub</h1>
              <p className="text-sm font-medium text-gray-500 truncate">
                {worker?.government_name} {worker?.government_surname || worker?.username}
              </p>
            </div>
          </div>
          <button onClick={handleSignOut} className="tp-btn-ghost-danger tp-btn-sm">
            Sign Out
          </button>
        </div>

        {/* Online Toggle */}
        <div className="flex items-center justify-between bg-white/60 border border-white rounded-2xl p-4 mb-6 shadow-inner">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full transition-all duration-300 ${isOnline ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-gray-400'}`} />
            <div>
              <p className="font-bold text-gray-700">{isOnline ? 'Online' : 'Offline'}</p>
              <p className="text-xs text-gray-400">{isOnline ? 'Receiving orders' : 'Not receiving orders'}</p>
            </div>
          </div>
          <button
            onClick={toggleOnline}
            disabled={toggling}
            className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center disabled:opacity-60 ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isOnline ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* My Services */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-gray-500 uppercase">My Services</h3>
            <button onClick={() => setShowServicesModal(true)} className="tp-text-link text-xs">
              + Manage Services
            </button>
          </div>
          {workerServices.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {workerServices.map(s => (
                <span key={s.id} className="px-3 py-1 bg-brand/10 text-brand rounded-full text-xs font-semibold">{s.name} · €{Number(s.price || 0).toFixed(2)}</span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No services added yet. Click "Manage Services" to add some.</p>
          )}
        </div>

        {/* Status area */}
        {isOnline ? (
          <div>
            {activeOrders.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-700 mb-2">Active Orders</h3>
                {activeOrders.map(o => {
                  const hasLocation = o.lat && o.lng;
                  return (
                    <div key={o.id} className="bg-gradient-to-br from-white to-gray-50 border border-white shadow-lg rounded-3xl overflow-hidden">
                      <div className="p-5">
                        <h4 className="font-bold text-gray-800 mb-1">Order #{o.id}</h4>
                        <p className="text-sm text-gray-500 mb-1">{o.vehicleBrand} {o.vehicleModel} — {o.regNumber}</p>
                        <p className="text-sm text-gray-500 mb-1">Address: {o.address}</p>
                        <p className="text-sm text-gray-500 mb-1">Note: {o.note}</p>
                        {o.price && <p className="text-sm font-bold text-brand">€{Number(o.price).toFixed(2)} · {o.paymentType}</p>}
                      </div>
                      {hasLocation && (
                        <div className="h-48 w-full">
                          <MapContainer center={[o.lat, o.lng]} zoom={15} zoomControl={false} style={{ height: '100%', width: '100%' }} key={`${o.id}-${o.lat}-${o.lng}`}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                            <Marker position={[o.lat, o.lng]} />
                          </MapContainer>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/70 border border-white shadow-lg rounded-3xl overflow-hidden">
                  <div className="h-56 w-full">
                    <MapContainer center={CENTER} zoom={MAP_START_ZOOM} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                      <WorkerLocationAnimator position={workerLocation} />
                      <Marker position={workerLocation} />
                    </MapContainer>
                  </div>
                  {locationStatus && (
                    <div className="px-4 py-2 bg-white/90 border-t border-gray-100 text-xs font-semibold text-gray-500">
                      {locationStatus}
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 border border-white shadow-lg rounded-3xl p-6 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-400/10 rounded-full filter blur-xl" />
                  <div className="worker-radar mx-auto mb-3" aria-hidden="true">
                    <span className="worker-radar-pulse worker-radar-pulse-one" />
                    <span className="worker-radar-pulse worker-radar-pulse-two" />
                    <span className="worker-radar-sweep" />
                    <span className="worker-radar-core" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 mb-1">Waiting for orders</h2>
                  <p className="text-sm text-gray-400">You'll receive orders that match your services</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-10 px-6 bg-white/40 rounded-3xl border border-white border-dashed text-gray-400 text-center">
            <svg className="w-14 h-14 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            <p className="font-semibold">You are currently offline.</p>
            <p className="text-sm mt-1">Toggle the switch above to start receiving orders.</p>
          </div>
        )}

        {/* Back to Cabinet */}
        <button onClick={() => navigate('/cabinet')} className="tp-btn-secondary w-full mt-4 py-3 text-sm">
          ← Back to Cabinet
        </button>
      </div>
    </div>
  );
}

export default Provider;
