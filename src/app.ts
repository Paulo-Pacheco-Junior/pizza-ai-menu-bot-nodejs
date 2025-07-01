import express from "express";
import messageRoutes from "./routes/messageRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import cors from "cors";
import "express-async-errors";

const app = express();

app.use(cors());

app.use(express.json());

app.use(messageRoutes);

app.use(errorHandler);

export default app;
