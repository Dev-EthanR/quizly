import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
import { requireAuth } from "./middleware";
import { authHandler } from "./routes/auth.route";

const app = express();
const PORT = 3000;

app.set("trust proxy", true);
app.use(cors());
app.use("/api/auth/*splat", authHandler);
app.use(express.json());

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
