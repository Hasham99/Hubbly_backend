import express from "express";
import session from 'express-session';
import cors from "cors"
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { errorHandler } from "./middlewares/error.middleware.js";


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN ,
    credentials: true

}))

// Make sure the session middleware is set up first
app.use(session({
    secret: process.env.SESSION_SECRET,  // Secret key used for signing the session ID
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set secure: true if using HTTPS
  }));

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
    res.send("Server is running")
})

// http://localhost:8090//api/v1/users/register


app.use(errorHandler); 
export { app }