import { useEffect, useState } from 'react';
import { getToken } from '../utilis/auth';
import '../styles/AdminCategories.scss';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', image: null });

  // Состояние для редактирования
  const [editingCategory, setEditingCategory] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedImage, setEditedImage] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    fetch('/api/categories', {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => setCategories(data));
  };

  const handleAdd = () => {
    if (!newCategory.name.trim() || !newCategory.image) return;

    const formData = new FormData();
    formData.append('name', newCategory.name);
    formData.append('image', newCategory.image);

    fetch('/api/admin/categories', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    })
      .then(() => {
        setNewCategory({ name: '', image: null });
        fetchCategories();
      });
  };

  const handleDelete = id => {
    if (window.confirm('Удалить категорию?')) {
      fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      }).then(() => fetchCategories());
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setEditedName(category.name);
    setEditedImage(null); // оставим пустым, если пользователь не загрузит новое изображение
  };

  const handleEditSave = () => {
    const formData = new FormData();
    formData.append('name', editedName);
    if (editedImage) {
      formData.append('image', editedImage);
    }

    fetch(`/api/admin/categories/${editingCategory.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: formData,
    }).then(() => {
      fetchCategories();
      setEditingCategory(null);
    });
  };

  return (
    <div className="admin-categories">
      <h2>Категории</h2>

      <div className="add-category">
        <input
          type="text"
          placeholder="Название категории"
          value={newCategory.name}
          onChange={e => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
        />
        <input
          type="file"
          accept="image/*"
          onChange={e => setNewCategory(prev => ({ ...prev, image: e.target.files[0] }))}
        />
        <button onClick={handleAdd}>Добавить</button>
      </div>

      <ul className="category-list">
        {categories.map(cat => (
          <li key={cat.id}>
            <img src={cat.imageUrl} alt={cat.name} />
            <span>{cat.name}</span>
            <div>
              <button onClick={() => openEditModal(cat)}>✏️</button>
              <button onClick={() => handleDelete(cat.id)}>❌</button>
            </div>
          </li>
        ))}
      </ul>

      {editingCategory && (
        <div className="modal">
          <div className="modal-content">
            <h3>Редактировать категорию</h3>
            <input
              type="text"
              value={editedName}
              onChange={e => setEditedName(e.target.value)}
              placeholder="Новое название"
            />
            <input
              type="file"
              accept="image/*"
              onChange={e => setEditedImage(e.target.files[0])}
            />
            <div className="modal-buttons">
              <button onClick={handleEditSave}>Сохранить</button>
              <button onClick={() => setEditingCategory(null)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
