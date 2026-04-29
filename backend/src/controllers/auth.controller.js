import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken"
import {config} from "../configs/config.js"
import { uploadFile } from "../services/storage.service.js";
import { generateOTP } from "../utils/generateOtp.js";
import { sendEmail } from "../services/email.service.js";


const sendToken = async (res, user, message) => {
    try {
        const token = jwt.sign(
            { id: user.id },
            config.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,     // true in production (https)
            sameSite: "none"   // "none" for cross-origin
        });

        return res.status(200).json({
            message,
            success: true,
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                avatar: user.avatar,
                isVerified: user.isVerified
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
        <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:20px;text-align:center;color:white;">
          <h1>Verify Your Email</h1>
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


export const register = async (req, res) => {
  const { fullname, username, email, password } = req.body;
  const name = fullname || username;
  const avatar = req.file;

  try {
    // 1. Check user exists
    const isUserAlreadyExist = await userModel.findOne({ email });

    if (isUserAlreadyExist) {
      return res.status(400).json({
        message: "User already exists with this email",
        success: false,
      });
    }

    if (!name) {
      return res.status(400).json({
        message: "Fullname or username is required",
        success: false,
      });
    }

    // 2. Upload avatar (optional)
    let avatarUrl = "";
    if (avatar) {
      const uploaded = await uploadFile({
        buffer: avatar.buffer,
        fileName: avatar.originalname,
      });
      avatarUrl = uploaded.url;
    }
    

    // 3. Generate OTP
    const otp = generateOTP();

    // 4. Create user
    const userData = {
      fullname: name,
      email,
      password,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000, // 5 min
    };

    if (avatarUrl) {
      userData.avatar = avatarUrl;
    }

    const user = await userModel.create(userData);


    // 5. Send Email (✅ FIXED CALL)
    await sendEmail(
      email,
      "Verify your email",
      emailTemplate(fullname, email, otp)
    );

    return res.status(200).json({
      message: "OTP sent to email",
      success: true,
    });

  } catch (error) {
    console.log("error in register:", error);
    return res.status(500).json({
      message: "error in register",
      success: false,
      error,
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
                success:false
            })
        }

        const match =await user.comparePassword(password);

        if(!match){
            return res.status(400).json({
                message:"password incorrect",
                success:false
            })
        }

        if(user.isVerified===false){
            return res.status(400).json({
                message:"verify you email",
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

export const getMe =async (req,res)=>{
    const user =req.user;

    return res.status(200).json({
        message:"user data fetch successfully",
        success:true,
        user
    })
}

export const logout =async (req,res)=>{
    await res.clearCookie("token");

    return res.status(200).json({
        message:"user logout successfully",
        success:true,
    })
}

export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified. Please login.", success: false });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP", success: false });
    }


    if (user.otpExpiry < Date.now()) {
      await userModel.findByIdAndDelete(user._id);
      return res.status(400).json({ message: "OTP expired. Please register again.", success: false });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    return res.status(200).json({
      message: "Email verified successfully",
      success: true
    });

  } catch (error) {
    console.log("Verify Email Error:", error);
    return res.status(500).json({
      message: "Error in email verification",
      success: false,
      error: error.message
    });
  }
};