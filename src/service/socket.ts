import { Server } from "socket.io";

export const socketServer = new Server({
    cors: {
      origin: "*"
    }
  });
