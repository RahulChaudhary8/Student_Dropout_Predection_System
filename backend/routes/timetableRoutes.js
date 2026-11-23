import express from "express";
import mongoose from "mongoose";
import AcademicProgram from "../models/AcademicProgram.js";
import Mentor from "../models/Mentor.js";
import Student from "../models/Student.js";
import TimetableEntry from "../models/TimetableEntry.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { exactTextPattern } from "../utils/mentorAssignment.js";

const router = express.Router();
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const fail = (status, message) => {
  const error = new Error(message);
  error.status = status;
  throw error;
};

const populatedEntries = (query) =>
  query
    .populate("courseId", "name studyMode periodCount")
    .populate("mentorId", "firstName lastName mentorId");

const validateEntry = async (data) => {
  const {
    courseId,
    branch: requestedBranch,
    period,
    dayOfWeek,
    startTime,
    endTime,
    slotType,
  } = data;

  if (!mongoose.isValidObjectId(courseId)) fail(400, "Select a valid course");
  if (!DAYS.includes(dayOfWeek)) fail(400, "Select a valid day");
  if (!TIME_PATTERN.test(startTime) || !TIME_PATTERN.test(endTime) || endTime <= startTime) {
    fail(400, "Enter a valid time range; end time must be after start time");
  }
  if (!["class", "break", "lunch"].includes(slotType)) {
    fail(400, "Select class, break, or lunch");
  }

  const program = await AcademicProgram.findById(courseId);
  if (!program) fail(404, "Course not found");
  const branch = program.branches.find(
    (item) => item.name.toLowerCase() === String(requestedBranch || "").trim().toLowerCase()
  );
  if (!branch) fail(400, "Select a branch from this course");

  const normalizedPeriod = Number(period);
  if (
    !Number.isInteger(normalizedPeriod) ||
    normalizedPeriod < 1 ||
    normalizedPeriod > program.periodCount
  ) {
    fail(
      400,
      `${program.studyMode === "semester" ? "Semester" : "Year"} must be between 1 and ${program.periodCount}`
    );
  }

  const entry = {
    courseId: program._id,
    branch: branch.name,
    period: normalizedPeriod,
    dayOfWeek,
    startTime,
    endTime,
    slotType,
    title: slotType === "class" ? "" : String(data.title || (slotType === "lunch" ? "Lunch" : "Break")).trim(),
    subject: "",
    mentorId: null,
    room: String(data.room || "").trim(),
  };

  if (slotType === "class") {
    const subject = branch.subjects.find(
      (item) => item.toLowerCase() === String(data.subject || "").trim().toLowerCase()
    );
    if (!subject) fail(400, "Select a subject assigned to this branch");
    if (!mongoose.isValidObjectId(data.mentorId)) fail(400, "Select a valid mentor");

    const mentor = await Mentor.findById(data.mentorId);
    if (!mentor || !mentor.active) fail(400, "Selected mentor is unavailable");
    const hasSubjectAssignment = mentor.subjectAssignments.some((assignment) => {
      const sameGroup =
        String(assignment.courseId) === String(program._id) &&
        assignment.branch.toLowerCase() === branch.name.toLowerCase();
      const matchesPeriod =
        assignment.period == null || Number(assignment.period) === normalizedPeriod;
      const teachesSubject = (assignment.subjects || []).some(
        (assignedSubject) => assignedSubject.toLowerCase() === subject.toLowerCase()
      );
      return sameGroup && matchesPeriod && teachesSubject;
    });
    if (!hasSubjectAssignment) {
      fail(400, "Selected mentor is not assigned to this subject, branch, and period");
    }

    entry.subject = subject;
    entry.mentorId = mentor._id;
  }

  return entry;
};

const ensureNoConflicts = async (entry, excludedId = null) => {
  const overlapQuery = {
    dayOfWeek: entry.dayOfWeek,
    startTime: { $lt: entry.endTime },
    endTime: { $gt: entry.startTime },
  };
  if (excludedId) overlapQuery._id = { $ne: excludedId };

  const overlaps = await TimetableEntry.find(overlapQuery);
  const sameGroup = (other) =>
    String(other.courseId) === String(entry.courseId) &&
    other.branch.toLowerCase() === entry.branch.toLowerCase() &&
    other.period === entry.period;

  if (overlaps.some(sameGroup)) {
    fail(409, "This course, branch, and year/semester already has a timetable entry at that time");
  }
  if (
    entry.mentorId &&
    overlaps.some(
      (other) => other.slotType === "class" && String(other.mentorId) === String(entry.mentorId)
    )
  ) {
    fail(409, "This mentor already has a class scheduled at that time");
  }
  if (
    entry.room &&
    overlaps.some(
      (other) =>
        other.room &&
        other.room.toLowerCase() === entry.room.toLowerCase() &&
        !sameGroup(other)
    )
  ) {
    fail(409, "This room is already booked at that time");
  }
};

router.get("/", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can view all timetable entries" });
  }
  try {
    const entries = await populatedEntries(
      TimetableEntry.find().sort({ dayOfWeek: 1, startTime: 1 })
    );
    res.json(entries);
  } catch (error) {
    console.error("Failed to fetch timetable:", error);
    res.status(500).json({ message: "Failed to fetch timetable" });
  }
});

router.get("/my", verifyToken, async (req, res) => {
  try {
    let query;
    if (req.user.role === "student") {
      const student = await Student.findById(req.user.id);
      if (!student) return res.status(404).json({ message: "Student not found" });
      const program = await AcademicProgram.findOne({
        name: exactTextPattern(student.courseApplied),
      });
      const period =
        program?.studyMode === "semester" ? student.semester : student.academicYear;
      if (!program || !student.branchSpecialization || !period) return res.json([]);
      query = TimetableEntry.find({
        courseId: program._id,
        branch: exactTextPattern(student.branchSpecialization),
        period,
      });
    } else if (req.user.role === "mentor") {
      const mentor = await Mentor.findById(req.user.id).select("subjectAssignments");
      if (!mentor) return res.status(404).json({ message: "Mentor not found" });
      const breakEntries = mentor.subjectAssignments.map((assignment) => ({
        slotType: { $in: ["break", "lunch"] },
        courseId: assignment.courseId,
        branch: exactTextPattern(assignment.branch),
        ...(assignment.period == null ? {} : { period: assignment.period }),
      }));
      query = TimetableEntry.find({
        $or: [{ mentorId: mentor._id }, ...breakEntries],
      });
    } else {
      return res.status(403).json({ message: "Only mentors and students can view their timetable" });
    }

    const entries = await populatedEntries(query);
    res.json(entries);
  } catch (error) {
    console.error("Failed to fetch personal timetable:", error);
    res.status(500).json({ message: "Failed to fetch timetable" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can manage the timetable" });
  }
  try {
    const entry = await validateEntry(req.body);
    await ensureNoConflicts(entry);
    const created = await TimetableEntry.create(entry);
    const populated = await populatedEntries(TimetableEntry.findById(created._id));
    res.status(201).json(populated);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error("Failed to create timetable entry:", error);
    res.status(500).json({ message: "Failed to create timetable entry" });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can manage the timetable" });
  }
  try {
    if (!mongoose.isValidObjectId(req.params.id)) fail(400, "Invalid timetable entry");
    const currentEntry = await TimetableEntry.findById(req.params.id);
    if (!currentEntry) fail(404, "Timetable entry not found");
    const entry = await validateEntry({ ...currentEntry.toObject(), ...req.body });
    await ensureNoConflicts(entry, currentEntry._id);
    currentEntry.set(entry);
    await currentEntry.save();
    const populated = await populatedEntries(TimetableEntry.findById(currentEntry._id));
    res.json(populated);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error("Failed to update timetable entry:", error);
    res.status(500).json({ message: "Failed to update timetable entry" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can manage the timetable" });
  }
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid timetable entry" });
    }
    const deleted = await TimetableEntry.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Timetable entry not found" });
    res.json({ message: "Timetable entry deleted" });
  } catch (error) {
    console.error("Failed to delete timetable entry:", error);
    res.status(500).json({ message: "Failed to delete timetable entry" });
  }
});

export default router;
