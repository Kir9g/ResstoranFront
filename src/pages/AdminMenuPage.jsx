import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utilis/auth.js'; // используем ваши функции
import '../styles/AdminMenu.scss';

export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, []);

  const fetchMenu = () => {
    fetch('/api/admin/menu', {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then(res => res.json())
      .then(setMenuItems);
  };

  const fetchCategories = () => {
    fetch('/api/categories', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        })
        .then(res => res.json())
        .then(data => {
            // data: [{ id: 1, name: 'Пицца', imageUrl: '/images/...' }, ...]
            setCategories(data.map(cat => cat.name)); // или сохраняй весь объект
        });

  };

  const handleToggleVisibility = (id, current) => {
    fetch(`/api/admin/menu/${id}/availability?available=${!current}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }).then(() => fetchMenu());
  };

  const handleDelete = id => {
    if (window.confirm('Удалить блюдо?')) {
      fetch(`/api/admin/menu/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }).then(() => fetchMenu());
    }
  };

  const filteredItems = selectedCategory
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  return (
    <div className="admin-menu">
      <div className="admin-menu-header">
        <select
          onChange={e => setSelectedCategory(e.target.value)}
          value={selectedCategory}
        >
          <option value="">Категории</option>
          {categories.map(cat => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
        <button onClick={() => navigate('/admin/menu/add')}>Добавить блюдо</button>
      </div>

      <table className="admin-menu-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Видимость</th>
            <th>Изменить</th>
            <th>Удалить</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>
                <button
                  className={item.available ? 'visible-btn' : 'hidden-btn'}
                  onClick={() => handleToggleVisibility(item.id, item.available)}
                >
                  {item.available ? '✔️' : '❌'}
                </button>
              </td>
              <td>
                <button onClick={() => navigate(`/admin/menu/edit/${item.id}`)}>
                  ✏️
                </button>
              </td>
              <td>
                <button className="delete-btn" onClick={() => handleDelete(item.id)}>
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
