import cors from "cors";
import "dotenv/config";
import express from "express";
import { discoverRouter } from "./routes/discoverRoutes";
import { matchesRouter } from "./routes/matchesRoutes";
import { profileRouter } from "./routes/profileRoutes";
import { swipeRouter } from "./routes/swipeRoutes";
import { initializeDatabase } from "./database/schema";
import { seedProfiles } from "./data/seedProfiles";

const app = express();
const port = Number(process.env.PORT) || 5000;

initializeDatabase();
seedProfiles();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("public/uploads"));

app.get("/health", (_request, response) => {
  response.json({
    success: true,
    message: "Coy Discover API is running",
  });
});

app.use("/api", discoverRouter);
app.use("/api", swipeRouter);
app.use("/api", matchesRouter);
app.use("/api", profileRouter);

app.listen(port, () => {
  console.log(`Coy Discover API is running at http://localhost:${port}`);
});
