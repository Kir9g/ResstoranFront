import React, { useState, useEffect } from 'react';
import '../styles/UserModal.scss';

const ROLES = ['ADMIN', 'WAITER', 'COOK'];

const UserModal = ({ user, onClose, onSave }) => {
  const isNew = !user.id;

  const [formData, setFormData] = useState({
  fullName: '',
  secondName: '',
  phone: '',
  email: '',
  username: '',     
  role: 'WAITER',
  password: '',
});

    useEffect(() => {
        if (user) {
            setFormData({
            fullName: user.fullName || '',
            secondName: user.secondName || '',
            phone: user.phone || '',
            email: user.email || '',
            username: user.username || '',  // добавлено
            role: user.role || 'WAITER',
            password: '',
            });
        }
    }, [user]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isNew) {
        await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch(`/api/admin/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      onSave();
    } catch (err) {
      console.error('Ошибка сохранения сотрудника:', err);
    }
  };

  return (
    <div className="user-modal-backdrop" onClick={onClose}>
      <div className="user-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{isNew ? 'Добавить сотрудника' : 'Редактировать сотрудника'}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Имя"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="secondName"
            placeholder="Фамилия"
            value={formData.secondName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Логин"
            value={formData.username}
            onChange={handleChange}
            required
            />

          <input
            type="password"
            name="password"
            placeholder={isNew ? "Пароль" : "Новый пароль (оставьте пустым, если не менять)"}
            value={formData.password}
            onChange={handleChange}
            required={isNew}  // Пароль обязателен только при создании
            />

          <input
            type="text"
            name="phone"
            placeholder="Телефон"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <select name="role" value={formData.role} onChange={handleChange}>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <div className="modal-buttons">
            <button type="submit" className="save-btn">
              Сохранить
            </button>
            <button type="button" onClick={onClose} className="cancel-btn">
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
