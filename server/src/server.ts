import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
import { requireAuth } from "./middleware";
import { authHandler } from "./routes/auth.route";
import registerRouter from "./routes/register.route";

const app = express();
const PORT = 3000;

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
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
