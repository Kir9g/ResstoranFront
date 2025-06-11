import React, { useEffect, useState } from 'react';
import UserModal from '../components/UserModal.jsx';
import { getToken } from '../utilis/auth.js';
import '../styles/AdminStaffPage.scss';

const AdminStaffPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await authFetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
      filterUsers(data, selectedRole);
    } catch (error) {
      console.error('Ошибка загрузки пользователей', error);
    }
  };

  const filterUsers = (userList, role) => {
    if (role === 'ALL') {
      setFilteredUsers(userList);
    } else {
      setFilteredUsers(userList.filter((user) => user.role === role));
    }
  };

  const handleFilterChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    filterUsers(users, role);
  };

  const handleAddUser = () => {
    setSelectedUser({}); // Пустой объект означает добавление
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user); // Передаём существующего пользователя
    setShowModal(true);
  };

    const handleDeleteUser = async (userId) => {
    if (window.confirm("Удалить этого сотрудника?")) {
        try {
        const res = await authFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
        if (res.ok) {
            fetchUsers();
        } else {
            console.error('Ошибка при удалении');
        }
        } catch (error) {
        console.error('Ошибка при удалении пользователя:', error);
        }
    }
    };

    const authFetch = (url, options = {}) => {
        const token = getToken();
        const headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`,
            'Content-Type': options.headers?.['Content-Type'] || 'application/json',
        };

        return fetch(url, { ...options, headers });
    };

  return (
    <div className="admin-staff-page">
      <h2>Управление персоналом</h2>

      <div className="top-bar">
        <select value={selectedRole} onChange={handleFilterChange}>
          <option value="ALL">Все</option>
          <option value="WAITER">Официанты</option>
          <option value="COOK">Повара</option>
          <option value="ADMIN">Администраторы</option>
        </select>
        <button onClick={handleAddUser}>Добавить сотрудника</button>
      </div>

      <table className="staff-table">
        <thead>
          <tr>
            <th>Имя</th>
            <th>Фамилия</th>
            <th>Телефон</th>
            <th>Email</th>
            <th>Роль</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.fullName}</td>
              <td>{user.secondName}</td>
              <td>{user.phone}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => handleEditUser(user)}>✏️</button>
                <button onClick={() => handleDeleteUser(user.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <UserModal
          user={selectedUser}
          onClose={() => setShowModal(false)}
          onSave={() => {
            fetchUsers();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default AdminStaffPage;
