import { useEffect, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useNavigate } from 'react-router-dom';
import '../utilis/auth.js'
import '../styles/WaiterOrdersPage.scss';
import { getUserRole } from '../utilis/auth.js';
import ManualSeatingModal from '../components/ManualSeatingModal.jsx';

export default function WaiterOrdersPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwt_token');
  const [orders, setOrders] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const roles = getUserRole();

    if (!roles.includes("WAITER")) {
      navigate("/staff/login");
    }
  }, []);

  /* ---------- REST initial load ---------- */
  const loadOrders = useCallback(() => {
    fetch('/api/Waiter/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setOrders)
      .catch(console.error);
  }, [token]);

  useEffect(loadOrders, [loadOrders]);

  /* ---------- WebSocket live updates ---------- */
  useEffect(() => {
    const stompClient = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        stompClient.subscribe('/topic/waiters', ({ body }) => {
          const updatedOrder = JSON.parse(body);
          setOrders(prev => {
            const idx = prev.findIndex(o => o.id === updatedOrder.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = updatedOrder;
              return copy;
            }
            return [updatedOrder, ...prev];
          });
        });
        stompClient.subscribe('/topic/waiter-alerts', ({ body }) => {
        const message = body;
        alert(message); 
      });
      },
    
    });
    stompClient.activate();
    return () => stompClient.deactivate();
  }, [token]);

  /* ---------- actions ---------- */
  const updateStatus = (id, status) =>
    fetch(`/api/Waiter/orders/${id}/status?status=${status}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    }).then(loadOrders);

  const acceptOrder = id => updateStatus(id, 'DELIVERING'); // или DELIVERING

  const completeOrder = (id, method) =>
    fetch(`/api/Waiter/orders/${id}/confirm-payment?method=${method}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).then(response => {
      if (!response.ok) throw new Error("Ошибка оплаты");
      // Удаляем заказ из состояния
      setOrders(prev => prev.filter(order => order.id !== id));
    })
    .catch(console.error);

  /* ---------- UI ---------- */
  return (
    <div className="waiter-page">

      {/* Кнопка открытия модалки */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2%' }}>
        <button className="btn btn-manual-seat" onClick={() => setIsModalOpen(true)}>
          Посадить клиента без брони
        </button>
      </div>
      

      <ManualSeatingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <h1 className="waiter-title">Активные заказы</h1>

      <div className="orders-grid">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <header>
              <div>Номер: {order.id}</div>
              <div>{new Date(order.createdAt).toLocaleString()}</div>
              <div className="status">Статус: {order.status}</div>
            </header>

            <ul className="order-items">
              {order.items.map(it => (
                <li key={it.menuItemId}>
                  {it.name}
                  {it.quantity > 1 && <span>&nbsp;×&nbsp;{it.quantity}</span>}
                </li>
              ))}
            </ul>

            <div className="order-actions">
              {/* ПРИНЯТЬ виден только когда заказ готов на кухне */}
              {order.status === 'READY' && (
                <button
                  className="btn btn-accept"
                  onClick={() => acceptOrder(order.id)}
                >
                  Принять
                </button>
              )}

              {/* ЗАВЕРШИТЬ доступен, когда заказ доставлен и клиент попросил счёт
                 (или твоё собственное условие, напр. status === 'PAYMENT_REQUESTED') */}
              {order.status === 'DELIVERING' && (
                <>
                  <button
                    className="btn btn-complete"
                    onClick={() => completeOrder(order.id, 'CASH')}
                  >
                    Завершить / Наличные
                  </button>
                  <button
                    className="btn btn-complete"
                    onClick={() => completeOrder(order.id, 'CARD')}
                  >
                    Завершить / Карта
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
