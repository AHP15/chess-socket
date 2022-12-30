import { Server } from "socket.io";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { createServer } from "http";

import gameNamespace from './namespaces/games.js';
import challengeNamespace from "./namespaces/challenges.js";

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

io.on("connection", (socket) => {
  console.log("user connetced", socket.id);

  socket.on("challenge", (data) => {
    console.log("challenge by", data);
  });

  socket.conn.on("close", () => {
    console.log(socket.id, "closed");
  });
});
*/

challengeNamespace(io);
gameNamespace(io);

io.listen(8081);