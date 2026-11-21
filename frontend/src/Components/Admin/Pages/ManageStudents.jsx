import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
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
  { field: "dateOfBirth", label: "Date of Birth" },
  { field: "gender", label: "Gender" },
  { field: "fathersName", label: "Father's Name" },
  { field: "mothersName", label: "Mother's Name" },
  { field: "category", label: "Category" },
  { field: "aadharNumber", label: "Aadhar Number" },
  { field: "email", label: "Email" },
  { field: "phoneNumber", label: "Phone Number" },
  { field: "permanentAddress", label: "Permanent Address" },
  { field: "currentAddress", label: "Current Address" },
  { field: "parentContactNumber", label: "Parent Contact Number" },
  { field: "parentEmergencyNumber", label: "Parent Emergency Number" },
  { field: "courseApplied", label: "Course / Program Applied For" },
  { field: "previousQualification", label: "Previous Qualification" },
  { field: "boardUniversityName", label: "Board / University Name" },
  { field: "yearOfAddmission", label: "Year of Admission" },
  { field: "yearOfPassing", label: "Year of Passing" },
  { field: "nationality", label: "Nationality" },
];

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
      .catch((err) => console.error("Failed to fetch mentors", err));
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

  const handleStudentAdded = (newStudent) => {
    setStudents((prev) => [...prev, newStudent]);
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
    setBulkUpdates((prev) => ({ ...prev, [field]: value }));
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
        return student;
      });

      const invalidRows = studentsToUpload
        .map((student, index) => {
          const missing = REQUIRED_STUDENT_COLUMNS
            .filter(({ field }) => String(student[field] ?? "").trim() === "")
            .map(({ label }) => label);
          return missing.length > 0 ? `Row ${index + 2}: ${missing.join(", ")}` : null;
        })
        .filter(Boolean);

      if (invalidRows.length > 0) {
        alert(
          `Upload nahi hua. Required fields har row mein bharein:\n${invalidRows.slice(0, 5).join("\n")}` +
          (invalidRows.length > 5 ? `\n...and ${invalidRows.length - 5} more row(s)` : "")
        );
        return;
      }

      if (!window.confirm(`${studentsToUpload.length} complete student record(s) upload karein?`)) {
        return;
      }

      const res = await axios.post("http://localhost:5000/api/students/bulk-upload", {
        students: studentsToUpload,
      });
      await fetchStudents();
      setSelectedIds([]);

      const failures = (res.data.errors || [])
        .slice(0, 5)
        .map((item) => `Row ${item.row}: ${item.error}`);
      alert(
        `✅ ${res.data.created} student(s) database mein save hue.` +
        (res.data.failed > 0
          ? `\n❌ ${res.data.failed} row(s) save nahi hue:\n${failures.join("\n")}` +
            (res.data.failed > 5 ? `\n...and ${res.data.failed - 5} more row(s)` : "")
          : "")
      );
    } catch (err) {
      console.error("Bulk student upload failed:", err);
      alert(`❌ ${err.response?.data?.error || "Failed to upload student records"}`);
    } finally {
      event.target.value = "";
      setBulkUploading(false);
    }
  };

  const assignOldMentors = async () => {
    try {
      const res = await axios.put("http://localhost:5000/api/students/assign-old-mentors");
      console.log(res.data);
      alert("✅ Old students updated with mentors!");
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to assign mentors");
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
                    Excel ki har row mein ye required columns bharein:{" "}
                    {REQUIRED_STUDENT_COLUMNS.map(({ label }) => label).join(", ")}.
                    Student ID aur password system khud generate karega; baaki optional fields bhi upload kar sakte hain.
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
                                    <IconButton size="small" color="primary">
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
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Full Name"
                value={bulkUpdates.fullName || ""}
                onChange={(e) => handleBulkFieldChange("fullName", e.target.value)}
                size="small"
              />
              <TextField
                label="Course"
                value={bulkUpdates.courseApplied || ""}
                onChange={(e) => handleBulkFieldChange("courseApplied", e.target.value)}
                size="small"
              />
              <TextField
                label="Branch / Specialization"
                value={bulkUpdates.branchSpecialization || ""}
                onChange={(e) => handleBulkFieldChange("branchSpecialization", e.target.value)}
                size="small"
              />
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
                <MenuItem value="">No change</MenuItem>
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
                <MenuItem value="">No change</MenuItem>
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
                <MenuItem value="">No change</MenuItem>
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
              <TextField
                select
                label="Assigned Mentor"
                value={bulkUpdates.assignedMentorId || ""}
                onChange={(e) => handleBulkFieldChange("assignedMentorId", e.target.value)}
                size="small"
                sx={{ gridColumn: { sm: "1 / -1" } }}
              >
                <MenuItem value="">No change</MenuItem>
                <MenuItem value="__NONE__">Remove assigned mentor</MenuItem>
                {mentors.map((mentor) => (
                  <MenuItem key={mentor._id} value={mentor._id}>
                    {mentor.firstName} {mentor.lastName}
                  </MenuItem>
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
      </Box>
    </Fade>
  );
}