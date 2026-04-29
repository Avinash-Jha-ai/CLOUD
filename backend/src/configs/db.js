import mongoose from "mongoose";
import { config } from "./config.js";


let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            serverSelectionTimeoutMS: 5000,
            bufferCommands: false, // Fail fast if connection is not ready
        };

        console.log("Connecting to Database...");
        cached.promise = mongoose.connect(config.MONGO_URI, opts).then((mongoose) => {
            console.log("Database connected successfully");
            return mongoose;
        }).catch((err) => {
            console.error("Database connection error:", err.message);
            cached.promise = null; // Reset promise so we can retry
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
};

export default connectDB;