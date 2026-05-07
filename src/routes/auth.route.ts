import express from "express";
import bcrypt from "bcryptjs";
import { db } from "../utils/db.helper";
import jwt from "jsonwebtoken";

const router = express.Router();

// --------------------------------------------------
// Register page
// --------------------------------------------------
router.get("/register", (_req, res) => {
  res.render("register", {
    title: "Register",
    error: null,
  });
});

// --------------------------------------------------
// Handle user registration
// --------------------------------------------------
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  // Validate input
  if (!username || !email || !password) {
    return res.render("register", {
      title: "Register",
      error: "All fields are required",
    });
  }

  try {
    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)"
    ).run(username, email, hashedPassword);

    return res.redirect("/auth/login");

  } catch (err: any) {
    console.error("Register error:", err);

    // Handle duplicate user (unique constraint)
    if (err.message?.includes("UNIQUE")) {
      return res.render("register", {
        title: "Register",
        error: "Username or email already exists",
      });
    }

    return res.render("register", {
      title: "Register",
      error: "Registration failed",
    });
  }
});

// --------------------------------------------------
// Login page
// --------------------------------------------------
router.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    error: null
  });
});

// --------------------------------------------------
// Handle login
// --------------------------------------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = db
      .query("SELECT * FROM users WHERE email = ? LIMIT 1")
      .get(email) as any;

    const isValid =
      user && (await bcrypt.compare(password, user.password));

    if (!isValid) {
      return res.status(401).render("login", {
        title: "Login",
        error: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });

    return res.redirect("/portal/get-my-exercises");

  } catch (err) {
    console.error(err);

    return res.status(500).render("login", {
      title: "Login",
      error: "Login failed. Please try again."
    });
  }
});

// --------------------------------------------------
// Logout user
// --------------------------------------------------
router.get("/logout", (_req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

export default router;