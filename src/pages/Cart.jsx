import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Cart.scss';

export default function Cart() {
  const [cart, setCart] = useState(null); // начальное значение — null
  const navigate = useNavigate();

  useEffect(() => {
  const stored = JSON.parse(localStorage.getItem('cart'));
    if (stored) {
      // Добавим комментарии по умолчанию, если их нет
      const updated = stored.map(item => ({ ...item, comment: item.comment || '' }));
      setCart(updated);
    } else {
      setCart([]);
    }
  }, []);

  useEffect(() => {
    if (cart !== null) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);
    const handleCommentChange = (id, newComment) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, comment: newComment } : item
      )
    );
  };

  if (cart === null) return <div className="cart-page"><p>Загрузка...</p></div>;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const goToBooking = () => {
    navigate('/reservation-history', { state: { cart } });
  };

  const clearCart = () => {
    localStorage.removeItem('cart');
    setCart([]);
  };

  const increaseQuantity = (id) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart(prev =>
      prev
        .map(item =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  return (
    <div className="cart-page">
      <h2>Корзина</h2>
      {cart.length === 0 ? (
        <p>Корзина пуста</p>
      ) : (
        <>
          <ul>
            {cart.map(item => (
              <li key={item.id} className="cart-item">
                <span>{item.name}</span>
                <div className="quantity-controls">
                  <button onClick={() => decreaseQuantity(item.id)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQuantity(item.id)}>+</button>
                </div>
                <span>{item.price * item.quantity} руб</span>
                <textarea
                  placeholder="Комментарий к блюду"
                  value={item.comment}
                  onChange={(e) => handleCommentChange(item.id, e.target.value)}
                  className="item-comment"
                />
              </li>
            ))}
          </ul>
          <h3>Итого: {total} руб</h3>
          <div className="cart-actions">
            <button onClick={() => navigate(-1)}>Назад</button>
            <button onClick={clearCart} className="clear-cart-button">Очистить</button>
            <button onClick={goToBooking}>Выбрать бронь</button>
          </div>
        </>
      )}
    </div>
  );
}
