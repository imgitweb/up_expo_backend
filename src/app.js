const express = require("express");
const cors = require("cors");
require("dotenv").config();


const visitorRoutes = require("./routes/visitor.route");
const contactRoutes = require("./routes/contact.route");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
      : "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/api/visitors", visitorRoutes);
app.use("/api/contacts", contactRoutes);

app.get("/", (req, res) => {
  res.json({ message: "BVS Expo Backend is running 🚀" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
