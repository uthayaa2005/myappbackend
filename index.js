const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*", // change to frontend URL after deploy
  },
});

// 💖 USERS (only you two)
const users = [
  { name: "uthayaa", password: "anuuthayaa" },
  { name: "anu", password: "anuuthayaa" },
];

// 🔐 LOGIN API
app.post("/login", (req, res) => {
  const { name, password } = req.body;

  const user = users.find(
    (u) => u.name === name && u.password === password
  );

  if (user) {
    res.json({ success: true, name });
  } else {
    res.json({ success: false });
  }
});

// 💬 + 🎵 SOCKET
io.on("connection", (socket) => {
  console.log("User connected");

  // 💬 Chat
  socket.on("sendMessage", (msg) => {
    io.emit("receiveMessage", msg);
  });

  // 🎵 Play Song Sync
  socket.on("playSong", (videoId) => {
    io.emit("playSong", videoId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});