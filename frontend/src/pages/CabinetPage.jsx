import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getUserId } from '../api';

export function CabinetPage() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [active, setActive] = useState([]);
  const [done, setDone] = useState([]);

  useEffect(() => {
    const uid = getUserId();
    if (!uid) return;

    api('/api/user/' + encodeURIComponent(uid)).then((j) => setUser(j.user)).catch(() => {});
    api('/api/user/' + encodeURIComponent(uid) + '/orders/active').then((j) => setActive(j.orders || [])).catch(() => {});
    api('/api/user/' + encodeURIComponent(uid) + '/orders/completed').then((j) => setDone(j.orders || [])).catch(() => {});
  }, []);

  function logout() {
    localStorage.clear();
    nav('/');
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Личный кабинет</h2>
      <div className="card">
        <div><b>Пользователь:</b> {user?.username || '-'}</div>
        <div><b>Телефон:</b> {user?.phone || '-'}</div>
      </div>

      <h3 className="mt-16">Активные заказы</h3>
      <div className="list-col">
        {active.map((o) => (
          <div key={o.id} className="card">
            <div>#{o.id} {o.companyName || 'Без компании'}</div>
            <div>{o.address || '-'}</div>
            <Link to={`/order/6?order=${o.id}&provider=${o.provider_id || ''}&employee=${o.employee_id || ''}&car=${o.car_id || ''}`}>Открыть</Link>
          </div>
        ))}
        {!active.length && <div className="card">Нет активных заказов</div>}
      </div>

      <h3 className="mt-16">История</h3>
      <div className="list-col">
        {done.map((o) => (
          <div key={o.id} className="card">#{o.id} {o.companyName || 'Без компании'}</div>
        ))}
        {!done.length && <div className="card">История пуста</div>}
      </div>

      <div className="inline-row mt-16">
        <Link className="btn-sos-primary" to="/order/1">Вызвать помощь</Link>
        <button className="btn-sos-secondary" onClick={logout}>Выйти</button>
      </div>
    </div>
  );
}
