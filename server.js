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

/*
challengeNamespace(io);
gameNamespace(io);
*/

io.on('connection', (socket) => {
  socket.on('user', (email) => {
    socket.join(email);
    console.log(email);
  });

  socket.on('challenge-sent', ({ id, email }) => {
    io.to(email).emit('challenge-recieved', { id, email })
  });
});

io.listen(8081);