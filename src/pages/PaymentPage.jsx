import { useEffect, useState } from 'react';
import '../styles/PaymentPage.scss';
import { useParams, useNavigate } from 'react-router-dom';

export default function PaymentPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState('waiter');

  useEffect(() => {
    fetch(`/api/user/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` }
    })
      .then(res => res.json())
      .then(setOrder);
  }, [orderId]);

  // В компоненте:
const navigate = useNavigate();

const handlePayment = () => {
  if (method === 'ONLINE') {
    // Переход на страницу оплаты картой
    navigate(`/pay/card/${orderId}`);
  } else {
    // Оплата через официанта
    fetch(`/api/user/orders/${orderId}/pay?method=WAITER`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt_token')}`
      }
    })
      .then(res => {
        if (res.ok) {
          alert("Сейчас подойдет официант");
        } else {
          res.text().then(alert);
        }
      });
  }
};

  if (!order) return <div className="payment-page">Загрузка...</div>;

  return (
    <div className="payment-page">
      <div className="payment-card">
        <h2>Оплата</h2>

        <div className="payment-amount">Сумма: {order.totalAmount} руб.</div>

        {/* Можно показать блюда */}
        <ul className="order-items">
          {order.items.map((item) => (
            <li key={item.menuItemId}>
              {item.name} × {item.quantity} — {item.price} руб.
            </li>
          ))}
        </ul>

        <div className="payment-methods">
          <label>
            <input
              type="radio"
              name="paymentType"
              value="WAITER"
              checked={method === 'WAITER'}
              onChange={() => setMethod('WAITER')}
            />
            Официанту
          </label>
          <label>
            <input
              type="radio"
              name="paymentType"
              value="ONLINE"
              checked={method === 'ONLINE'}
              onChange={() => setMethod('ONLINE')}
            />
            Через сайт
          </label>
        </div>

        <button className="pay-button" onClick={handlePayment}>
          {method === 'ONLINE' ? 'Перейти к оплате картой' : 'Вызвать официанта'}
        </button>
      </div>
    </div>
  );

}
