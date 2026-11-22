import express from "express";
import mongoose from "mongoose";
import Mentor from "../models/Mentor.js";
import AcademicProgram from "../models/AcademicProgram.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

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
      .populate("subjectAssignments.courseId", "name branches");
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
      const { courseId, branch: branchName, subjects } = req.body;
      if (
        !mongoose.isValidObjectId(courseId) ||
        typeof branchName !== "string" ||
        !branchName.trim() ||
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
          assignment.branch.toLowerCase() !== branch.name.toLowerCase()
      );
      if (canonicalSubjects.length > 0) {
        mentor.subjectAssignments.push({
          courseId: program._id,
          branch: branch.name,
          subjects: canonicalSubjects,
        });
      }
      await mentor.save();

      const updatedMentor = await Mentor.findById(mentor._id)
        .populate("assignedClasses")
        .populate("subjectAssignments.courseId", "name branches");
      res.json(updatedMentor);
    } catch (error) {
      res.status(500).json({ message: "Error assigning subjects", error: error.message });
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