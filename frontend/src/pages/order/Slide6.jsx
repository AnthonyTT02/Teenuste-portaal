import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api';

export function Slide6() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [data, setData] = useState({ order: null, provider: null, employee: null, car: null });
  const [err, setErr] = useState('');

  const orderId = params.get('order');
  const providerId = params.get('provider');
  const employeeId = params.get('employee');
  const carId = params.get('car');

  useEffect(() => {
    if (!orderId || !providerId) return;
    (async () => {
      try {
        const o = await api('/api/orders/' + encodeURIComponent(orderId));
        const prices = await api('/api/providers/prices?orderId=' + encodeURIComponent(orderId));
        const p = (prices.providers || []).find((x) => String(x.provider.id) === String(providerId));
        const emp = employeeId ? await api('/api/employee/' + encodeURIComponent(employeeId)) : { employee: null };
        const car = carId ? await api('/api/car/' + encodeURIComponent(carId)) : { car: null };
        setData({ order: o.order, provider: p?.provider || null, employee: emp.employee, car: car.car });
      } catch (e) {
        setErr(e.payload?.error || e.message);
      }
    })();
  }, [orderId, providerId, employeeId, carId]);

  async function complete() {
    try {
      if (employeeId) {
        await api('/api/employee/' + encodeURIComponent(employeeId) + '/status', {
          method: 'PATCH',
          body: JSON.stringify({ isOnline: true })
        });
      }
      await api('/api/order/' + encodeURIComponent(orderId) + '/complete', {
        method: 'POST',
        body: JSON.stringify({})
      });
      nav('/cabinet');
    } catch (e) {
      setErr(e.payload?.error || e.message);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Заказ в работе</h2>
      {err ? <div className="error">{err}</div> : null}
      <div className="card">Провайдер: {data.provider?.companyName || '-'}</div>
      <div className="card mt-12">Адрес: {data.order?.address || '-'}</div>
      <div className="card mt-12">Мастер: {data.employee?.name || '-'}</div>
      <div className="card mt-12">Машина: {data.car?.name || '-'}</div>
      <button className="btn-sos-primary mt-16" onClick={complete}>Заказ выполнен</button>
    </div>
  );
}
