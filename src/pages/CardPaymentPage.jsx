import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/CardPaymentPage.scss';

const CardPaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Простая валидация (можно усилить)
    if (!cardNumber || !expiry || !cvv) {
      setError('Пожалуйста, заполните все поля');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`/api/users/orders/${orderId}/pay?method=CARD`);
      navigate('/profile'); // или куда угодно после успешной оплаты
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при оплате');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-card-page">
      <h2>Оплата картой</h2>
      <form onSubmit={handlePay} className="payment-form">
        <label>
          Номер карты:
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            maxLength="19"
            placeholder="1234 5678 9012 3456"
          />
        </label>
        <label>
          Срок действия:
          <input
            type="text"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            maxLength="5"
            placeholder="MM/YY"
          />
        </label>
        <label>
          CVV:
          <input
            type="password"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            maxLength="3"
            placeholder="123"
          />
        </label>

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Оплата...' : 'Оплатить'}
        </button>
      </form>
    </div>
  );
};

export default CardPaymentPage;
