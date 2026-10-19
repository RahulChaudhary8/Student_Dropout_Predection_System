
import express from "express";
import Attendance from "../models/Attendance.js";

const router = express.Router();

// Save or update attendance
router.post("/", async (req, res) => {
  try {
    const entries = req.body; // [{ student_id, name, course, status, date }]
    const results = [];

    for (let entry of entries) {
      const filter = { student_id: entry.student_id, date: entry.date };
      const update = {
        $set: {
          name: entry.name,
          course: entry.course,
          status: entry.status,
        },
      };
      const options = { upsert: true, new: true };
      const updated = await Attendance.findOneAndUpdate(filter, update, options);
      results.push(updated);
    }

    res.status(201).json({ message: "Attendance saved/updated", data: results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving attendance", error });
  }
});

// Get aggregate attendance per student
router.get("/aggregate/:student_id", async (req, res) => {
  try {
    const { student_id } = req.params;

    const agg = await Attendance.aggregate([
      { $match: { student_id } },
      {
        $group: {
          _id: "$student_id",
          totalPresent: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
          totalAbsent: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } },
          totalLeave: { $sum: { $cond: [{ $eq: ["$status", "Leave"] }, 1, 0] } },
          totalDays: { $sum: 1 },
        },
      },
    ]);

    res.json(
      agg[0] || { student_id, totalPresent: 0, totalAbsent: 0, totalLeave: 0, totalDays: 0 }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error aggregating attendance" });
  }
});

// Get full attendance history for one student (used by the calendar view)
router.get("/:student_id", async (req, res) => {
  try {
    const { student_id } = req.params;
    const records = await Attendance.find({ student_id }).sort({ date: 1 });
    res.json(records); // [{ student_id, name, course, status, date }, ...]
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching attendance" });
  }
});

export default router;
