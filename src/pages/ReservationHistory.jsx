import { useEffect, useState } from 'react';
import '../styles/ReservationHistory.scss';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';



export default function ReservationHistory() {
  const [activeTab, setActiveTab] = useState('current');
  const [reservations, setReservations] = useState([]);
  const location = useLocation();
  const cartFromState = location.state?.cart || [];
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const navigate = useNavigate();


  const openOrdersModal = (orderIds) => {
    setSelectedOrderIds(orderIds);
    setShowModal(true);
  };


  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch(
          `/api/user/reservations/${activeTab === 'current' ? 'active' : 'past'}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`, 
            }
          }
        );
        if (!response.ok) throw new Error('Ошибка при получении бронирований');
        const data = await response.json();
        setReservations(data);
      } catch (err) {
        console.error('Ошибка загрузки бронирований', err);
      }
    };

    fetchReservations();
  }, [activeTab]);

  const handleCancel = async (id) => {
    try {
      const response = await fetch(`/api/user/reservations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        }
      });

      if (!response.ok) throw new Error('Ошибка при отмене бронирования');
      setReservations(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('Ошибка при отмене бронирования');
    }
  };
  const handleAttachOrder = async (reservationId) => {
  try {
    const orderPayload = {
      reservationId: reservationId,
      items: cartFromState.map(item => ({
        dishName: item.name,
        quantity: item.quantity,
        price: item.price,
        comment: "", // опционально, если хочешь комментарии к блюдам
        menuItemId: item.id
      }))
    };

    const response = await fetch('/api/user/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
      },
      body: JSON.stringify(orderPayload)
    });

    if (!response.ok) throw new Error('Ошибка при создании заказа');
    
    alert('Заказ добавлен к бронированию!');
    localStorage.removeItem('cart'); // Очистка корзины
  } catch (err) {
    console.error('Ошибка создания заказа', err);
    alert('Ошибка при добавлении заказа к брони');
  }
  
};
  const handleViewOrders = (orders) => {
    const orderText = orders.map(order => `Заказ #${order.id} (${order.items?.length || 0} блюд)`).join('\n');
    alert(orderText || 'Нет заказов');
  };



  return (
    <div className="reservation-history">
      <h2 className="title">История</h2>
      <div className="tabs">
        <button
          className={activeTab === 'current' ? 'active' : ''}
          onClick={() => setActiveTab('current')}
        >
          Текущие
        </button>
        <button
          className={activeTab === 'past' ? 'active' : ''}
          onClick={() => setActiveTab('past')}
        >
          Прошедшие
        </button>
      </div>
      <div className="reservation-list">
        {reservations.map(res => (
          <div className="reservation-item" key={res.id}>
            <div className="info">
              <p><strong>Стол:</strong> {res.labelName}</p>
              <p><strong>Комната:</strong> {res.roomName}</p>
              <p><strong>Дата и время:</strong> {new Date(res.startTime).toLocaleString()} - {new Date(res.endTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</p>
              <p><strong>Статус:</strong> {res.status}</p>
              {cartFromState.length > 0 && activeTab === 'current' && (
              <button className="attach-order-btn" onClick={() => handleAttachOrder(res.id)}>
                Добавить заказ
              </button>
            )}
            {res.orderIds?.length > 0 && (
              <button
                className="view-orders-btn"
                onClick={() => openOrdersModal(res.orderIds)}
              >
                Посмотреть заказы
              </button>
            )}
            </div>
            {res.canBeCancelled && (
              <button className="cancel-btn" onClick={() => handleCancel(res.id)}>Отменить</button>
            )}
          </div>
        ))}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>Заказы:</h3>
              {selectedOrderIds.map(id => (
                <button key={id} onClick={() => navigate(`/orders/${id}`)}>
                  Заказ #{id}
                </button>
              ))}
              <button onClick={() => setShowModal(false)}>Закрыть</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
