import mongoose from "mongoose";

const markSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    marks: { type: Number, min: 0, required: true },
  },
  { _id: false }
);

const assessmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicProgram",
      required: true,
      index: true,
    },
    branch: { type: String, required: true, trim: true },
    period: { type: Number, required: true, min: 1 },
    subject: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        "Unit Test",
        "Internal Test",
        "Assignment",
        "Practical",
        "Mid Semester",
        "End Semester",
      ],
      required: true,
    },
    date: { type: Date, required: true },
    maxMarks: { type: Number, required: true, min: 1 },
    marks: { type: [markSchema], default: [] },
    rosterStudentIds: { type: [String], default: [] },
    published: { type: Boolean, default: false, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

assessmentSchema.index({ courseId: 1, branch: 1, period: 1, subject: 1 });

export default mongoose.model("Assessment", assessmentSchema);
