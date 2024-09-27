const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const path = require("path");
const ConnectDB = require("./config/Database");
const { initializeSocket } = require("./config/Socket");

const routes = {
  UserRoutes: require("./routes/UserRoutes"),
  AdminRoutes: require("./routes/AdminRoutes"),
  ReserveRoutes: require("./routes/ReserveRoutes"),
  ValidateRoutes: require("./routes/ValidateRoutes"),
  NotifRoutes: require("./routes/NotifRoutes"),
  EmailsRoutes: require("./routes/EmailsRoutes"),
  FileRoutes: require("./routes/FileRoutes"),
};

const app = express();
dotenv.config();

// Connect to the database
ConnectDB();

// PFX certificate setup
const pfxPath = path.join(__dirname, 'cert', '21tJ9tHUVUCrWVF8lM8ypg-main-11a461e6f3331c293bce4defe5f129cdff58531c-temp.pfx');
const passphrase = 'QTAyUtiCdLhaaDK9o1VpTNKS8tOlHS1w/FbGpIhP118=';
const options = {
  pfx: fs.readFileSync(pfxPath),
  passphrase: passphrase,
};

// Create HTTPS server
const server = https.createServer(options, app);

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,PATCH");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
  );
  console.log(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.use("/api/user", routes.UserRoutes);
app.use("/api/admin", routes.AdminRoutes);
app.use("/api/book", routes.ReserveRoutes);
app.use("/api/auth", routes.ValidateRoutes);
app.use("/api/notif", routes.NotifRoutes);
app.use("/api/email", routes.EmailsRoutes);
app.use("/api/file", routes.FileRoutes);

// Initialize Socket.io
const io = initializeSocket(server);
app.set("socketio", io);

// Start the server
server.listen(process.env.PORT, () =>
  console.log(`Server started on port ${process.env.PORT}`)
);
