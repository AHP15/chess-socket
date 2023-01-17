import { Server } from "socket.io";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { createServer } from "http";

// import gameNamespace from './namespaces/games.js';
// import challengeNamespace from "./namespaces/user.js";

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


io.on('connection', (socket) => {
  socket.on('user', (email) => {
    socket.join(email);
  });

  socket.on('challenge-sent', (challenge) => {
    io.to(challenge.to.email).emit('challenge-recieved', challenge)
  });

  socket.on('accept-challenge', (challenge) => {
    io.to(challenge.by.email).emit('challenge-accepted', challenge);
    io.to(challenge.to.email).emit('challenge-accepted', challenge);
  });

  socket.on('move-sent', ({ newPieces, email }) => {
    io.to(email).emit('move-received', newPieces);
  });
});

io.listen(8081);