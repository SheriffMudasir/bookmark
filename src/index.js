import express from "express";
import "dotenv/config";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoute.js";
import job from "./lib/cron.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Start cron job
job.start();

// Middleware
app.use(express.json({ limit: "50mb" })); // Allow large image payloads
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // Handle URL-encoded bodies
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    res.status(500).json({ message: "Internal server error", error: err.message });
});

// Start server and connect to DB
const server = app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
    connectDB();
});

// Optional: Increase timeout for long requests (e.g., uploads)
server.setTimeout(120000);
