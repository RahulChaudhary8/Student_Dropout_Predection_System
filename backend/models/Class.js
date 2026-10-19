import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
    {
        branch: {
            type: String,
            required: true,
            trim: true, // e.g. "CSE", "ECE", "Mechanical"
        },
        year: {
            type: String,
            required: true,
            trim: true, // e.g. "1st Year", "2nd Year", "3rd Year", "4th Year"
        },
        section: {
            type: String,
            trim: true, // e.g. "A", "B" (optional)
            default: "",
        },
    },
    { timestamps: true }
);

// Prevent exact duplicate class entries (same branch+year+section)
classSchema.index({ branch: 1, year: 1, section: 1 }, { unique: true });

const Class = mongoose.model("Class", classSchema);

export default Class;