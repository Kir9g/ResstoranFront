import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utilis/auth.js';
import '../styles/AddMenuItem.scss'

const AddMenuItemPage = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true,
  });
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/categories', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = e => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('category', form.category);
    formData.append('available', form.available);
    if (image) {
      formData.append('image', image);
    }

    fetch('/api/admin/menu', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    }).then(() => navigate('/admin/menu'));
  };

  return (
    <div className="add-menu-item-page">
      <h2>Добавить блюдо</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>
          Название:
          <input type="text" name="name" value={form.name} onChange={handleChange} required />
        </label>

        <label>
          Описание:
          <textarea name="description" value={form.description} onChange={handleChange} />
        </label>

        <label>
          Цена:
          <input type="number" name="price" value={form.price} onChange={handleChange} required />
        </label>

        <label>
          Категория:
          <select name="category" value={form.category} onChange={handleChange} required>
            <option value="">Выберите категорию</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </label>

        <label>
          Доступно:
          <input type="checkbox" name="available" checked={form.available} onChange={handleChange} />
        </label>

        <label>
          Фото:
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>

        <div style={{ display: 'flex', justifyContent: 'space-between', gridColumn: 'span 2' }}>
            <button type="button" className="cancel-btn" onClick={() => navigate('/admin/menu')}>
                Отмена
            </button>
            <button type="submit">
                Сохранить
            </button>
            </div>
      </form>
    </div>
  );
};

export default AddMenuItemPage;
