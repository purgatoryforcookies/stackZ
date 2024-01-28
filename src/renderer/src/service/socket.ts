import { io } from "socket.io-client";


export const SOCKET_HOST = "http://localhost:3123"

// Everyting else than terminal uses this basesocket.
// Terminals connect with their own sockets
export const baseSocket = io(SOCKET_HOST)