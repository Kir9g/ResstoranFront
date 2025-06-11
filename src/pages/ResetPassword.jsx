import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.scss';

export default function PasswordReset() {
  const [step, setStep] = useState(1); // 1 - ввод email, 2 - ввод кода + новый пароль
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Отправка email с кодом
  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setStep(2);
      } else {
        alert('Ошибка при отправке кода. Проверьте email.');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка сервера при отправке кода.');
    } finally {
      setLoading(false);
    }
  };

  // Подтверждение кода и установка нового пароля
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      if (response.ok) {
        alert('Пароль успешно изменён. Войдите в систему.');
        navigate('/login');
      } else {
        alert('Неверный код или срок действия кода истёк.');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка сервера при сбросе пароля.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-form" onSubmit={step === 1 ? handleSendCode : handleResetPassword}>
        <h2 className="title">Восстановление пароля</h2>

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Введите email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Отправка...' : 'Отправить код'}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Введите 4-значный код"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={4}
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Новый пароль"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Сброс...' : 'Сбросить пароль'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
