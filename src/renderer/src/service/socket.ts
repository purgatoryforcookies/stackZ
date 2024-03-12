import { io } from 'socket.io-client'

export const SOCKET_HOST = 'http://localhost:3123'

// Everyting else than terminal and stacks uses this basesocket.
export const baseSocket = io(SOCKET_HOST)
