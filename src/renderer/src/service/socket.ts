import { CustomClientSocket } from '@t'
import { io } from 'socket.io-client'

export const SOCKET_HOST = process.env.NODE_ENV === 'test' ? '' : 'http://localhost:3123'

// Everyting else than terminal and stacks uses this basesocket.
export const baseSocket: CustomClientSocket = io(SOCKET_HOST)
