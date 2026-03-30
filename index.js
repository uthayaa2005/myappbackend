const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: { origin: "*" },
});

// 💖 USERS
const users = [
  { name: "uthayaa", password: "anuuthayaa" },
  { name: "anu", password: "anuuthayaa" },
];

// 🏠 ROOMS STORE
const rooms = {}; 
// { roomId: { currentSong, isPlaying } }

// 🔐 LOGIN
app.post("/login", (req, res) => {
  const { name, password } = req.body;

  const user = users.find(
    (u) => u.name === name && u.password === password
  );

  res.json(user ? { success: true, name } : { success: false });
});

// 🎧 SOCKET
io.on("connection", (socket) => {

  // 🏠 JOIN ROOM
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);

    // create room if not exists
    if (!rooms[roomId]) {
      rooms[roomId] = {
        currentSong: null,
        isPlaying: false,
      };
    }

    // send current state to new user
    socket.emit("roomData", rooms[roomId]);
  });

  // 💬 CHAT
  socket.on("sendMessage", ({ roomId, msg }) => {
    io.to(roomId).emit("receiveMessage", msg);
  });

  // 🎵 PLAY
  socket.on("playSong", ({ roomId, data }) => {
    rooms[roomId].currentSong = data;
    rooms[roomId].isPlaying = true;

    io.to(roomId).emit("playSong", data);
  });

  // ⏸ PAUSE
  socket.on("pauseSong", (roomId) => {
    rooms[roomId].isPlaying = false;
    io.to(roomId).emit("pauseSong");
  });

  // ▶ RESUME
  socket.on("resumeSong", (roomId) => {
    rooms[roomId].isPlaying = true;
    io.to(roomId).emit("resumeSong");
  });
});

// ❤️ HEALTH
app.get("/", (req, res) => {
  res.send("Server running ❤️");
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("Server running on " + PORT);
});