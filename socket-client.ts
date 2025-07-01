import { io } from "socket.io-client";

const socket = io("http://localhost:3333");

socket.on("connect", () => {
  console.log("Conectado como:", socket.id);
  socket.emit("message", "Quais refrigerantes vocês têm?");
});

socket.on("connect_error", (err: any) => {
  console.error("Erro de conexão:", err.message);
});

socket.on("disconnect", (reason: string) => {
  console.log("Desconectado, motivo:", reason);
});

socket.on("response", (msg: any) => {
  console.log("Resposta do bot:", msg);
});

//npx ts-node socket-client.ts
