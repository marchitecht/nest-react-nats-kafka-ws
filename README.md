🇷🇺 Описание проекта 

Live Messaging App — это веб-приложение для передачи сообщений в реальном времени с авторизацией через Google OAuth 2.0 на клиент.

---

## 📌 Старт проекта

### Запуск сервисов
```bash
# Запуск publisher
cd publisher
node publisher.js --stream 2000 --subject updates.live

# Запуск backend frontend
cd root
npm i
npm run start:all

or
npm run start:frontend
npm run start:backend
```

or

```bash
# Запуск publisher
cd publisher
node publisher.js --stream 2000 --subject updates.live

# Запуск backend
cd backend
npm start

# Запуск frontend
cd frontend
npm run dev
```

Основные возможности:

- Google OAuth 2.0 — вход через Google с сохранением токена в HTTP-only cookies.

- JWT аутентификация — защищённые эндпоинты и WebSocket соединения.

- WebSocket + Socket.IO — передача live-сообщений в реальном времени.

- История сообщений — хранение live-сообщений и их перевод в историю.

- NATS WebSocket — публикация сообщений с внешнего сервиса через NATS.

- Клиент на React + TypeScript — интерфейс для отображения live и исторических сообщений.

- Кросс-доменные запросы (CORS) — поддержка безопасного обмена данными между фронтом и бэком на разных портах.

Стек технологий:

- Backend: Nest.js, Passport.js, JWT, Socket.IO, NATS.ws

- Frontend: React, TypeScript, React Router, Emotion CSS

- Auth: Google OAuth, HTTP-only cookies

🇬🇧 Project Description

Live Messaging App is a real-time messaging web application with Google OAuth 2.0 authentication.

Features:

- Google OAuth 2.0 — login with Google, storing JWT in HTTP-only cookies.

- JWT Authentication — protected REST endpoints and WebSocket connections.

- WebSocket + Socket.IO — real-time live message streaming.

- Message History — live messages are saved and can be moved to history.

- NATS WebSocket — receive messages from external services via NATS.

- React + TypeScript client — displays live and historical messages.

- CORS support — secure communication between frontend and backend on different ports.

Tech Stack:

- Backend: Nest.js, Passport.js, JWT, Socket.IO, NATS.ws

- Frontend: React, TypeScript, React Router, Emotion CSS

- Auth: Google OAuth, HTTP-only cookies
