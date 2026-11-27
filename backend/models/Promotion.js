import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, index: true },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicProgram",
      required: true,
    },
    branch: { type: String, required: true },
    fromPeriod: { type: Number, required: true },
    toPeriod: { type: Number, required: true },
    promotedBy: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

promotionSchema.index({ studentId: 1, fromPeriod: 1, toPeriod: 1 }, { unique: true });

export default mongoose.model("Promotion", promotionSchema);
