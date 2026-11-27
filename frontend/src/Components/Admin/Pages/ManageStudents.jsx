import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { getMentorsForStudentGroup } from "../../../utils/mentorAssignments";
import AddStudentForm from "./AddStudentForm";
import {
  Alert,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TextField,
  InputAdornment,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Fade,
  Grow,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";

const STUDENT_COLUMN_ALIASES = {
  fullName: ["fullname", "name"],
  dateOfBirth: ["dateofbirth", "dob"],
  gender: ["gender"],
  fathersName: ["fathersname", "fathername"],
  mothersName: ["mothersname", "mothername"],
  bloodGroup: ["bloodgroup"],
  category: ["category"],
  aadharNumber: ["aadharnumber", "aadhaarnumber", "aadhar", "aadhaar"],
  email: ["email"],
  phoneNumber: ["phonenumber", "phone"],
  permanentAddress: ["permanentaddress", "addresspermanent"],
  currentAddress: ["currentaddress", "addresscurrent"],
  parentContactNumber: ["parentcontactnumber", "parentphonenumbercontact"],
  parentEmergencyNumber: ["parentemergencynumber", "parentphonenumberemergency"],
  courseApplied: ["courseapplied", "courseprogramappliedfor", "course"],
  branchSpecialization: ["branchspecialization", "branch"],
  academicYear: ["academicyear", "currentacademicyear", "yearofstudy"],
  semester: ["semester", "currentsemester"],
  previousQualification: ["previousqualification"],
  boardUniversityName: ["boarduniversityname", "boardname"],
  yearOfAddmission: ["yearofaddmission", "yearofadmission", "admissionyear"],
  yearOfPassing: ["yearofpassing", "passingyear"],
  entranceExamScore: ["entranceexamscore"],
  fatherOccupation: ["fatheroccupation", "fathersoccupation"],
  motherOccupation: ["motheroccupation", "mothersoccupation"],
  annualFamilyIncome: ["annualfamilyincome"],
  totalCourseFees: ["totalcoursefees"],
  feeStructure: ["feestructure"],
  scholarshipApplicable: ["scholarshipapplicable", "scholarship"],
  paymentMode: ["paymentmode"],
  nationality: ["nationality"],
  religion: ["religion"],
  hostelRequired: ["hostelrequired"],
  transportRequired: ["transportrequired"],
};

const REQUIRED_STUDENT_COLUMNS = [
  { field: "fullName", label: "Full Name" },
  { field: "email", label: "Email" },
  { field: "courseApplied", label: "Course" },
];

const REQUIRED_BULK_UPLOAD_COLUMNS = [
  { field: "fullName", label: "Full Name" },
  { field: "email", label: "Email" },
];

const STUDENT_FIELDS = [
  { key: "fullName", label: "Full Name", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "courseApplied", label: "Course", type: "text" },
  { key: "branchSpecialization", label: "Branch / Specialization", type: "text" },
  { key: "academicYear", label: "Academic Year", type: "select" },
  { key: "semester", label: "Semester", type: "select" },
  { key: "assignedMentorId", label: "Assigned Mentor", type: "mentor" },
  { key: "dateOfBirth", label: "Date of Birth", type: "date" },
  { key: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
  { key: "fathersName", label: "Father's Name", type: "text" },
  { key: "mothersName", label: "Mother's Name", type: "text" },
  { key: "bloodGroup", label: "Blood Group", type: "select", options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] },
  { key: "category", label: "Category", type: "select", options: ["General", "OBC", "SC", "ST", "EWS"] },
  { key: "aadharNumber", label: "Aadhar Number", type: "text" },
  { key: "phoneNumber", label: "Phone Number", type: "text" },
  { key: "permanentAddress", label: "Permanent Address", type: "text" },
  { key: "currentAddress", label: "Current Address", type: "text" },
  { key: "parentContactNumber", label: "Parent Contact Number", type: "text" },
  { key: "parentEmergencyNumber", label: "Parent Emergency Number", type: "text" },
  { key: "previousQualification", label: "Previous Qualification", type: "select", options: ["10th", "12th", "Diploma"] },
  { key: "boardUniversityName", label: "Board / University Name", type: "text" },
  { key: "yearOfAddmission", label: "Year of Admission", type: "number" },
  { key: "yearOfPassing", label: "Year of Passing", type: "number" },
  { key: "entranceExamScore", label: "Entrance Exam Score", type: "text" },
  { key: "fatherOccupation", label: "Father's Occupation", type: "text" },
  { key: "motherOccupation", label: "Mother's Occupation", type: "text" },
  { key: "annualFamilyIncome", label: "Annual Family Income", type: "number" },
  { key: "totalCourseFees", label: "Total Course Fees", type: "number" },
  { key: "feeStructure", label: "Fee Structure", type: "select", options: ["Semester-wise", "Yearly", "One-time"] },
  { key: "scholarshipApplicable", label: "Scholarship Applicable", type: "select", options: ["Yes", "No"] }, 
  { key: "paymentMode", label: "Payment Mode", type: "select", options: ["Online", "Cash", "Cheque", "DD"] },
  { key: "nationality", label: "Nationality", type: "text" },
  { key: "religion", label: "Religion", type: "text" },
  { key: "hostelRequired", label: "Hostel Required", type: "select", options: ["Yes", "No"] },
  { key: "transportRequired", label: "Transport Required", type: "select", options: ["Yes", "No"] },
];

const normalizeAadhar = (value) => {
  const text = String(value ?? "").trim();
  if (text === "0") return "";
  if (/^\d{12}$/.test(text)) return text;
  if (/^[+-]?\d+(?:\.\d+)?e[+-]?\d+$/i.test(text)) {
    const number = Number(text);
    if (Number.isSafeInteger(number)) return String(number);
  }
  return text;
};

export default function ManageStudents({ isActiveTab }) {
  const [activeSection, setActiveSection] = useState("table");
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [mentors, setMentors] = useState([]);
  const [bulkUpdates, setBulkUpdates] = useState({});
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [uploadPreviewOpen, setUploadPreviewOpen] = useState(false);
  const [pendingUploadRows, setPendingUploadRows] = useState([]);
  const [editingUploadIndex, setEditingUploadIndex] = useState(null);
  const [uploadDraft, setUploadDraft] = useState({});
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentDraft, setStudentDraft] = useState({});
  const [studentSaving, setStudentSaving] = useState(false);
  const [academicPrograms, setAcademicPrograms] = useState([]);
  const [academicCatalogError, setAcademicCatalogError] = useState("");
  const [mentorLoadError, setMentorLoadError] = useState("");

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/students");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
    axios
      .get("http://localhost:5000/api/mentors")
      .then((res) => setMentors(res.data))
      .catch((err) => {
        console.error("Failed to fetch mentors", err);
        setMentorLoadError("Mentor list could not be loaded. Assigned mentor options are unavailable.");
      });
    axios
      .get("http://localhost:5000/api/academics", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setAcademicPrograms(res.data))
      .catch((err) => {
        console.error("Failed to fetch academic catalog", err);
        setAcademicCatalogError("Course catalog unavailable; course and branch can still be entered manually.");
      });
  }, []);

  useEffect(() => {
    if (!isActiveTab) {
      setActiveSection("table");
    }
  }, [isActiveTab]);

  const handleAddStudent = () => {
    setActiveSection("addStudent");
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/students/${id}`);
      setStudents((prev) => prev.filter((student) => student._id !== id));
      alert("✅ Student deleted successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete student");
    }
  };

  const handleStudentAdded = () => {
    fetchStudents();
    setActiveSection("table");
  };

  const toggleStudentSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const filteredStudents = students.filter(
    (student) =>
      student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.courseApplied?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const selectedStudentCourses = [
    ...new Set(
      students
        .filter((student) => selectedIds.includes(student._id))
        .map((student) => String(student.courseApplied || "").trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
  const bulkCourseName =
    bulkUpdates.courseApplied ||
    (selectedStudentCourses.length === 1
      ? students.find(
        (student) =>
          selectedIds.includes(student._id) &&
          String(student.courseApplied || "").trim().toLowerCase() === selectedStudentCourses[0]
      )?.courseApplied
      : "");
  const selectedBulkProgram = academicPrograms.find(
    (program) => program.name.toLowerCase() === String(bulkCourseName || "").toLowerCase()
  );
  const bulkBranchOptions = selectedBulkProgram
    ? selectedBulkProgram.branches.map((branch) => branch.name)
    : [...new Set(academicPrograms.flatMap((program) => program.branches.map((branch) => branch.name)))];
  const bulkMentorOptions = selectedBulkProgram
    ? getMentorsForStudentGroup(
      mentors,
      bulkCourseName,
      bulkUpdates.branchSpecialization === "__NONE__"
        ? ""
        : bulkUpdates.branchSpecialization,
      academicPrograms,
      selectedBulkProgram.studyMode === "semester"
        ? bulkUpdates.semester
        : bulkUpdates.academicYear
    )
    : mentors;

  const allFilteredSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((student) => selectedIds.includes(student._id));

  const toggleSelectAll = () => {
    const filteredIds = filteredStudents.map((student) => student._id);
    setSelectedIds((prev) =>
      allFilteredSelected
        ? prev.filter((id) => !filteredIds.includes(id))
        : Array.from(new Set([...prev, ...filteredIds]))
    );
  };

  const openBulkUpdate = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one student.");
      return;
    }
    setBulkUpdates({});
    setBulkDialogOpen(true);
  };

  const handleBulkFieldChange = (field, value) => {
    setBulkUpdates((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "branchSpecialization" ||
        field === "academicYear" ||
        field === "semester"
        ? { assignedMentorId: "" }
        : {}),
      ...(field === "academicYear" ? { semester: "__NONE__" } : {}),
      ...(field === "semester" ? { academicYear: "__NONE__" } : {}),
    }));
  };

  const handleBulkCourseChange = (value) => {
    setBulkUpdates((previous) => ({
      ...previous,
      courseApplied: value,
      branchSpecialization: value ? "__NONE__" : "",
      academicYear: value ? "__NONE__" : "",
      semester: value ? "__NONE__" : "",
      assignedMentorId: "",
    }));
  };

  const submitBulkUpdate = async () => {
    const cleanUpdates = Object.fromEntries(
      Object.entries(bulkUpdates).filter(([, value]) => value !== "")
    );

    if (Object.keys(cleanUpdates).length === 0) {
      alert("Please select at least one field to update.");
      return;
    }

    setBulkUpdating(true);
    try {
      const res = await axios.put(
        "http://localhost:5000/api/students/bulk-update",
        { studentIds: selectedIds, updates: cleanUpdates }
      );
      alert(`✅ ${res.data.modifiedCount} student(s) updated successfully`);
      setBulkDialogOpen(false);
      setSelectedIds([]);
      setBulkUpdates({});
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert(`❌ ${err.response?.data?.error || "Failed to update students"}`);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBulkUploading(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!["xlsx", "xls"].includes(extension)) {
        alert("Please select an Excel file (.xlsx or .xls).");
        return;
      }

      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const sourceRows = firstSheet
        ? XLSX.utils.sheet_to_json(firstSheet, { defval: "", raw: false })
        : [];
      if (sourceRows.length === 0) {
        alert("Excel file is empty. Add a header row and student data first.");
        return;
      }

      const normalizeHeader = (header) => String(header).toLowerCase().replace(/[^a-z0-9]/g, "");
      const headerMap = new Map(
        Object.keys(sourceRows[0]).map((header) => [normalizeHeader(header), header])
      );
      const studentsToUpload = sourceRows.map((sourceRow) => {
        const student = {};
        Object.entries(STUDENT_COLUMN_ALIASES).forEach(([field, aliases]) => {
          const matchingHeader = aliases.map((alias) => headerMap.get(alias)).find(Boolean);
          if (matchingHeader) student[field] = sourceRow[matchingHeader];
        });
        if (student.aadharNumber) {
          student.aadharNumber = normalizeAadhar(student.aadharNumber);
        }
        if (student.email) student.email = String(student.email).trim().toLowerCase();
        if (!String(student.courseApplied || "").trim()) {
          student.courseApplied = "Not Provided";
        }
        return student;
      });

      setPendingUploadRows(
        studentsToUpload.map((student, index) => ({ excelRow: index + 2, student, error: "" }))
      );
      setUploadPreviewOpen(true);
    } catch (err) {
      console.error("Could not read student workbook:", err);
      alert("❌ Could not read this Excel file. Check that it is a valid .xlsx or .xls workbook.");
    } finally {
      event.target.value = "";
      setBulkUploading(false);
    }
  };

  const saveBulkUpload = async () => {
    const invalidRows = pendingUploadRows
      .map(({ excelRow, student }) => {
        const missing = REQUIRED_BULK_UPLOAD_COLUMNS
          .filter(({ field }) => String(student[field] ?? "").trim() === "")
          .map(({ label }) => label);
        return missing.length ? `Excel row ${excelRow}: ${missing.join(", ")}` : null;
      })
      .filter(Boolean);

    if (invalidRows.length) {
      alert(
        `Please fill the required fields before saving:\n${invalidRows.slice(0, 5).join("\n")}` +
        (invalidRows.length > 5 ? `\n...and ${invalidRows.length - 5} more row(s)` : "")
      );
      return;
    }

    if (!window.confirm(`Save ${pendingUploadRows.length} student record(s) to the database?`)) return;

    setBulkSaving(true);
    try {
      const res = await axios.post("http://localhost:5000/api/students/bulk-upload", {
        students: pendingUploadRows.map(({ student }) => student),
      });
      const errors = res.data.errors || [];
      const failedIndexes = new Set(errors.map((item) => item.row - 2));
      const failedRows = pendingUploadRows
        .flatMap((row, index) =>
          failedIndexes.has(index)
            ? [{
              ...row,
              error: errors.find((item) => item.row === index + 2)?.error || "Could not save this row",
            }]
            : []
        );

      setPendingUploadRows(failedRows);
      setSelectedIds([]);
      await fetchStudents();
      const uploadWarnings = (res.data.warnings || [])
        .flatMap(({ row, warnings }) => warnings.map((warning) => `Excel row ${row}: ${warning}`));
      const warningSummary = uploadWarnings.length
        ? `\n\nOptional values skipped:\n${uploadWarnings.slice(0, 5).join("\n")}` +
        (uploadWarnings.length > 5 ? `\n...and ${uploadWarnings.length - 5} more warning(s)` : "")
        : "";

      if (failedRows.length === 0) {
        setUploadPreviewOpen(false);
        alert(`✅ ${res.data.created} student(s) saved successfully.${warningSummary}`);
      } else {
        const failureSummary = failedRows
          .slice(0, 5)
          .map((row) => `Excel row ${row.excelRow}: ${row.error}`)
          .join("\n");
        alert(
          `✅ ${res.data.created} student(s) saved.\n❌ ${failedRows.length} row(s) need correction:\n${failureSummary}` +
          (failedRows.length > 5 ? `\n...and ${failedRows.length - 5} more row(s)` : "") +
          warningSummary
        );
      }
    } catch (err) {
      console.error("Bulk student save failed:", err);
      alert(`❌ ${err.response?.data?.error || "Failed to save student records"}`);
    } finally {
      setBulkSaving(false);
    }
  };

  const openUploadRowEditor = (index) => {
    setEditingUploadIndex(index);
    setUploadDraft({ ...pendingUploadRows[index].student });
  };

  const saveUploadRowEdit = () => {
    setPendingUploadRows((previous) =>
      previous.map((row, index) =>
        index === editingUploadIndex ? { ...row, student: uploadDraft, error: "" } : row
      )
    );
    setEditingUploadIndex(null);
  };

  const openStudentEditor = (student) => {
    setEditingStudent(student);
    const selectedProgram = academicPrograms.find(
      (program) =>
        program.name.toLowerCase() ===
        String(student.courseApplied || "").trim().toLowerCase()
    );
    setStudentDraft(
      Object.fromEntries(
        STUDENT_FIELDS.map(({ key }) => [
          key,
          key === "academicYear" && selectedProgram?.studyMode === "semester"
            ? ""
            : key === "semester" && selectedProgram?.studyMode === "yearly"
              ? ""
              : key === "assignedMentorId"
                ? student.assignedMentorId?._id || student.assignedMentorId || "__NONE__"
                : student[key] ?? "",
        ])
      )
    );
  };

  const saveStudentChanges = async () => {
    const missing = REQUIRED_STUDENT_COLUMNS
      .filter(({ field }) => String(studentDraft[field] ?? "").trim() === "")
      .map(({ label }) => label);
    if (missing.length) {
      alert(`Please fill required fields: ${missing.join(", ")}`);
      return;
    }
    const studentProgram = academicPrograms.find(
      (program) =>
        program.name.toLowerCase() ===
        String(studentDraft.courseApplied || "").trim().toLowerCase()
    );
    if (studentProgram) {
      const periodField =
        studentProgram.studyMode === "semester" ? "semester" : "academicYear";
      if (!String(studentDraft[periodField] ?? "").trim()) {
        alert(`Please select the student's ${periodField === "semester" ? "semester" : "academic year"}.`);
        return;
      }
    }

    setStudentSaving(true);
    try {
      const res = await axios.put(
        `http://localhost:5000/api/students/${editingStudent._id}`,
        studentDraft
      );
      await fetchStudents();
      setEditingStudent(null);
      alert(res.data.message || "✅ Student details updated.");
    } catch (err) {
      console.error("Student update failed:", err);
      alert(`❌ ${err.response?.data?.error || "Failed to save student changes"}`);
    } finally {
      setStudentSaving(false);
    }
  };

  const renderStudentFields = (values, setValues, { existingStudent = false } = {}) => (
    <>
      {academicCatalogError && (
        <Alert severity="warning" sx={{ mb: 2 }}>{academicCatalogError}</Alert>
      )}
      {mentorLoadError && (
        <Alert severity="warning" sx={{ mb: 2 }}>{mentorLoadError}</Alert>
      )}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
        {STUDENT_FIELDS.map((field) => {
          const selectedProgram = academicPrograms.find(
            (program) =>
              program.name.toLowerCase() ===
              String(values.courseApplied || "").trim().toLowerCase()
          );
          const periodMode = selectedProgram?.studyMode || "yearly";
          const isYearField = field.key === "academicYear";
          const isSemesterField = field.key === "semester";
          const isPeriodField = isYearField || isSemesterField;
          if (
            (isPeriodField && !selectedProgram) ||
            (isYearField && periodMode !== "yearly") ||
            (isSemesterField && periodMode !== "semester")
          ) {
            return null;
          }
          const periodLabel = periodMode === "semester" ? "Semester" : "Academic Year";
          const periodOptions = Array.from(
            { length: selectedProgram?.periodCount || (periodMode === "semester" ? 8 : 4) },
            (_, index) => index + 1
          );
          const isCourseField = field.key === "courseApplied" && academicPrograms.length > 0;
          const isBranchField =
            field.key === "branchSpecialization" &&
            (selectedProgram?.branches.length || 0) > 0;
          const isMentorField = field.key === "assignedMentorId";
          const matchingMentors = isMentorField
            ? getMentorsForStudentGroup(
              mentors,
              values.courseApplied,
              values.branchSpecialization,
              academicPrograms,
              selectedProgram?.studyMode === "semester"
                ? values.semester
                : values.academicYear
            )
            : [];
          const currentMentor = isMentorField
            ? mentors.find((mentor) => mentor._id === String(values.assignedMentorId || ""))
            : null;
          const mentorOptions =
            currentMentor && !matchingMentors.some((mentor) => mentor._id === currentMentor._id)
              ? [...matchingMentors, currentMentor]
              : matchingMentors;
          const isAcademicSelect = isCourseField || isBranchField || isMentorField;
          const options = isCourseField
            ? academicPrograms.map((program) => program.name)
            : isBranchField
              ? selectedProgram.branches.map((branch) => branch.name)
              : field.options || [];
          const currentValue = values[field.key] ?? "";
          const fieldOptions =
            isAcademicSelect && currentValue && !options.includes(currentValue)
              ? [currentValue, ...options]
              : options;
          const isSelect = field.type === "select" || isAcademicSelect;

          return (
            <TextField
              key={field.key}
              select={isSelect}
              type={isSelect ? "text" : field.type}
              fullWidth
              required={
                isPeriodField ||
                REQUIRED_STUDENT_COLUMNS.some((required) => required.field === field.key)
              }
              label={isPeriodField ? periodLabel : field.label}
              value={currentValue}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  [field.key]: event.target.value,
                  ...(field.key === "courseApplied"
                    ? {
                      branchSpecialization: "",
                      academicYear: "",
                      semester: "",
                      assignedMentorId: "",
                    }
                    : field.key === "branchSpecialization"
                      ? { assignedMentorId: "" }
                      : field.key === "academicYear" || field.key === "semester"
                        ? { assignedMentorId: "" }
                        : {}),
                }))
              }
              size="small"
              InputLabelProps={field.type === "date" || isAcademicSelect ? { shrink: true } : undefined}
              SelectProps={isSelect ? { native: true } : undefined}
            >
              {isSelect && (
                isPeriodField ? (
                  <>
                    <option value="">
                      Select {periodMode === "semester" ? "semester" : "year"}
                    </option>
                    {periodOptions.map((option) => (
                      <option key={option} value={String(option)}>
                        {periodLabel} {option}
                      </option>
                    ))}
                  </>
                ) : isMentorField ? (
                  <>
                    <option value="">
                      {existingStudent
                        ? "Select a mentor"
                        : matchingMentors.length
                          ? "Auto assign by course and branch"
                          : "No mentor assigned to this course and branch"}
                    </option>
                    {mentorOptions.map((mentor) => (
                      <option
                        key={mentor._id}
                        value={mentor._id}
                        disabled={!matchingMentors.some((item) => item._id === mentor._id)}
                      >
                        {mentor.firstName} {mentor.lastName} ({mentor.mentorId})
                        {!matchingMentors.some((item) => item._id === mentor._id)
                          ? " (current assignment; no longer matches)"
                          : ""}
                      </option>
                    ))}
                  </>
                ) : (
                  <>
                    <option value="">
                      {isCourseField ? "Select a course" : "Not provided"}
                    </option>
                    {fieldOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </>
                )
              )}
            </TextField>
          );
        })}
      </Box>
    </>
  );

  const assignOldMentors = async () => {
    try {
      const res = await axios.put("http://localhost:5000/api/students/assign-old-mentors");
      await fetchStudents();
      alert(`✅ ${res.data.updatedStudents.length} student(s) assigned to matching mentors.`);
    } catch (err) {
      console.error(err);
      alert(`❌ ${err.response?.data?.error || "Failed to assign mentors"}`);
    }
  };

  return (
    <Fade in timeout={450}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Student Management
        </Typography>

        {/* Action Cards */}
        <Grid container spacing={3} className="mb-6">
          <Grid item xs={12} sm={6}>
            <Grow in timeout={400}>
              <Card
                elevation={0}
                onClick={handleAddStudent}
                className="cursor-pointer transition-all duration-300"
                sx={{
                  border: "1px solid #e2e8f0",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 24px -8px rgba(15, 23, 42, 0.15)",
                    bgcolor: "#f9fafc",
                  },
                }}
              >
                <CardContent className="flex items-center gap-3">
                  <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
                    <PersonAddRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Add Student
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add a new student to the system.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Grow in timeout={550}>
              <Card
                elevation={0}
                onClick={() => setActiveSection("table")}
                className="cursor-pointer transition-all duration-300"
                sx={{
                  border: "1px solid #e2e8f0",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 24px -8px rgba(15, 23, 42, 0.15)",
                    bgcolor: "#f9fafc",
                  },
                }}
              >
                <CardContent className="flex items-center gap-3">
                  <Avatar sx={{ bgcolor: "secondary.main", width: 48, height: 48 }}>
                    <GroupsRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Manage Students
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View, edit, or delete student details.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        </Grid>

        {activeSection === "addStudent" && (
          <Fade in timeout={400}>
            <Box>
              <AddStudentForm onStudentAdded={handleStudentAdded} />
            </Box>
          </Fade>
        )}

        {activeSection === "table" && (
          <Fade in timeout={400}>
            <Box>
              <Grow in timeout={500}>
                <Card elevation={0} sx={{ border: "1px solid #e2e8f0", p: 2 }}>
                  {/* Header row: title, search, assign-mentors */}
                  <Box className="flex flex-wrap justify-between items-center gap-3 mb-3">
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      All Students
                    </Typography>
                    <Box className="flex gap-2 flex-wrap items-center">
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<UploadFileRoundedIcon />}
                        disabled={bulkUploading}
                      >
                        {bulkUploading ? "Uploading..." : "Bulk Upload"}
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          hidden
                          onChange={handleBulkUpload}
                        />
                      </Button>
                      <TextField
                        placeholder="Search by name or course..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        sx={{ width: { xs: "100%", sm: 260 } }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchRoundedIcon fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<UpdateRoundedIcon />}
                        onClick={openBulkUpdate}
                        disabled={selectedIds.length === 0}
                      >
                        Bulk Update {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<SyncRoundedIcon />}
                        onClick={assignOldMentors}
                        className="transition-all duration-300"
                        sx={{
                          "&:hover": { transform: "translateY(-2px)", boxShadow: 2 },
                        }}
                      >
                        Assign Old Students Mentors
                      </Button>
                    </Box>
                  </Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Sirf ye 3 fields zaroori hain:{" "}
                    {REQUIRED_STUDENT_COLUMNS.map(({ label }) => label).join(", ")}.
                    Baaki details optional hain—abhi ya baad mein Edit karke add karein. Excel upload ke baad
                    preview mein changes karke Save to Database dabayein.
                  </Alert>

                  {filteredStudents.length === 0 ? (
                    <Box className="flex flex-col items-center justify-center py-16">
                      <InboxRoundedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1.5 }} />
                      <Typography color="text.secondary">No students found.</Typography>
                    </Box>
                  ) : (
                    <TableContainer sx={{ maxHeight: 450, overflowY: "auto" }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9", width: 52 }}>
                              <Checkbox
                                checked={allFilteredSelected}
                                indeterminate={
                                  filteredStudents.some((student) => selectedIds.includes(student._id)) &&
                                  !allFilteredSelected
                                }
                                onChange={toggleSelectAll}
                                inputProps={{ "aria-label": "Select all visible students" }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>Course</TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>Branch</TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>Study Period</TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>Year</TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>Password</TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>
                              Assigned Mentor
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }} align="right">
                              Action
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredStudents.map((student) => (
                            <TableRow
                              key={student.studentId}
                              hover
                              sx={{ "&:hover": { bgcolor: "rgba(37, 99, 235, 0.04)" } }}
                            >
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={selectedIds.includes(student._id)}
                                  onChange={() => toggleStudentSelection(student._id)}
                                  inputProps={{ "aria-label": `Select ${student.fullName}` }}
                                />
                              </TableCell>
                              <TableCell>{student.studentId}</TableCell>
                              <TableCell>{student.fullName}</TableCell>
                              <TableCell>{student.courseApplied}</TableCell>
                              <TableCell>{student.branchSpecialization || "—"}</TableCell>
                              <TableCell>
                                {(() => {
                                  const program = academicPrograms.find(
                                    (item) =>
                                      item.name.toLowerCase() ===
                                      String(student.courseApplied || "").trim().toLowerCase()
                                  );
                                  const isSemester = program?.studyMode === "semester";
                                  const period = isSemester ? student.semester : student.academicYear;
                                  return period
                                    ? `${isSemester ? "Semester" : "Year"} ${period}`
                                    : "—";
                                })()}
                              </TableCell>
                              <TableCell>{student.yearOfAddmission}</TableCell>
                              <TableCell>{student.email}</TableCell>
                              <TableCell>{student.plainPassword}</TableCell>
                              <TableCell>
                                {student.assignedMentorId ? (
                                  <Chip
                                    label={`${student.assignedMentorId.firstName} ${student.assignedMentorId.lastName}`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ fontWeight: 600 }}
                                  />
                                ) : (
                                  <Chip
                                    label="Not Assigned"
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontWeight: 600, color: "text.secondary" }}
                                  />
                                )}
                              </TableCell>
                              <TableCell align="right">
                                <Box className="flex gap-1 justify-end">
                                  <Tooltip title="Edit">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => openStudentEditor(student)}
                                    >
                                      <EditRoundedIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleDeleteStudent(student._id)}
                                    >
                                      <DeleteRoundedIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Card>
              </Grow>
            </Box>
          </Fade>
        )}

        <Dialog
          open={bulkDialogOpen}
          onClose={() => !bulkUpdating && setBulkDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Bulk Update {selectedIds.length} Student{selectedIds.length === 1 ? "" : "s"}
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Fill only the fields you want to change. Other student details will remain unchanged.
            </Typography>
            {academicCatalogError && (
              <Alert severity="warning" sx={{ mb: 2 }}>{academicCatalogError}</Alert>
            )}
            {mentorLoadError && (
              <Alert severity="warning" sx={{ mb: 2 }}>{mentorLoadError}</Alert>
            )}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Full Name"
                value={bulkUpdates.fullName || ""}
                onChange={(e) => handleBulkFieldChange("fullName", e.target.value)}
                size="small"
              />
              <TextField
                select
                SelectProps={{ native: true }}
                label="Course"
                value={bulkUpdates.courseApplied || ""}
                onChange={(e) => handleBulkCourseChange(e.target.value)}
                size="small"
              >
                {academicPrograms.map((program) => (
                  <option key={program._id} value={program.name}>{program.name}</option>
                ))}
              </TextField>
              <TextField
                select
                SelectProps={{ native: true }}
                label="Branch / Specialization"
                value={bulkUpdates.branchSpecialization || ""}
                onChange={(e) => handleBulkFieldChange("branchSpecialization", e.target.value)}
                size="small"
              >
                {bulkBranchOptions.map((branch) => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </TextField>
              {selectedBulkProgram?.studyMode === "yearly" && (
                <TextField
                  select
                  SelectProps={{ native: true }}
                  label="Academic Year"
                  value={bulkUpdates.academicYear || ""}
                  onChange={(e) => handleBulkFieldChange("academicYear", e.target.value)}
                  size="small"
                >

                  {Array.from(
                    { length: selectedBulkProgram.periodCount || 4 },
                    (_, index) => index + 1
                  ).map((year) => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </TextField>
              )}
              {selectedBulkProgram?.studyMode === "semester" && (
                <TextField
                  select
                  SelectProps={{ native: true }}
                  label="Semester"
                  value={bulkUpdates.semester || ""}
                  onChange={(e) => handleBulkFieldChange("semester", e.target.value)}
                  size="small"
                >
                  {Array.from(
                    { length: selectedBulkProgram.periodCount || 8 },
                    (_, index) => index + 1
                  ).map((semester) => (
                    <option key={semester} value={semester}>Semester {semester}</option>
                  ))}
                </TextField>
              )}
              <TextField
                label="Year of Admission"
                type="number"
                value={bulkUpdates.yearOfAddmission || ""}
                onChange={(e) => handleBulkFieldChange("yearOfAddmission", e.target.value)}
                size="small"
              />
              <TextField
                label="Year of Passing"
                type="number"
                value={bulkUpdates.yearOfPassing || ""}
                onChange={(e) => handleBulkFieldChange("yearOfPassing", e.target.value)}
                size="small"
              />
              <TextField
                label="Phone Number"
                value={bulkUpdates.phoneNumber || ""}
                onChange={(e) => handleBulkFieldChange("phoneNumber", e.target.value)}
                size="small"
              />
              <TextField
                label="Total Course Fees"
                type="number"
                value={bulkUpdates.totalCourseFees || ""}
                onChange={(e) => handleBulkFieldChange("totalCourseFees", e.target.value)}
                size="small"
              />
              <TextField
                select
                label="Scholarship"
                value={bulkUpdates.scholarshipApplicable || ""}
                onChange={(e) => handleBulkFieldChange("scholarshipApplicable", e.target.value)}
                size="small"
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
              <TextField
                select
                label="Hostel Required"
                value={bulkUpdates.hostelRequired || ""}
                onChange={(e) => handleBulkFieldChange("hostelRequired", e.target.value)}
                size="small"
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
              <TextField
                select
                label="Transport Required"
                value={bulkUpdates.transportRequired || ""}
                onChange={(e) => handleBulkFieldChange("transportRequired", e.target.value)}
                size="small"
              >

                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
              <TextField
                select
                SelectProps={{ native: true }}
                label="Assigned Mentor"
                value={bulkUpdates.assignedMentorId || ""}
                onChange={(e) => handleBulkFieldChange("assignedMentorId", e.target.value)}
                size="small"
                sx={{ gridColumn: { sm: "1 / -1" } }}
              >
                {bulkMentorOptions.map((mentor) => (
                  <option key={mentor._id} value={mentor._id}>
                    {mentor.firstName} {mentor.lastName} ({mentor.mentorId})
                  </option>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setBulkDialogOpen(false)} disabled={bulkUpdating}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={submitBulkUpdate}
              disabled={bulkUpdating}
              startIcon={<UpdateRoundedIcon />}
            >
              {bulkUpdating ? "Updating..." : "Update Students"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={uploadPreviewOpen}
          onClose={() => !bulkSaving && setUploadPreviewOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Review Excel Student Upload</DialogTitle>
          <DialogContent dividers>
            <Alert severity="info" sx={{ mb: 2 }}>
              Sirf Full Name aur Email zaroori hain. Course blank ho toh "Not Provided" save hoga;
              baad mein Edit karke add kar sakte hain. Year/Semester course ke configured study mode ke
              hisaab se optional hai.
            </Alert>
            <TableContainer sx={{ maxHeight: 420 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {["Excel Row", "Full Name", "Email", "Course", "Study Period", "Review"].map((heading) => (
                      <TableCell key={heading} sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>
                        {heading}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingUploadRows.map((row, index) => (
                    <TableRow key={`${row.excelRow}-${row.student.email || index}`}>
                      <TableCell>{row.excelRow}</TableCell>
                      <TableCell>{row.student.fullName || "Missing"}</TableCell>
                      <TableCell>{row.student.email || "Missing"}</TableCell>
                      <TableCell>{row.student.courseApplied || "Missing"}</TableCell>
                      <TableCell>
                        {(() => {
                          const program = academicPrograms.find(
                            (item) =>
                              item.name.toLowerCase() ===
                              String(row.student.courseApplied || "").trim().toLowerCase()
                          );
                          const isSemester = program?.studyMode === "semester";
                          const period = isSemester ? row.student.semester : row.student.academicYear;
                          return period
                            ? `${isSemester ? "Semester" : "Year"} ${period}`
                            : "—";
                        })()}
                      </TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => openUploadRowEditor(index)}>
                          Edit details
                        </Button>
                        {row.error && (
                          <Typography variant="caption" color="error" display="block">
                            {row.error}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setUploadPreviewOpen(false)} disabled={bulkSaving}>
              Cancel
            </Button>
            <Button variant="contained" onClick={saveBulkUpload} disabled={bulkSaving || pendingUploadRows.length === 0}>
              {bulkSaving ? "Saving..." : "Save to Database"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={editingUploadIndex !== null}
          onClose={() => setEditingUploadIndex(null)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Edit Excel Row {editingUploadIndex === null ? "" : pendingUploadRows[editingUploadIndex]?.excelRow}
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Name and Email are required. Course and other details can be filled now or later.
            </Typography>
            {renderStudentFields(uploadDraft, setUploadDraft)}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setEditingUploadIndex(null)}>Cancel</Button>
            <Button variant="contained" onClick={saveUploadRowEdit}>Save Row Changes</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={Boolean(editingStudent)}
          onClose={() => !studentSaving && setEditingStudent(null)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Edit Student {editingStudent?.studentId ? `— ${editingStudent.studentId}` : ""}
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Name, Email and Course are required. Add or change the remaining details whenever available.
            </Typography>
            {renderStudentFields(studentDraft, setStudentDraft, { existingStudent: true })}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setEditingStudent(null)} disabled={studentSaving}>Cancel</Button>
            <Button variant="contained" onClick={saveStudentChanges} disabled={studentSaving}>
              {studentSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}