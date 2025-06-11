import { useEffect, useState } from 'react';
import '../styles/AdminReservations.scss';
import { getToken } from '../utilis/auth.js';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/admin/reservations', {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(setReservations);
  }, []);

  const filteredReservations = reservations.filter(r => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  const formatDateTime = iso => {
    const date = new Date(iso);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month} ${hours}:${minutes}`;
};


  const getStatusIcon = status => {
    switch (status) {
      case 'CONFIRMED': return '✅';
      case 'CANCELLED': return '❌';
      case 'PENDING': return '✉️';
      case 'ACTIVE': return '🟢';
      case 'COMPLETED': return '🏁';
      default: return '❓';
    }
  };

  return (
    <div className="admin-reservations">
      <h2>
        Бронирования{' '}
        <span className="filter-dropdown">
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="ALL">Фильтры ▾</option>
            <option value="CONFIRMED">Подтверждённые</option>
            <option value="CANCELLED">Отменённые</option>
            <option value="PENDING">Ожидают</option>
            <option value="ACTIVE">Активные</option>
            <option value="COMPLETED">Завершённые</option>
          </select>
        </span>
      </h2>

      <table className="reservation-table">
        <thead>
          <tr>
            <th>Начало</th>
            <th>Конец</th>
            <th>Клиент</th>
            <th>Стол</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {filteredReservations.map(r => (
            <tr key={r.id}>
              <td>{formatDateTime(r.startTime)}</td>
              <td>{formatDateTime(r.endTime)}</td>
              <td>{r.userName}</td>
              <td>{r.tableName}</td>
              <td className="status-icon">{getStatusIcon(r.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
