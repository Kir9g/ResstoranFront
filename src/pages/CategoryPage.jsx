import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { isLoggedIn } from '../utilis/auth';
import '../styles/CategoryPage.scss';

export default function CategoryPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [dishes, setDishes] = useState([]);
  const [activeIndex, setActiveIndex] = useState(1);
  const [selectedDish, setSelectedDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchDishes() {
      try {
        const response = await fetch(`/api/guest/menu/${encodeURIComponent(name)}`);
        const data = await response.json();
        setDishes(data);
      } catch (err) {
        console.error('Ошибка при получении меню:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDishes();
  }, [name]);

  const rotateLeft = () => {
    setActiveIndex((prev) => (prev - 1 + dishes.length) % dishes.length);
  };

  const rotateRight = () => {
    setActiveIndex((prev) => (prev + 1) % dishes.length);
  };
  const changeQuantity = (delta) => {
    setQuantity((q) => Math.max(1, q + delta));
  };

  const getVisibleDishes = () => {
    if (dishes.length < 3) return dishes;
    const left = (activeIndex - 1 + dishes.length) % dishes.length;
    const right = (activeIndex + 1) % dishes.length;
    return [dishes[left], dishes[activeIndex], dishes[right]];
  };

  const handleAddToCart = (dish) => {
  if (!isLoggedIn()) {
    navigate('/login');
    return;
  }

  const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingItemIndex = existingCart.findIndex(item => item.id === dish.id);

  if (existingItemIndex !== -1) {
    // Увеличиваем количество
    existingCart[existingItemIndex].quantity += 1;
  } else {
    existingCart.push({ ...dish, quantity: quantity });
  }

  localStorage.setItem('cart', JSON.stringify(existingCart));
  alert('Товар добавлен в корзину');
};

  const visibleDishes = getVisibleDishes();

  return (
    <div className="category-page">
      <button className="back-btn" onClick={() => navigate(-1)}>Назад</button>
      <h2>{name.toUpperCase()}</h2>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <div className="scroller-container">
          <button className="scroll-btn left" onClick={rotateLeft}>❮</button>
          <div className="scroller">
            {visibleDishes.map((dish, idx) => (
              <div className={`card ${idx === 1 ? 'active' : ''}`} key={dish.id}>
                <img src={`http://localhost:8080${dish.imageUrl}`} alt={dish.name} />
                <div className="title">{dish.name}</div>
                {idx === 1 && (
                  <button className="more-btn" onClick={() => setSelectedDish(dish)}>
                    Подробнее
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="scroll-btn right" onClick={rotateRight}>❯</button>
        </div>
      )}

      {selectedDish && (
        <div className="modal-overlay" onClick={() => setSelectedDish(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={`http://localhost:8080${selectedDish.imageUrl}`} alt={selectedDish.name} />
            <h3>{selectedDish.name}</h3>
            <p><strong>Описание:</strong> {selectedDish.description}</p>
            <p><strong>Цена:</strong> {selectedDish.price} руб.</p>
            <div className="quantity-selector">
              <button onClick={() => changeQuantity(-1)}>-</button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val > 0) setQuantity(val);
                }}
              />
              <button onClick={() => changeQuantity(1)}>+</button>
            </div>

            <div className="modal-actions">
              <button onClick={() => setSelectedDish(null)}>Назад</button>
              <button onClick={() => handleAddToCart(selectedDish)}>В корзину</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
