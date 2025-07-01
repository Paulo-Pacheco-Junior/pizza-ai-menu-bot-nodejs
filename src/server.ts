import http from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import app from "./app";
import { setupSocket } from "./sockets/socketHandler";

dotenv.config();

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: { origin: "*" },
});

setupSocket(io);

const PORT = process.env.PORT || 3333;

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export { server };
