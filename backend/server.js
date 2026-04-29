import app from "./src/app.js";
import connectDB from "./src/configs/db.js";

connectDB();

const PORT =  3000;
const server = app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);

    // Keep Render free-tier awake: self-ping every 14 minutes
    const BACKEND_URL = process.env.BACKEND_URL || `https://cloud-1-v23n.onrender.com`;
    setInterval(async () => {
        try {
            await fetch(`${BACKEND_URL}/`);
            console.log("[keep-alive] pinged backend successfully");
        } catch (err) {
            console.warn("[keep-alive] ping failed:", err.message);
        }
    }, 14 * 60 * 1000); // every 14 minutes
});


