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
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
        const serviceIds = Array.from(new Set(JSON.parse(orderRes.order?.services || '[]').map(String).filter(Boolean)));

        const onlineByProvider = new Map();
        for (const sid of serviceIds) {
          const online = await api('/api/providers-for-service/' + encodeURIComponent(sid));
          for (const p of online.providers || []) {
            const key = String(p.id);
            const prev = onlineByProvider.get(key) || { onlineEmployees: [], onlineCars: [] };
            const nextEmployees = [...prev.onlineEmployees];
            const nextCars = [...prev.onlineCars];

            for (const e of p.onlineEmployees || []) {
              if (!nextEmployees.some((x) => String(x.id) === String(e.id))) nextEmployees.push(e);
            }
            for (const c of p.onlineCars || []) {
              if (!nextCars.some((x) => String(x.id) === String(c.id))) nextCars.push(c);
            }

            onlineByProvider.set(key, { onlineEmployees: nextEmployees, onlineCars: nextCars });
          }
        }

        const prices = await api('/api/providers/prices?orderId=' + encodeURIComponent(oid));
        const withOnline = (prices.providers || [])
          .map((entry) => {
            const p = entry.provider;
            if (!p?.id) return null;
            const found = onlineByProvider.get(String(p.id));
            return {
              id: p.id,
              companyName: p.companyName,
              ownerPhone: p.ownerPhone,
              price: Number(entry.total || 0),
              eta: entry.eta_minutes || null,
              distance: entry.distance || null,
              onlineEmployees: found?.onlineEmployees || [],
              onlineCars: found?.onlineCars || []
            };
          })
          .filter(Boolean);

        setProviders(withOnline);
<<<<<<< HEAD
=======
=======
        const serviceIds = JSON.parse(orderRes.order.services || '[]');
        if (!serviceIds.length) throw new Error('Услуги не выбраны');
        const ps = await api('/api/providers-for-service/' + encodeURIComponent(serviceIds[0]));
        setProviders(ps.providers || []);
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
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

<<<<<<< HEAD
      nav(`/order/6?order=${encodeURIComponent(orderId)}&provider=${encodeURIComponent(p.id)}&employee=${encodeURIComponent(emp.id)}&car=${encodeURIComponent(car.id)}&price=${encodeURIComponent(p.price || 0)}&eta=${encodeURIComponent(p.eta || 15)}`);
=======
<<<<<<< HEAD
      nav(`/order/6?order=${encodeURIComponent(orderId)}&provider=${encodeURIComponent(p.id)}&employee=${encodeURIComponent(emp.id)}&car=${encodeURIComponent(car.id)}&price=${encodeURIComponent(p.price || 0)}&eta=${encodeURIComponent(p.eta || 15)}`);
=======
      nav(`/order/6?order=${encodeURIComponent(orderId)}&provider=${encodeURIComponent(p.id)}&employee=${encodeURIComponent(emp.id)}&car=${encodeURIComponent(car.id)}&price=${encodeURIComponent(p.price || 0)}&eta=15`);
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
            <div>ETA: {p.eta ? `${p.eta} мин` : '-'}</div>
            <div>Мастеров онлайн: {p.onlineEmployees?.length || 0}</div>
            <div>Машин онлайн: {p.onlineCars?.length || 0}</div>
            <button
              className="btn-sos-primary mt-12"
              disabled={!p.onlineEmployees?.length || !p.onlineCars?.length}
              onClick={() => choose(p)}
            >
              {!p.onlineEmployees?.length || !p.onlineCars?.length ? 'Недоступно' : 'Выбрать'}
            </button>
<<<<<<< HEAD
=======
=======
            <div>Мастеров онлайн: {p.onlineEmployees?.length || 0}</div>
            <div>Машин онлайн: {p.onlineCars?.length || 0}</div>
            <button className="btn-sos-primary mt-12" onClick={() => choose(p)}>Выбрать</button>
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
          </div>
        ))}
        {!providers.length && !error && <div className="card">Поставщики не найдены</div>}
      </div>
    </div>
  );
}
