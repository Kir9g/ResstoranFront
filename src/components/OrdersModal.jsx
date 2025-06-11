import React from "react";
import "../styles/Modal.scss";

const OrdersModal = ({ orders, onClose, onSelect }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Выберите заказ</h3>
        <ul className="order-list">
          {orders.map((order, index) => (
            <li key={order.id} onClick={() => onSelect(order)}>
              Заказ #{index + 1}
            </li>
          ))}
        </ul>
        <div className="modal-buttons">
          <button onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
};

export default OrdersModal;
