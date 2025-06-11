import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.scss';
import { saveToken } from '../utilis/auth';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    phone: '',
    email: '',
    agree: false,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agree) {
      alert('Вы должны принять условия политики конфиденциальности');
      return;
    }
    console.log('Submitting form:', form);

    const payload = {
    username: form.username,
    password: form.password,
    fullName: form.fullName,
    phone: form.phone,
    email: form.email,
  };
    try {
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const token = await response.text();
        saveToken(token);
        navigate('/');
      } else {
        const errorText = await response.text();
        alert('Ошибка регистрации: ' + errorText);
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при подключении к серверу');
    }
  };

  return (
    <div className="register-wrapper">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2 className="title">Регистрация</h2>
        <input type="text" name="username" placeholder="Логин" value={form.username} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Пароль" value={form.password} onChange={handleChange} required />
        <input type="text" name="fullName" placeholder="Имя" value={form.fullName} onChange={handleChange} />
        <input type="tel" name="phone" placeholder="Телефон" value={form.phone} onChange={handleChange} />
        <input type="email" name="email" placeholder="Почта" value={form.email} onChange={handleChange} />
        <label className="checkbox-area">
          <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} />
          Принимаю условия <a href="/privacy">политики конфиденциальности</a>
        </label>
        <button type="submit">Регистрация</button>
      </form>
    </div>
  );
}
