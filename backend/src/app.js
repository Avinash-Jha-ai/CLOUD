import cookieParser from "cookie-parser";
import express from "express"
import authRouter from "./routes/auth.route.js"
import folderRouter from "./routes/folder.route.js"
import fileRouter from "./routes/file.route.js"
import searchRouter from "./routes/search.route.js"
import planRouter from "./routes/plan.route.js"
import paymentRouter from "./routes/payment.route.js"

import cors from "cors";
import { config } from "./configs/config.js";

const app =express();
const allowedOrigins = [config.FRONTEND_URL, "https://cloud-nine-dusky.vercel.app", "http://localhost:5173"];

app.use(cors({
    origin: function (origin, callback) {
        const normalizedOrigin = origin ? origin.replace(/\/$/, "") : null;
        const normalizedAllowed = allowedOrigins.map(o => o ? o.replace(/\/$/, "") : o);
        
        if (!origin || normalizedAllowed.indexOf(normalizedOrigin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req, res) => {
    res.status(200).json({ message: "Server is running" });
});

app.use("/api/auth",authRouter);
app.use("/api/",folderRouter);
app.use("/api/file",fileRouter);
app.use("/api/search", searchRouter);
app.use("/api/plan", planRouter);
app.use("/api/payment", paymentRouter);



export default app;