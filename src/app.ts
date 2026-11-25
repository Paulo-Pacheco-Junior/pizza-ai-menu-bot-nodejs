import express from "express";
import messageRoutes from "./routes/messageRoutes";
import storeRoutes from "./routes/storeRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import cors from "cors";
import "express-async-errors";

const app = express();

app.use(cors());

app.use(express.json());

app.use(messageRoutes);
app.use(storeRoutes);

app.use(errorHandler);

export default app;
