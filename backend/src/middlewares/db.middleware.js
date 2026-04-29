import connectDB from "../configs/db.js";


export const ensureDB = async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection middleware error:", error.message);
        res.status(500).json({
            success: false,
            message: "Database connection failed. Please try again later.",
            error: process.env.NODE_ENV === 'production' ? null : error.message
        });
    }
};
