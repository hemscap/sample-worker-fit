import express from "express";
import path from "path";
import session from "express-session";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import portalRoutes from "./routes/portal.route.js";
import resultRouter from "./routes/webhook.route.js";
import { initial } from "./utils/db.helper.js";
import axios from "axios";
import { to } from "await-to-js";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

initial();

const app = express();
const port = Number(process.env.PORT) || 3000;
app.use(express.static('public'));

// ====================== Middleware ======================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

// Routes
app.use("/auth/", authRoutes);
app.use("/portal/", portalRoutes);
app.use("/result/",resultRouter);


// Home Route
app.get("/", async (req, res) => {
  res.redirect("/portal/get-my-exercises");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});