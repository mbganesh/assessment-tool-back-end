import mongoose from "mongoose";

const studentsDetailsSchema = new mongoose.Schema(
  {
    studentID: String,
    studentName: String,
    studentMobNo: String,
    studentGender: String,
    studentMail: String,
    studentAddress: String,
    studentColor:String,
  },
  {
    timestamps: true,
  }
);

export default studentsDetailsSchema;
