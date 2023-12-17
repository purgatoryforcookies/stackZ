import { io } from "socket.io-client";


export const SOCKET_HOST = "http://localhost:3000"


export const baseSocket = io(SOCKET_HOST)