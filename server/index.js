const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

// Database connection
require("./config/database").connect();

// Middleware ORDER IS CRUCIAL
app.use(cookieParser()); // Must come before CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://note-app-umber-rho.vercel.app'
  ],
  credentials: true,
  exposedHeaders: ['set-cookie']
}));

app.use(express.json());

// Routes
app.use("/api/v1/auth", require("./routes/User"));
app.use("/api/v1/notes", require("./routes/NoteRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Server is running" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});