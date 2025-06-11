import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Info() {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    fetch('/api/guest/restaurant')
      .then(res => res.json())
      .then(data => setRestaurant(data))
      .catch(err => console.error('Ошибка загрузки информации:', err));
  }, []);

  const handleStaffLogin = () => {
    navigate('/staff/login');
  };

  return (
    <div style={{ padding: '2rem', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Информация о ресторане</h2>

      {restaurant ? (
        <div style={{ lineHeight: '1.6' }}>
          <p><strong>Название:</strong> {restaurant.name}</p>
          <p><strong>Описание:</strong> {restaurant.description}</p>
          <p><strong>Адрес:</strong> {restaurant.address}</p>
          <p><strong>Телефон:</strong> {restaurant.phoneNumber}</p>
        </div>
      ) : (
        <p>Загрузка информации...</p>
      )}
    </div>
  );
}
