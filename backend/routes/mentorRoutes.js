import express from "express";
import mongoose from "mongoose";
import Mentor from "../models/Mentor.js";
import AcademicProgram from "../models/AcademicProgram.js";
import Student from "../models/Student.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  exactTextPattern,
  findMentorsForStudentGroup,
  selectMentorForStudentGroup,
} from "../utils/mentorAssignment.js";

const router = express.Router();
let mentorCounter = 1; // server restart hone par reset hoga, DB se sync karna better hai

const generateMentorId = async () => {
  const lastMentor = await Mentor.findOne().sort({ createdAt: -1 });
  let newId = 1;

  if (lastMentor && lastMentor.mentorId) {
    const lastNum = parseInt(lastMentor.mentorId.replace("MT", ""));
    if (!isNaN(lastNum)) {
      newId = lastNum + 1;
    }
  }

  return "MT" + String(newId).padStart(3, "0");
};


// Function to generate random password
const generatePassword = () => crypto.randomBytes(4).toString("hex");

// Add mentor
router.post("/", async (req, res) => {
  try {
    const customMentorId = await generateMentorId(); // ✅ generate MT001 etc
    const randomPassword = generatePassword();
    const generateUserId = () => "MNT" + Math.floor(Math.random() * 10000);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);


    const newMentor = new Mentor({
      ...req.body,
      mentorId: customMentorId, // ✅ save custom ID
      userId: generateUserId(),
      password: hashedPassword,       // save hashed password for login
      plainPassword: randomPassword,
    });

    await newMentor.save();
    res.status(201).json({
      message: "Mentor added successfully",
      mentor: newMentor,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error adding mentor", error });
  }
});

// Get all mentors
router.get("/", async (req, res) => {
  try {
    const mentors = await Mentor.find()
      .populate("assignedClasses")
      .populate("subjectAssignments.courseId", "name branches studyMode periodCount");
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching mentors", error });
  }
});
// Total mentors count
router.get("/count", async (req, res) => {
  try {
    const totalMentors = await Mentor.countDocuments();
    res.json({ totalMentors });
  } catch (err) {
    res.status(500).json({ message: "Error fetching total mentors", error: err });
  }
});


// Update mentor details
router.put("/:id", async (req, res) => {
  try {
    const { userId, password, ...updateData } = req.body;
    const updatedMentor = await Mentor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(updatedMentor);
  } catch (error) {
    res.status(400).json({ message: "Error updating mentor", error });
  }
});

// Toggle Active/Inactive
router.patch("/:id/toggle", async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });

    mentor.active = !mentor.active;
    await mentor.save();
    res.json({ message: "Mentor status updated", mentor });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error });
  }
});

// Assign classes to a mentor (multiple classes supported)
router.patch("/:id/assign-classes", async (req, res) => {
  try {
    const { classIds } = req.body; // array of Class _id strings
    if (!Array.isArray(classIds)) {
      return res.status(400).json({ message: "classIds must be an array" });
    }
    const mentor = await Mentor.findByIdAndUpdate(
      req.params.id,
      { assignedClasses: classIds },
      { new: true }
    ).populate("assignedClasses");

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ message: "Error assigning classes", error: error.message });
  }
});

router.patch(
  "/:id/subject-assignments",
  verifyToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { courseId, branch: branchName, period, subjects } = req.body;
      const hasPeriod = period !== undefined && period !== null && period !== "";
      const normalizedPeriod = hasPeriod ? Number(period) : null;
      if (
        !mongoose.isValidObjectId(courseId) ||
        typeof branchName !== "string" ||
        !branchName.trim() ||
        (hasPeriod && (!Number.isInteger(normalizedPeriod) || normalizedPeriod < 1)) ||
        !Array.isArray(subjects) ||
        subjects.some((subject) => typeof subject !== "string")
      ) {
        return res.status(400).json({ message: "Valid course, branch, and subjects are required" });
      }

      const [mentor, program] = await Promise.all([
        Mentor.findById(req.params.id),
        AcademicProgram.findById(courseId),
      ]);
      if (!mentor) return res.status(404).json({ message: "Mentor not found" });
      if (!program) return res.status(404).json({ message: "Course not found" });
      if (hasPeriod && normalizedPeriod > program.periodCount) {
        return res.status(400).json({ message: "Period is outside this course's configured duration" });
      }

      const branch = program.branches.find(
        (item) => item.name.toLowerCase() === branchName.trim().toLowerCase()
      );
      if (!branch) return res.status(404).json({ message: "Branch not found in this course" });

      const selectedSubjects = [
        ...new Map(
          subjects
            .map((subject) => subject.trim())
            .filter(Boolean)
            .map((subject) => [subject.toLowerCase(), subject])
        ).values(),
      ];
      const canonicalSubjects = selectedSubjects.map((subject) =>
        branch.subjects.find((available) => available.toLowerCase() === subject.toLowerCase())
      );
      if (canonicalSubjects.some((subject) => !subject)) {
        return res.status(400).json({ message: "One or more selected subjects are not in this branch" });
      }

      mentor.subjectAssignments = mentor.subjectAssignments.filter(
        (assignment) =>
          String(assignment.courseId) !== String(program._id) ||
          assignment.branch.toLowerCase() !== branch.name.toLowerCase() ||
          (hasPeriod
            ? Number(assignment.period) !== normalizedPeriod
            : assignment.period !== undefined && assignment.period !== null)
      );
      if (canonicalSubjects.length > 0) {
        mentor.subjectAssignments.push({
          courseId: program._id,
          branch: branch.name,
          ...(hasPeriod ? { period: normalizedPeriod } : {}),
          subjects: canonicalSubjects,
        });
      }
      await mentor.save();

      const studentFilter = {
        courseApplied: exactTextPattern(program.name),
        branchSpecialization: exactTextPattern(branch.name),
      };
      if (hasPeriod) {
        studentFilter[program.studyMode === "semester" ? "semester" : "academicYear"] =
          normalizedPeriod;
      }
      const studentAssignmentResult = canonicalSubjects.length && mentor.active
        ? await Student.updateMany(
            studentFilter,
            { $set: { assignedMentorId: mentor._id } }
          )
        : { matchedCount: 0, modifiedCount: 0 };
      const updatedMentor = await Mentor.findById(mentor._id)
        .populate("assignedClasses")
        .populate("subjectAssignments.courseId", "name branches studyMode periodCount");
      res.json({
        mentor: updatedMentor,
        matchedStudentCount: studentAssignmentResult.matchedCount,
        assignedStudentCount: studentAssignmentResult.modifiedCount,
      });
    } catch (error) {
      res.status(500).json({ message: "Error assigning subjects", error: error.message });
    }
  }
);

router.patch(
  "/:id/branch-assignments",
  verifyToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { courseId, branches } = req.body;
      if (!mongoose.isValidObjectId(courseId) || !Array.isArray(branches) ||
        branches.some((branch) => typeof branch !== "string")) {
        return res.status(400).json({ message: "Valid course and branch list are required" });
      }

      const [mentor, program] = await Promise.all([
        Mentor.findById(req.params.id),
        AcademicProgram.findById(courseId),
      ]);
      if (!mentor) return res.status(404).json({ message: "Mentor not found" });
      if (!program) return res.status(404).json({ message: "Course not found" });

      const selectedBranches = [
        ...new Map(
          branches.map((name) => {
            const branch = program.branches.find(
              (item) => item.name.toLowerCase() === name.trim().toLowerCase()
            );
            return branch ? [branch.name.toLowerCase(), branch] : [name.trim().toLowerCase(), null];
          })
        ).values(),
      ];
      if (selectedBranches.some((branch) => !branch)) {
        return res.status(400).json({ message: "One or more branches are not in this course" });
      }

      const courseAssignments = mentor.subjectAssignments.filter(
        (assignment) => String(assignment.courseId) === String(program._id)
      );
      const selectedNames = new Set(
        selectedBranches.map((branch) => branch.name.toLowerCase())
      );
      const removedAssignments = courseAssignments.filter(
        (assignment) => !selectedNames.has(assignment.branch.toLowerCase())
      );
      const retainedAssignments = courseAssignments.filter(
        (assignment) => selectedNames.has(assignment.branch.toLowerCase())
      );
      const newAssignments = selectedBranches
        .filter(
          (branch) =>
            !retainedAssignments.some(
              (assignment) =>
                assignment.branch.toLowerCase() === branch.name.toLowerCase() &&
                assignment.period == null
            )
        )
        .map((branch) => ({
          courseId: program._id,
          branch: branch.name,
          subjects: [],
        }));
      mentor.subjectAssignments = mentor.subjectAssignments.filter(
        (assignment) => String(assignment.courseId) !== String(program._id)
      );
      mentor.subjectAssignments.push(...retainedAssignments, ...newAssignments);
      await mentor.save();

      let matchedStudentCount = 0;
      let assignedStudentCount = 0;
      if (mentor.active) {
        for (const branch of selectedBranches) {
          const students = await Student.find({
              courseApplied: exactTextPattern(program.name),
              branchSpecialization: exactTextPattern(branch.name),
            });
          matchedStudentCount += students.length;
          const groups = new Map();
          for (const student of students) {
            const period =
              program.studyMode === "semester" ? student.semester : student.academicYear;
            const key = period ?? "";
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(student);
          }
          for (const [periodKey, group] of groups) {
            const period = periodKey === "" ? null : Number(periodKey);
            const candidates = await findMentorsForStudentGroup(
              program.name,
              branch.name,
              period
            );
            const assignedMentor = selectMentorForStudentGroup(
              program.name,
              branch.name,
              candidates,
              period
            );
            if (!assignedMentor) continue;

            const result = await Student.updateMany(
              { _id: { $in: group.map((student) => student._id) } },
              { $set: { assignedMentorId: assignedMentor._id } }
            );
            assignedStudentCount += result.modifiedCount;
          }
        }
      }

      for (const assignment of removedAssignments) {
        const affectedStudents = await Student.find({
          courseApplied: exactTextPattern(program.name),
          branchSpecialization: exactTextPattern(assignment.branch),
          assignedMentorId: mentor._id,
        });
        for (const student of affectedStudents) {
          const alternatives = await findMentorsForStudentGroup(
            student.courseApplied,
            student.branchSpecialization,
            student.academicYear ?? student.semester
          );
          const replacement = selectMentorForStudentGroup(
            student.courseApplied,
            student.branchSpecialization,
            alternatives,
            student.academicYear ?? student.semester
          );
          student.assignedMentorId = replacement?._id ?? null;
          await student.save();
        }
      }

      const updatedMentor = await Mentor.findById(mentor._id)
        .populate("assignedClasses")
        .populate("subjectAssignments.courseId", "name branches studyMode periodCount");
      res.json({
        mentor: updatedMentor,
        matchedStudentCount,
        assignedStudentCount,
      });
    } catch (error) {
      console.error("Error updating mentor branch assignments:", error);
      res.status(500).json({ message: "Failed to update mentor branch assignments" });
    }
  }
);

// Delete mentor
router.delete("/:id", async (req, res) => {
  try {
    await Mentor.findByIdAndDelete(req.params.id);
    res.json({ message: "Mentor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting mentor", error });
  }
});



export default router;