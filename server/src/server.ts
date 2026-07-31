import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
import { errorHandler, requireAuth } from "./middleware.js";
import { authHandler } from "./routes/auth.route.js";
import registerRouter from "./routes/register.route.js";
import quizzesRouter from "./routes/quizzes.route.js";
import usersRouter from "./routes/users.route.js";
import statsRouter from "./routes/stats.route.js";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { registerGameHandlers } from "./sockets/game.socket.js";
import { registerChatHandlers } from "./sockets/chat.socket.js";
import { requireEnv } from "./lib/env.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const frontendUrl = requireEnv("PUBLIC_FRONTEND_URL");
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: frontendUrl,
    credentials: true,
  },
});

app.set("trust proxy", true);
app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authHandler);
app.use("/api", registerRouter);
app.use("/api", quizzesRouter);
app.use("/api", usersRouter);
app.use("/api", statsRouter);
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.get("/api/data", (req: Request, res: Response) => {
  res.json({ message: "Hello from the Express backend!" });
});

app.get("/api/profile", requireAuth, (req: Request, res: Response) => {
  const { session } = res.locals;
  res.render("profile", { user: session?.user });
});
app.use(errorHandler);

io.on("connection", (socket) => {
  console.log("a user connected: ", socket.id);

  registerGameHandlers(io, socket);
  registerChatHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
