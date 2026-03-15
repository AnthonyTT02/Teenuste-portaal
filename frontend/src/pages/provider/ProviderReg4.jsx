import { useNavigate } from 'react-router-dom';

export function ProviderReg4() {
  const nav = useNavigate();
  return (
    <div style={{ padding: 20 }}>
      <h2>Шаг 4: Платежные данные</h2>
      <p>Данные карты в React-версии сохраняются только как безопасный срез (last4/brand).</p>
      <button className="btn-sos-primary" onClick={() => {
        sessionStorage.setItem('providerPaymentSafe', JSON.stringify({ brand: 'Card', last4: '0000', ts: Date.now() }));
        nav('/provider-reg/5');
      }}>Сохранить и далее</button>
    </div>
  );
}
