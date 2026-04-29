import userModel from "../models/user.model.js";
import {uploadFile} from "../services/storage.service.js"
import { generateOTP } from "../utils/generateOtp.js";
import {sendEmail} from "../services/gmail.service.js"
import jwt from "jsonwebtoken";
import { config } from "../configs/config.js";



const sendToken = async (res, user, message) => {
    try {
        const token = jwt.sign(
            { id: user.id },
            config.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,    
            sameSite: "none"   
        });

        return res.status(200).json({
            message,
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
        console.log("error in send token:", error);
    }
};

export const emailTemplate = (fullname, email, otp) => {
  return `
  <div style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial;">
    <table align="center" width="100%" style="max-width:600px;background:#fff;border-radius:10px;overflow:hidden;">
      
      <tr>
        <td style="background:linear-gradient(135deg,#ef4444,#991b1b);padding:20px;text-align:center;color:white;">
          <h1>CLOUDAVI Verification</h1>
        </td>
      </tr>

      <tr>
        <td style="padding:30px;text-align:center;">
          <h2>Hello ${fullname}</h2>
          <p style="color:#555;font-size:14px;">
            We received a request to verify your account with email:
            <br><b>${email}</b>
          </p>

          <div style="margin:25px 0;">
            <span style="background:#f1f5f9;padding:15px 25px;
              font-size:28px;letter-spacing:6px;font-weight:bold;
              color:#4f46e5;border-radius:8px;">
              ${otp}
            </span>
          </div>

          <p style="font-size:13px;color:#777;">
            OTP valid for 5 minutes. Do not share it.
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#f9fafb;padding:15px;text-align:center;font-size:12px;color:#888;">
          © ${new Date().getFullYear()} Your App
        </td>
      </tr>

    </table>
  </div>
  `;
};


export const register =async (req,res)=>{
    const {fullname,email,password} =req.body;
    const file = req.file;
    
    try{

        const isAlreadyUserExist =await userModel.findOne({email});

        if (isAlreadyUserExist) {
            return res.status(400).json({
                message: isAlreadyUserExist.isVerified 
                    ? "User already exists. Please login instead." 
                    : "User already exists but is not verified. Please verify your email.",
                success: false
            });
        }

        let avatarUrl ="";

        if(file){
            const result = await uploadFile(file, "CLOUD/avatar");
            avatarUrl=result.secure_url
        }

        const user =await userModel.create({
            fullname,
            email,
            password,
            avatar: avatarUrl || "https://ik.imagekit.io/Avinash/youtube/default-avatar.png"
        })

        await sendToken(res,user,"login successfully");

    }catch(error){
        console.log("error in register : ",error);
        return res.status(500).json({
            message:"error in register",
            success:false,
            error:error
        })
    }
}

export const sentotp = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "user not found",
                success: false
            });
        }

        const otp = generateOTP();
        const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        await sendEmail(
            user.email,
            "Verify your account",
            emailTemplate(user.fullname, user.email, otp)
        );

        return res.status(200).json({
            message: "otp sent successfully",
            success: true
        });

    } catch (error) {
        console.log("error in sentotp : ", error);
        return res.status(500).json({
            message: "error in sent otp",
            success: false,
            error: error.message
        });
    }
};

export const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "user not found",
                success: false
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                message: "email already verified",
                success: false
            });
        }

        if (user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({
                message: "invalid or expired otp",
                success: false
            });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        return res.status(200).json({
            message: "email verified successfully",
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
        console.log("error in verifyEmail : ", error);
        return res.status(500).json({
            message: "error in verify email",
            success: false,
            error: error.message
        });
    }
};

export const login =async (req,res)=>{
    const {email,password}=req.body;

    try{

        const user =await userModel.findOne({email});

        if(!user){
            return res.status(400).json({
                message:"user not found",
                success:true,
            })
        }

        const match =await user.comparePassword(password);

        if(!match){
            return res.status(400).json({
                message:"password incorrect",
                success:false
            })
        }

        sendToken(res,user,"login successfully");
    }catch(error){
        console.log("error in login : ",error);
        return res.status(500).json({
            message:"error in login",
            success:false,
            error:error
        })
    }
}

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
    const { email, fullname, avatar, providerId, provider } = req.body;
    try {
        let user = await userModel.findOne({ email });

        if (!user) {
            const userData = {
                email,
                fullname,
                avatar: avatar || "https://ik.imagekit.io/Avinash/youtube/default-avatar.png",
                isVerified: true
            };
            if (provider === 'google') userData.googleId = providerId;
            if (provider === 'github') userData.githubId = providerId;
            
            user = await userModel.create(userData);
        } else {
            
            let updated = false;
            if (provider === 'google' && !user.googleId) { user.googleId = providerId; updated = true; }
            if (provider === 'github' && !user.githubId) { user.githubId = providerId; updated = true; }
            if (updated) await user.save();
        }

        await sendToken(res, user, "Login successfully");
    } catch (error) {
        console.log("error in socialLogin : ", error);
        return res.status(500).json({
            message: "error in social login",
            success: false,
            error: error
        });
    }
};
