/* eslint-disable no-undef */
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// set up rate limiter: maximum of five requests per minute
var RateLimit = require("express-rate-limit");
var limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000,
});

// apply rate limiter to all requests
app.use(limiter);

app.use(express.static(path.join(__dirname, "dist")));

// apply security response headers
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https: fonts.gstatic.com; frame-ancestors 'none'");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

app.get("/help/*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "help", "index.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
