import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {router as authRoutes} from "./routes/auth.js";
import { router as userRouter } from "./routes/user.js";
import { router as projectRouter } from "./routes/project.js";
import dotenv from "dotenv"
dotenv.config()

const app=express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    allowedHeaders: ["Content-Type","Authorization"],
    credentials: true
}))

app.use(express.json({limit:"1mb"}))
app.use(express.urlencoded({extended:true, limit:"1mb"}))
app.use(cookieParser())

app.use("/auth",authRoutes)
app.use("/user", userRouter);
app.use("/project", projectRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

export {app}