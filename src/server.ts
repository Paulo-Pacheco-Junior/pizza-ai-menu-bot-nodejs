import dotenv from "dotenv";
dotenv.config();

import { env } from "./config/geminiEnv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { setupSocket } from "./sockets/socketHandler";

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: { origin: "*" },
});

setupSocket(io, env.GEMINI_API_KEY!);

const PORT = process.env.PORT || 3333;

server.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export { server };
