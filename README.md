# 💬 Chat en Tiempo Real con React y Socket.IO

Este proyecto es una aplicación de chat en tiempo real desarrollada con **React** en el frontend y **Node.js + Express + Socket.IO** en el backend. Su propósito es ofrecer una plataforma de comunicación moderna, rápida y funcional que permite:

- Envío de mensajes públicos y privados
- Creación y cambio de salas de chat
- Visualización de usuarios conectados en tiempo real
- Envío de emojis en los mensajes
- Subida y visualización de imágenes
- Envío de archivos (PDF, DOC, etc.) con previsualización
- Notificaciones de conexión y desconexión de usuarios

Este proyecto está diseñado con un enfoque educativo y práctico, ideal para aprender cómo funcionan las conexiones WebSocket, la gestión de salas, la sincronización de usuarios y el envío de multimedia en tiempo real.

## 🚀 Tecnologías utilizadas

### Frontend
- React
- Socket.IO Client
- Emoji Picker
- HTML + CSS (estilizado con Flexbox)

### Backend
- Node.js
- Express
- Socket.IO
- Cloudinary (para subir y alojar imágenes)
- Middleware para manejo de archivos base64

## 📁 Estructura del proyecto

- `frontend/` – Contiene la aplicación React (`Chat.jsx`).
- `backend/` – Contiene la lógica del servidor (`index.js`) con los eventos de conexión, mensajes, salas, imágenes y archivos.

## 📌 Objetivos

Este proyecto tiene como finalidad demostrar cómo construir un sistema de chat robusto con funcionalidades modernas usando tecnologías del ecosistema JavaScript. Es una base ideal para ampliar con:
- Autenticación de usuarios
- Persistencia de mensajes en base de datos


## 📷 Ejemplo de funcionalidades

- ✅ Enviar mensajes de texto y emojis
- ✅ Enviar mensajes privados entre usuarios
- ✅ Cambiar entre múltiples salas
- ✅ Ver qué usuarios están conectados en cada sala
- ✅ Subir y mostrar imágenes (usando Cloudinary)
- ✅ Subir y compartir archivos con otros usuarios


# 💬 Chat App en Tiempo Real

Este es un proyecto de chat en tiempo real construido con **React** (frontend), **Node.js** y **Socket.IO** (backend). Incluye funcionalidades como:
- Mensajes públicos y privados
- Salas dinámicas
- Envío de imágenes y archivos
- Soporte para emojis 😀
- Notificaciones de conexión y desconexión

---

## 🛠️ Guía para ejecutar el proyecto localmente

### 📁 Estructura del proyecto

```
/chat-app
│
├── /frontend     # React App
└── /backend      # Servidor con Node.js y Socket.IO
```

---

### 1️⃣ Requisitos previos

Asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (v14 o superior)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- Una cuenta de [Cloudinary](https://cloudinary.com/)

---

### 2️⃣ Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/chat-app.git
cd chat-app
```

---

### 3️⃣ Configurar el Backend

#### 📦 Instalar dependencias

```bash
cd backend
npm install
```

#### ⚙️ Crear archivo `.env`

Crea un archivo `.env` dentro de `backend`:

```dotenv
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
PORT=3001
```

#### ▶️ Ejecutar el servidor

```bash
npm run dev
```

El servidor estará en: [http://localhost:3001](http://localhost:3001)

---

### 4️⃣ Configurar el Frontend

#### 📦 Instalar dependencias

```bash
cd ../frontend
npm install
```

#### ⚙️ Revisar conexión al backend

En `Chat.jsx`, asegúrate de tener:

```js
const socket = io("http://localhost:3001");
```

#### ▶️ Ejecutar React

```bash
npm run dev
```

App disponible en: [http://localhost:5173](http://localhost:5173)

---

### ✅ ¡Todo listo!

Ya puedes:
- Unirte a salas
- Enviar mensajes públicos o privados
- Compartir imágenes, archivos y emojis
- Ver notificaciones de conexión/desconexión

---

🎉 ¡Gracias por probar este proyecto!
