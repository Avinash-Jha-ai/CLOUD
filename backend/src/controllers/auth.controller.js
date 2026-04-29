import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { config } from "../configs/config.js";

const sendToken = async (res, user, message) => {
    try {
        if (!config.JWT_SECRET) {
            console.error("JWT_SECRET is missing in config");
            return res.status(500).json({ message: "Server configuration error", success: false });
        }

        const token = jwt.sign(
            { id: user._id.toString() },
            config.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json({
            message,
            success: true,
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                avatar: user.avatar,
                isVerified: user.isVerified,
                storageUsed: user.storageUsed,  
                storageLimit: user.storageLimit, 
                plan: user.plan                 
            }
        });
    } catch (error) {
        console.error("Error in sendToken:", error);
        return res.status(500).json({ message: "Error generating authentication token", success: false });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) return res.status(401).json({ message: "User not found", success: false });

        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                avatar: user.avatar,
                isVerified: user.isVerified,
                storageUsed: user.storageUsed,
                storageLimit: user.storageLimit,
                plan: user.plan
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching user", success: false });
    }
};

export const logout = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: true,
        sameSite: "none"
    });
    return res.status(200).json({ message: "Logged out successfully", success: true });
};

export const socialLogin = async (req, res) => {
    try {
        const { email, fullname, avatar, providerId, provider } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required", success: false });
        }

        if (provider !== 'google') {
            return res.status(400).json({ message: "Only Google login is supported", success: false });
        }

        let user = await userModel.findOne({ email });

        if (!user) {
            const userData = {
                email,
                fullname: fullname || "Google User",
                avatar: avatar || "https://ik.imagekit.io/Avinash/youtube/default-avatar.png",
                isVerified: true,
                googleId: providerId
            };
            user = await userModel.create(userData);
            console.log("New user created via social login:", email);
        } else {
            if (!user.googleId) {
                user.googleId = providerId;
                await user.save();
                console.log("Google ID updated for existing user:", email);
            }
        }

        return await sendToken(res, user, "Login successfully");
    } catch (error) {
        console.error("Error in socialLogin:", error);
        return res.status(500).json({ 
            message: "Error in social login", 
            success: false,
            error: error.message 
        });
    }
};