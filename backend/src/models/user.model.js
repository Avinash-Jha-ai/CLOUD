import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema =mongoose.Schema({
    avatar:{
      type:String,
      default:"https://ik.imagekit.io/Avinash/youtube/default-avatar.png"
    },
    fullname :{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase: true,
    },
    password:{
        type:String,
        required: function () {
            return !(this.googleId || this.githubId);
        }
    },
    googleId: {
        type: String,
        default:null
    },
    githubId: {
        type: String,
        default:null
    },

    storageUsed: {
      type: Number,
      default: 0
    },

    storageLimit: {
      type: Number,
      default: 1 * 1024 * 1024 * 1024  // 1 GB default (free tier)
    },

    plan: {
      type: String,
      enum: ["none", "free", "pro", "premium"],
      default: "free"
    },

    planExpiry: {
      type: Date
    },

    otp: String,
    otpExpiry: Date,

    isVerified: {
      type: Boolean,
      default: function () {
        return (this.googleId || this.githubId) ? true : false;
      },
    },
},{timestamps :true})


userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
})


userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
}

const userModel =mongoose.model("user",userSchema);

export default userModel;