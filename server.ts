import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Admin Login (JWT)
  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ role: 'admin' }, process.env.ADMIN_JWT_SECRET || 'secret', { expiresIn: '1d' });
      res.cookie('admin_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      return res.json({ success: true });
    }
    res.status(401).json({ error: "Invalid credentials" });
  });

  app.post("/api/admin/logout", (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true });
  });

  // Middleware to check admin session
  const isAdmin = (req, res, next) => {
    const token = req.cookies.admin_token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      jwt.verify(token, process.env.ADMIN_JWT_SECRET || 'secret');
      next();
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  app.get("/api/admin/check", isAdmin, (req, res) => {
    res.json({ isAdmin: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error('Vite initialization failed:', e);
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
