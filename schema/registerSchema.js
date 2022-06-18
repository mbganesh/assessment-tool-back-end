import mongoose from "mongoose";

const registerSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    color: String,
    mobno: String,
    lastLogin:String,
  },
  {
    timestamps: true,
  }
);

const registerModalCreational = mongoose.model("register", registerSchema);

export default registerModalCreational;
