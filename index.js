require("dotenv").config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http=require("http");
const {Server}=require("socket.io");



app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  require("./controllers/stripeWebhook").stripeWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(cookieParser());

const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes=require("./routes/paymentRoutes")
const reviewRoutes=require("./routes/reviewRoutes")
const uploadRoutes=require("./routes/uploadRoutes")
const providerRoutes=require("./routes/providerRoutes")
const messageRoutes=require("./routes/messageRoutes")

connectDB();

app.get("/", (req, res) => {
  res.send("welcome to backend");
});

app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments",paymentRoutes)
app.use("/api/reviews",reviewRoutes)
app.use("/api/users",uploadRoutes)
app.use("/api/stripe",paymentRoutes);
app.use("/api/provider", providerRoutes);
app.use("/api/messages",messageRoutes)

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join chat room by booking ID
  socket.on("join-room", (bookingId) => {
    socket.join(bookingId);
  });

  // Send message to room
  socket.on("send-message", (data) => {
    io.to(data.bookingId).emit("receive-message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.listen(process.env.PORT, () => {
  console.log(`server running at http://localhost:${process.env.PORT}`);
});
