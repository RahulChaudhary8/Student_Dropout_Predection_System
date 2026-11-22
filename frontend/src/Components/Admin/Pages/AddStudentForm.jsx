import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Divider,
  Chip,
  Fade,
  Grow,
} from "@mui/material";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import FamilyRestroomRoundedIcon from "@mui/icons-material/FamilyRestroomRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import { getMentorsForStudentGroup } from "../../../utils/mentorAssignments";

// ---- Field definitions (key must match initialState) ----
const sections = [
  {
    title: "Basic Information",
    icon: <PersonRoundedIcon />,
    fields: [
      { key: "fullName", label: "Full Name", type: "text" },
      { key: "dateOfBirth", label: "Date of Birth", type: "date" },
      {
        key: "gender",
        label: "Gender",
        type: "select",
        options: ["Male", "Female", "Other"],

      },
      { key: "fathersName", label: "Father's Name", type: "text" },
      { key: "mothersName", label: "Mother's Name", type: "text" },
      {
        key: "bloodGroup",
        label: "Blood Group",
        type: "select",
        options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      },
      {
        key: "category",
        label: "Category",
        type: "select",
        options: ["General", "OBC", "SC", "ST", "EWS"],
      },
      { key: "aadharNumber", label: "Aadhar Number", type: "text" },
    ],
  },
  {
    title: "Contact Information",
    icon: <AssignmentRoundedIcon />,
    fields: [
      { key: "email", label: "Email", type: "email" },
      { key: "phoneNumber", label: "Phone Number", type: "text" },
      { key: "permanentAddress", label: "Address (Permanent)", type: "text" },
      { key: "currentAddress", label: "Address (Current)", type: "text" },
      {
        key: "parentContactNumber",
        label: "Parent Phone Number (Contact)",
        type: "text",
      },
      {
        key: "parentEmergencyNumber",
        label: "Parent Phone Number (Emergency)",
        type: "text",
      },
    ],
  },
  {
    title: "Academic Information",
    icon: <FamilyRestroomRoundedIcon />,
    fields: [
      { key: "courseApplied", label: "Course / Program Applied For", type: "text" },
      { key: "branchSpecialization", label: "Branch / Specialization", type: "text" },
      { key: "academicYear", label: "Academic Year", type: "select" },
      { key: "semester", label: "Semester", type: "select" },
      { key: "assignedMentorId", label: "Assigned Mentor", type: "mentor" },
      {
        key: "previousQualification",
        label: "Previous Qualification",
        type: "select",
        options: ["10th", "12th", "Diploma"],
      },
      { key: "boardUniversityName", label: "Board / University Name", type: "text" },
      { key: "yearOfAddmission", label: "Year of Admission", type: "number" },
      { key: "yearOfPassing", label: "Year of Passing", type: "number" },
      {
        key: "entranceExamScore",
        label: "Entrance Exam Score (JEE / NEET / CET, if applicable)",
        type: "text",
      },
    ],
  },
  {
    title: "Family Background",
    icon: <TrendingUpRoundedIcon />,
    fields: [
      { key: "fatherOccupation", label: "Father's Occupation", type: "text" },
      { key: "motherOccupation", label: "Mother's Occupation", type: "text" },
      { key: "annualFamilyIncome", label: "Annual Family Income", type: "number" },
    ],
  },
  {
    title: "Fees & Financial Information",
    icon: <MenuBookRoundedIcon />,
    fields: [
      { key: "totalCourseFees", label: "Total Course Fees", type: "number" },
      {
        key: "feeStructure",
        label: "Fee Structure",
        type: "select",
        options: ["Semester-wise", "Yearly", "One-time"],
      },
      {
        key: "scholarshipApplicable",
        label: "Scholarship Applicable?",
        type: "select",
        options: ["Yes", "No"],
      },
      {
        key: "paymentMode",
        label: "Payment Mode",
        type: "select",
        options: ["Online", "Cash", "Cheque", "DD"],
      },
    ],
  },
  {
    title: "Other",
    icon: <PublicRoundedIcon />,
    fields: [
      { key: "nationality", label: "Nationality", type: "text" },
      { key: "religion", label: "Religion", type: "text" },
      {
        key: "hostelRequired",
        label: "Hostel Required?",
        type: "select",
        options: ["Yes", "No"],
      },
      {
        key: "transportRequired",
        label: "Transport Required?",
        type: "select",
        options: ["Yes", "No"],
      },
    ],
  },
];

// ---- Build initialState automatically from the sections above ----
// (so form fields and state can never drift out of sync again)
const initialState = {};
sections.forEach((section) => {
  section.fields.forEach((field) => {
    initialState[field.key] = "";
  });
});

const requiredFields = new Set(["fullName", "email", "courseApplied"]);

const AddStudentForm = ({ onStudentAdded }) => {
  const [studentData, setStudentData] = useState(initialState);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [academicPrograms, setAcademicPrograms] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [academicCatalogError, setAcademicCatalogError] = useState("");
  const [mentorLoadError, setMentorLoadError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/api/academics", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setAcademicPrograms(response.data))
      .catch((error) => {
        console.error("Failed to load academic catalog:", error);
        setAcademicCatalogError("Course catalog could not be loaded. You can still enter course and branch manually.");
      });
    axios
      .get("http://localhost:5000/api/mentors")
      .then((response) => setMentors(response.data))
      .catch((error) => {
        console.error("Failed to load mentors:", error);
        setMentorLoadError("Mentor list could not be loaded. You can still add a student and auto-assign a mentor.");
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData((current) => ({
      ...current,
      [name]: value,
      ...(name === "courseApplied"
        ? {
            branchSpecialization: "",
            academicYear: "",
            semester: "",
            assignedMentorId: "",
          }
        : name === "branchSpecialization" || name === "academicYear" || name === "semester"
          ? { assignedMentorId: "" }
          : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const normalizedStudentData = Object.fromEntries(
        Object.entries(studentData)
          .filter(([key, value]) => requiredFields.has(key) || value !== "")
          .map(([key, value]) => [
            key,
            key === "email" || key === "aadharNumber"
              ? value.trim().toLowerCase()
              : value,
          ])
      );

      const res = await axios.post(
        "http://localhost:5000/api/students",
        normalizedStudentData
      );

      setGeneratedPassword(res.data.generatedPassword);
      alert(res.data.message || "✅ Student added successfully!");

      if (onStudentAdded) {
        onStudentAdded({ ...res.data.student, plainPassword: res.data.generatedPassword });
      }

      setStudentData(initialState);
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.error || "Error adding student";
      alert(`❌ ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Fade in timeout={450}>
      <Box sx={{ maxWidth: 1000, mx: "auto" }}>
        <Box className="flex items-center gap-2 mb-4">
          <SchoolRoundedIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Add Student
          </Typography>
        </Box>

        {academicCatalogError && (
          <Alert severity="warning" sx={{ mb: 2 }}>{academicCatalogError}</Alert>
        )}
        {mentorLoadError && (
          <Alert severity="warning" sx={{ mb: 2 }}>{mentorLoadError}</Alert>
        )}

        {generatedPassword && (
          <Fade in timeout={300}>
            <Chip
              label={`Generated Password: ${generatedPassword}`}
              color="success"
              sx={{ mb: 3, fontWeight: 700 }}
            />
          </Fade>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Box
            sx={{
              maxHeight: "60vh",
              overflowY: "auto",
              pr: 1,
              mb: 3,
            }}
          >
            {sections.map((section, sIdx) => (
              <Grow in timeout={350 + sIdx * 120} key={section.title}>
                <Card elevation={0} sx={{ border: "1px solid #e2e8f0", mb: 2.5 }}>
                  <CardContent>
                    <Box className="flex items-center gap-2 mb-1">
                      <Box sx={{ color: "primary.main", display: "flex" }}>{section.icon}</Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {section.title}
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(2, minmax(0, 1fr))",
                          md: "repeat(3, minmax(0, 1fr))",
                        },
                        gap: 2,
                      }}
                    >
                      {section.fields.map((field) => {
                        const selectedProgram = academicPrograms.find(
                          (program) =>
                            program.name.toLowerCase() ===
                            studentData.courseApplied.trim().toLowerCase()
                        );
                        const isCourseField = field.key === "courseApplied" && academicPrograms.length > 0;
                        const isBranchField =
                          field.key === "branchSpecialization" &&
                          (selectedProgram?.branches.length || 0) > 0;
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
                        const isMentorField = field.key === "assignedMentorId";
                        const academicOptions = isCourseField
                          ? academicPrograms.map((program) => program.name)
                          : isBranchField
                            ? selectedProgram.branches.map((branch) => branch.name)
                            : [];
                        const matchingMentors = isMentorField
                          ? getMentorsForStudentGroup(
                              mentors,
                                studentData.courseApplied,
                                studentData.branchSpecialization,
                                academicPrograms,
                                selectedProgram?.studyMode === "semester"
                                  ? studentData.semester
                                  : studentData.academicYear
                              )
                          : [];
                        const isAcademicSelect = isCourseField || isBranchField || isMentorField;

                        return (
                        <Box
                          key={field.key}
                          sx={
                            field.type === "select" || isAcademicSelect
                              ? { gridColumn: "1 / -1" }
                              : undefined
                          }
                        >
                          {isPeriodField ? (
                            <TextField
                              select
                              fullWidth
                              size="medium"
                              name={field.key}
                              label={periodLabel}
                              value={studentData[field.key]}
                              onChange={handleChange}
                              required
                              InputLabelProps={{ shrink: true }}
                            >
                              <MenuItem value="">
                                Select {periodMode === "semester" ? "semester" : "year"}
                              </MenuItem>
                              {periodOptions.map((option) => (
                                <MenuItem key={option} value={String(option)}>
                                  {periodLabel} {option}
                                </MenuItem>
                              ))}
                            </TextField>
                          ) : isAcademicSelect ? (
                            <TextField
                              select
                              fullWidth
                              size="medium"
                              name={field.key}
                              label={field.label}
                              value={studentData[field.key]}
                              onChange={handleChange}
                              required={requiredFields.has(field.key)}
                              InputLabelProps={{ shrink: true }}
                              SelectProps={{ native: true }}
                            >
                              <option value="">
                                {isCourseField
                                  ? "Select a course"
                                  : isMentorField
                                    ? matchingMentors.length
                                      ? "Auto assign based on course and branch"
                                      : "No mentor assigned to this course and branch"
                                    : "Not provided"}
                              </option>
                              {isMentorField && <option value="__NONE__">Do not assign</option>}
                              {isMentorField
                                ? matchingMentors.map((mentor) => (
                                    <option key={mentor._id} value={mentor._id}>
                                      {mentor.firstName} {mentor.lastName} ({mentor.mentorId})
                                    </option>
                                  ))
                                : academicOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                  ))}
                            </TextField>
                          ) : field.type === "select" ? (
                            <TextField
                              select
                              fullWidth
                              size="medium"
                              name={field.key}
                              label={field.label}
                              value={studentData[field.key]}
                              onChange={handleChange}
                              required={requiredFields.has(field.key)}
                              InputLabelProps={{ shrink: true }}
                              sx={{
                                minWidth: 0,
                                "& .MuiSelect-select": {
                                  overflow: "visible",
                                  textOverflow: "clip",
                                  whiteSpace: "normal",
                                  lineHeight: 1.35,
                                },
                              }}
                              SelectProps={{
                                MenuProps: {
                                  PaperProps: {
                                    sx: { minWidth: 300, maxWidth: "90vw" },
                                  },
                                },
                              }}
                            >
                              {field.options.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </TextField>
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              type={field.type}
                              name={field.key}
                              label={field.label}
                              value={studentData[field.key]}
                              onChange={handleChange}
                              InputLabelProps={
                                field.type === "date" ? { shrink: true } : undefined
                              }
                              required={requiredFields.has(field.key)}
                            />
                          )}
                        </Box>
                      );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            ))}
          </Box>

          <Box className="flex justify-center">
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<SaveRoundedIcon />}
              disabled={submitting}
              className="transition-all duration-300"
              sx={{
                px: 5,
                "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
              }}
            >
              {submitting ? "Saving..." : "Add Student"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export default AddStudentForm;