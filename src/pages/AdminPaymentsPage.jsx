import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AdminPaymentsPage.scss';


const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [usernameFilter, setUsernameFilter] = useState('');


  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/payments/admin',{
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });
      setPayments(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке платежей:', error);
    }
  };

  const applyFilters = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.method = methodFilter;
      if (usernameFilter) params.username = usernameFilter;

      const response = await axios.get('http://localhost:8080/api/admin/payments/search', { params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt_token')}`
        } });
      setPayments(response.data);
    } catch (error) {
      console.error('Ошибка при фильтрации:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  return (
    <div className="payments-page">
      <div className="header">
        <h2>Платежи</h2>
        <div className="filters-dropdown">
          <button onClick={() => setFiltersVisible(!filtersVisible)}>
            Фильтры ▾
          </button>
          {filtersVisible && (
            <div className="filters-panel">
              <input
                type="text"
                placeholder="Пользователь"
                value={usernameFilter}
                onChange={(e) => setUsernameFilter(e.target.value)}
              />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">Статус</option>
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
                <option value="">Метод</option>
                <option value="CARD">CARD</option>
                <option value="CASH">CASH</option>
                <option value="WAITER">WAITER</option>
              </select>
              <button onClick={applyFilters}>Применить</button>
            </div>
          )}
        </div>
      </div>

      <div className="payments-table-wrapper">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Статус</th>
              <th>Пользователь</th>
              <th>Метод</th>
              <th>№</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{formatDate(p.paidAt)}</td>
                <td>{p.status}</td>
                <td>{p.username}</td>
                <td>{p.method}</td>
                <td>{p.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
