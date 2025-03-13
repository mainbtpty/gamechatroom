const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const redis = require('redis');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Create a Redis client
const redisClient = redis.createClient();
redisClient.on('error', (err) => console.error('Redis Client Error', err));

const ROOM_EXPIRATION = 600; // Room expiration time in seconds (10 minutes)

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a room
  socket.on('joinRoom', ({ roomName, username }) => {
    socket.join(roomName);
    console.log(`${username} joined room: ${roomName}`);

    // Store room name in Redis with expiration
    redisClient.setex(roomName, ROOM_EXPIRATION, JSON.stringify({ username }), (err) => {
      if (err) {
        console.error('Error storing room name in Redis:', err);
      }
    });

    // Notify others in the room
    socket.to(roomName).emit('userJoined', { username });

    // Send the current list of rooms to all clients
    redisClient.keys('*', (err, keys) => {
      if (err) {
        console.error('Error fetching room names from Redis:', err);
        return;
      }
      io.emit('updateRoomList', keys);
    });
  });

  // Handle sending messages
  socket.on('sendMessage', ({ roomName, username, message }) => {
    const timestamp = new Date().toISOString();
    const newMessage = { username, message, timestamp };

    // Broadcast the message to everyone in the room
    io.to(roomName).emit('receiveMessage', [newMessage]);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

server.listen(3001, () => {
  console.log('WebSocket server is running on port 3001');
});
