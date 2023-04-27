const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// set up rate limiter: maximum of five requests per minute
var RateLimit = require("express-rate-limit");
var limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
});

// apply rate limiter to all requests
app.use(limiter);

app.use(express.static(path.join(__dirname, "build")));

app.get("/help/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "help", "index.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
