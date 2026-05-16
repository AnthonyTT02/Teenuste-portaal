import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useSidebar } from '../context/SidebarContext';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({ click(e) { onLocationSelect(e.latlng); } });
  return null;
}

// Steps: 1=Service, 2=Location&Vehicle, 3=Payment, 3.5=Card details, 4=Choose Worker, 5=Confirm
export default function RequestHelp() {
  const { openSidebar } = useSidebar();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [vehicle, setVehicle] = useState({ brand: '', plate: '' });
  const [payment, setPayment] = useState('cash');
  const [agreedToStorage, setAgreedToStorage] = useState(false);
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    api('/api/services').then(r => setServices(r.services || [])).catch(() => {});
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await r.json();
          setAddress(data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } catch { setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`); }
        setGeoLoading(false);
      },
      () => setGeoLoading(false)
    );
  };

  const handleMapClick = async (latlng) => {
    setLocation({ lat: latlng.lat, lng: latlng.lng });
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`);
      const data = await r.json();
      setAddress(data.display_name || `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
    } catch { setAddress(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`); }
  };

  const loadWorkers = async () => {
    if (!selectedService) return;
    setLoading(true);
    try {
      const res = await api(`/api/workers/for-service/${selectedService.id}`);
      setWorkers(res.workers || []);
    } catch { setWorkers([]); }
    setLoading(false);
  };

  const goToStep = async (next) => {
    setError('');
    if (step === 1 && !selectedService) return setError('Please select a service');
    if (step === 2) {
      if (!location) return setError('Please select your location on the map');
      if (!vehicle.plate || vehicle.plate.trim().length < 2) return setError('Please enter a valid vehicle registration number');
    }
    if (next === 4) await loadWorkers();
    setStep(next);
  };

  const validateCard = () => {
    const num = cardData.number.replace(/\s/g, '');
    if (num.length < 13 || num.length > 19) return 'Card number must be 13-19 digits';
    if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) return 'Expiry must be MM/YY format';
    if (!/^\d{3,4}$/.test(cardData.cvv)) return 'CVV must be 3-4 digits';
    if (!cardData.name.trim()) return 'Cardholder name is required';
    return null;
  };

  const handleCardContinue = () => {
    const err = validateCard();
    if (err) return setError(err);
    setError('');
    goToStep(4);
  };

  const confirmOrder = async () => {
    if (!selectedWorker) return setError('Please choose a worker');
    setSubmitting(true);
    try {
      const res = await api('/api/order', {
        method: 'POST',
        body: JSON.stringify({
          userId: userId ? Number(userId) : null,
          services: [selectedService.id],
          vehicleBrand: vehicle.brand,
          regNumber: vehicle.plate,
          address,
          lat: location?.lat,
          lng: location?.lng,
          paymentType: payment,
          worker_user_id: selectedWorker.id,
          status: 'active',
          price: selectedWorker.price,
          worker_name: `${selectedWorker.name || ''} ${selectedWorker.surname || ''}`.trim(),
          worker_phone: selectedWorker.phone || null
        })
      });
      setOrderId(res.orderId);
      setStep(5);
    } catch (e) { setError(e.message); }
    setSubmitting(false);
  };

  const centerMap = location ? [location.lat, location.lng] : [59.377, 28.186];
  const totalSteps = payment === 'card' ? 5 : 4;
  const displayStep = step === 3.5 ? 'Payment Details' : step <= 4 ? ['Service', 'Location & Vehicle', 'Payment Method', 'Choose Worker'][step - 1] : 'Done';
  const progressStep = step === 3.5 ? 3 : step;

  return (
    <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05),0_0_80px_rgba(91,108,249,0.08)] p-8 overflow-hidden relative animate-fade-in-up">
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none opacity-50 rounded-[2.5rem]" />
      <div className="relative z-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black tracking-tighter text-[#111827]">
            Teenuste<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">Portaal</span>
          </h1>
          <button onClick={openSidebar} className="p-2.5 rounded-full hover:bg-gray-100/80 transition-all text-gray-500">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>

        {step < 5 && (
          <>
            <h2 className="text-3xl font-extrabold text-[#111827] mb-1">Request <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">Assistance</span></h2>
            <p className="text-gray-400 text-sm mb-5">{displayStep}</p>
            <div className="flex gap-1.5 mb-6">
              {[1,2,3,4].map(s => <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${s <= progressStep ? 'bg-brand' : 'bg-gray-200'}`} />)}
            </div>
          </>
        )}

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold">{error}</div>}

        {/* STEP 1: Select Service */}
        {step === 1 && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">What do you need?</h3>
            {services.map(s => (
              <button key={s.id} type="button" onClick={() => setSelectedService(s)}
                className={`w-full flex items-center justify-between p-4 border rounded-2xl transition-all text-left ${selectedService?.id === s.id ? 'bg-brand/5 border-brand/40 shadow-sm' : 'bg-gray-50/50 border-gray-200/60 hover:bg-white'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selectedService?.id === s.id ? 'bg-brand border-brand' : 'border-gray-300'}`}>
                    {selectedService?.id === s.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <p className="font-semibold text-gray-800">{s.name}</p>
                </div>
                <p className="font-bold text-brand">€{Number(s.price).toFixed(2)}</p>
              </button>
            ))}
            <button onClick={() => goToStep(2)} className="w-full mt-4 py-4 bg-brand text-white font-bold rounded-2xl shadow-[0_8px_20px_rgba(91,108,249,0.25)] hover:shadow-[0_15px_30px_rgba(91,108,249,0.4)] transform hover:-translate-y-1 transition-all">
              Next →
            </button>
          </div>
        )}

        {/* STEP 2: Location & Vehicle */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-gray-700">Your Location</label>
                <button onClick={getUserLocation} disabled={geoLoading} className="text-xs font-bold text-brand hover:underline flex items-center gap-1 disabled:opacity-50">
                  {geoLoading ? 'Locating...' : 'Use GPS'}
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden border border-gray-200 h-52 mb-2">
                <MapContainer center={centerMap} zoom={13} style={{ height: '100%', width: '100%' }} key={centerMap.join(',')}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OpenStreetMap' />
                  <MapClickHandler onLocationSelect={handleMapClick} />
                  {location && <Marker position={[location.lat, location.lng]} />}
                </MapContainer>
              </div>
              {address && <p className="text-xs text-gray-500 truncate">Address: {address}</p>}
              {!location && <p className="text-xs text-gray-400">Click on the map or use GPS to set your location</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Vehicle Brand</label>
                <input value={vehicle.brand} onChange={e => setVehicle(p => ({ ...p, brand: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border border-gray-200/60 focus:border-brand/40 focus:ring-[4px] focus:ring-brand/15 transition-all outline-none text-sm"
                  placeholder="Toyota, BMW..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Reg. Number *</label>
                <input value={vehicle.plate} onChange={e => setVehicle(p => ({ ...p, plate: e.target.value.toUpperCase() }))}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border border-gray-200/60 focus:border-brand/40 focus:ring-[4px] focus:ring-brand/15 transition-all outline-none text-sm"
                  placeholder="123 ABC" maxLength={10} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl transition-colors">Back</button>
              <button onClick={() => goToStep(3)} className="flex-1 py-3 bg-brand text-white font-bold rounded-2xl hover:bg-brand-dark transition-colors">Next →</button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment Method */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Payment Method</h3>
            {[{ id: 'cash', label: 'Cash', desc: 'Pay the worker directly in cash' }, { id: 'card', label: 'Card', desc: 'Pay securely by card' }].map(m => (
              <button key={m.id} type="button" onClick={() => setPayment(m.id)}
                className={`w-full flex items-center gap-4 p-5 border rounded-2xl transition-all text-left ${payment === m.id ? 'bg-brand/5 border-brand/40 shadow-sm' : 'bg-gray-50/50 border-gray-200/60 hover:bg-white'}`}>
                <div>
                  <p className="font-bold text-gray-800">{m.label}</p>
                  <p className="text-xs text-gray-500">{m.desc}</p>
                </div>
                <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${payment === m.id ? 'bg-brand border-brand' : 'border-gray-300'}`}>
                  {payment === m.id && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            ))}

            {payment === 'card' && (
              <label className="flex items-center gap-3 p-3 bg-brand/5 border border-brand/20 rounded-xl cursor-pointer mt-2">
                <input 
                  type="checkbox" 
                  checked={agreedToStorage} 
                  onChange={(e) => setAgreedToStorage(e.target.checked)} 
                  className="w-5 h-5 text-brand rounded border-gray-300 focus:ring-brand accent-brand"
                />
                <span className="text-sm text-gray-700">Я согласен на краткосрочное хранение своих банковских данных</span>
              </label>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(2)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl transition-colors">Back</button>
              <button disabled={payment === 'card' && !agreedToStorage} onClick={() => {
                setError('');
                if (payment === 'card') { setStep(3.5); }
                else { goToStep(4); }
              }} className={`flex-1 py-3 font-bold rounded-2xl transition-colors ${payment === 'card' && !agreedToStorage ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-brand text-white hover:bg-brand-dark'}`}>
                {payment === 'card' ? 'Enter Card Details →' : 'Find Worker →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3.5: Card Payment Details */}
        {step === 3.5 && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-6 text-white mb-2 shadow-xl">
              <div className="flex justify-between items-start mb-8">
                <div className="text-xs uppercase tracking-widest opacity-60">Credit Card</div>
              </div>
              <div className="text-xl tracking-[0.25em] font-mono mb-4">{cardData.number || '•••• •••• •••• ••••'}</div>
              <div className="flex justify-between text-xs uppercase tracking-wider">
                <div><span className="opacity-50">Name</span><br /><span className="font-bold">{cardData.name || 'YOUR NAME'}</span></div>
                <div className="text-right"><span className="opacity-50">Expiry</span><br /><span className="font-bold">{cardData.expiry || 'MM/YY'}</span></div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Card Number *</label>
              <input value={cardData.number} onChange={e => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 19);
                setCardData(p => ({ ...p, number: v.replace(/(\d{4})(?=\d)/g, '$1 ') }));
              }} className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border border-gray-200/60 focus:border-brand/40 focus:ring-[4px] focus:ring-brand/15 transition-all outline-none text-sm font-mono tracking-wider" placeholder="1234 5678 9012 3456" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Expiry *</label>
                <input value={cardData.expiry} onChange={e => {
                  let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                  if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
                  setCardData(p => ({ ...p, expiry: v }));
                }} className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border border-gray-200/60 focus:border-brand/40 focus:ring-[4px] focus:ring-brand/15 transition-all outline-none text-sm" placeholder="MM/YY" maxLength={5} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">CVV *</label>
                <input value={cardData.cvv} onChange={e => setCardData(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border border-gray-200/60 focus:border-brand/40 focus:ring-[4px] focus:ring-brand/15 transition-all outline-none text-sm" placeholder="123" maxLength={4} type="password" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Cardholder Name *</label>
              <input value={cardData.name} onChange={e => setCardData(p => ({ ...p, name: e.target.value.toUpperCase() }))}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border border-gray-200/60 focus:border-brand/40 focus:ring-[4px] focus:ring-brand/15 transition-all outline-none text-sm" placeholder="JOHN DOE" />
            </div>
            
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(3)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl transition-colors">Back</button>
              <button onClick={handleCardContinue} className="flex-1 py-3 bg-brand text-white font-bold rounded-2xl hover:bg-brand-dark transition-colors">
                Pay & Find Worker →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Choose Worker */}
        {step === 4 && (
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Available Workers</h3>
            {loading ? (
              <div className="text-center py-12 text-gray-400">Finding available workers...</div>
            ) : workers.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-bold text-gray-700 mb-2">No workers available</h3>
                <p className="text-gray-400 text-sm">No workers are currently online for this service. Please try again later.</p>
                <button onClick={() => setStep(3)} className="mt-6 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors">Go Back</button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {workers.map(w => (
                    <button key={w.id} type="button" onClick={() => setSelectedWorker(w)}
                      className={`w-full flex items-center gap-4 p-5 border rounded-2xl transition-all text-left ${selectedWorker?.id === w.id ? 'bg-brand/5 border-brand/40 shadow-sm' : 'bg-gray-50/50 border-gray-200/60 hover:bg-white'}`}>
                      <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center text-lg font-bold flex-shrink-0">
                        {(w.name || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{w.name} {w.surname}</p>
                        {w.phone && <p className="text-xs text-gray-400">Phone: {w.phone}</p>}
                        <p className="text-sm text-gray-500">ETA: ~{w.eta} min</p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-brand text-lg">€{Number(w.price).toFixed(2)}</p>
                        <p className="text-xs text-gray-400">{selectedService?.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(payment === 'card' ? 3.5 : 3)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl transition-colors">Back</button>
                  <button onClick={confirmOrder} disabled={submitting || !selectedWorker} className="flex-1 py-3 bg-brand text-white font-bold rounded-2xl hover:bg-brand-dark transition-colors disabled:opacity-50">
                    {submitting ? 'Confirming...' : 'Confirm Order'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 5: Confirmation */}
        {step === 5 && (
          <div className="text-center py-6">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h2>
            <p className="text-gray-500 mb-2">Order #{orderId}</p>
            {selectedWorker && (
              <div className="bg-brand/5 border border-brand/20 rounded-2xl p-4 mb-6 text-left">
                <p className="text-sm font-semibold text-gray-600 mb-2">Worker</p>
                <p className="font-bold text-gray-900">{selectedWorker.name} {selectedWorker.surname}</p>
                {selectedWorker.phone && <p className="text-sm text-gray-500">Phone: {selectedWorker.phone}</p>}
                <p className="text-sm text-gray-500 mt-1">ETA: ~{selectedWorker.eta} minutes</p>
                <p className="text-sm font-bold text-brand mt-1">{selectedService?.name} — €{Number(selectedWorker.price).toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-1">Payment: {payment === 'cash' ? 'Cash' : 'Card'}</p>
              </div>
            )}
            <p className="text-sm text-gray-400 mb-6">The worker is on their way. You can track the order in your cabinet.</p>
            <button onClick={() => navigate('/cabinet')} className="w-full py-4 bg-brand text-white font-bold rounded-2xl shadow-[0_8px_20px_rgba(91,108,249,0.25)] hover:shadow-[0_15px_30px_rgba(91,108,249,0.4)] transform hover:-translate-y-1 transition-all">
              Go to My Cabinet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}