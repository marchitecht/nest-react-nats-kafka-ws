import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function LoginPage() {
  const navigate = useNavigate();

  // Проверка на наличие куки JWT
useEffect(() => {
  fetch(`http://localhost:3000/auth/check`, {
    method: 'GET',
    credentials: 'include',
  })
    .then(res => {
      if (!res.ok) throw new Error('Unauthorized');
      return res.json();
    })
    .then(data => {
      if (data.user) {
        navigate('/messages');
      }
    })
    .catch(() => {});
}, [navigate]);

  const handleLogin = () => {
    // Редирект на бэкенд Google OAuth
    window.location.href = `http://localhost:3000/auth/google`;
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Вход через Google</h1>
      <button onClick={handleLogin}>Войти</button>
    </div>
  );
}
