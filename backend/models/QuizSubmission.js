import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    selectedOption: { type: String, required: true, enum: ["A", "B", "C", "D"] },
  },
  { _id: false }
);

const quizSubmissionSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    studentName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    answers: { type: [answerSchema], required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    distanceFromCenter: { type: Number, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["submitted", "completed"], default: "submitted" },
  },
  { timestamps: true }
);

quizSubmissionSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("QuizSubmission", quizSubmissionSchema);
