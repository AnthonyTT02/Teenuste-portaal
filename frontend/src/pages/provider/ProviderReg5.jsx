import { useNavigate } from 'react-router-dom';

export function ProviderReg5() {
  const nav = useNavigate();
  return (
    <div style={{ padding: 20 }}>
      <h2>Шаг 5: Подтверждение условий</h2>
      <label className="inline-row" style={{ alignItems: 'center' }}>
        <input type="checkbox" id="agree" />
        <span>Я согласен с условиями</span>
      </label>
      <button className="btn-sos-primary mt-16" onClick={() => {
        const ok = document.getElementById('agree')?.checked;
        if (!ok) return alert('Подтвердите согласие');
        sessionStorage.setItem('providerAgreement', JSON.stringify({ agree: true, ts: Date.now() }));
        nav('/provider-reg/6');
      }}>Далее</button>
    </div>
  );
}
