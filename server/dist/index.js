"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const authRoutes_1 = require("./routes/authRoutes");
const chatRoutes_1 = require("./routes/chatRoutes");
const discoverRoutes_1 = require("./routes/discoverRoutes");
const matchesRoutes_1 = require("./routes/matchesRoutes");
const profileRoutes_1 = require("./routes/profileRoutes");
const swipeRoutes_1 = require("./routes/swipeRoutes");
const trendingRoutes_1 = require("./routes/trendingRoutes");
const schema_1 = require("./database/schema");
const seedProfiles_1 = require("./data/seedProfiles");
const app = (0, express_1.default)();
const port = process.env.PORT ? Number(process.env.PORT) : 5000;
(0, schema_1.initializeDatabase)();
(0, seedProfiles_1.seedProfiles)();
const allowedOrigins = new Set((process.env.CLIENT_ORIGINS ?? "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean));
app.use((0, cors_1.default)({
    credentials: true,
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("Origin is not allowed by CORS."));
    },
}));
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static("public/uploads"));
app.get("/health", (_request, response) => {
    response.json({
        success: true,
        message: "Joy API is running",
    });
});
app.use("/api", authRoutes_1.authRouter);
app.use("/api", discoverRoutes_1.discoverRouter);
app.use("/api", swipeRoutes_1.swipeRouter);
app.use("/api", matchesRoutes_1.matchesRouter);
app.use("/api", chatRoutes_1.chatRouter);
app.use("/api", trendingRoutes_1.trendingRouter);
app.use("/api", profileRoutes_1.profileRouter);
exports.server = app.listen(port, () => {
    const address = exports.server.address();
    const actualPort = typeof address === "object" && address ? address.port : port;
    console.log(`Joy API is running at http://localhost:${actualPort}`);
});
