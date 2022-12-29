import { Server } from "socket.io";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { createServer } from "http";

dotenv.config();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173"
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    console.log('bad');
    const error = new Error('No token provided!');
    return next(error);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(err.message);
    }

    socket.userId = decoded.id;
    next();
  });
});

io.on("connection", (socket) => {
  console.log("user connetced", socket.id);

  socket.on("register", user => {
    socket.emit('register_success');
  });

  socket.conn.on("close", () => {
    console.log(socket.id, "closed");
  });
});

io.listen(8081);