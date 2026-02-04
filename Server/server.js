const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
  methods: ["GET", "POST"]
});

// server health check
app.get("/", (req, res) => {
  res.send("SharedPad™ Server is Running");
});

// Shared document state
let documentText = "";

// Track connected users
let users = new Set();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Add user
  users.add(socket.id);
  io.emit("users-count", users.size);

  // Send existing document to new user
  socket.emit("load-document", documentText);

  // Receive document updates
  socket.on("edit-document", (text) => {
    documentText = text;
    socket.broadcast.emit("update-document", text);
  });

  // Remove user on disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    users.delete(socket.id);
    io.emit("users-count", users.size);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});