import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getUserId } from '../../api';

export function Slide2() {
  const nav = useNavigate();
  const [f, setF] = useState({ vehicleBrand: 'Volvo', vehicleModel: 'X70', regNumber: '123 ADC', paymentType: 'card' });
  const [err, setErr] = useState('');

  async function submit() {
    setErr('');
    try {
      const st = JSON.parse(localStorage.getItem('orderState') || '{}');
      const payload = {
        vehicleBrand: f.vehicleBrand,
        vehicleModel: f.vehicleModel,
        regNumber: f.regNumber,
        services: st.services || [],
        address: st.address || null,
        lat: st.lat || null,
        lng: st.lng || null,
        paymentType: f.paymentType,
        userId: getUserId() || null
      };
      const j = await api('/api/order', { method: 'POST', body: JSON.stringify(payload) });
      const nextState = { ...st, orderId: j.orderId, paymentType: f.paymentType };
      localStorage.setItem('orderState', JSON.stringify(nextState));
      nav('/order/5?order=' + encodeURIComponent(j.orderId));
    } catch (e) {
      setErr(e.payload?.error || e.message);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Заказ: автомобиль и оплата</h2>
      <input className="input" value={f.vehicleBrand} onChange={(e) => setF({ ...f, vehicleBrand: e.target.value })} placeholder="Марка" />
      <input className="input mt-12" value={f.vehicleModel} onChange={(e) => setF({ ...f, vehicleModel: e.target.value })} placeholder="Модель" />
      <input className="input mt-12" value={f.regNumber} onChange={(e) => setF({ ...f, regNumber: e.target.value })} placeholder="Рег. номер" />
      <select className="input mt-12" value={f.paymentType} onChange={(e) => setF({ ...f, paymentType: e.target.value })}>
        <option value="card">Оплата картой</option>
        <option value="cash">Оплата наличными</option>
      </select>
      {err ? <div className="error">{err}</div> : null}
      <button className="btn-sos-primary mt-16" onClick={submit}>Подтвердить заказ</button>
    </div>
  );
}
