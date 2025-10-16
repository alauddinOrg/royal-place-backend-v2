import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import globalErrorHandler from "./app/middleware/globalErrorHandeller";
import { initialRoute } from "./app/apiRoutes";

// ==============================
// App Configuration
// ==============================
const app: Application = express();
app.use(cors({

  origin: ["http://localhost:3000", "https://royal-place.vercel.app"],

  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-vercel-protection-bypass'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']

}));

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//==================================== Root and Utility Routes========================================

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: `Database connected`,
  });
});





// =======================Main Api Routes===============================

initialRoute(app)


// ==============================404 Not Found Handler=======================================

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: "Page Not Found",
  });
});

// ==============================
// Global Error Handler
// ==============================
app.use(globalErrorHandler);

// ==============================
// Export App
// ==============================
export default app;
