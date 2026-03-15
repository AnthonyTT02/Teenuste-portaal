import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';

export function Slide1() {
  const nav = useNavigate();
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(() => {
    const st = JSON.parse(localStorage.getItem('orderState') || '{}');
    return new Set(st.services || []);
  });

  useEffect(() => {
    api('/api/services').then((j) => setServices(j.services || [])).catch(() => setServices([]));
  }, []);

  function toggle(id) {
    const copy = new Set(selected);
    if (copy.has(String(id))) copy.delete(String(id));
    else copy.add(String(id));
    setSelected(copy);
  }

  function next() {
    const st = JSON.parse(localStorage.getItem('orderState') || '{}');
    st.services = Array.from(selected);
    localStorage.setItem('orderState', JSON.stringify(st));
    nav('/order/2');
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Заказ: услуги</h2>
      <div className="list-col">
        {services.map((s) => (
          <label key={s.id} className="card inline-row" style={{ alignItems: 'center' }}>
            <input type="checkbox" checked={selected.has(String(s.id))} onChange={() => toggle(s.id)} />
            <span>{s.name}</span>
          </label>
        ))}
      </div>
      <button className="btn-sos-primary mt-16" onClick={next}>Далее</button>
    </div>
  );
}
