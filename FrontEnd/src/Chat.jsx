import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import EmojiPicker from "emoji-picker-react";

const socket = io("http://localhost:3001");

export default function Chat() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [todosLosUsuarios, setTodosLosUsuarios] = useState([]);
  const [receptor, setReceptor] = useState(null);
  const [joined, setJoined] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [file, setFile] = useState(null);

  const emojiRef = useRef(null);
  const prevRoom = useRef("");

  const joinRoom = () => {
    if (!username || !room) return;
    socket.emit("join_room", { username, room });
    prevRoom.current = room;
    setJoined(true);
  };

  const changeRoom = () => {
    if (!newRoom || newRoom === room) return;
    socket.emit("leave_room", { username, room });
    socket.emit("join_room", { username, room: newRoom });
    setRoom(newRoom);
    setNewRoom("");
    setMessages([]);
    setReceptor(null);
  };

  const cambiarSala = (nuevaSala) => {
    if (nuevaSala === room) return;
    socket.emit("leave_room");
    socket.emit("join_room", { username, room: nuevaSala });
    setRoom(nuevaSala);
    setMessages([]);
    setNotifications([]);
    setReceptor(null);
  };

  const sendMessage = () => {
    if (!message) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (receptor) {
      socket.emit("send_private_message", {
        to: receptor.id,
        from: username,
        message,
        time,
      });
      setMessages((prev) => [
        ...prev,
        { author: "yo → " + receptor.username, message, time, private: true },
      ]);
    } else {
      socket.emit("send_message", { room, author: username, message, time });
      setMessages((prev) => [
        ...prev,
        { author: "yo", message, time },
      ]);
    }

    setMessage("");
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const sendFile = () => {
    if (!file) return;
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result;
      socket.emit("send_file", {
        room,
        author: username,
        filename: file.name,
        file: base64,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      setMessages((prev) => [
        ...prev,
        {
          author: "yo",
          message: `Archivo enviado: ${file.name}`,
          file: base64,
          filename: file.name,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      // Después de subir la imagen exitosamente
      socket.emit("send_image", {
        room,
        author: username,
        imageUrl: uploadedImageUrl,
        timestamp: new Date().toISOString(), // para mostrar hora/fecha
      });

      // Mostrarla inmediatamente en tu propio chat
      setMessages(prev => [...prev, {
        author: "yo",
        imageUrl: uploadedImageUrl,
        timestamp: new Date().toISOString(),
      }]);

      setFile(null);
    };

    reader.readAsDataURL(file);
  };

  useEffect(() => {
    socket.on("receive_private_message", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          author: `${data.from} (privado)`,
          message: data.message,
          time: data.time,
          private: true,
        },
      ]);
      alert(`📬 Mensaje privado de ${data.from}`);
    });

    socket.on("receive_message", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          author: data.author,
          message: data.message,
          time: data.time,
        },
      ]);
    });

    socket.on("receive_file", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          author: data.author,
          file: data.file,
          filename: data.filename,
          message: `Archivo recibido: ${data.filename}`,
          time: data.time,
        },
      ]);
    });

    socket.on("receive_image", ({ author, imageUrl, timestamp }) => {
      setMessages(prev => [...prev, { author, imageUrl, timestamp }]);
    });

    socket.on("user_connected", (msg) => {
      setNotifications((prev) => [...prev, msg]);
    });

    socket.on("user_disconnected", (msg) => {
      setNotifications((prev) => [...prev, msg]);
    });

    socket.on("room_users", (list) => {
      setUsuarios(list);
    });

    socket.on("all_users", (list) => {
      setTodosLosUsuarios(list.filter((u) => u.username !== username));
    });

    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      socket.off("receive_private_message");
      socket.off("receive_message");
      socket.off("receive_file");
      socket.off("user_connected");
      socket.off("user_disconnected");
      socket.off("room_users");
      socket.off("all_users");
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [username]);

  if (!joined) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Unirse al chat</h2>
        <input
          placeholder="Tu nombre"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ display: "block", margin: "10px 0", padding: "8px" }}
        />
        <input
          placeholder="Sala"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          style={{ display: "block", margin: "10px 0", padding: "8px" }}
        />
        <button onClick={joinRoom} style={{ padding: "10px 20px" }}>
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#fff" }}>
      <div style={{ width: "25%", borderRight: "1px solid #ccc", padding: 10 }}>
        <h3>Usuarios conectados</h3>
        <ul>
          {todosLosUsuarios.map((user) => (
            <li
              key={user.id}
              style={{
                cursor: "pointer",
                backgroundColor: receptor?.id === user.id ? "#ccc" : "transparent",
              }}
              onClick={() => {
                if (receptor?.id === user.id) {
                  setReceptor(null);
                } else if (user.username !== username) {
                  setReceptor(user);
                }
              }}
            >
              {user.username} - <small>{user.room}</small>
              {user.room !== room && (
                <button
                  style={{ marginLeft: "5px" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    cambiarSala(user.room);
                  }}
                >
                  Ir a sala
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 10, borderBottom: "1px solid #ccc", display: "flex", justifyContent: "space-between" }}>
          <div>
            <strong>Sala:</strong> {room} — <strong>Usuario:</strong> {username}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="Nueva sala"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              style={{ padding: "4px" }}
            />
            <button onClick={changeRoom}>Cambiar sala</button>
            {receptor && <button onClick={() => setReceptor(null)}>Salir privado</button>}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
          {notifications.map((note, i) => (
            <p key={i} style={{ fontStyle: "italic", color: "gray" }}>{note}</p>
          ))}
          {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.author}:</strong>
            {msg.imageUrl ? (
              <>
                <br />
                <img
                  src={msg.imageUrl}
                  alt="imagen enviada"
                  style={{ maxWidth: "200px", borderRadius: "8px", marginTop: "5px" }}
                />
                {msg.timestamp && (
                  <div style={{ fontSize: "12px", color: "#999" }}>
                    {new Date(msg.timestamp).toLocaleString()}
                  </div>
                )}
              </>
            ) : (
              <>
                {msg.message}
                {msg.timestamp && (
                  <div style={{ fontSize: "12px", color: "#999" }}>
                    {new Date(msg.timestamp).toLocaleString()}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        </div>

        <div style={{ padding: 10, borderTop: "1px solid #ccc", display: "flex", alignItems: "center", position: "relative" }}>
          <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ marginRight: "8px" }}>
            😊
          </button>
          {showEmojiPicker && (
            <div ref={emojiRef} style={{ position: "absolute", bottom: "60px", left: "10px", zIndex: 1000 }}>
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setMessage((prev) => prev + emojiData.emoji);
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          )}

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            style={{ flex: 1, padding: "8px" }}
          />
          <button onClick={sendMessage} style={{ marginLeft: "8px" }}>
            Enviar
          </button>

          <input
            type="file"
            onChange={handleFileChange}
            style={{ marginLeft: "8px" }}
          />
          <button onClick={sendFile} disabled={!file} style={{ marginLeft: "8px" }}>
            Enviar archivo
          </button>
        </div>
      </div>
    </div>
  );
}
