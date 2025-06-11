import { useEffect, useState } from 'react';
import '../styles/AdminDashboard.scss';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    reservations: 0,
    revenue: 0,
    visitors: 0,
  });

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const end = new Date().toISOString();

    fetch(`/api/admin/income?start=${start}&end=${end}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` }
    })
      .then(res => res.json())
      .then(revenue =>
        setStats(prev => ({ ...prev, revenue }))
      );

    fetch(`/api/admin/reservations`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('jwt_token')}` }
    })
      .then(res => res.json())
      .then(reservations =>
        setStats(prev => ({
          ...prev,
          reservations: reservations.length,
          visitors: reservations.reduce((sum, r) => sum + (r.personCount || 0), 0)
        }))
      );
  }, []);

  return (
    <div className="admin-dashboard"> 
      <div className="admin-left">
        <h2>Управление рестораном</h2>
        <button onClick={() => navigate("/admin/menu")}>Меню</button>
        <button onClick={() => navigate("/admin/categories")}>Категории</button>
        <button onClick={() => navigate("/admin/Reservation")}>Бронирование</button>
        <button onClick={() => navigate("/admin/payment")}>Платежи</button>
        <button onClick={() => navigate("/admin/Room")}>Комнаты</button>
        <button onClick={() => navigate("/admin/Staff")}>Персонал</button>
      </div>

      <div className="admin-right">
        <h2>Статистика за сегодня</h2>
        <p>Бронирований за день: {stats.reservations}</p>
        <p>Выручка за день: {stats.revenue} руб.</p>
        <p>Посетителей без брони за день: {stats.visitors}</p>
      </div>
    </div>
  );
}
