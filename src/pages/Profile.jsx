import React, { useEffect, useState } from 'react';
import '../styles/Profile.scss';
import { getToken } from '../utilis/auth';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    secondName: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    fetch('/api/user/profile', {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setForm({
          fullName: data.fullName || '',
          secondName: data.secondName || '',
          phone: data.phone || '',
          email: data.email || '',
        });
      })
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setEditing(false);
      })
      .catch(console.error);
  };

  if (!profile) return <div className="profile-page">Загрузка...</div>;

  return (
    <div className="profile-page">
      <h2 className="title">Профиль</h2>
      <div className="profile-grid">
        <div className="column">
          <label>Имя</label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            disabled={!editing}
          />
          <label>Телефон</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            disabled={!editing}
          />
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={!editing}
          />
        </div>
        <div className="column">
          <label>Фамилия</label>
          <input
            type="text"
            name="secondName"
            value={form.secondName}
            onChange={handleChange}
            disabled={!editing}
          />
        </div>
      </div>
      <button className="edit-btn" onClick={() => (editing ? handleSave() : setEditing(true))}>
        {editing ? 'Сохранить' : 'Редактировать'}
      </button>
    </div>
  );
}
