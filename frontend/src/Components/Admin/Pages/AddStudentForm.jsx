import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
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
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";

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
      { key: "photo", label: "Photo (Accept only jpeg/png)", type: "file", accept: "image/jpeg,image/png" },
      { key: "signature", label: "Signature (Accept only jpeg/png)", type: "file", accept: "image/jpeg,image/png" },
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
    title: "Documents",
    icon: <DescriptionRoundedIcon />,
    fields: [
      { key: "marksheet10th", label: "10th Marksheet(accept only pdf file)", type: "file", accept: "application/pdf" },
      { key: "marksheet12th", label: "12th Marksheet(accept only pdf file)", type: "file", accept: "application/pdf" },
      { key: "transferCertificate", label: "Transfer Certificate (accept only pdf file)", type: "file", accept: "application/pdf" },
      { key: "migrationCertificate", label: "Migration Certificate(accept only pdf file)", type: "file", accept: "application/pdf" },
      {
        key: "casteCertificate",
        label: "Caste Certificate (accept only pdf file/jpeg/png)",
        type: "file", accept: "application/pdf,image/jpeg,image/png"
      },
      { key: "incomeCertificate", label: "Income Certificate(accept only pdf file/jpeg/png)", type: "file", accept: "application/pdf,image/jpeg,image/png" },
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
const fileKeys = [];
const initialState = {};
sections.forEach((section) => {
  section.fields.forEach((field) => {
    initialState[field.key] = field.type === "number" ? "" : "";
    if (field.type === "file") fileKeys.push(field.key);
  });
});

const AddStudentForm = ({ onStudentAdded }) => {
  const [studentData, setStudentData] = useState(initialState);
  const [files, setFiles] = useState({});
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles({ ...files, [name]: selectedFiles[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Files need multipart/form-data, so we build FormData instead of plain JSON
      const formData = new FormData();

      Object.entries(studentData).forEach(([key, value]) => {
        if (!fileKeys.includes(key)) {
          formData.append(key, value);
        }
      });

      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      const res = await axios.post(
        "http://localhost:5000/api/students",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setGeneratedPassword(res.data.generatedPassword);
      alert("✅ Student added successfully!");

      if (onStudentAdded) {
        onStudentAdded({ ...res.data.student, plainPassword: res.data.generatedPassword });
      }

      setStudentData(initialState);
      setFiles({});
    } catch (err) {
      console.error(err);
      alert("Error adding student");
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
                    <Grid container spacing={2}>
                      {section.fields.map((field) => (
                        <Grid item xs={12} sm={6} md={4} key={field.key}>
                          {field.type === "select" ? (
                            <TextField
                              select
                              fullWidth
                              size="small"
                              name={field.key}
                              label={field.label}
                              value={studentData[field.key]}
                              onChange={handleChange}
                              required
                            >
                              {field.options.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </TextField>
                          ) : field.type === "file" ? (
                            <TextField
                              fullWidth
                              size="small"
                              type="file"
                              name={field.key}
                              label={field.label}
                              onChange={handleFileChange}
                              InputLabelProps={{ shrink: true }}
                              required
                            />
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
                              required
                            />
                          )}
                        </Grid>
                      ))}
                    </Grid>
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