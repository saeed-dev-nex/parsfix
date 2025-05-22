import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import errorHandler from "./middlewares/errorMiddleware.js";
import mainRouter from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 5001;

/* ---------- Middlewares ---------- */
const corsOptions = {
  // Replace with your frontend's actual origin
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true, // Important for cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization", "Accept"], // Allowed headers
  optionsSuccessStatus: 200, // For legacy browser compatibility
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
/* ---------- Routes ---------- */
app.use("/api/v1", mainRouter);

/* ---------- Error Handling ---------- */
// TODO: Add error handling middleware
app.use(errorHandler);
/* ---------- Server Start ---------- */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
