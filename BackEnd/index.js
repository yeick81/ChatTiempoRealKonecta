const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const multer = require("multer");
const path = require("path");

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Ruta para subir archivo
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo." });
  }

  const fileUrl = `http://localhost:3001/uploads/${req.file.filename}`;
  return res.json({ url: fileUrl });
});

// Servir archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Asegúrate que sea el puerto correcto de tu frontend
    methods: ["GET", "POST"],
  },
});

const usuariosConectados = [];

// Emitir todos los usuarios conectados (global)
const emitirTodos = () => io.emit("all_users", usuariosConectados);

// Emitir usuarios de una sala específica
const emitirUsuariosSala = (room) => {
  const usuariosSala = usuariosConectados.filter((u) => u.room === room);
  io.to(room).emit("room_users", usuariosSala);
};

io.on("connection", (socket) => {
  console.log("✅ Usuario conectado:", socket.id);

  // JOIN ROOM
  socket.on("join_room", ({ username, room }) => {
    if (!username || !room) return;

    socket.join(room);

    // Eliminar entrada previa si existía
    const existente = usuariosConectados.findIndex((u) => u.id === socket.id);
    if (existente !== -1) usuariosConectados.splice(existente, 1);

    usuariosConectados.push({ id: socket.id, username, room });

    // Notificar a la sala
    socket.to(room).emit("user_connected", `${username} se unió a ${room}`);

    emitirTodos();
    emitirUsuariosSala(room);
  });
  
  // SALIDA MANUAL O DESCONEXIÓN
  const removerUsuario = () => {
    const idx = usuariosConectados.findIndex((u) => u.id === socket.id);
    if (idx !== -1) {
      const { username, room } = usuariosConectados.splice(idx, 1)[0];
      socket.to(room).emit("user_disconnected", `${username} salió de ${room}`);
      emitirTodos();
      emitirUsuariosSala(room);
    }
  };

  socket.on("leave_room", removerUsuario);
  socket.on("disconnect", removerUsuario);

  // MENSAJE PÚBLICO
  socket.on("send_message", ({ room, author, message }) => {
    socket.to(room).emit("receive_message", { author, message });
  });

  // MENSAJE PRIVADO
  socket.on("send_private_message", ({ to, from, message }) => {
    io.to(to).emit("receive_private_message", { from, message });
  });
});

server.listen(3001, () => {
  console.log("🚀 Servidor corriendo en http://localhost:3001");
});
