import React, { useEffect, useState } from 'react';
import '../styles/ManualSeatingModal.scss';
import { getToken } from '../utilis/auth';

export default function ManualSeatingModal({ isOpen, onClose }) {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [menu, setMenu] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);

  // Загружаем свободные столы
  const fetchFreeTables = () => {
    const now = new Date();
    const isoDatetime = now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"

    fetch(`/api/guest/tables?datetime=${encodeURIComponent(isoDatetime)}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        const freeTables = data.filter(table => table.available);
        setTables(freeTables);
      })
      .catch(console.error);
  };


  // Загружаем меню
  const fetchMenu = () => {
    fetch('/api/guest/menu', {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        const grouped = data.reduce((acc, item) => {
          const cat = item.category || 'Без категории';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(item);
          return acc;
        }, {});
        setMenu(grouped);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (isOpen) {
      fetchFreeTables();
    } else {
      setTables([]);
      setSelectedTable(null);
      setMenu({});
      setSelectedItems([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTable) {
      fetchMenu();
    }
  }, [selectedTable]);

  const addItem = (item) => {
    setSelectedItems(prev => {
      const existing = prev.find(it => String(it.menuItemId) === String(item.id));
      if (existing) {
        return prev.map(it =>
          String(it.menuItemId) === String(item.id)
            ? { ...it, quantity: it.quantity + 1 }
            : it
        );
      }
      return [...prev, {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        comment: ''
      }];
    });
  };




  const removeItem = (id) => {
    setSelectedItems(prev =>
      prev
        .map(it => it.menuItemId === id ? { ...it, quantity: it.quantity - 1 } : it)
        .filter(it => it.quantity > 0)
    );
  };

  const updateComment = (menuItemId, comment) => {
    setSelectedItems(prev =>
      prev.map(it =>
        it.menuItemId === menuItemId
          ? { ...it, comment }
          : it
      )
    );
  };

  const submitOrder = async () => {
    try {
      const res = await fetch(`/api/Waiter/orders/manual-order`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tableId: selectedTable.id,
          items: selectedItems.map(({ menuItemId, quantity, comment }) => ({
            menuItemId,
            quantity,
            comment,  // добавляем комментарий
          }))
        })
      });
      if (res.ok) {
        alert('Заказ создан!');
        onClose();
      } else {
        const msg = await res.text();
        alert('Ошибка: ' + msg);
      }
    } catch (err) {
      alert('Ошибка подключения');
    }
  };

  if (!isOpen) return null;
  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={e => e.stopPropagation()}>
        <h2>Посадить клиента без брони</h2>

        {!selectedTable ? (
          <>
            {tables.length === 0 ? (
              <p>Свободных столов нет</p>
            ) : (
              <div className="table-grid">
                {tables.map(table => (
                  <div
                    className="table-card"
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={`http://localhost:8080${table.stringUrl}`} alt={`Столик ${table.label}`} />
                    <div className="caption">
                      <strong>{table.label}</strong><br />
                      {table.seats} человек
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h3>Столик: {selectedTable.label}</h3>
            <div className="menu-section">
              {Object.entries(menu).map(([category, items]) => (
                <div key={category} className="category-block">
                  <h4>{category}</h4>
                  <div className="menu-items">
                    {items.map(item => (
                      <button key={item.id} onClick={() => addItem(item)}>
                        {item.name} — {item.price}₽
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <h4>Выбранные блюда:</h4>
               <ul>
                  {selectedItems.map(item => (
                    <li key={item.menuItemId} style={{ marginBottom: '1em' }}>
                      {item.name} × {item.quantity}
                      <div className="quantity-controls">
                        <button onClick={() => removeItem(item.menuItemId)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => addItem({ id: item.menuItemId, name: item.name })}>+</button>
                      </div>
                      <br />
                      <textarea
                        placeholder="Комментарий к блюду..."
                        value={item.comment}
                        onChange={(e) => updateComment(item.menuItemId, e.target.value)}
                        style={{ width: '100%', marginTop: '0.3em', resize: 'vertical' }}
                      />
                    </li>
                  ))}
                </ul>

            <div className="footer">
              <div className="total">Итого: {total}</div>
              <button className="confirm-btn">Подтвердить</button>
            </div>

          </>
        )}
      </div>
    </div>
  );
}
