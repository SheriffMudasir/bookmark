import express from "express";
import "dotenv/config";
import cors from "cors"
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoute.js"

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    res.status(500).json({ message: "Internal server error", error: err.message });
});

const server = app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
    connectDB();
});

// Increase server timeout
server.setTimeout(120000); 