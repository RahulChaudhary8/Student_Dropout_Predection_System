import express from "express";
import mongoose from "mongoose";
import Assessment from "../models/Assessment.js";
import AcademicProgram from "../models/AcademicProgram.js";
import AuditLog from "../models/AuditLog.js";
import Mentor from "../models/Mentor.js";
import Promotion from "../models/Promotion.js";
import SemesterPublication from "../models/SemesterPublication.js";
import Student from "../models/Student.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { exactTextPattern } from "../utils/mentorAssignment.js";
import {
  calculateAssessmentResults,
  calculateSemesterResults,
  gradeForPercentage,
} from "../utils/resultCalculations.js";

const router = express.Router();
const ASSESSMENT_TYPES = [
  "Unit Test",
  "Internal Test",
  "Assignment",
  "Practical",
  "Mid Semester",
  "End Semester",
];

router.use(verifyToken);

const fail = (status, message) => Object.assign(new Error(message), { status });
const manager = (req) => ["admin", "mentor"].includes(req.user?.role);
const isAdmin = (req) => req.user?.role === "admin";

const recordAudit = async (req, action, entityType, entityId, details = {}) => {
  try {
    await AuditLog.create({
      actorId: req.user.id,
      actorRole: req.user.role,
      action,
      entityType,
      entityId: String(entityId),
      details,
    });
  } catch (error) {
    console.error("Could not write result-management audit entry:", error);
  }
};

const getProgramContext = async (courseId, branchName, rawPeriod) => {
  if (!mongoose.isValidObjectId(courseId)) throw fail(400, "A valid course is required");
  const program = await AcademicProgram.findById(courseId);
  if (!program) throw fail(404, "Course not found");
  const branch = program.branches.find(
    (item) => item.name.toLowerCase() === String(branchName || "").trim().toLowerCase()
  );
  if (!branch) throw fail(400, "Select a branch configured for this course");
  const period = Number(rawPeriod);
  if (!Number.isInteger(period) || period < 1 || period > program.periodCount) {
    throw fail(400, `Period must be between 1 and ${program.periodCount}`);
  }
  const periodField = program.studyMode === "semester" ? "semester" : "academicYear";
  return { program, branch, period, periodField };
};

const getCohort = async (context) =>
  Student.find({
    courseApplied: exactTextPattern(context.program.name),
    branchSpecialization: exactTextPattern(context.branch.name),
    $or: [
      { [context.periodField]: context.period },
      {
        academicHistory: {
          $elemMatch: {
            courseApplied: exactTextPattern(context.program.name),
            branchSpecialization: exactTextPattern(context.branch.name),
            period: context.period,
            studyMode: context.program.studyMode,
          },
        },
      },
    ],
  })
    .select("studentId rollNumber registrationNumber fullName courseApplied branchSpecialization semester academicYear")
    .sort({ studentId: 1 });

const getSnapshotCohort = async (context, studentIds) => {
  if (!studentIds?.length) return getCohort(context);
  return Student.find({ studentId: { $in: studentIds } })
    .select("studentId rollNumber registrationNumber fullName courseApplied branchSpecialization semester academicYear")
    .sort({ studentId: 1 });
};

const assertCanManage = async (req, context, subject = null) => {
  if (isAdmin(req)) return;
  if (req.user.role !== "mentor") throw fail(403, "Only admins and mentors can manage marks");
  const mentor = await Mentor.findById(req.user.id).select("subjectAssignments");
  const hasAssignment = mentor?.subjectAssignments?.some((assignment) =>
    String(assignment.courseId) === String(context.program._id) &&
    assignment.branch.toLowerCase() === context.branch.name.toLowerCase() &&
    (assignment.period == null || Number(assignment.period) === context.period) &&
    (!subject || assignment.subjects.some(
      (assignedSubject) => assignedSubject.toLowerCase() === subject.toLowerCase()
    ))
  );
  if (!hasAssignment) throw fail(403, "You are not assigned to this course, branch, period, and subject");
};

const getPublished = async (context) =>
  SemesterPublication.findOne({
    courseId: context.program._id,
    branch: context.branch.name,
    period: context.period,
  });

const getSemesterResults = async (context, students) => {
  const assessments = await Assessment.find({
    courseId: context.program._id,
    branch: context.branch.name,
    period: context.period,
  }).sort({ date: 1, subject: 1 });
  return { assessments, results: calculateSemesterResults(assessments, students) };
};

router.get("/options", async (req, res) => {
  try {
    if (!manager(req)) return res.status(403).json({ message: "Access denied" });
    const programs = await AcademicProgram.find().sort({ name: 1 });
    if (isAdmin(req)) return res.json(programs);

    const mentor = await Mentor.findById(req.user.id).select("subjectAssignments");
    const allowed = new Map();
    for (const assignment of mentor?.subjectAssignments || []) {
      const courseId = String(assignment.courseId);
      if (!allowed.has(courseId)) allowed.set(courseId, new Map());
      const branches = allowed.get(courseId);
      const key = assignment.branch.toLowerCase();
      const existing = branches.get(key) || { periods: new Set(), subjects: new Set() };
      if (assignment.period != null) existing.periods.add(Number(assignment.period));
      for (const subject of assignment.subjects || []) existing.subjects.add(subject.toLowerCase());
      branches.set(key, existing);
    }
    const options = programs
      .filter((program) => allowed.has(String(program._id)))
      .map((program) => ({
        ...program.toObject(),
        branches: program.branches
          .filter((branch) => allowed.get(String(program._id)).has(branch.name.toLowerCase()))
          .map((branch) => {
            const assignment = allowed.get(String(program._id)).get(branch.name.toLowerCase());
            const subjects =
              assignment.subjects.size === 0
                ? branch.subjects
                : branch.subjects.filter((subject) =>
                    assignment.subjects.has(subject.toLowerCase())
                  );
            return { ...branch.toObject(), subjects };
          }),
      }));
    res.json(options);
  } catch (error) {
    console.error("Failed to load result options:", error);
    res.status(500).json({ message: "Failed to load result options" });
  }
});

router.get("/audit", async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Only admins can view result audit logs" });
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json(logs);
  } catch (error) {
    console.error("Failed to load result audit log:", error);
    res.status(500).json({ message: "Failed to load result audit log" });
  }
});

router.get("/cohort", async (req, res) => {
  try {
    if (!manager(req)) return res.status(403).json({ message: "Access denied" });
    const context = await getProgramContext(req.query.courseId, req.query.branch, req.query.period);
    await assertCanManage(req, context);
    const publication = await getPublished(context);
    const students = await getSnapshotCohort(context, publication?.studentIds);
    const { assessments, results } = await getSemesterResults(context, students);
    res.json({
      students,
      assessments,
      results,
      published: Boolean(publication),
      publishedAt: publication?.publishedAt || null,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Failed to load class results" });
  }
});

router.get("/assessments/:id/results", async (req, res) => {
  try {
    if (!manager(req)) return res.status(403).json({ message: "Access denied" });
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) throw fail(404, "Assessment not found");
    const context = await getProgramContext(
      assessment.courseId,
      assessment.branch,
      assessment.period
    );
    await assertCanManage(req, context, assessment.subject);
    const students = await getSnapshotCohort(context, assessment.rosterStudentIds);
    res.json({
      assessment,
      results: calculateAssessmentResults(assessment, students),
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Failed to generate test results" });
  }
});

router.get("/assessments", async (req, res) => {
  try {
    if (!manager(req)) return res.status(403).json({ message: "Access denied" });
    const { program, branch, period } = await getProgramContext(
      req.query.courseId,
      req.query.branch,
      req.query.period
    );
    const assessments = await Assessment.find({
      courseId: program._id,
      branch: branch.name,
      period,
    }).sort({ date: -1, createdAt: -1 });
    res.json(assessments);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Failed to fetch assessments" });
  }
});

router.post("/assessments", async (req, res) => {
  try {
    if (!manager(req)) return res.status(403).json({ message: "Access denied" });
    const { courseId, branch: branchName, period: rawPeriod, subject, title, type, date, maxMarks } = req.body;
    const context = await getProgramContext(courseId, branchName, rawPeriod);
    const canonicalSubject = context.branch.subjects.find(
      (item) => item.toLowerCase() === String(subject || "").trim().toLowerCase()
    );
    const maximum = Number(maxMarks);
    const assessmentDate = new Date(date);
    if (!canonicalSubject) throw fail(400, "Select a subject configured for this branch");
    if (!String(title || "").trim()) throw fail(400, "Assessment title is required");
    if (!ASSESSMENT_TYPES.includes(type)) throw fail(400, "Select a valid assessment type");
    if (!Number.isFinite(maximum) || maximum <= 0) throw fail(400, "Maximum marks must be greater than zero");
    if (Number.isNaN(assessmentDate.getTime())) throw fail(400, "A valid assessment date is required");
    await assertCanManage(req, context, canonicalSubject);
    if (await getPublished(context)) throw fail(409, "This semester result is published and locked");

    const assessment = await Assessment.create({
      courseId: context.program._id,
      branch: context.branch.name,
      period: context.period,
      subject: canonicalSubject,
      title: String(title).trim(),
      type,
      date: assessmentDate,
      maxMarks: maximum,
      createdBy: req.user.id,
    });
    await recordAudit(req, "assessment.created", "Assessment", assessment._id, {
      title: assessment.title,
      subject: assessment.subject,
      type: assessment.type,
    });
    res.status(201).json(assessment);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Failed to create assessment" });
  }
});

router.put("/assessments/:id", async (req, res) => {
  try {
    if (!manager(req)) return res.status(403).json({ message: "Access denied" });
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) throw fail(404, "Assessment not found");
    if (assessment.published) throw fail(409, "Published assessment is locked");
    const context = await getProgramContext(
      assessment.courseId,
      assessment.branch,
      assessment.period
    );
    await assertCanManage(req, context, assessment.subject);
    if (await getPublished(context)) throw fail(409, "This semester result is published and locked");

    const title = req.body.title === undefined ? assessment.title : String(req.body.title).trim();
    const maximum = req.body.maxMarks === undefined ? assessment.maxMarks : Number(req.body.maxMarks);
    const date = req.body.date === undefined ? assessment.date : new Date(req.body.date);
    if (!title) throw fail(400, "Assessment title is required");
    if (!Number.isFinite(maximum) || maximum <= 0) throw fail(400, "Maximum marks must be greater than zero");
    if (Number.isNaN(date.getTime())) throw fail(400, "A valid assessment date is required");
    if (assessment.marks.some((entry) => entry.marks > maximum)) {
      throw fail(400, "Maximum marks cannot be lower than marks already entered");
    }

    assessment.title = title;
    assessment.maxMarks = maximum;
    assessment.date = date;
    await assessment.save();
    await recordAudit(req, "assessment.updated", "Assessment", assessment._id, {
      title,
      maxMarks: maximum,
    });
    res.json(assessment);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Failed to update assessment" });
  }
});

router.delete("/assessments/:id", async (req, res) => {
  try {
    if (!manager(req)) return res.status(403).json({ message: "Access denied" });
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) throw fail(404, "Assessment not found");
    if (assessment.published) throw fail(409, "Published assessment is locked");
    const context = await getProgramContext(assessment.courseId, assessment.branch, assessment.period);
    await assertCanManage(req, context, assessment.subject);
    if (await getPublished(context)) throw fail(409, "This semester result is published and locked");
    await assessment.deleteOne();
    await recordAudit(req, "assessment.deleted", "Assessment", assessment._id, {
      title: assessment.title,
    });
    res.json({ message: "Assessment deleted" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Failed to delete assessment" });
  }
});

router.put("/assessments/:id/marks", async (req, res) => {
  try {
    if (!manager(req)) return res.status(403).json({ message: "Access denied" });
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) throw fail(404, "Assessment not found");
    if (assessment.published) throw fail(409, "Published assessment is locked");
    const context = await getProgramContext(assessment.courseId, assessment.branch, assessment.period);
    await assertCanManage(req, context, assessment.subject);
    if (await getPublished(context)) throw fail(409, "This semester result is published and locked");
    if (!Array.isArray(req.body.marks)) throw fail(400, "marks must be an array");

    const cohort = await getCohort(context);
    const cohortIds = new Set(cohort.map((student) => student.studentId));
    const seen = new Set();
    const marks = req.body.marks.map((entry) => {
      const studentId = String(entry?.studentId || "");
      const score = Number(entry?.marks);
      if (!cohortIds.has(studentId)) throw fail(400, `Student ${studentId || "(missing ID)"} is not in this cohort`);
      if (seen.has(studentId)) throw fail(400, `Duplicate marks supplied for ${studentId}`);
      if (!Number.isFinite(score) || score < 0 || score > assessment.maxMarks) {
        throw fail(400, `Marks for ${studentId} must be between 0 and ${assessment.maxMarks}`);
      }
      seen.add(studentId);
      return { studentId, marks: score };
    });
    assessment.marks = marks;
    await assessment.save();
    await recordAudit(req, "marks.updated", "Assessment", assessment._id, {
      studentCount: marks.length,
    });
    res.json({ message: "Marks saved", assessment });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Failed to save marks" });
  }
});

router.post("/assessments/:id/publish", async (req, res) => {
  try {
    if (!manager(req)) return res.status(403).json({ message: "Access denied" });
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) throw fail(404, "Assessment not found");
    const context = await getProgramContext(assessment.courseId, assessment.branch, assessment.period);
    await assertCanManage(req, context, assessment.subject);
    if (await getPublished(context)) throw fail(409, "This semester has already been published");
    const cohort = await getCohort(context);
    if (!cohort.length) throw fail(400, "There are no students in this cohort");
    const enteredIds = new Set(assessment.marks.map((entry) => entry.studentId));
    const missing = cohort.filter((student) => !enteredIds.has(student.studentId));
    if (missing.length) {
      throw fail(400, `Enter marks for every student before publishing (${missing.length} missing)`);
    }
    assessment.rosterStudentIds = cohort.map((student) => student.studentId);
    assessment.published = true;
    await assessment.save();
    await recordAudit(req, "assessment.published", "Assessment", assessment._id);
    res.json({
      assessment,
      results: calculateAssessmentResults(assessment, cohort),
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Failed to publish assessment" });
  }
});

router.post("/assessments/:id/unlock", async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Only admins can unlock published assessments" });
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) throw fail(404, "Assessment not found");
    const context = await getProgramContext(assessment.courseId, assessment.branch, assessment.period);
    if (await getPublished(context)) throw fail(409, "Unpublish the semester result before unlocking an assessment");
    assessment.published = false;
    await assessment.save();
    await recordAudit(req, "assessment.unlocked", "Assessment", assessment._id);
    res.json({ message: "Assessment unlocked", assessment });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Failed to unlock assessment" });
  }
});

router.get("/semester", async (req, res) => {
  try {
    if (!manager(req)) return res.status(403).json({ message: "Access denied" });
    const context = await getProgramContext(req.query.courseId, req.query.branch, req.query.period);
    await assertCanManage(req, context);
    const publication = await getPublished(context);
    const students = await getSnapshotCohort(context, publication?.studentIds);
    const { assessments, results } = await getSemesterResults(context, students);
    res.json({
      course: context.program.name,
      branch: context.branch.name,
      period: context.period,
      studyMode: context.program.studyMode,
      published: Boolean(publication),
      publishedAt: publication?.publishedAt || null,
      assessments,
      results,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Failed to generate semester results" });
  }
});

router.post("/semester/publish", async (req, res) => {
  try {
    if (!manager(req)) return res.status(403).json({ message: "Access denied" });
    const context = await getProgramContext(req.body.courseId, req.body.branch, req.body.period);
    await assertCanManage(req, context);
    if (await getPublished(context)) throw fail(409, "Semester result is already published");
    const students = await getCohort(context);
    if (!students.length) throw fail(400, "There are no students in this cohort");
    const assessments = await Assessment.find({
      courseId: context.program._id,
      branch: context.branch.name,
      period: context.period,
    });
    if (!assessments.length) throw fail(400, "Create assessments and enter marks before publishing");

    const studentIds = new Set(students.map((student) => student.studentId));
    for (const assessment of assessments) {
      const enteredIds = new Set(assessment.marks.map((entry) => entry.studentId));
      const missingCount = [...studentIds].filter((id) => !enteredIds.has(id)).length;
      if (missingCount) {
        throw fail(400, `${assessment.title}: marks are missing for ${missingCount} student(s)`);
      }
    }
    await SemesterPublication.create({
      courseId: context.program._id,
      branch: context.branch.name,
      period: context.period,
      publishedBy: req.user.id,
      studentIds: students.map((student) => student.studentId),
    });
    await Assessment.updateMany(
      {
        courseId: context.program._id,
        branch: context.branch.name,
        period: context.period,
      },
      {
        $set: {
          published: true,
          rosterStudentIds: students.map((student) => student.studentId),
        },
      }
    );
    await recordAudit(req, "semester.published", "Semester", `${context.program._id}:${context.branch.name}:${context.period}`);
    res.json({
      message: "Semester result published and marks locked",
      results: calculateSemesterResults(assessments, students),
    });
  } catch (error) {
    res.status(error.status || (error.code === 11000 ? 409 : 500)).json({
      message: error.message || "Failed to publish semester result",
    });
  }
});

router.post("/semester/unlock", async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Only admins can unlock semester results" });
    const context = await getProgramContext(req.body.courseId, req.body.branch, req.body.period);
    await SemesterPublication.deleteOne({
      courseId: context.program._id,
      branch: context.branch.name,
      period: context.period,
    });
    await Assessment.updateMany(
      {
        courseId: context.program._id,
        branch: context.branch.name,
        period: context.period,
      },
      { $set: { published: false } }
    );
    await recordAudit(req, "semester.unlocked", "Semester", `${context.program._id}:${context.branch.name}:${context.period}`);
    res.json({ message: "Semester result unlocked" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Failed to unlock semester result" });
  }
});

router.get("/mine", async (req, res) => {
  try {
    if (req.user.role !== "student") return res.status(403).json({ message: "Student access only" });
    const student = await Student.findById(req.user.id).select(
      "studentId rollNumber registrationNumber fullName courseApplied branchSpecialization academicYear semester academicHistory"
    );
    if (!student) throw fail(404, "Student not found");
    const program = await AcademicProgram.findOne({
      name: exactTextPattern(student.courseApplied),
    });
    if (!program) return res.json({ student, semesters: [], finalResult: null });
    const branch = program.branches.find(
      (item) => item.name.toLowerCase() === String(student.branchSpecialization || "").toLowerCase()
    );
    if (!branch) return res.json({ student, semesters: [], finalResult: null });

    const publications = await SemesterPublication.find({
      courseId: program._id,
      branch: branch.name,
    }).sort({ period: 1 });
    const semesters = [];
    for (const publication of publications) {
      const context = {
        program,
        branch,
        period: publication.period,
        periodField: program.studyMode === "semester" ? "semester" : "academicYear",
      };
      const [assessments, cohort] = await Promise.all([
        Assessment.find({
          courseId: program._id,
          branch: branch.name,
          period: publication.period,
        }),
        getSnapshotCohort(context, publication.studentIds),
      ]);
      const result = calculateSemesterResults(assessments, cohort).find(
        (item) => item.studentId === student.studentId
      );
      if (!result) continue;
      semesters.push({
        period: publication.period,
        studyMode: program.studyMode,
        publishedAt: publication.publishedAt,
        ...result,
      });
    }
    const finalResult = semesters.length
      ? (() => {
          const overallPercentage = Number(
            (semesters.reduce((sum, item) => sum + item.percentage, 0) / semesters.length).toFixed(2)
          );
          const { grade } = gradeForPercentage(overallPercentage);
          const status = semesters.every((item) => item.status === "Pass") ? "Pass" : "Fail";
          return {
          semesters,
          overallPercentage,
          cgpa: Number(
            (semesters.reduce((sum, item) => sum + item.gpa, 0) / semesters.length).toFixed(2)
          ),
          grade,
          status,
          academicRemarks: status === "Pass"
            ? "Passed all published academic periods."
            : "Academic support is recommended for one or more published periods.",
          };
        })()
      : null;
    res.json({ student, semesters, finalResult });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Failed to load student results" });
  }
});

router.post("/promote/:studentId", async (req, res) => {
  try {
    if (!manager(req)) return res.status(403).json({ message: "Access denied" });
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) throw fail(404, "Student not found");
    const program = await AcademicProgram.findOne({
      name: exactTextPattern(student.courseApplied),
    });
    if (!program || program.studyMode !== "semester") {
      throw fail(400, "Promotion currently supports semester-based courses only");
    }
    const branch = program.branches.find(
      (item) => item.name.toLowerCase() === String(student.branchSpecialization || "").toLowerCase()
    );
    if (!branch) throw fail(400, "Student branch is not configured in the academic course");
    const fromPeriod = Number(student.semester);
    if (!Number.isInteger(fromPeriod) || fromPeriod < 1) {
      throw fail(409, "Student does not have a valid current semester");
    }
    const context = { program, branch, period: fromPeriod };
    await assertCanManage(req, context);
    if (fromPeriod >= program.periodCount) throw fail(400, "Student is already in the final semester");
    if (!(await getPublished(context))) throw fail(409, "Publish the semester result before promoting students");
    const assessments = await Assessment.find({
      courseId: program._id,
      branch: branch.name,
      period: fromPeriod,
    });
    const publication = await getPublished(context);
    const resultCohort = await getSnapshotCohort(context, publication.studentIds);
    const result = calculateSemesterResults(assessments, resultCohort).find(
      (item) => item.studentId === student.studentId
    );
    if (!result || result.status !== "Pass") throw fail(409, "Student must pass every subject before promotion");

    const toPeriod = fromPeriod + 1;
    const promotion = await Promotion.create({
      studentId: student.studentId,
      courseId: program._id,
      branch: branch.name,
      fromPeriod,
      toPeriod,
      promotedBy: req.user.id,
    });
    student.academicHistory.push({
      courseApplied: student.courseApplied,
      branchSpecialization: student.branchSpecialization,
      period: fromPeriod,
      studyMode: program.studyMode,
      promotedAt: new Date(),
    });
    student.semester = toPeriod;
    await student.save();
    await recordAudit(req, "student.promoted", "Student", student.studentId, {
      fromPeriod,
      toPeriod,
    });
    res.json({ message: `Promoted to Semester ${toPeriod}`, promotion, student });
  } catch (error) {
    res.status(error.status || (error.code === 11000 ? 409 : 500)).json({
      message: error.message || "Failed to promote student",
    });
  }
});

export default router;
