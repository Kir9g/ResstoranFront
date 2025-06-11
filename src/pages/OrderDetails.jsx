import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/OrderDetails.scss';

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      const res = await fetch(`/api/user/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        }
      });
      const data = await res.json();
      setOrder(data);
    };
    fetchOrder();
  }, [orderId]);

  if (!order) return <p>Загрузка...</p>;

  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleBack = () => {
        navigate(-1);
    };

    const handlePay = () => {
        navigate(`/payment/${order.id}`);
    };


  return (
    <div className="order-details">
      <h2 className="order-title">Заказ #{order.id}</h2>
      <div className="order-items">
        {order.items.map(item => (
          <div className="order-item" key={item.menuItemId}>
            <span className="item-name">{item.name} x{item.quantity}</span>
            <span className="item-price">{item.price} ₽</span>
          </div>
        ))}
      </div>
      <hr />
      <div className="total">
        <strong>Итого:</strong> {total} ₽
      </div>
      <div className="buttons">
        <button className="button" onClick={handleBack}>Назад</button>

        {!order.paid ? (
          <button className="button" onClick={handlePay}>Оплатить</button>
        ) : (
          <span className="paid-message">Заказ уже оплачен</span>
        )}
      </div>
    </div>
  );
}
