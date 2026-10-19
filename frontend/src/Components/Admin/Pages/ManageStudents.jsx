import React, { useState, useEffect } from "react";
import axios from "axios";
import AddStudentForm from "./AddStudentForm";
import {
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
} from "@mui/material";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";

export default function ManageStudents({ isActiveTab }) {
  const [activeSection, setActiveSection] = useState("table");
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredStudents = students.filter(
    (student) =>
      student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.courseApplied?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      </Box>
    </Fade>
  );
}