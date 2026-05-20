// frontend/src/components/RequestHelp.jsx defines a React UI component and documents the state, handlers, and render flow used by this screen.
// Imports leaflet so this file can use its exported functionality.
import L from 'leaflet';
// Imports dependency so this file can use its exported functionality.
import 'leaflet/dist/leaflet.css';
// Imports React hooks used to manage component state and lifecycle behavior.
import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
// Imports the shared API client functions used to communicate with the backend.
import { api } from '../api';
// Imports ../context/SidebarContext so this file can use its exported functionality.
import { useSidebar } from '../context/SidebarContext';
// Imports ../utils/car_brands_models.json so this file can use its exported functionality.
import carBrandModels from '../utils/car_brands_models.json';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// MapClickHandler renders the map click handler screen and connects its UI behavior.
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({ click(e) { onLocationSelect(e.latlng); } });
  return null;
}

// Steps: 1=Service, 2=Location&Vehicle, 3=Payment, 3.5=Card details, 4=Send Request, 5=Confirm
/**
 * RequestHelp Component
 * Manages the step-by-step Roadside Assistance Checkout and Booking workflow:
 * Step 1: Select Emergency Service (Towing, Battery jumpstart, fuel, tire repair).
 * Step 2: Set incident GPS location (Leaflet Map drop pin & auto reverse-geocoding) and specify vehicle details (Brand, Model, Plate number).
 * Step 3: Choose Payment Method (Cash, Card, or Stripe).
 * Step 3.5: Input credit card details (under security compliance).
 * Step 4: Display list of active, nearby, and online professional providers.
 * Step 5: Submit order to database and redirect user to track assigned emergency vehicle.
 */
// RequestHelp renders the page component and keeps its UI behavior in one place.
export default function RequestHelp() {
  const { openSidebar } = useSidebar();
  // This navigation helper redirects the user after successful actions or role-based decisions.
  const navigate = useNavigate();
  // This value is read from localStorage to restore existing session or preference data.
  const userId = localStorage.getItem('userId');

  // Stores the step value so the UI can update when it changes.
  const [step, setStep] = useState(1);
  // Stores the services value so the UI can update when it changes.
  const [services, setServices] = useState([]);
  // Stores the selectedService value so the UI can update when it changes.
  const [selectedService, setSelectedService] = useState(null);
  // Stores the location value so the UI can update when it changes.
  const [location, setLocation] = useState(null);
  // Stores the address value so the UI can update when it changes.
  const [address, setAddress] = useState('');
  // Stores the vehicle value so the UI can update when it changes.
  const [vehicle, setVehicle] = useState({ brand: '', model: '', plate: '' });
  // Stores the note value so the UI can update when it changes.
  const [note, setNote] = useState('');
  // Stores the payment value so the UI can update when it changes.
  const [payment, setPayment] = useState('cash');
  // Stores the agreedToStorage value so the UI can update when it changes.
  const [agreedToStorage, setAgreedToStorage] = useState(false);
  // Stores the cardData value so the UI can update when it changes.
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
  // Stores the workers value so the UI can update when it changes.
  const [workers, setWorkers] = useState([]);
  // Stores the workerStats value so the UI can update when it changes.
  const [workerStats, setWorkerStats] = useState({ total: 0, online: 0 });
  // Stores the selectedWorker value so the UI can update when it changes.
  const [selectedWorker, setSelectedWorker] = useState(null);
  // Stores the loading value so the UI can update when it changes.
  const [loading, setLoading] = useState(false);
  // Stores the submitting value so the UI can update when it changes.
  const [submitting, setSubmitting] = useState(false);
  // Stores the orderId value so the UI can update when it changes.
  const [orderId, setOrderId] = useState(null);
  // Stores the error value so the UI can update when it changes.
  const [error, setError] = useState('');
  // Stores the geoLoading value so the UI can update when it changes.
  const [geoLoading, setGeoLoading] = useState(false);

  // useEffect keeps this component behavior synchronized with its dependencies.
  useEffect(() => {
    api('/api/services').then(r => setServices(r.services || [])).catch(() => {});
  }, []);

  // getUserLocation loads the required data and returns it to the caller.
  const getUserLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        // The try block wraps operations that may fail, such as API requests or browser storage updates.
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

  // handleMapClick handles the related user action and updates the component state or API data.
  const handleMapClick = async (latlng) => {
    setLocation({ lat: latlng.lat, lng: latlng.lng });
    // The try block wraps operations that may fail, such as API requests or browser storage updates.
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`);
      const data = await r.json();
      setAddress(data.display_name || `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
    } catch { setAddress(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`); }
  };

  // loadWorkers loads the required data and returns it to the caller.
  const loadWorkers = async () => {
    if (!selectedService) return;
    setLoading(true);
    // The try block wraps operations that may fail, such as API requests or browser storage updates.
    try {
      // This API call sends data to the backend or retrieves data needed by the component.
      const res = await api(`/api/workers/for-service/${selectedService.id}`);
      const nextWorkers = res.workers || [];
      setWorkers(nextWorkers);
      setWorkerStats({
        total: Number(res.workerStats?.total ?? nextWorkers.length),
        online: Number(res.workerStats?.online ?? nextWorkers.length)
      });
    } catch {
      setWorkers([]);
      setWorkerStats({ total: 0, online: 0 });
    }
    setLoading(false);
  };

  // goToStep contains reusable logic for this file.
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

  // validateCard contains reusable logic for this file.
  const validateCard = () => {
    const num = cardData.number.replace(/\s/g, '');
    if (num.length < 13 || num.length > 19) return 'Card number must be 13-19 digits';
    if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) return 'Expiry must be MM/YY format';
    if (!/^\d{3,4}$/.test(cardData.cvv)) return 'CVV must be 3-4 digits';
    if (!cardData.name.trim()) return 'Cardholder name is required';
    return null;
  };

  // handleCardContinue handles the related user action and updates the component state or API data.
  const handleCardContinue = () => {
    const err = validateCard();
    if (err) return setError(err);
    setError('');
    goToStep(4);
  };

  // confirmOrder contains reusable logic for this file.
  const confirmOrder = async () => {
    if (!selectedWorker) return setError('Please choose a worker');
    setSubmitting(true);
    // The try block wraps operations that may fail, such as API requests or browser storage updates.
    try {
      // This API call sends data to the backend or retrieves data needed by the component.
      const res = await api('/api/order', {
        method: 'POST',
        body: JSON.stringify({
          userId: userId ? Number(userId) : null,
          services: [selectedService.id],
              vehicleBrand: vehicle.brand,
              vehicleModel: vehicle.model,
              regNumber: vehicle.plate,
          address,
          lat: location?.lat,
          lng: location?.lng,
          paymentType: payment,
          worker_user_id: selectedWorker.id,
          status: 'active',
          price: selectedWorker.price,
          note: note ? String(note).slice(0, 50) : null,
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
  const displayStep = step === 3.5 ? 'Payment Details' : step <= 4 ? ['Service', 'Location & Vehicle', 'Payment Method', 'Send Request'][step - 1] : 'Done';
  const progressStep = step === 3.5 ? 3 : step;

  // Renders the JSX markup for this component.
  return (
    <div className="tp-page-card max-w-2xl p-8">
      {/* This container groups related UI elements and keeps the layout consistent. */}
      <div className="tp-page-card-shine" />
      <div className="relative z-10">
        {/* This container groups related UI elements and keeps the layout consistent. */}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          {/* This container groups related UI elements and keeps the layout consistent. */}
          <h1 className="tp-brand-title">
            Teenuste<span className="tp-brand-accent">Portaal</span>
          </h1>
          {/* This button triggers the main action for this part of the screen. */}
          <button onClick={openSidebar} className="tp-icon-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>

        {step < 5 && (
          <>
            <h2 className="text-3xl font-extrabold text-[#111827] mb-1">Request <span className="tp-brand-accent">Assistance</span></h2>
            <p className="text-gray-400 text-sm mb-5">{displayStep}</p>
            <div className="flex gap-1.5 mb-6">
              {/* This container groups related UI elements and keeps the layout consistent. */}
              {[1,2,3,4].map(s => <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${s <= progressStep ? 'bg-brand' : 'bg-gray-200'}`} />)}
            </div>
          </>
        )}

        {error && <div className="tp-alert-error mb-4">{error}</div>}

        {/* STEP 1: Select Service */}
        {step === 1 && (
          <div className="space-y-2">
            {/* This container groups related UI elements and keeps the layout consistent. */}
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">What do you need?</h3>
            {services.map(s => (
              <button key={s.id} type="button" onClick={() => setSelectedService(s)}
                className={`tp-choice justify-between ${selectedService?.id === s.id ? 'tp-choice-active' : ''}`}>
                <div className="flex items-center gap-3">
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  <div className={`tp-choice-check rounded-full ${selectedService?.id === s.id ? 'tp-choice-check-active' : ''}`}>
                    {/* This container groups related UI elements and keeps the layout consistent. */}
                    {selectedService?.id === s.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <p className="font-semibold text-gray-800">{s.name}</p>
                </div>
                <p className="font-bold text-brand">€{Number(s.price).toFixed(2)}</p>
              </button>
            ))}
            {/* This button triggers the main action for this part of the screen. */}
            <button onClick={() => goToStep(2)} className="tp-btn-primary w-full mt-4 py-4 hover:-translate-y-1">
              Next →
            </button>
          </div>
        )}

        {/* STEP 2: Location & Vehicle */}
        {step === 2 && (
          <div className="space-y-4">
            {/* This container groups related UI elements and keeps the layout consistent. */}
            <div>
              {/* This container groups related UI elements and keeps the layout consistent. */}
              <div className="flex justify-between items-center mb-2">
                {/* This container groups related UI elements and keeps the layout consistent. */}
                <label className="text-sm font-bold text-gray-700">Your Location</label>
                {/* This button triggers the main action for this part of the screen. */}
                <button onClick={getUserLocation} disabled={geoLoading} className="tp-text-link text-xs flex items-center gap-1 disabled:opacity-50">
                  {geoLoading ? 'Locating...' : 'Use GPS'}
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden border border-gray-200 h-52 mb-2">
                {/* This container groups related UI elements and keeps the layout consistent. */}
                <MapContainer center={centerMap} zoom={13} zoomControl={false} style={{ height: '100%', width: '100%' }} key={centerMap.join(',')}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OpenStreetMap' />
                  <MapClickHandler onLocationSelect={handleMapClick} />
                  {location && <Marker position={[location.lat, location.lng]} />}
                </MapContainer>
              </div>
              {address && <p className="text-xs text-gray-500 truncate">Address: {address}</p>}
              {!location && <p className="text-xs text-gray-400">Click on the map or use GPS to set your location</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* This container groups related UI elements and keeps the layout consistent. */}
              <div>
                {/* This container groups related UI elements and keeps the layout consistent. */}
                <label className="tp-label-sm">Vehicle Brand *</label>
                {/* This input keeps its value connected to component state. */}
                <input list="car-brands" value={vehicle.brand} onChange={e => setVehicle(p => ({ ...p, brand: e.target.value, model: '' }))}
                  className="tp-input-sm"
                  placeholder="Toyota, BMW..." />
                <datalist id="car-brands">
                  {Object.keys(carBrandModels).map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
                <div className="mt-2">
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  <label className="tp-label-sm">Vehicle Model</label>
                  {/* This input keeps its value connected to component state. */}
                  <input list="car-models" value={vehicle.model} onChange={e => setVehicle(p => ({ ...p, model: e.target.value }))}
                    className="tp-input-sm"
                    placeholder="Model or type" />
                  <datalist id="car-models">
                    {(carBrandModels[vehicle.brand] || []).map(m => <option key={m} value={m} />)}
                  </datalist>
                </div>
              </div>
              <div>
                {/* This container groups related UI elements and keeps the layout consistent. */}
                <label className="tp-label-sm">Reg. Number *</label>
                {/* This input keeps its value connected to component state. */}
                <input value={vehicle.plate} onChange={e => setVehicle(p => ({ ...p, plate: e.target.value.replace(/[^a-zA-Z0-9\s]/g, '').toUpperCase() }))}
                  className="tp-input-sm"
                  placeholder="123 ABC" maxLength={10} />
              </div>
            </div>

            <div>
              {/* This container groups related UI elements and keeps the layout consistent. */}
              <label className="tp-label-sm">Note for worker (max 50 characters)</label>
              {/* This input keeps its value connected to component state. */}
              <input value={note} onChange={e => setNote(e.target.value.slice(0, 50))}
                className="tp-input-sm"
                placeholder="Short note for the worker" maxLength={50} />
            </div>

            <div className="flex gap-3 pt-2">
              {/* This button triggers the main action for this part of the screen. */}
              <button onClick={() => setStep(1)} className="tp-btn-secondary flex-1 py-3">Back</button>
              {/* This button triggers the main action for this part of the screen. */}
              <button onClick={() => goToStep(3)} className="tp-btn-primary flex-1 py-3">Next →</button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment Method */}
        {step === 3 && (
          <div className="space-y-4">
            {/* This container groups related UI elements and keeps the layout consistent. */}
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Payment Method</h3>
            {[{ id: 'cash', label: 'Cash', desc: 'Pay the worker directly in cash' }, { id: 'card', label: 'Card', desc: 'Pay securely by card' }].map(m => (
              <button key={m.id} type="button" onClick={() => setPayment(m.id)}
                className={`tp-choice p-5 ${payment === m.id ? 'tp-choice-active' : ''}`}>
                <div>
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  <p className="font-bold text-gray-800">{m.label}</p>
                  <p className="text-xs text-gray-500">{m.desc}</p>
                </div>
                <div className={`tp-choice-check ml-auto rounded-full ${payment === m.id ? 'tp-choice-check-active' : ''}`}>
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  {payment === m.id && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            ))}

            {payment === 'card' && (
              <label className="flex items-center gap-3 p-3 bg-brand/5 border border-brand/20 rounded-xl cursor-pointer mt-2">
                {/* This input keeps its value connected to component state. */}
                <input 
                  type="checkbox" 
                  checked={agreedToStorage} 
                  onChange={(e) => setAgreedToStorage(e.target.checked)} 
                  className="tp-checkbox"
                />
                <span className="text-sm text-gray-700">I agree to the short-term storage of my personal and banking data</span>
              </label>
            )}

            <div className="flex gap-3 pt-2">
              {/* This button triggers the main action for this part of the screen. */}
              <button onClick={() => setStep(2)} className="tp-btn-secondary flex-1 py-3">Back</button>
              {/* This button triggers the main action for this part of the screen. */}
              <button disabled={payment === 'card' && !agreedToStorage} onClick={() => {
                setError('');
                if (payment === 'card') { setStep(3.5); }
                else { goToStep(4); }
              }} className={`flex-1 py-3 ${payment === 'card' && !agreedToStorage ? 'tp-btn-secondary opacity-60 cursor-not-allowed' : 'tp-btn-primary'}`}>
                {payment === 'card' ? 'Enter Card Details →' : 'Send Request →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3.5: Card Payment Details */}
        {step === 3.5 && (
          <div className="space-y-4">
            {/* This container groups related UI elements and keeps the layout consistent. */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-6 text-white mb-2 shadow-xl">
              {/* This container groups related UI elements and keeps the layout consistent. */}
              <div className="flex justify-between items-start mb-8">
                {/* This container groups related UI elements and keeps the layout consistent. */}
                <div className="text-xs uppercase tracking-widest opacity-60">Credit Card</div>
              </div>
              <div className="text-xl tracking-[0.25em] font-mono mb-4">{cardData.number || '•••• •••• •••• ••••'}</div>
              <div className="flex justify-between text-xs uppercase tracking-wider">
                {/* This container groups related UI elements and keeps the layout consistent. */}
                <div><span className="opacity-50">Name</span><br /><span className="font-bold">{cardData.name || 'YOUR NAME'}</span></div>
                <div className="text-right"><span className="opacity-50">Expiry</span><br /><span className="font-bold">{cardData.expiry || 'MM/YY'}</span></div>
              </div>
            </div>

            <div>
              {/* This container groups related UI elements and keeps the layout consistent. */}
              <label className="tp-label-sm">Card Number *</label>
              {/* This input keeps its value connected to component state. */}
              <input value={cardData.number} onChange={e => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 19);
                setCardData(p => ({ ...p, number: v.replace(/(\d{4})(?=\d)/g, '$1 ') }));
              }} className="tp-input-sm font-mono tracking-wider" placeholder="1234 5678 9012 3456" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* This container groups related UI elements and keeps the layout consistent. */}
              <div>
                {/* This container groups related UI elements and keeps the layout consistent. */}
                <label className="tp-label-sm">Expiry *</label>
                {/* This input keeps its value connected to component state. */}
                <input value={cardData.expiry} onChange={e => {
                  let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                  if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
                  setCardData(p => ({ ...p, expiry: v }));
                }} className="tp-input-sm" placeholder="MM/YY" maxLength={5} />
              </div>
              <div>
                {/* This container groups related UI elements and keeps the layout consistent. */}
                <label className="tp-label-sm">CVV *</label>
                {/* This input keeps its value connected to component state. */}
                <input value={cardData.cvv} onChange={e => setCardData(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  className="tp-input-sm" placeholder="123" maxLength={4} type="password" />
              </div>
            </div>
            <div>
              {/* This container groups related UI elements and keeps the layout consistent. */}
              <label className="tp-label-sm">Cardholder Name *</label>
              {/* This input keeps its value connected to component state. */}
              <input value={cardData.name} onChange={e => setCardData(p => ({ ...p, name: e.target.value.toUpperCase() }))}
                className="tp-input-sm" placeholder="JOHN DOE" />
            </div>
            
            <div className="flex gap-3 pt-2">
              {/* This button triggers the main action for this part of the screen. */}
              <button onClick={() => setStep(3)} className="tp-btn-secondary flex-1 py-3">Back</button>
              {/* This button triggers the main action for this part of the screen. */}
              <button onClick={handleCardContinue} className="tp-btn-primary flex-1 py-3">
                Pay & Send Request →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Send Request */}
        {step === 4 && (
          <div>
            {/* This container groups related UI elements and keeps the layout consistent. */}
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Available Workers</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {/* This container groups related UI elements and keeps the layout consistent. */}
              <div className="rounded-2xl bg-gray-50/70 border border-gray-200/60 px-4 py-3">
                {/* This container groups related UI elements and keeps the layout consistent. */}
                <p className="text-2xl font-extrabold text-gray-900">{workerStats.total}</p>
                <p className="text-xs font-semibold text-gray-400">Workers with this service</p>
              </div>
              <div className="rounded-2xl bg-green-50 border border-green-100 px-4 py-3">
                {/* This container groups related UI elements and keeps the layout consistent. */}
                <p className="text-2xl font-extrabold text-green-600">{workerStats.online}</p>
                <p className="text-xs font-semibold text-green-600/70">Online now</p>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-12 text-gray-400">Finding available workers...</div>
            ) : workers.length === 0 ? (
              <div className="text-center py-12">
                {/* This container groups related UI elements and keeps the layout consistent. */}
                <h3 className="text-xl font-bold text-gray-700 mb-2">No workers available</h3>
                <p className="text-gray-400 text-sm">No workers are currently online for this service. Please try again later.</p>
                {/* This button triggers the main action for this part of the screen. */}
                <button onClick={() => setStep(3)} className="tp-btn-secondary mt-6 px-6 py-3">Go Back</button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {/* This container groups related UI elements and keeps the layout consistent. */}
                  {workers.map(w => (
                    <button key={w.id} type="button" onClick={() => setSelectedWorker(w)}
                      className={`tp-choice p-5 ${selectedWorker?.id === w.id ? 'tp-choice-active' : ''}`}>
                      <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center text-lg font-bold flex-shrink-0">
                        {/* This container groups related UI elements and keeps the layout consistent. */}
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
                  {/* This button triggers the main action for this part of the screen. */}
                  <button onClick={() => setStep(payment === 'card' ? 3.5 : 3)} className="tp-btn-secondary flex-1 py-3">Back</button>
                  {/* This button triggers the main action for this part of the screen. */}
                  <button onClick={confirmOrder} disabled={submitting || !selectedWorker} className="tp-btn-primary flex-1 py-3">
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
            {/* This button triggers the main action for this part of the screen. */}
            <button onClick={() => navigate('/cabinet')} className="tp-btn-primary w-full py-4 hover:-translate-y-1">
              Go to My Cabinet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
