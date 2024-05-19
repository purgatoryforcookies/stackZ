import { Server } from 'socket.io'
import { ClientToServerEvents, ServerToClientEvents } from '../../../types'

export const socketServer = new Server<ClientToServerEvents, ServerToClientEvents>({
    cors: {
        origin: '*'
    }
})
