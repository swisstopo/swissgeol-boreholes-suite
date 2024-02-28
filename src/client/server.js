import { express } from "express";
import { path } from "path";
import { RateLimit } from "express-rate-limit";

const app = express();
const PORT = import.meta.env.PORT || 3000;

// set up rate limiter: maximum of 1000 requests per minute
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000,
});

// apply rate limiter to all requests
app.use(limiter);

app.use(express.static(path.join(__dirname, "dist")));

app.get("/help/*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "help", "index.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
