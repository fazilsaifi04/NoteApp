const express = require("express");
const app = express();

const userRoutes = require("./routes/User"); 
const noteRoutes = require("./routes/NoteRoutes"); 

const database = require("./config/database");

const cors = require("cors");
const dotenv = require("dotenv");


dotenv.config();
const PORT = process.env.PORT || 5000;

database.connect();


app.use(express.json());


app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://note-app-umber-rho.vercel.app'
  ],
  credentials: true,
  exposedHeaders: ['set-cookie']
}));


app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/notes", noteRoutes); 

const cookieParser = require("cookie-parser");
app.use(cookieParser());


app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Your server is up and running...",
  });
});


app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});


app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
