import express, { Router } from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { errorHandler } from "./middlewares/error.middleware.js";
import session from "express-session";

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET ,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 5 * 60 * 1000 // 5 minutes
  }
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN ,
    credentials: true

}))

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser())
app.use(morgan("dev"));
// Global error handler

//routes import
import userRouter from "./routes/user.routes.js"

//routes declaration
app.use("/api/v1/users", userRouter);

app.use("/", (req, res) => {
    res.send("Server is running (1.0.0)")
})

app.use(errorHandler); 
export { app }