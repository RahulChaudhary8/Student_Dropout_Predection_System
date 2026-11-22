import express from "express";
import mongoose from "mongoose";
import AcademicProgram from "../models/AcademicProgram.js";
import Student from "../models/Student.js";
import bcrypt from "bcryptjs";
import {
  resolveStudentIdentity,
  ensureCounterSeeded,
} from "../utils/idGenerator.js";
import {
  exactTextPattern,
  findMentorsForStudentGroup,
  selectMentorForStudentGroup,
} from "../utils/mentorAssignment.js";

const router = express.Router();

const validateAcademicPeriod = async (
  courseName,
  studentData,
  { required = false, warnings = null } = {}
) => {
  const program = await AcademicProgram.findOne({ name: exactTextPattern(courseName) });
  if (!program) return null;

  const periodField = program.studyMode === "semester" ? "semester" : "academicYear";
  const otherPeriodField = periodField === "semester" ? "academicYear" : "semester";
  if (studentData[otherPeriodField] !== undefined && studentData[otherPeriodField] !== null) {
    if (warnings) {
      warnings.push(`${otherPeriodField} was skipped because this course uses ${program.studyMode} periods`);
      delete studentData[otherPeriodField];
    } else {
      const error = new Error(`This course uses ${program.studyMode} periods`);
      error.status = 400;
      throw error;
    }
  }

  const rawPeriod = studentData[periodField];
  if (rawPeriod === undefined || rawPeriod === null || rawPeriod === "") {
    if (required) {
      const error = new Error(`${program.studyMode === "semester" ? "Semester" : "Academic year"} is required`);
      error.status = 400;
      throw error;
    }
    return null;
  }

  const period = Number(rawPeriod);
  if (!Number.isInteger(period) || period < 1 || period > program.periodCount) {
    if (warnings) {
      warnings.push(
        `${periodField} was skipped because it must be between 1 and ${program.periodCount}`
      );
      delete studentData[periodField];
      return null;
    }
    const error = new Error(
      `${program.studyMode === "semester" ? "Semester" : "Academic year"} must be between 1 and ${program.periodCount}`
    );
    error.status = 400;
    throw error;
  }

  studentData[periodField] = period;
  return period;
};

// One-time bootstrap so the atomic counter starts past any Student IDs
// that already exist in the DB from before this centralized generator
// was introduced. Safe to call on every server start — it's a no-op once
// the counter document exists.
ensureCounterSeeded().catch((err) =>
  console.error("⚠️ Failed to seed student ID counter:", err)
);

// POST - Add Student + Assign Mentor
router.post("/", async (req, res) => {
  try {
    if (!req.body || !req.body.courseApplied) {
      return res.status(400).json({ error: "❌ courseApplied is required" });
    }

    if (req.body.email) {
      req.body.email = String(req.body.email).trim().toLowerCase();
      const existingStudent = await Student.findOne({ email: req.body.email });
      if (existingStudent) {
        return res.status(409).json({
          error: "A student with this email already exists",
          field: "email",
        });
      }
    }

    // === Mentor Assignment Logic ===
    const studentCourse = req.body.courseApplied;
    const studentBranch = req.body.branchSpecialization;
    const studentPeriod = await validateAcademicPeriod(studentCourse, req.body, { required: true });
    const matchingMentors = await findMentorsForStudentGroup(
      studentCourse,
      studentBranch,
      studentPeriod
    );
    let assignedMentor = null;
    const requestedMentorId = req.body.assignedMentorId;
    if (requestedMentorId && requestedMentorId !== "__NONE__") {
      if (!mongoose.isValidObjectId(requestedMentorId)) {
        return res.status(400).json({ error: "Select a valid mentor" });
      }
      assignedMentor = matchingMentors.find(
        (mentor) => String(mentor._id) === requestedMentorId
      );
      if (!assignedMentor) {
        return res.status(400).json({
          error: "Selected mentor is not assigned to this course and branch",
        });
      }
    } else if (requestedMentorId !== "__NONE__") {
      assignedMentor = selectMentorForStudentGroup(
        studentCourse,
        studentBranch,
        matchingMentors,
        studentPeriod
      );
    }

    // Agar mentor nahi mila to bhi student save hoga — mentor baad me manually assign ho sakta hai
    if (!assignedMentor) {
      console.log(
        `⚠️ No mentor available for ${studentCourse} / ${studentBranch || "no branch"}. Student will be saved without a mentor.`
      );
    }

    // The form never legitimately carries a Student ID or password —
    // those are always system-assigned. Passing no studentId here forces
    // resolveStudentIdentity into the "fresh registration" branch.
    const identity = await resolveStudentIdentity({});
    const hashedPassword = await bcrypt.hash(identity.plainPassword, 10);

    // Note: studentId/password/plainPassword are set AFTER the ...req.body
    // spread on purpose, so even if the client form somehow submitted
    // those field names, they're always overridden by the system-assigned
    // values below — never trusted from the client.
    const newStudent = new Student({
      ...req.body,
      studentId: identity.studentId,
      password: hashedPassword, // store hashed password
      plainPassword: identity.plainPassword,
      assignedMentorId: assignedMentor ? assignedMentor._id : null, // save mentor ID
    });

    await newStudent.save();

    res.status(201).json({
      message: assignedMentor
        ? "✅ Student added successfully"
        : requestedMentorId === "__NONE__"
          ? "✅ Student added successfully without a mentor"
          : `✅ Student added successfully, but ⚠️ no mentor found for ${studentCourse} / ${studentBranch || "no branch"}. Please assign one manually.`,
      student: newStudent,
      generatedPassword: identity.plainPassword,
      assignedMentor: assignedMentor
        ? `${assignedMentor.firstName} ${assignedMentor.lastName}`
        : null,
    });
  } catch (error) {
    console.error(error);

    if (error?.code === 11000) {
      const duplicateField = error.keyPattern ? Object.keys(error.keyPattern)[0] : "field";
      return res.status(409).json({
        error: duplicateField === "email"
          ? "A student with this email already exists"
          : `A student with this ${duplicateField} already exists`,
        field: duplicateField,
      });
    }

    if (error?.name === "ValidationError") {
      return res.status(400).json({
        error: "Please check all required fields",
        details: error.message,
      });
    }
    if (error?.status === 400) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: "❌ Failed to save student" });
  }
});

// POST - Create complete student records from an admin Excel upload.
router.post("/bulk-upload", async (req, res) => {
  const { students } = req.body;

  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ error: "A non-empty students array is required" });
  }

  const requiredFields = ["fullName", "email"];
  const allowedFields = [
    ...requiredFields,
    "dateOfBirth",
    "gender",
    "fathersName",
    "mothersName",
    "category",
    "aadharNumber",
    "phoneNumber",
    "permanentAddress",
    "currentAddress",
    "parentContactNumber",
    "parentEmergencyNumber",
    "previousQualification",
    "boardUniversityName",
    "yearOfAddmission",
    "yearOfPassing",
    "nationality",
    "bloodGroup",
    "branchSpecialization",
    "academicYear",
    "semester",
    "entranceExamScore",
    "fatherOccupation",
    "motherOccupation",
    "annualFamilyIncome",
    "totalCourseFees",
    "feeStructure",
    "scholarshipApplicable",
    "paymentMode",
    "religion",
    "hostelRequired",
    "transportRequired",
    "assignedMentorId",
  ];
  const numericFields = [
    "academicYear",
    "semester",
    "yearOfAddmission",
    "yearOfPassing",
    "annualFamilyIncome",
    "totalCourseFees",
  ];
  const seenEmails = new Set();
  const createdIds = [];
  const errors = [];
  const warnings = [];

  for (const [index, row] of students.entries()) {
    try {
      if (!row || typeof row !== "object" || Array.isArray(row)) {
        throw new Error("Row must contain student fields");
      }

      const studentData = {};
      for (const field of allowedFields) {
        const value = row[field];
        if (value !== undefined && value !== null && String(value).trim() !== "") {
          studentData[field] = typeof value === "string" ? value.trim() : value;
        }
      }

      const missingFields = requiredFields.filter(
        (field) => studentData[field] === undefined || studentData[field] === ""
      );
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      studentData.courseApplied = String(studentData.courseApplied || "").trim() || "Not Provided";
      studentData.email = String(studentData.email).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentData.email)) {
        throw new Error("Email is invalid");
      }

      const enumValues = {
        gender: ["Male", "Female", "Other"],
        category: ["General", "OBC", "SC", "ST", "EWS"],
        bloodGroup: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
        previousQualification: ["10th", "12th", "Diploma"],
        feeStructure: ["Semester-wise", "Yearly", "One-time"],
        scholarshipApplicable: ["Yes", "No"],
        paymentMode: ["Online", "Cash", "Cheque", "DD"],
        hostelRequired: ["Yes", "No"],
        transportRequired: ["Yes", "No"],
      };
      const rowWarnings = [];
      for (const [field, values] of Object.entries(enumValues)) {
        if (studentData[field] !== undefined && !values.includes(studentData[field])) {
          rowWarnings.push(`${field} was skipped because its value is invalid`);
          delete studentData[field];
        }
      }

      if (studentData.aadharNumber !== undefined && !/^\d{12}$/.test(studentData.aadharNumber)) {
        rowWarnings.push("Aadhar Number was skipped because it must contain exactly 12 digits");
        delete studentData.aadharNumber;
      }

      if (seenEmails.has(studentData.email)) {
        throw new Error("Duplicate email in uploaded file");
      }
      seenEmails.add(studentData.email);

      for (const field of numericFields) {
        if (studentData[field] !== undefined) {
          const value = studentData[field];
          const directNumber = Number(value);
          const numberValue = Number.isFinite(directNumber)
            ? directNumber
            : Number(String(value).replace(/[^0-9.-]/g, ""));
          if (!Number.isFinite(numberValue)) {
            rowWarnings.push(`${field} was skipped because its value is not a valid number`);
            delete studentData[field];
            continue;
          }
          studentData[field] = numberValue;
        }
      }

      const studentPeriod = await validateAcademicPeriod(
        studentData.courseApplied,
        studentData,
        { warnings: rowWarnings }
      );
      const existingStudent = await Student.findOne({ email: studentData.email });
      if (existingStudent) {
        throw new Error("A student with this email already exists");
      }

      const identity = await resolveStudentIdentity({});
      const hashedPassword = await bcrypt.hash(identity.plainPassword, 10);
      const studentBranch = studentData.branchSpecialization;
      const matchingMentors = await findMentorsForStudentGroup(
        studentData.courseApplied,
        studentBranch,
        studentPeriod
      );
      let assignedMentor = null;
      const requestedMentorId = studentData.assignedMentorId;
      if (requestedMentorId && requestedMentorId !== "__NONE__") {
        if (!mongoose.isValidObjectId(requestedMentorId)) {
          throw new Error("Assigned Mentor must be a valid mentor ID");
        }
        assignedMentor = matchingMentors.find(
          (mentor) => String(mentor._id) === requestedMentorId
        );
        if (!assignedMentor) {
          throw new Error("Assigned mentor is not assigned to this course and branch");
        }
      } else if (requestedMentorId !== "__NONE__") {
        assignedMentor = selectMentorForStudentGroup(
          studentData.courseApplied,
          studentBranch,
          matchingMentors,
          studentPeriod
        );
      }

      const student = await Student.create({
        ...studentData,
        studentId: identity.studentId,
        password: hashedPassword,
        plainPassword: identity.plainPassword,
        assignedMentorId: assignedMentor?._id ?? null,
      });
      createdIds.push(student.studentId);
      if (rowWarnings.length > 0) {
        warnings.push({ row: index + 2, warnings: rowWarnings });
      }
    } catch (error) {
      console.warn(`Bulk student upload row ${index + 2} failed:`, error.message);
      errors.push({
        row: index + 2,
        email: row?.email || "",
        error: error.message,
      });
    }
  }

  res.json({
    message: `${createdIds.length} student(s) created, ${errors.length} row(s) failed`,
    created: createdIds.length,
    createdIds,
    failed: errors.length,
    errors,
    warnings,
  });
});

// GET - Fetch All Students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().populate("assignedMentorId", "firstName lastName");
    const studentsWithPassword = students.map((student) => ({
      ...student._doc,
      plainPassword: student.plainPassword, // ya POST me jo random password tha
    }));
    res.json(studentsWithPassword);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// PUT - Assign mentors to old students without mentors
router.put("/assign-old-mentors", async (req, res) => {
  try {
    const studentsWithoutMentor = await Student.find({
      $or: [{ assignedMentorId: null }, { assignedMentorId: { $exists: false } }],
    });

    const updatedStudents = [];
    for (const student of studentsWithoutMentor) {
      const mentors = await findMentorsForStudentGroup(
        student.courseApplied,
        student.branchSpecialization,
        student.academicYear ?? student.semester
      );
      const assignedMentor = selectMentorForStudentGroup(
        student.courseApplied,
        student.branchSpecialization,
        mentors,
        student.academicYear ?? student.semester
      );
      if (!assignedMentor) continue;

      student.assignedMentorId = assignedMentor._id;
      await student.save();
      updatedStudents.push({
        fullName: student.fullName,
        courseApplied: student.courseApplied,
        branchSpecialization: student.branchSpecialization,
        assignedMentor: `${assignedMentor.firstName} ${assignedMentor.lastName}`,
      });
    }

    res.json({
      message: "✅ Old students updated with mentors",
      updatedStudents,
    });
  } catch (error) {
    console.error("Failed to assign mentors to old students:", error);
    res.status(500).json({ error: "Failed to assign mentors to old students" });
  }
});

// PUT - Bulk update selected students
router.put("/bulk-update", async (req, res) => {
  try {
    const { studentIds, updates } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: "Please select at least one student" });
    }

    if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
      return res.status(400).json({ error: "Update fields are required" });
    }

    const allowedFields = new Set([
      "fullName",
      "courseApplied",
      "branchSpecialization",
      "academicYear",
      "semester",
      "yearOfAddmission",
      "yearOfPassing",
      "phoneNumber",
      "parentContactNumber",
      "parentEmergencyNumber",
      "totalCourseFees",
      "scholarshipApplicable",
      "hostelRequired",
      "transportRequired",
      "assignedMentorId",
    ]);

    const updateData = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.has(key) && value !== "" && value !== null && value !== undefined) {
        updateData[key] = value;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "Please provide at least one valid field to update" });
    }

    if (updateData.branchSpecialization === "__NONE__") {
      updateData.branchSpecialization = null;
    }
    for (const field of ["academicYear", "semester"]) {
      if (updateData[field] === "__NONE__") {
        updateData[field] = null;
      } else if (updateData[field] !== undefined) {
        const period = Number(updateData[field]);
        if (!Number.isInteger(period) || period < 1) {
          return res.status(400).json({ error: `${field} must be a positive whole number` });
        }
        updateData[field] = period;
      }
    }

    const resolvePeriodForStudent = async (student, course) => {
      const program = await AcademicProgram.findOne({ name: exactTextPattern(course) });
      if (!program) return student.academicYear ?? student.semester ?? null;
      const periodField = program.studyMode === "semester" ? "semester" : "academicYear";
      const courseChanged =
        updateData.courseApplied !== undefined &&
        String(updateData.courseApplied).trim().toLowerCase() !==
          String(student.courseApplied || "").trim().toLowerCase();
      const periodData = { academicYear: null, semester: null };
      periodData[periodField] =
        updateData[periodField] !== undefined
          ? updateData[periodField]
          : courseChanged
            ? null
            : student[periodField] ?? null;
      await validateAcademicPeriod(course, periodData, { required: courseChanged });
      return periodData[periodField] ?? null;
    };

    if (updateData.assignedMentorId === "__NONE__") {
      updateData.assignedMentorId = null;
    } else if (updateData.assignedMentorId) {
      if (!mongoose.isValidObjectId(updateData.assignedMentorId)) {
        return res.status(400).json({ error: "Select a valid mentor" });
      }
      const targetStudents = await Student.find({ _id: { $in: studentIds } });
      for (const student of targetStudents) {
        const course = updateData.courseApplied ?? student.courseApplied;
        const branch =
          updateData.branchSpecialization === null
            ? ""
            : updateData.branchSpecialization ?? student.branchSpecialization;
        const period = await resolvePeriodForStudent(student, course);
        const matchingMentors = await findMentorsForStudentGroup(course, branch, period);
        if (!matchingMentors.some((mentor) => String(mentor._id) === updateData.assignedMentorId)) {
          return res.status(400).json({
            error: `Selected mentor is not assigned to ${course} / ${branch || "no branch"} for every selected student`,
          });
        }
      }
      updateData.assignedMentorId = new mongoose.Types.ObjectId(updateData.assignedMentorId);
    }

    if (
      (updateData.courseApplied !== undefined ||
        updateData.branchSpecialization !== undefined ||
        updateData.academicYear !== undefined ||
        updateData.semester !== undefined) &&
      updateData.assignedMentorId === undefined
    ) {
      const targetStudents = await Student.find({ _id: { $in: studentIds } });
      let modifiedCount = 0;
      for (const student of targetStudents) {
        const course = updateData.courseApplied ?? student.courseApplied;
        const branch = Object.prototype.hasOwnProperty.call(
          updateData,
          "branchSpecialization"
        )
          ? updateData.branchSpecialization || ""
          : student.branchSpecialization;
        const period = await resolvePeriodForStudent(student, course);
        const program = await AcademicProgram.findOne({ name: exactTextPattern(course) });
        const periodData = { academicYear: null, semester: null };
        if (program) {
          periodData[program.studyMode === "semester" ? "semester" : "academicYear"] = period;
        }
        const matchingMentors = await findMentorsForStudentGroup(course, branch, period);
        const existingMentorId = String(student.assignedMentorId || "");
        const assignedMentor = matchingMentors.find(
          (mentor) => String(mentor._id) === existingMentorId
        ) || selectMentorForStudentGroup(course, branch, matchingMentors, period);
        student.set({
          ...updateData,
          ...periodData,
          assignedMentorId: assignedMentor?._id ?? null,
        });
        await student.save();
        modifiedCount += 1;
      }

      return res.json({
        message: `✅ ${modifiedCount} student(s) updated successfully`,
        matchedCount: targetStudents.length,
        modifiedCount,
      });
    }

    if (updateData.yearOfAddmission !== undefined) {
      updateData.yearOfAddmission = Number(updateData.yearOfAddmission);
    }
    if (updateData.yearOfPassing !== undefined) {
      updateData.yearOfPassing = Number(updateData.yearOfPassing);
    }
    if (updateData.totalCourseFees !== undefined) {
      updateData.totalCourseFees = Number(updateData.totalCourseFees);
    }

    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: updateData }
    );

    res.json({
      message: `✅ ${result.modifiedCount} student(s) updated successfully`,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Bulk student update error:", error);
    if (error?.status === 400) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update selected students" });
  }
});

// PUT - Update editable student profile fields
router.put("/:id", async (req, res) => {
  try {
    const editableFields = [
      "fullName",
      "dateOfBirth",
      "gender",
      "fathersName",
      "mothersName",
      "bloodGroup",
      "category",
      "aadharNumber",
      "email",
      "phoneNumber",
      "permanentAddress",
      "currentAddress",
      "parentContactNumber",
      "parentEmergencyNumber",
      "courseApplied",
      "branchSpecialization",
      "academicYear",
      "semester",
      "previousQualification",
      "boardUniversityName",
      "yearOfAddmission",
      "yearOfPassing",
      "entranceExamScore",
      "fatherOccupation",
      "motherOccupation",
      "annualFamilyIncome",
      "totalCourseFees",
      "feeStructure",
      "scholarshipApplicable",
      "paymentMode",
      "nationality",
      "religion",
      "hostelRequired",
      "transportRequired",
      "assignedMentorId",
    ];
    const updates = {};

    for (const field of editableFields) {
      if (!Object.prototype.hasOwnProperty.call(req.body, field)) continue;
      const value = req.body[field];
      updates[field] = value === "" ? null : typeof value === "string" ? value.trim() : value;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No editable student fields provided" });
    }

    if (updates.email) {
      updates.email = updates.email.toLowerCase();
      const duplicate = await Student.findOne({ email: updates.email, _id: { $ne: req.params.id } });
      if (duplicate) {
        return res.status(409).json({ error: "A student with this email already exists" });
      }
    }

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    const courseChanged =
      updates.courseApplied !== undefined &&
      String(updates.courseApplied || "").trim().toLowerCase() !==
        String(student.courseApplied || "").trim().toLowerCase();
    const branchChanged =
      updates.branchSpecialization !== undefined &&
      String(updates.branchSpecialization || "").trim().toLowerCase() !==
        String(student.branchSpecialization || "").trim().toLowerCase();
    for (const field of ["academicYear", "semester"]) {
      if (updates[field] !== undefined && updates[field] !== null) {
        const period = Number(updates[field]);
        if (!Number.isInteger(period) || period < 1) {
          return res.status(400).json({ error: `${field} must be a positive whole number` });
        }
        updates[field] = period;
      }
    }
    const periodChanged =
      (updates.academicYear !== undefined &&
        updates.academicYear !== student.academicYear) ||
      (updates.semester !== undefined && updates.semester !== student.semester);
    const academicGroupChanged = courseChanged || branchChanged || periodChanged;
    let studentPeriod =
      updates.academicYear ?? updates.semester ?? student.academicYear ?? student.semester;
    if (courseChanged || updates.academicYear !== undefined || updates.semester !== undefined) {
      const course = updates.courseApplied ?? student.courseApplied;
      const program = await AcademicProgram.findOne({ name: exactTextPattern(course) });
      if (program) {
        const periodField = program.studyMode === "semester" ? "semester" : "academicYear";
        const periodData = { academicYear: null, semester: null };
        periodData[periodField] =
          updates[periodField] !== undefined
            ? updates[periodField]
            : courseChanged
              ? null
              : student[periodField] ?? null;
        studentPeriod = await validateAcademicPeriod(course, periodData, {
          required: courseChanged,
        });
        updates.academicYear = periodData.academicYear;
        updates.semester = periodData.semester;
      }
    }
    if (updates.assignedMentorId !== undefined) {
      if (updates.assignedMentorId === "__NONE__") {
        updates.assignedMentorId = null;
      } else if (updates.assignedMentorId === null && !academicGroupChanged) {
        updates.assignedMentorId = null;
      } else if (updates.assignedMentorId === null) {
        const course = updates.courseApplied ?? student.courseApplied;
        const branch =
          updates.branchSpecialization === null
            ? ""
            : updates.branchSpecialization ?? student.branchSpecialization;
        const matchingMentors = await findMentorsForStudentGroup(
          course,
          branch,
          studentPeriod
        );
        const assignedMentor = selectMentorForStudentGroup(
          course,
          branch,
          matchingMentors,
          studentPeriod
        );
        updates.assignedMentorId = assignedMentor?._id ?? null;
      } else {
        if (!mongoose.isValidObjectId(updates.assignedMentorId)) {
          return res.status(400).json({ error: "Select a valid mentor" });
        }
        const course = updates.courseApplied ?? student.courseApplied;
        const branch =
          updates.branchSpecialization === null
            ? ""
            : updates.branchSpecialization ?? student.branchSpecialization;
        const sameAsCurrent =
          String(student.assignedMentorId || "") === String(updates.assignedMentorId);
        if (!sameAsCurrent || academicGroupChanged) {
          const matchingMentors = await findMentorsForStudentGroup(
            course,
            branch,
            studentPeriod
          );
          if (!matchingMentors.some((mentor) => String(mentor._id) === updates.assignedMentorId)) {
            return res.status(400).json({
              error: "Selected mentor is not assigned to this course and branch",
            });
          }
        }
        updates.assignedMentorId = new mongoose.Types.ObjectId(updates.assignedMentorId);
      }
    } else if (academicGroupChanged) {
      const course = updates.courseApplied ?? student.courseApplied;
      const branch =
        updates.branchSpecialization === null
          ? ""
          : updates.branchSpecialization ?? student.branchSpecialization;
      const matchingMentors = await findMentorsForStudentGroup(
        course,
        branch,
        studentPeriod
      );
      const existingMentorId = String(student.assignedMentorId || "");
      const assignedMentor = matchingMentors.find(
        (mentor) => String(mentor._id) === existingMentorId
      ) || selectMentorForStudentGroup(course, branch, matchingMentors, studentPeriod);
      updates.assignedMentorId = assignedMentor?._id ?? null;
    }
    student.set(updates);
    await student.save();

    res.json({ message: "Student updated successfully", student });
  } catch (error) {
    console.error("Student update error:", error);
    if (error?.status === 400) {
      return res.status(400).json({ error: error.message });
    }
    if (error?.code === 11000) {
      return res.status(409).json({ error: "A student with this email already exists" });
    }
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update student" });
  }
});

// PUT - Update Attendance
router.put("/:id/attendance", async (req, res) => {
  try {
    const { attendance } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { attendance },
      { new: true }
    );
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Failed to update attendance" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Total students count
router.get("/count", async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    res.json({ totalStudents });
  } catch (err) {
    res.status(500).json({ message: "Error fetching total students", error: err });
  }
});

// PUT - Update Test Score
router.put("/:id/testscore", async (req, res) => {
  try {
    const { testScore } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { testScore },
      { new: true }
    );
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Failed to update test score" });
  }
});

// Builds a new Student document with placeholder values for all the
// enrollment fields Excel doesn't carry (DOB, Aadhar, address, etc.).
// Real values pulled from Excel where available: fullName, email, and —
// from the ML feature set itself — Gender, Course, Nacionality.
// Identity (studentId + password) is NOT decided here — it's passed in
// already resolved by resolveStudentIdentity(), so both the fresh-
// registration and migration cases go through the exact same identity
// logic as the "Add Student" form.
// Marked isPlaceholder: true so the UI can flag these for the mentor to
// complete later (via the normal student-edit flow, once that exists).
const buildPlaceholderStudent = async (identity, fullName, email, mlFeatures) => {
  const genderRaw = (mlFeatures?.["Gender"] || "").toString().trim();
  const gender = ["Male", "Female", "Other"].includes(genderRaw) ? genderRaw : "Other";
  const courseRaw = (mlFeatures?.["Course"] || "").toString().trim();
  const nationalityRaw = (mlFeatures?.["Nacionality"] || "").toString().trim();
  const currentYear = new Date().getFullYear();

  const hashedPassword = await bcrypt.hash(identity.plainPassword, 10);

  return {
    studentId: identity.studentId,
    fullName: fullName?.trim() || `Unnamed (${identity.studentId})`,
    dateOfBirth: "2000-01-01", // placeholder — mentor should update
    gender,
    fathersName: "Not Provided",
    mothersName: "Not Provided",
    category: "General",
    aadharNumber: "000000000000", // placeholder — mentor should update
    email: email?.trim() || `${identity.studentId.toLowerCase()}@placeholder.mentorpanel.local`,
    phoneNumber: "0000000000",
    permanentAddress: "Not Provided",
    currentAddress: "Not Provided",
    parentContactNumber: "0000000000",
    parentEmergencyNumber: "0000000000",
    courseApplied: courseRaw || "Not Provided",
    previousQualification: "12th",
    boardUniversityName: "Not Provided",
    yearOfAddmission: currentYear,
    yearOfPassing: currentYear + 4,
    nationality: nationalityRaw || "Indian",
    password: hashedPassword,
    plainPassword: identity.plainPassword,
    mlFeatures,
    isPlaceholder: true,
  };
};

// POST - Bulk import students from Excel (registration + academic features).
// No ML prediction runs here — that only happens when the mentor
// explicitly clicks "Predict Risk".
//
// Body: { students: [ { student_id, password, fullName, email, mlFeatures }, ... ] }
//
// Student ID / password rules (same centralized logic as the "Add Student"
// form, via resolveStudentIdentity):
//   - student_id / password BLANK  → normal case. System generates a brand
//     new, unique Student ID + random password for this row, and creates
//     a new student. This is the expected case for ordinary bulk imports —
//     Excel should NOT carry these columns filled in.
//   - student_id (and optionally password) FILLED IN → migration case.
//     If that Student ID already exists in the DB, we treat this as an
//     update to that same student (avoids creating a duplicate). If it
//     doesn't exist yet, we create it with the given ID (preserving the
//     legacy ID) and bump the internal counter past it.
router.post("/bulk-import", async (req, res) => {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: "❌ students array is required" });
    }

    const updatedIds = [];
    const createdIds = [];
    const failedIds = [];

    for (const row of students) {
      const { student_id, password, fullName, email, mlFeatures } = row;

      try {
        const identity = await resolveStudentIdentity({ studentId: student_id, password });

        if (identity.isMigrated && identity.existingStudent) {
          // Migration case, ID already exists → just refresh mlFeatures,
          // leave the rest of the enrollment record untouched.
          identity.existingStudent.mlFeatures = mlFeatures;
          await identity.existingStudent.save();
          updatedIds.push(identity.studentId);
        } else {
          // Either a fresh registration (system-generated ID) or a
          // migration row whose legacy ID doesn't exist in the DB yet —
          // both are a brand-new student document.
          const placeholderDoc = await buildPlaceholderStudent(identity, fullName, email, mlFeatures);
          await Student.create(placeholderDoc);
          createdIds.push(identity.studentId);
        }
      } catch (err) {
        console.warn(`⚠️ Could not save/create row for "${student_id || "(auto)"}":`, err.message);
        failedIds.push(student_id || "(auto-generated row failed)");
      }
    }

    console.log(
      `💾 bulk-import: ${updatedIds.length} updated, ${createdIds.length} created, ${failedIds.length} failed`,
      { updatedIds, createdIds, failedIds }
    );

    res.json({
      message: `✅ ${updatedIds.length} updated, 🆕 ${createdIds.length} newly created${failedIds.length ? `, ⚠️ ${failedIds.length} failed` : ""
        }`,
      saved: updatedIds.length + createdIds.length,
      updated: updatedIds.length,
      created: createdIds.length,
      failed: failedIds.length,
      updatedIds,
      createdIds,
      failedIds,
    });
  } catch (error) {
    console.error("❌ Error in bulk import:", error);
    res.status(500).json({ error: "❌ Failed to bulk import students" });
  }
});

// POST - Save/Update ML prediction result for a student (Predict Risk button)
// Frontend sends: { student_id, prediction, dropout_probability, risk, explanations, mlFeatures? }
// `student_id` here corresponds to our Student model's `studentId` field (e.g. "ST001").
// `mlFeatures` is optional: when present (e.g. right after an Excel upload merge,
// or from a raw Excel-shaped row), we persist it too, so the next time a mentor
// clicks "Predict Risk" on this student directly from the DB, the academic
// features are already there and don't need to be re-uploaded.
router.post("/save-prediction", async (req, res) => {
  try {
    const {
      student_id,
      prediction,
      dropout_probability,
      risk,
      explanations,
      mlFeatures,
    } = req.body;

    if (!student_id) {
      return res.status(400).json({ error: "❌ student_id is required" });
    }

    const update = {
      prediction,
      dropout_probability,
      risk,
      explanations,
      predictedAt: new Date(),
    };

    if (mlFeatures && typeof mlFeatures === "object") {
      update.mlFeatures = mlFeatures;
    }

    const updatedStudent = await Student.findOneAndUpdate(
      { studentId: student_id },
      update,
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ error: `❌ No student found with studentId: ${student_id}` });
    }

    res.json({
      message: "✅ Prediction result saved successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("❌ Error saving prediction:", error);
    res.status(500).json({ error: "❌ Failed to save prediction result" });
  }
});

// PUT - Manually save/update just the ML input features for a student
// (useful when a mentor wants to fill in academic data for one enrolled
// student without going through a full Excel upload)
router.put("/:studentId/ml-features", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { mlFeatures } = req.body;

    if (!mlFeatures || typeof mlFeatures !== "object") {
      return res.status(400).json({ error: "❌ mlFeatures object is required" });
    }

    const updatedStudent = await Student.findOneAndUpdate(
      { studentId },
      { mlFeatures },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ error: `❌ No student found with studentId: ${studentId}` });
    }

    res.json({
      message: "✅ Academic/ML features saved successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("❌ Error saving ml-features:", error);
    res.status(500).json({ error: "❌ Failed to save ml-features" });
  }
});

export default router;