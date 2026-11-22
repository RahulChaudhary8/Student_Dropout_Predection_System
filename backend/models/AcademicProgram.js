import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subjects: { type: [String], default: [] },
  },
  { _id: false }
);

const academicProgramSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    studyMode: { type: String, enum: ["yearly", "semester"], default: "yearly" },
    periodCount: { type: Number, min: 1, default: 4 },
    branches: { type: [branchSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("AcademicProgram", academicProgramSchema);
