const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

// 💖 USERS
const users = [
  { name: "uthayaa", password: "anuuthayaa" },
  { name: "anu", password: "anuuthayaa" },
];

// 🔐 LOGIN
app.post("/login", (req, res) => {
  const { name, password } = req.body;

  const user = users.find(
    (u) => u.name === name && u.password === password
  );

  res.json(user ? { success: true, name } : { success: false });
});

// 💬 + 🎵 SOCKET
io.on("connection", (socket) => {
  socket.on("sendMessage", (msg) => {
    io.emit("receiveMessage", msg);
  });

  socket.on("playSong", (videoId) => {
    io.emit("playSong", videoId);
  });
});

// ❤️ HEALTH CHECK
app.get("/", (req, res) => {
  res.send("Server is running ❤️");
});

// ✅ PORT
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});