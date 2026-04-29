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
        required: false
    },
    googleId: {
        type: String,
        default:null
    },

    storageUsed: {
      type: Number,
      default: 0
    },

    storageLimit: {
      type: Number,
      default: 0
    },

    plan: {
      type: String,
      enum: ["none", "free", "pro", "premium"],
      default: "none"
    },

    planExpiry: {
      type: Date
    },

    isVerified: {
      type: Boolean,
      default: true,
    },
},{timestamps :true})


userSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) return;

  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
})


userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
}

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;