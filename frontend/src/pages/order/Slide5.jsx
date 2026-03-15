import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api';

export function Slide5() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const st = JSON.parse(localStorage.getItem('orderState') || '{}');
    const oid = params.get('order') || st.orderId;
    if (!oid) return;
    setOrderId(String(oid));

    (async () => {
      try {
        const orderRes = await api('/api/orders/' + encodeURIComponent(oid));
        const serviceIds = JSON.parse(orderRes.order.services || '[]');
        if (!serviceIds.length) throw new Error('Услуги не выбраны');
        const ps = await api('/api/providers-for-service/' + encodeURIComponent(serviceIds[0]));
        setProviders(ps.providers || []);
      } catch (e) {
        setError(e.payload?.error || e.message);
      }
    })();
  }, [params]);

  async function choose(p) {
    try {
      if (!p.onlineEmployees?.length || !p.onlineCars?.length) return;
      const emp = p.onlineEmployees[Math.floor(Math.random() * p.onlineEmployees.length)];
      const car = p.onlineCars[Math.floor(Math.random() * p.onlineCars.length)];

      await api('/api/employee/' + encodeURIComponent(emp.id) + '/status', {
        method: 'PATCH',
        body: JSON.stringify({ isOnline: false })
      });

      await api('/api/order/attach', {
        method: 'POST',
        body: JSON.stringify({ orderId, providerId: p.id, employeeId: emp.id, carId: car.id })
      });

      nav(`/order/6?order=${encodeURIComponent(orderId)}&provider=${encodeURIComponent(p.id)}&employee=${encodeURIComponent(emp.id)}&car=${encodeURIComponent(car.id)}&price=${encodeURIComponent(p.price || 0)}&eta=15`);
    } catch (e) {
      setError(e.payload?.error || e.message);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Выбор провайдера</h2>
      {error ? <div className="error">{error}</div> : null}
      <div className="list-col">
        {providers.map((p) => (
          <div key={p.id} className="card">
            <b>{p.companyName}</b>
            <div>Цена: {Number(p.price || 0).toFixed(2)} EUR</div>
            <div>Мастеров онлайн: {p.onlineEmployees?.length || 0}</div>
            <div>Машин онлайн: {p.onlineCars?.length || 0}</div>
            <button className="btn-sos-primary mt-12" onClick={() => choose(p)}>Выбрать</button>
          </div>
        ))}
        {!providers.length && !error && <div className="card">Поставщики не найдены</div>}
      </div>
    </div>
  );
}
