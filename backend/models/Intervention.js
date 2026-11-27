import mongoose from "mongoose";

const interventionSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    counsellingType: { type: String, default: "" },
    counsellor: { type: String, default: "" },
    sessionDate: { type: Date, default: null },
    followUpDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ["Pending", "Ongoing", "Completed", "Cancelled"],
      default: "Pending",
    },
    outcome: {
      type: String,
      enum: ["Pending", "Improved", "Stable", "Needs Follow-up", "Referred"],
      default: "Pending",
    },
    notes: { type: String, default: "", maxlength: 2000 },
    meetLink: { type: String, default: "" },
    riskProbability: { type: Number, default: 0 },
  },
  { timestamps: true }
);

interventionSchema.index({ studentId: 1, updatedAt: -1 });

export default mongoose.model("Intervention", interventionSchema);
