import cors from "cors";
import "dotenv/config";
import express from "express";
import { authRouter } from "./routes/authRoutes";
import { chatRouter } from "./routes/chatRoutes";
import { discoverRouter } from "./routes/discoverRoutes";
import { matchesRouter } from "./routes/matchesRoutes";
import { profileRouter } from "./routes/profileRoutes";
import { swipeRouter } from "./routes/swipeRoutes";
import { trendingRouter } from "./routes/trendingRoutes";
import { initializeDatabase } from "./database/schema";
import { seedProfiles } from "./data/seedProfiles";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 5000;

initializeDatabase();
seedProfiles();

const allowedOrigins = new Set(
  (process.env.CLIENT_ORIGINS ?? "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin is not allowed by CORS."));
  },
}));
app.use(express.json());
app.use("/uploads", express.static("public/uploads"));

app.get("/health", (_request, response) => {
  response.json({
    success: true,
    message: "Joy API is running",
  });
});

app.use("/api", authRouter);
app.use("/api", discoverRouter);
app.use("/api", swipeRouter);
app.use("/api", matchesRouter);
app.use("/api", chatRouter);
app.use("/api", trendingRouter);
app.use("/api", profileRouter);

export const server = app.listen(port, () => {
  const address = server.address();
  const actualPort = typeof address === "object" && address ? address.port : port;
  console.log(`Joy API is running at http://localhost:${actualPort}`);
});
