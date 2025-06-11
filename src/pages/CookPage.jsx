// src/pages/CookOrdersPage.jsx
import { useEffect, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useNavigate } from 'react-router-dom';
import {getUserRole} from'../utilis/auth.js'
import '../styles/WaiterOrdersPage.scss'; // Можно переименовать в CookOrdersPage.scss при необходимости

export default function CookOrdersPage() {
  const token = localStorage.getItem('jwt_token');
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  // Проверка роли повара
  useEffect(() => {
    const roles = getUserRole();
    console.log(roles)

    if (!roles.includes("COOK")) {
      navigate("/staff/login");
    }
  }, [navigate, token]);

  // Загрузка активных заказов
  const loadOrders = useCallback(() => {
    fetch('/api/cook/orders/active', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setOrders)
      .catch(console.error);
  }, [token]);

  useEffect(loadOrders, [loadOrders]);

  // Подписка на WebSocket обновления
  useEffect(() => {
    const stompClient = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        stompClient.subscribe('/topic/cooks', ({ body }) => {
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
      }
    });
    stompClient.activate();
    return () => stompClient.deactivate();
  }, [token]);

  // Действия повара
  const acceptOrder = id =>
    fetch(`/api/cook/orders/${id}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).then(loadOrders);

  const completeOrder = id =>
    fetch(`/api/cook/orders/${id}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).then(loadOrders);

  return (
    <div className="waiter-page">
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
              {order.status === 'CREATED' && (
                <button
                  className="btn btn-accept"
                  onClick={() => acceptOrder(order.id)}
                >
                  Принять
                </button>
              )}

              {order.status === 'IN_PROGRESS' && (
                <button
                  className="btn btn-complete"
                  onClick={() => completeOrder(order.id)}
                >
                  Завершить
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
