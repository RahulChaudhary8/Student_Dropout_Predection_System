import express from "express";
import mongoose from "mongoose";
import Intervention from "../models/Intervention.js";
import Student from "../models/Student.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/summary", async (req, res) => {
  try {
    const [total, active, completed, followUpsDue] = await Promise.all([
      Intervention.countDocuments(),
      Intervention.countDocuments({ status: { $in: ["Pending", "Ongoing"] } }),
      Intervention.countDocuments({ status: "Completed" }),
      Intervention.countDocuments({
        followUpDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        status: { $ne: "Completed" },
      }),
    ]);

    res.json({ total, active, completed, followUpsDue });
  } catch (error) {
    console.error("Failed to load intervention summary:", error);
    res.status(500).json({ msg: "Failed to load intervention summary" });
  }
});

router.get("/student/:studentId", async (req, res) => {
  try {
    const intervention = await Intervention.findOne({
      studentId: req.params.studentId,
    }).sort({ updatedAt: -1 });

    res.json(intervention);
  } catch (error) {
    console.error("Failed to load intervention:", error);
    res.status(500).json({ msg: "Failed to load intervention" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      studentId,
      counsellingType,
      counsellor,
      sessionDate,
      followUpDate,
      status,
      outcome,
      notes,
      meetLink,
      riskProbability,
    } = req.body;

    if (!studentId) {
      return res.status(400).json({ msg: "studentId is required" });
    }

    const query = { studentId };
    if (mongoose.isValidObjectId(studentId)) {
      query.$or = [{ studentId }, { _id: studentId }];
      delete query.studentId;
    }
    const student = await Student.findOne(query);
    if (!student) {
      return res.status(404).json({
        msg: `Student not found for intervention (Student ID: ${studentId})`,
      });
    }

    const allowedStatuses = ["Pending", "Ongoing", "Completed", "Cancelled"];
    const allowedOutcomes = ["Pending", "Improved", "Stable", "Needs Follow-up", "Referred"];
    const safeStatus = allowedStatuses.includes(status) ? status : "Pending";
    const safeOutcome = allowedOutcomes.includes(outcome) ? outcome : "Pending";

    const existing = await Intervention.findOne({ studentId: student.studentId });
    const intervention = await Intervention.findOneAndUpdate(
      { studentId: student.studentId },
      {
        studentId: student.studentId,
        studentName: student.fullName,
        counsellingType: String(counsellingType || existing?.counsellingType || ""),
        counsellor: String(counsellor || existing?.counsellor || ""),
        sessionDate: sessionDate ? new Date(sessionDate) : null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        status: safeStatus,
        outcome: safeOutcome,
        notes: String(notes || "").trim().slice(0, 2000),
        meetLink: String(meetLink || "").trim(),
        riskProbability: Number.isFinite(Number(riskProbability))
          ? Number(riskProbability)
          : Number(student.dropout_probability || 0),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    res.json({ msg: "Intervention saved successfully", intervention });
  } catch (error) {
    console.error("Failed to save intervention:", error);
    res.status(500).json({ msg: "Failed to save intervention" });
  }
});

export default router;
