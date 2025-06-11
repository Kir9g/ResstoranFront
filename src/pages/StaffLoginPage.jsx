import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { saveToken, getUserRole } from "../utilis/auth.js"; // путь поправь по структуре проекта
import "../styles/StaffLoginPage.scss"; 

export default function StaffLoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Login failed with status " + res.status);
        }
       return res.text(); // <--- нужно вернуть результат!
      })
        .then(token => {
          saveToken(token); // сохраняем токен

          const role = getUserRole(); // получаем роль пользователя из токена

          if (role === "WAITER") navigate("/staff/waiter");
          else if (role === "COOK") navigate("/staff/cook");
          else if (role === "ADMIN") navigate("/admin");
          else alert("Нет доступа");
          })
        .catch(err => {
          console.error(err);
          alert("Ошибка входа: " + err.message);
        });
  };

  return (
    <div className="login-wrapper">
      <div className="login-form">
        <div className="title">Вход для персонала</div>
        <input
          type="text"
          placeholder="Логин"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Войти</button>
      </div>
    </div>
  );
}
