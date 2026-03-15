import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';

export function ProviderReg1() {
  const nav = useNavigate();
  const [services, setServices] = useState([]);
  const [prices, setPrices] = useState(() => JSON.parse(sessionStorage.getItem('providerServices') || '{}'));

  useEffect(() => {
    api('/api/services').then((j) => setServices(j.services || [])).catch(() => setServices([]));
  }, []);

  function next() {
    sessionStorage.setItem('providerServices', JSON.stringify(prices));
    nav('/provider-reg/2');
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Регистрация поставщика: Шаг 1</h2>
      <p>Выберите услуги и цены</p>
      <div className="list-col">
        {services.map((s) => (
          <div key={s.id} className="card inline-row">
            <div style={{ flex: 1 }}>{s.name}</div>
            <input
              className="input"
              style={{ width: 120 }}
              type="number"
              min="0"
              step="0.01"
              value={prices[s.name]?.price || ''}
              onChange={(e) => {
                const v = e.target.value;
                setPrices({ ...prices, [s.name]: { id: s.id, price: Number(v) } });
              }}
              placeholder="Цена"
            />
          </div>
        ))}
      </div>
      <button className="btn-sos-primary mt-16" onClick={next}>Далее</button>
    </div>
  );
}
