import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    // ---- System-generated / internal fields ----
    studentId: { type: String, unique: true },

    // ---- Basic Information ----
    fullName: { type: String, required: true },
    dateOfBirth: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    fathersName: { type: String },
    mothersName: { type: String },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    category: {
      type: String,
      enum: ["General", "OBC", "SC", "ST", "EWS"],
    },
    aadharNumber: { type: String, match: /^[0-9]{12}$/ },

    // ---- Contact Information ----
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String },
    permanentAddress: { type: String },
    currentAddress: { type: String },
    parentContactNumber: { type: String },
    parentEmergencyNumber: { type: String },

    // ---- Academic Information ----
    courseApplied: { type: String, required: true },
    branchSpecialization: { type: String },
    academicYear: { type: Number, min: 1 },
    semester: { type: Number, min: 1 },
    previousQualification: {
      type: String,
      enum: ["10th", "12th", "Diploma"],
    },
    boardUniversityName: { type: String },
    yearOfAddmission: { type: Number },
    yearOfPassing: { type: Number },
    entranceExamScore: { type: String },

    // ---- Family Background ----
    fatherOccupation: { type: String },
    motherOccupation: { type: String },
    annualFamilyIncome: { type: Number },

    // ---- Fees & Financial Information ----
    totalCourseFees: { type: Number, default: 0 },
    feeStructure: {
      type: String,
      enum: ["Semester-wise", "Yearly", "One-time"],
    },
    scholarshipApplicable: { type: String, enum: ["Yes", "No"], default: "No" },
    paymentMode: { type: String, enum: ["Online", "Cash", "Cheque", "DD"] },

    // Payment tracking (system-managed, updated after registration)
    paidFees: { type: Number, default: 0 },
    dueDate: { type: String, default: null },

    // Fee status — recomputed and persisted every time a payment is saved
    // (see POST /api/payments). Kept in sync with paidFees/totalCourseFees/
    // dueDate rather than being independently editable.
    tuitionFeesUpToDate: {
      type: String,
      enum: ["Yes", "No", "Overdue"],
      default: "No",
    },

    // ---- Other ----
    nationality: { type: String },
    religion: { type: String },
    hostelRequired: { type: String, enum: ["Yes", "No"], default: "No" },
    transportRequired: { type: String, enum: ["Yes", "No"], default: "No" },

    // ---- Auth ----
    password: { type: String, required: true },
    plainPassword: { type: String },

    // ---- Mentorship / Performance tracking (system-managed) ----
    assignedMentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      default: null,
    },
    attendance: { type: Number, default: 0 },
    testScore: { type: Number, default: 0 },

    // ---- ML Model Input Features (system-managed) ----
    mlFeatures: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Prediction fields (system-managed, updated after ML model prediction)
    prediction: { type: String, default: "N/A" },
    dropout_probability: { type: Number, default: 0 },
    risk: { type: String, enum: ["Low", "Moderate", "High"], default: "Low" },
    explanations: { type: Array, default: [] },
    predictedAt: { type: Date },

    // ---- Auto-created via Excel upload (system-managed) ----
    isPlaceholder: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);
export default Student;