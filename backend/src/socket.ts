import { Server } from "socket.io";
import { Server as HttpServer } from "http";

export let io: Server;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join:poll", (pollId: string) => {
      socket.join(`poll:${pollId}`);
      console.log(`Socket ${socket.id} joined room poll:${pollId}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}
