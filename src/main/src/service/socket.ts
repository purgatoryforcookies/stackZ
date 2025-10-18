import { Server } from 'socket.io'
import { ClientToServerEvents, ServerToClientEvents } from '../../../types.js'

export const socketServer = new Server<ClientToServerEvents, ServerToClientEvents>({
    cors: {
        origin: '*'
    }
})
