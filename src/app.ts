import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Olá, pizza bot está funcionando!" });
});

export { app };
