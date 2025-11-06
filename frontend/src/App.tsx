import { useEffect, useState } from "react";
import { RouterProvider, Navigate } from "react-router-dom";
import { router } from "../router/index"; // твой router

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/auth/check', {
      method: 'GET',
      credentials: 'include', // <--- отправляем cookie на сервер
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        setUser(data.user);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Загрузка...</div>;

  return <RouterProvider router={router(user)} />;
}

export default App;
