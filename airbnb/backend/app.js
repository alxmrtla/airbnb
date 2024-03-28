const express = require("express");
require("express-async-errors");
require("dotenv").config();

const morgan = require("morgan");
const cors = require("cors");
const csurf = require("csurf");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const app = express();

// Middleware setup
app.use(morgan("dev")); // Logging middleware
app.use(cookieParser());
app.use(express.json()); // Built-in middleware to parse JSON bodies

// Security middleware setup
if (process.env.NODE_ENV !== "production") {
  app.use(cors()); // Enable CORS if in development mode for React frontend
}
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Configure Helmet for security
  })
);
app.use(
  csurf({
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Lax" : false,
      httpOnly: true,
    },
  })
);

// Test route
app.get("/hello/world", function (req, res) {
  res.cookie("XSRF-TOKEN", req.csrfToken());
  res.send("Hello World!");
});
// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));


module.exports = app;
