import mongoose from "mongoose";

const timetableEntrySchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicProgram",
      required: true,
    },
    branch: { type: String, required: true, trim: true },
    period: { type: Number, required: true, min: 1 },
    dayOfWeek: {
      type: String,
      required: true,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
    startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    slotType: { type: String, required: true, enum: ["class", "break", "lunch"] },
    title: { type: String, trim: true, default: "" },
    subject: { type: String, trim: true, default: "" },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor", default: null },
    room: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("TimetableEntry", timetableEntrySchema);
