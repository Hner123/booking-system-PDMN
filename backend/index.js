const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const http = require("http");
const ConnectDB = require("./config/Database");
const { initializeSocket } = require("./config/Socket");

const UserRoutes = require("./routes/UserRoutes");
const AdminRoutes = require("./routes/AdminRoutes");
const ReserveRoutes = require("./routes/ReserveRoutes");
const ValidateRoutes = require("./routes/ValidateRoutes");
const NotifRoutes = require("./routes/NotifRoutes");
const EmailsRoutes = require("./routes/EmailsRoutes");
const FileRoutes = require("./routes/FileRoutes");

const app = express();

dotenv.config();

ConnectDB();

const server = http.createServer(app);

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
  console.log(req.path, req.method);
  next();
});

app.use("/api/user", UserRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/book", ReserveRoutes);
app.use("/api/auth", ValidateRoutes);
app.use("/api/notif", NotifRoutes);
app.use("/api/email", EmailsRoutes);
app.use("/api/file", FileRoutes);

const io = initializeSocket(server);
app.set("socketio", io);

server.listen(process.env.PORT, () =>
  console.log(`Server started on port ${process.env.PORT}`)
);
