// src/index.js
import express from "express";
import "dotenv/config";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoute.js";
// import job from "./lib/cron.js"; // Uncomment if used

const app = express();
const PORT = process.env.PORT || 3000;

// if (job) job.start(); // Start cron job if defined and needed

app.use(express.json());

// Configure CORS: For development, allow all. For production, restrict.
if (process.env.NODE_ENV === 'production') {
    app.use(cors({
        origin: 'https://your-frontend-domain.com', // Replace with your actual frontend domain
        // optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    }));
} else {
    app.use(cors());
}


app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error("Error Stack:", err.stack); // Log full stack for server-side debugging

    const statusCode = err.statusCode || 500;
    const message = (process.env.NODE_ENV === 'production' && statusCode === 500)
        ? "Internal server error"
        : err.message || "An unexpected error occurred";

    res.status(statusCode).json({ message });
});

const startServer = async () => {
    try {
        await connectDB(); // Connect to DB first
        console.log("Database connected successfully.");

        const server = app.listen(PORT, () => {
            console.log(`Server is running at port ${PORT}`);
        });

        server.setTimeout(120000);

    } catch (error) {
        console.error("Failed to start the server or connect to DB:", error);
        process.exit(1); // Exit if critical startup components fail
    }
};

startServer();