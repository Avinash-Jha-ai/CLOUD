import mongoose from "mongoose";
import {config} from "./config.js"


const connectDB = async () => {
    try {
        if (mongoose.connection.readyState >= 1) return;
        
        await mongoose.connect(config.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection error:", error.message);
        
    }
}

export default connectDB