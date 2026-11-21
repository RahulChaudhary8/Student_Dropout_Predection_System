import express from "express";
import rateLimit from "express-rate-limit";
import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import QuizSubmission from "../models/QuizSubmission.js";
import Student from "../models/Student.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { calculateDistance } from "../utils/calculateDistance.js";

const router = express.Router();
const quizRateLimit = rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

router.use(quizRateLimit);

const exactMatch = (value) =>
  new RegExp(`^\\s*${String(value).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i");

const getStudentQuizScope = (student) => {
  const course = student.courseApplied?.trim();
  if (!course) return null;

  const scope = { courseApplied: exactMatch(course) };
  const branch = student.branchSpecialization?.trim();
  scope.$or = [{ branchSpecialization: { $in: ["", null] } }];
  if (branch) scope.$or.push({ branchSpecialization: exactMatch(branch) });
  return scope;
};

const findActiveQuizForStudent = async (studentId, quizId) => {
  const student = await Student.findById(studentId).select(
    "fullName email courseApplied branchSpecialization"
  );
  if (!student) return { student: null, quiz: null };

  const scope = getStudentQuizScope(student);
  if (!scope) return { student, quiz: null };

  const now = new Date();
  const query = {
    ...scope,
    isActive: true,
    startTime: { $lte: now },
    endTime: { $gte: now },
  };
  if (quizId) query._id = quizId;

  const quiz = await Quiz.findOne(query).sort({ startTime: -1 });
  return { student, quiz };
};

router.post("/create", verifyToken, requireRole("mentor"), async (req, res) => {
  try {
    const {
      title,
      description,
      courseApplied,
      branchSpecialization,
      latitude,
      longitude,
      allowedRadius,
      startTime,
      endTime,
    } = req.body;
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof courseApplied !== "string" ||
      !courseApplied.trim() ||
      latitude === undefined ||
      longitude === undefined ||
      allowedRadius === undefined ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({ error: "Quiz title, course, location and schedule are required" });
    }

    const normalizedCourse = courseApplied.trim();
    const normalizedBranch = typeof branchSpecialization === "string"
      ? branchSpecialization.trim()
      : "";
    const coursePattern = exactMatch(normalizedCourse);
    const courseExists = await Student.exists({ courseApplied: coursePattern });
    if (!courseExists) {
      return res.status(400).json({ error: "No students are enrolled in the selected course" });
    }

    if (normalizedBranch) {
      const branchExists = await Student.exists({
        courseApplied: coursePattern,
        branchSpecialization: exactMatch(normalizedBranch),
      });
      if (!branchExists) {
        return res.status(400).json({ error: "No students are enrolled in the selected branch" });
      }
    }

    const quizLatitude = Number(latitude);
    const quizLongitude = Number(longitude);
    const radius = Number(allowedRadius);
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (
      !Number.isFinite(quizLatitude) ||
      quizLatitude < -90 ||
      quizLatitude > 90 ||
      !Number.isFinite(quizLongitude) ||
      quizLongitude < -180 ||
      quizLongitude > 180 ||
      !Number.isFinite(radius) ||
      radius <= 0
    ) {
      return res.status(400).json({ error: "Enter valid coordinates and a positive radius" });
    }

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ error: "Enter valid quiz start and end date/time" });
    }
    if (end <= start) {
      return res.status(400).json({ error: "End date and time must be after the start date and time" });
    }

    const quiz = await Quiz.create({
      title: String(title).trim().slice(0, 150),
      description: String(description || "").trim().slice(0, 1000),
      courseApplied: normalizedCourse,
      branchSpecialization: normalizedBranch,
      latitude: quizLatitude,
      longitude: quizLongitude,
      allowedRadius: radius,
      startTime: start,
      endTime: end,
      createdBy: req.user.id,
      isActive: true,
    });
    res.status(201).json({ message: "Quiz created", quiz });
  } catch (error) {
    console.error("Failed to create quiz:", error);
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create quiz" });
  }
});

router.get("/active", verifyToken, requireRole("student"), async (req, res) => {
  const { quiz } = await findActiveQuizForStudent(req.user.id);
  if (!quiz) return res.status(404).json({ error: "No active quiz available for your course or branch" });
  res.json({ quiz });
});

router.get("/check-attempt", verifyToken, requireRole("student"), async (req, res) => {
  const { quiz } = await findActiveQuizForStudent(req.user.id, req.query.quizId);
  if (!quiz) return res.status(404).json({ submitted: false, error: "No active quiz available for your course or branch" });
  const existing = await QuizSubmission.findOne({ quizId: quiz._id, studentId: req.user.id });
  res.json({ submitted: Boolean(existing), quizId: quiz._id, quiz });
});

router.post("/submit", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const { quizId, latitude, longitude, answers } = req.body;
    const now = new Date();

    const { student, quiz } = await findActiveQuizForStudent(req.user.id, quizId);
    if (!student) return res.status(404).json({ error: "Student not found" });
    if (!quiz) {
      return res.status(403).json({ error: "This quiz is not active or is not assigned to your course or branch" });
    }

    const studentLatitude = Number(latitude);
    const studentLongitude = Number(longitude);
    if (!Number.isFinite(studentLatitude) || !Number.isFinite(studentLongitude)) {
      return res.status(400).json({ error: "Valid student location is required" });
    }

    const distance = calculateDistance(studentLatitude, studentLongitude, quiz.latitude, quiz.longitude);
    if (distance > quiz.allowedRadius) {
      return res.status(403).json({ error: "You are outside the permitted quiz area." });
    }

    const alreadySubmitted = await QuizSubmission.findOne({ quizId: quiz._id, studentId: req.user.id });
    if (alreadySubmitted) return res.status(409).json({ error: "You have already submitted this quiz." });

    if (!Array.isArray(answers) || answers.length !== 10) {
      return res.status(400).json({ error: "Exactly 10 answers are required" });
    }

    const normalizedAnswers = answers.map((answer) => ({
      questionId: answer.questionId,
      selectedOption: String(answer.selectedOption).toUpperCase(),
    }));

    if (normalizedAnswers.some((answer) => !["A", "B", "C", "D"].includes(answer.selectedOption))) {
      return res.status(400).json({ error: "Invalid selected option" });
    }

    const questionIds = normalizedAnswers.map((answer) => answer.questionId);
    const validQuestions = await Question.countDocuments({ _id: { $in: questionIds } });
    if (validQuestions !== 10 || new Set(questionIds.map(String)).size !== 10) {
      return res.status(400).json({ error: "Invalid quiz answers" });
    }

    await QuizSubmission.create({
      quizId: quiz._id,
      studentId: student._id,
      studentName: student.fullName,
      email: student.email,
      answers: normalizedAnswers,
      latitude: studentLatitude,
      longitude: studentLongitude,
      distanceFromCenter: Math.round(distance),
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || "",
      submittedAt: now,
      status: "completed",
    });

    res.status(201).json({ message: "Quiz Submitted Successfully", success: true });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ error: "You have already submitted this quiz." });
    res.status(400).json({ error: error.message });
  }
});

router.get("/mentor", verifyToken, requireRole("mentor"), async (req, res) => {
  const quizzes = await Quiz.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
  res.json({ quizzes });
});

router.get("/mentor/targets", verifyToken, requireRole("mentor"), async (req, res) => {
  const courses = await Student.aggregate([
    { $match: { courseApplied: { $type: "string", $regex: "\\S" } } },
    {
      $group: {
        _id: "$courseApplied",
        branches: { $addToSet: "$branchSpecialization" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    targets: courses.map((item) => ({
      course: item._id.trim(),
      branches: [...new Set(
        item.branches
          .filter((branch) => typeof branch === "string" && branch.trim())
          .map((branch) => branch.trim())
      )].sort((a, b) => a.localeCompare(b)),
    })),
  });
});

router.get("/mentor/submissions", verifyToken, requireRole("mentor"), async (req, res) => {
  const ownedQuizIds = await Quiz.distinct("_id", { createdBy: req.user.id });
  const submissions = await QuizSubmission.find({ quizId: { $in: ownedQuizIds } })
    .populate("quizId", "title")
    .sort({ submittedAt: -1 });
  res.json({ submissions });
});

router.get("/mentor/submission/:id", verifyToken, requireRole("mentor"), async (req, res) => {
  const submission = await QuizSubmission.findById(req.params.id)
    .populate("quizId", "title description latitude longitude allowedRadius createdBy")
    .populate("answers.questionId", "questionText optionA optionB optionC optionD category");
  if (!submission) return res.status(404).json({ error: "Submission not found" });
  if (String(submission.quizId?.createdBy) !== String(req.user.id)) {
    return res.status(403).json({ error: "You cannot access this submission" });
  }
  res.json({ submission });
});

const getRandomQuestions = async (req, res) => {
  if (!req.query.quizId) {
    return res.status(400).json({ error: "quizId is required" });
  }
  const { quiz } = await findActiveQuizForStudent(req.user.id, req.query.quizId);
  if (!quiz) {
    return res.status(403).json({ error: "This quiz is not assigned to your course or branch" });
  }

  const count = Math.min(Math.max(Number(req.query.count) || 10, 1), 50);
  const questions = await Question.aggregate([{ $sample: { size: count } }]);
  res.json({ questions: questions.map((q) => ({
    _id: q._id,
    questionText: q.questionText,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
  })) });
};

router.get("/questions/random", verifyToken, requireRole("student"), getRandomQuestions);
router.get("/random", verifyToken, requireRole("student"), getRandomQuestions);

router.get("/submissions", verifyToken, requireRole("mentor"), async (req, res) => {
  const ownedQuizIds = await Quiz.distinct("_id", { createdBy: req.user.id });
  const submissions = await QuizSubmission.find({ quizId: { $in: ownedQuizIds } })
    .populate("quizId", "title")
    .sort({ submittedAt: -1 });
  res.json({ submissions });
});

router.get("/submission/:id", verifyToken, requireRole("mentor"), async (req, res) => {
  const submission = await QuizSubmission.findById(req.params.id)
    .populate("quizId", "title description latitude longitude allowedRadius createdBy")
    .populate("answers.questionId", "questionText optionA optionB optionC optionD category");
  if (!submission) return res.status(404).json({ error: "Submission not found" });
  if (String(submission.quizId?.createdBy) !== String(req.user.id)) {
    return res.status(403).json({ error: "You cannot access this submission" });
  }
  res.json({ submission });
});

export default router;
