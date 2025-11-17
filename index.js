require("dotenv").config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(cors({ origin: "http://localhost:5173" }));

app.use(cookieParser());

const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes=require("./routes/paymentRoutes")
const reviewRoutes=require("./routes/reviewRoutes")
const uploadRoutes=require("./routes/uploadRoutes")

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



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

app.listen(process.env.PORT, () => {
  console.log(`server running at http://localhost:${process.env.PORT}`);
});
