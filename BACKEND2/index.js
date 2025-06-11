import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import ValidateRoutes from "./routes/ValidateRoutes.js"; // ← Fixed: default import
import ListJsonFiles from "./routes/StatsRoutes.js"
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors()); // ← Enable CORS for all routes
app.use(express.json());

// Use routes - Fixed
app.use("/api/auth", ValidateRoutes);
app.use("/api/stats", ListJsonFiles);

// Create the raw HTTP server…
const httpServer = createServer(app);

// …and attach Socket.IO to it
const io = new IOServer(httpServer, {
  cors: { origin: "*" }, // allow your React app to connect
});

// When a client connects, log it
io.on("connection", (socket) => {
  console.log("⚡️ Client connected:", socket.id);
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server (with WebSockets) running on port ${PORT}`);
});