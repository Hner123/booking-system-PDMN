import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import ValidateRoutes from "./routes/ValidateRoutes.js"; // ← Fixed: default import
import StatsRoutes from "./routes/StatsRoutes.js";
import userRoutes from "./routes/UserRoutes.js";
import adminRoutes from "./routes/AdminRoutes.js";
import NotifRoutes from "./routes/NotifRoutes.js";
import ReserveRoutes from "./routes/ReserveRoutes.js";
import EmailRoutes from "./routes/EmailsRoutes.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors()); // ← Enable CORS for all routes
app.use(express.json());

// Use routes - Fixed
app.use("/api/auth", ValidateRoutes);
app.use("/api/stats", StatsRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notif", NotifRoutes);
app.use("/api/book", ReserveRoutes);
app.use("/api/email", EmailRoutes);

// Create the raw HTTP server…
const httpServer = createServer(app);

// …and attach Socket.IO to it
const io = new IOServer(httpServer, {
  cors: { origin: "*" }, // allow your React app to connect
});

// Make io available to routes (important!)
app.set("socketio", io);

// When a client connects, log it
io.on("connection", (socket) => {
  // console.log("⚡️ Client connected:", socket.id);
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server (with WebSockets) running on port ${PORT}`);
});
