import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { AppError } from "../error/appError";

let io: Server;

export const initiateSocket = (server: HTTPServer) => {
  io = new Server(server, {
    cors: {
      credentials: true,
      origin: [
        "https://royal-place.vercel.app", // ✅ Production
        "http://localhost:3000",          // ✅ Dev (Next.js default)
      ],

      methods: ['GET', 'POST'],
    },
  });

  io.on("connection", (socket) => {
    const { userId, role } = socket.handshake.query;

    if (userId) {
      socket.join(userId); // Join user's private room
    }

    if (role) {
      socket.join(role); // Join role-based room
      console.log(`Socket ${socket.id} joined room: ${role}`);
    }

    socket.on("disconnect", () => {
      console.log(`Socket ${socket.id} disconnected`);
    });
  });
  return io;
};


export const getIO = () => {
  if (!io) {
    throw new AppError("Socket.io not initialized!", 500);
  }
  return io;
}