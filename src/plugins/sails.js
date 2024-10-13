import sails from 'sails.io.js';
import socketIoClient from 'socket.io-client';
import { handleInGameEvents } from '@/plugins/sockets/inGameEvents';
import {
  handleGameStarted,
  handleGameCreated,
  handleGameFinished,
  handleJoin,
  handleLeftGame,
  handleIsRanked,
} from '@/plugins/sockets/gameListEvents';
import { handleConnect } from '@/plugins/sockets/connectivityEvents';

export const io = sails(socketIoClient);

export const reconnectSockets = () => {
  return new Promise((resolve, reject) => {
    io.socket.disconnect();
    io.socket.reconnect();
    const MAX_TRIES = 10; // 10 seconds
    const INTERVAL = 500; // 10 * 500 = 5000 (5 seconds)
    let tries = 1;
    const interval = setInterval(() => {
      // If we are connected to the socket, resolve
      if (io.socket.isConnected()) {
        resolve();
      }

      // If no connection after threshold, reject the promise to prevent an infinite loop
      if (tries >= MAX_TRIES) {
        clearInterval(interval);
        reject();
      }

      tries += 1;
    }, INTERVAL);
  });
};

// Configure socket connection url for dev environments
if (!import.meta.env.PROD) {
  io.sails.url = import.meta.env.VITE_API_URL || 'http://localhost:1337';
}

io.sails.transports = [ 'websocket' ];
io.sails.useCORSRouteToGetCookie = false;
io.sails.reconnection = true;

io.socket.on('game', handleInGameEvents);

io.socket.on('gameCreated', handleGameCreated);

io.socket.on('gameStarted', handleGameStarted);

io.socket.on('gameFinished', handleGameFinished);

io.socket.on('join', handleJoin);

io.socket.on('leftGame', handleLeftGame);

io.socket.on('setIsRanked', handleIsRanked);
//////////////////
// Connectivity //
//////////////////

io.socket.on('connect', handleConnect);
