import express from "express";
import AcademicProgram from "../models/AcademicProgram.js";
import Mentor from "../models/Mentor.js";
import Student from "../models/Student.js";
import Quiz from "../models/Quiz.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(verifyToken, requireRole("admin"));

const matchesText = (value) =>
  new RegExp(`^\\s*${String(value).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i");

const findBranch = (program, name) =>
  program.branches.find((branch) => branch.name.toLowerCase() === name.toLowerCase());

router.get("/", async (req, res) => {
  try {
    const programs = await AcademicProgram.find().sort({ name: 1 });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses and subjects", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    if (!name) return res.status(400).json({ message: "Course name is required" });

    const existing = await AcademicProgram.findOne({ name: matchesText(name) });
    if (existing) return res.status(409).json({ message: "This course already exists" });

    const program = await AcademicProgram.create({ name });
    res.status(201).json(program);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "This course already exists" });
    }
    res.status(500).json({ message: "Error adding course", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const program = await AcademicProgram.findById(req.params.id);
    if (!program) return res.status(404).json({ message: "Course not found" });

    const coursePattern = matchesText(program.name);
    const [hasStudents, hasQuizzes, hasAssignments] = await Promise.all([
      Student.exists({ courseApplied: coursePattern }),
      Quiz.exists({ courseApplied: coursePattern }),
      Mentor.exists({ "subjectAssignments.courseId": program._id }),
    ]);
    if (hasStudents || hasQuizzes || hasAssignments) {
      return res.status(409).json({
        message: "This course is used by students, quizzes, or mentor assignments and cannot be deleted.",
      });
    }

    await program.deleteOne();
    res.json({ message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting course", error: error.message });
  }
});

router.post("/:id/branches", async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    if (!name) return res.status(400).json({ message: "Branch name is required" });

    const program = await AcademicProgram.findById(req.params.id);
    if (!program) return res.status(404).json({ message: "Course not found" });
    if (findBranch(program, name)) {
      return res.status(409).json({ message: "This branch already exists in the course" });
    }

    program.branches.push({ name, subjects: [] });
    await program.save();
    res.status(201).json(program);
  } catch (error) {
    res.status(500).json({ message: "Error adding branch", error: error.message });
  }
});

router.delete("/:id/branches", async (req, res) => {
  try {
    const program = await AcademicProgram.findById(req.params.id);
    if (!program) return res.status(404).json({ message: "Course not found" });

    const branchName = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const branch = findBranch(program, branchName);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    const branchPattern = matchesText(branch.name);
    const [hasStudents, hasQuizzes, hasAssignments] = await Promise.all([
      Student.exists({
        courseApplied: matchesText(program.name),
        branchSpecialization: branchPattern,
      }),
      Quiz.exists({
        courseApplied: matchesText(program.name),
        branchSpecialization: branchPattern,
      }),
      Mentor.exists({
        subjectAssignments: { $elemMatch: { courseId: program._id, branch: branch.name } },
      }),
    ]);
    if (hasStudents || hasQuizzes || hasAssignments) {
      return res.status(409).json({
        message: "This branch is used by students, quizzes, or mentor assignments and cannot be deleted.",
      });
    }

    program.branches = program.branches.filter(
      (item) => item.name.toLowerCase() !== branch.name.toLowerCase()
    );
    await program.save();
    res.json(program);
  } catch (error) {
    res.status(500).json({ message: "Error deleting branch", error: error.message });
  }
});

router.post("/:id/subjects", async (req, res) => {
  try {
    const branchName = typeof req.body.branch === "string" ? req.body.branch.trim() : "";
    const subjectName = typeof req.body.name === "string" ? req.body.name.trim() : "";
    if (!branchName || !subjectName) {
      return res.status(400).json({ message: "Branch and subject name are required" });
    }

    const program = await AcademicProgram.findById(req.params.id);
    if (!program) return res.status(404).json({ message: "Course not found" });
    const branch = findBranch(program, branchName);
    if (!branch) return res.status(404).json({ message: "Branch not found" });
    if (branch.subjects.some((subject) => subject.toLowerCase() === subjectName.toLowerCase())) {
      return res.status(409).json({ message: "This subject already exists in the branch" });
    }

    branch.subjects.push(subjectName);
    await program.save();
    res.status(201).json(program);
  } catch (error) {
    res.status(500).json({ message: "Error adding subject", error: error.message });
  }
});

router.delete("/:id/subjects", async (req, res) => {
  try {
    const branchName = typeof req.body.branch === "string" ? req.body.branch.trim() : "";
    const subjectName = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const program = await AcademicProgram.findById(req.params.id);
    if (!program) return res.status(404).json({ message: "Course not found" });
    const branch = findBranch(program, branchName);
    if (!branch) return res.status(404).json({ message: "Branch not found" });
    const subject = branch.subjects.find((item) => item.toLowerCase() === subjectName.toLowerCase());
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    await Mentor.updateMany(
      {
        subjectAssignments: {
          $elemMatch: { courseId: program._id, branch: branch.name, subjects: subject },
        },
      },
      { $pull: { "subjectAssignments.$[assignment].subjects": subject } },
      {
        arrayFilters: [
          { "assignment.courseId": program._id, "assignment.branch": branch.name },
        ],
      }
    );

    branch.subjects = branch.subjects.filter((item) => item !== subject);
    await program.save();
    res.json(program);
  } catch (error) {
    res.status(500).json({ message: "Error deleting subject", error: error.message });
  }
});

export default router;
