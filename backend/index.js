const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const http = require('http');
const ConnectDB = require("./config/Database");
const { initializeSocket } = require('./config/socket');

const UserRoutes = require("./routes/UserRoutes");
const AdminRoutes = require("./routes/AdminRoutes");
const ReserveRoutes = require("./routes/ReserveRoutes");
const ValidateRoutes = require("./routes/ValidateRoutes");
const NotifRoutes = require("./routes/NotifRoutes");

dotenv.config();
ConnectDB();

const app = express();
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

app.use('/api/user', UserRoutes);
app.use('/api/admin', AdminRoutes);
app.use('/api/book', ReserveRoutes);
app.use('/api/auth', ValidateRoutes);
app.use('/api/notif', NotifRoutes);

const io = initializeSocket(server);
app.set('socketio', io);

const PORT = process.env.PORT || 8800;
server.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`)
);
