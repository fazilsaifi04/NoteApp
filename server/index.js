const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const authRoutes = require("./routes/User"); // Adjust to your path

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

// ✅ Allow frontend access with credentials
app.use(cors({
  origin: "https://note-app-umber-rho.vercel.app/", // e.g. Netlify or localhost
  credentials: true
}));

app.use("/api/v1/auth", authRoutes); // Mount your auth routes

app.get("/", (req, res) => {
  res.send("API is working");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
