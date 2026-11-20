"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const discoverRoutes_1 = require("./routes/discoverRoutes");
const matchesRoutes_1 = require("./routes/matchesRoutes");
const profileRoutes_1 = require("./routes/profileRoutes");
const swipeRoutes_1 = require("./routes/swipeRoutes");
const schema_1 = require("./database/schema");
const seedProfiles_1 = require("./data/seedProfiles");
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 5000;
(0, schema_1.initializeDatabase)();
(0, seedProfiles_1.seedProfiles)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static("public/uploads"));
app.get("/health", (_request, response) => {
    response.json({
        success: true,
        message: "Coy Discover API is running",
    });
});
app.use("/api", discoverRoutes_1.discoverRouter);
app.use("/api", swipeRoutes_1.swipeRouter);
app.use("/api", matchesRoutes_1.matchesRouter);
app.use("/api", profileRoutes_1.profileRouter);
app.listen(port, () => {
    console.log(`Coy Discover API is running at http://localhost:${port}`);
});
