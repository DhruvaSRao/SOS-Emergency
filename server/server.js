require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const sosRoutes = require("./routes/sosRoutes");
const authRoutes = require("./routes/authRoutes");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const app = express();

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors({
  origin: [
    "https://sos-emergency-one.vercel.app",
    /https:\/\/sos-emergency-.*\.vercel\.app/,
  ],
  credentials: true,
}));
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("Backend running");
});

// API Routes
app.use("/api/sos", sosRoutes);
app.use("/api/auth", authRoutes);

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      "https://sos-emergency-one.vercel.app",
      /https:\/\/sos-emergency-.*\.vercel\.app/,
    ],
    credentials: true,
  },
});

// Make io accessible inside controllers
app.set("io", io);

// Socket authentication
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.join(`user-${socket.user.id}`);
  console.log("Joined room:", `user-${socket.user.id}`);

  socket.on("joinSOSRoom", (sosId) => {
    socket.join(`sos-${sosId}`);
    console.log(`Socket joined room: sos-${sosId}`);
  });

  socket.on("locationUpdate", (data) => {
    const { sosId, latitude, longitude } = data;
    console.log("Live location received:", sosId, latitude, longitude);
    io.to(`sos-${sosId}`).emit("liveLocation", { sosId, latitude, longitude });
  });

  socket.on("policeLocationUpdate", async (data) => {
    try {
      if (socket.user.role !== "police") return;
      const { latitude, longitude } = data;
      await User.findByIdAndUpdate(socket.user.id, {
        location: { type: "Point", coordinates: [longitude, latitude] },
      });
      console.log("Police location updated:", socket.user.id);
    } catch (error) {
      console.error("Police location update error:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});