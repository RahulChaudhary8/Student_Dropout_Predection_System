import mongoose from "mongoose";

const semesterPublicationSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicProgram",
      required: true,
    },
    branch: { type: String, required: true },
    period: { type: Number, required: true, min: 1 },
    studentIds: { type: [String], default: [] },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

semesterPublicationSchema.index(
  { courseId: 1, branch: 1, period: 1 },
  { unique: true }
);

export default mongoose.model("SemesterPublication", semesterPublicationSchema);
