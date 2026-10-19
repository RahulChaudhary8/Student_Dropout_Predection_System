import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    // ---- System-generated / internal fields ----
    studentId: { type: String, unique: true },

    // ---- Basic Information ----
    fullName: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    fathersName: { type: String, required: true },
    mothersName: { type: String, required: true },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    category: {
      type: String,
      enum: ["General", "OBC", "SC", "ST", "EWS"],
      required: true,
    },
    aadharNumber: { type: String, required: true, match: /^[0-9]{12}$/ },
    photo: { type: String },
    signature: { type: String },

    // ---- Contact Information ----
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    permanentAddress: { type: String, required: true },
    currentAddress: { type: String, required: true },
    parentContactNumber: { type: String, required: true },
    parentEmergencyNumber: { type: String, required: true },

    // ---- Academic Information ----
    courseApplied: { type: String, required: true },
    branchSpecialization: { type: String },
    previousQualification: {
      type: String,
      enum: ["10th", "12th", "Diploma"],
      required: true,
    },
    boardUniversityName: { type: String, required: true },
    yearOfAddmission: { type: Number, required: true },
    yearOfPassing: { type: Number, required: true },
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

    // ---- Documents (file paths/URLs from multer) ----
    marksheet10th: { type: String },
    marksheet12th: { type: String },
    transferCertificate: { type: String },
    migrationCertificate: { type: String },
    casteCertificate: { type: String },
    incomeCertificate: { type: String },

    // ---- Other ----
    nationality: { type: String, required: true },
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