import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, getProviderId, getUserId } from '../api';

export function CompanyPage() {
  const [params] = useSearchParams();
  const providerId = useMemo(() => params.get('providerId') || getProviderId(), [params]);
  const userId = getUserId();

  const [provider, setProvider] = useState(null);
  const [orders, setOrders] = useState([]);
  const [newCar, setNewCar] = useState('');
  const [emp, setEmp] = useState({ name: '', phone: '' });
  const [error, setError] = useState('');

  async function loadAll() {
    if (!providerId) return;
    try {
      const p = await api('/api/provider/' + encodeURIComponent(providerId) + '?userId=' + encodeURIComponent(userId));
      setProvider(p.provider);
      const o = await api('/api/provider/' + encodeURIComponent(providerId) + '/orders?userId=' + encodeURIComponent(userId));
      setOrders(o.orders || []);
      setError('');
    } catch (e) {
      setError(e.payload?.error || e.message);
    }
  }

  useEffect(() => { loadAll(); }, [providerId]);

  async function addCar() {
    if (!newCar.trim()) return;
    await api('/api/provider/' + encodeURIComponent(providerId) + '/car', {
      method: 'POST',
      body: JSON.stringify({ userId, regNumber: newCar.trim() })
    });
    setNewCar('');
    loadAll();
  }

  async function addEmployee() {
    if (!emp.name.trim()) return;
    await api('/api/provider/' + encodeURIComponent(providerId) + '/employee', {
      method: 'POST',
      body: JSON.stringify({ userId, name: emp.name, phone: emp.phone, languages: [] })
    });
    setEmp({ name: '', phone: '' });
    loadAll();
  }

  async function removeCar(id) {
    await api('/api/provider/' + encodeURIComponent(providerId) + '/car/' + encodeURIComponent(id) + '?userId=' + encodeURIComponent(userId), {
      method: 'DELETE'
    });
    loadAll();
  }

  async function removeEmployee(id) {
    await api('/api/provider/' + encodeURIComponent(providerId) + '/employee/' + encodeURIComponent(id) + '?userId=' + encodeURIComponent(userId), {
      method: 'DELETE'
    });
    loadAll();
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Панель компании</h2>
      {error ? <div className="error">{error}</div> : null}
      <div className="inline-row" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3>Сотрудники</h3>
          <div className="list-col">
            {(provider?.employees || []).map((e) => (
              <div key={e.id} className="card">
                <b>{e.name}</b> {e.phone || ''}
                <button className="btn-sos-secondary mt-12" onClick={() => removeEmployee(e.id)}>Удалить</button>
              </div>
            ))}
          </div>
          <input className="input mt-12" placeholder="Имя" value={emp.name} onChange={(e) => setEmp({ ...emp, name: e.target.value })} />
          <input className="input mt-12" placeholder="Телефон" value={emp.phone} onChange={(e) => setEmp({ ...emp, phone: e.target.value })} />
          <button className="btn-sos-primary mt-12" onClick={addEmployee}>Добавить сотрудника</button>

          <h3 className="mt-16">Машины</h3>
          <div className="list-col">
            {(provider?.cars || []).map((c) => (
              <div key={c.id} className="card">
                {c.regNumber || '-'}
                <button className="btn-sos-secondary mt-12" onClick={() => removeCar(c.id)}>Удалить</button>
              </div>
            ))}
          </div>
          <input className="input mt-12" placeholder="Рег. номер" value={newCar} onChange={(e) => setNewCar(e.target.value)} />
          <button className="btn-sos-primary mt-12" onClick={addCar}>Добавить машину</button>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Активные заказы</h3>
          <div className="list-col">
            {orders.map((o) => (
              <div key={o.id} className="card">#{o.id} {o.address || '-'}</div>
            ))}
            {!orders.length && <div className="card">Нет активных заказов</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
