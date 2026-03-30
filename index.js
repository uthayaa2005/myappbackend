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

// 🏠 ROOM STORAGE
const rooms = {};

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

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        currentSong: null,
        isPlaying: false,
      };
    }

    socket.emit("roomData", rooms[roomId]);
  });

  socket.on("sendMessage", ({ roomId, msg }) => {
    io.to(roomId).emit("receiveMessage", msg);
  });

  socket.on("playSong", ({ roomId, data }) => {
    rooms[roomId].currentSong = data;
    rooms[roomId].isPlaying = true;

    io.to(roomId).emit("playSong", data);
  });

  socket.on("pauseSong", (roomId) => {
    rooms[roomId].isPlaying = false;
    io.to(roomId).emit("pauseSong");
  });

  socket.on("resumeSong", (roomId) => {
    rooms[roomId].isPlaying = true;

    // update timestamp so sync continues
    if (rooms[roomId].currentSong) {
      rooms[roomId].currentSong.timestamp = Date.now();
    }

    io.to(roomId).emit("resumeSong", rooms[roomId].currentSong);
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