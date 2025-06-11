import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.scss';
import { saveToken } from '../utilis/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const token = await response.text();
        saveToken(token);
        navigate('/');
      } else {
        alert('Ошибка авторизации');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка сервера');
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-form" onSubmit={handleLogin}>
        <h2 className="title">Авторизация</h2>
        <input
          type="text"
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <a className="help-link" onClick={() => navigate('/password-reset')}>
          Забыли пароль?
        </a>
        <button type="submit">Авторизация</button>
        <button type="button" onClick={() => navigate('/staff/login')}>
          Вход для сотрудников
        </button>
        <p>У вас нет учетной записи?</p>
        <button type="button" onClick={() => navigate('/register')}>
          Регистрация
        </button>
      </form>
    </div>
  );
}
