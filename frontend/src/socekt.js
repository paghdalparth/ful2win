// src/socket.js
import { io } from 'socket.io-client';

// Use the deployed backend URL here
const socket = io('https://ful2win-backend.onrender.com');
export default socket;
