// src/socket.js
import { io } from 'socket.io-client';

const socket = io('https://ful2win-backend.onrender.com'); // Make sure this matches your backend port
export default socket;
