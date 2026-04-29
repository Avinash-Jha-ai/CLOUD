import cookieParser from "cookie-parser";
import express from "express"
import authRouter from "./routes/auth.route.js"
import folderRouter from "./routes/folder.route.js"
import fileRouter from "./routes/file.route.js"
import searchRouter from "./routes/search.route.js"
import planRouter from "./routes/plan.route.js"
import paymentRouter from "./routes/payment.route.js"

const app =express();
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