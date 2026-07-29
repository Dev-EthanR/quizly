import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
import { errorHandler, requireAuth } from "./middleware";
import { authHandler } from "./routes/auth.route";
import registerRouter from "./routes/register.route";
import quizzesRouter from "./routes/quizzes.route";
import usersRouter from "./routes/users.route";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { registerGameHandlers } from "./sockets/game.socket.js";

const app = express();
const PORT = 3000;
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.PUBLIC_FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
  },
});

app.set("trust proxy", true);
app.use(
  cors({
    origin: process.env.PUBLIC_FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authHandler);
app.use("/api", registerRouter);
app.use("/api", quizzesRouter);
app.use("/api", usersRouter);
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

  registerGameHandlers(socket);

  socket.on("send_message", (data) => {
    // Broadcast the payload to all other connected clients
    socket.broadcast.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
