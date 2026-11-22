import React, { useState, useEffect } from "react";
import AddMentorForm from "./AddMentorForm";
import EditMentorBranchesDialog from "./EditMentorBranchesDialog";
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
  Chip,
  Button,
  IconButton,
  Tooltip,
  Fade,
  Grow,
} from "@mui/material";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import ToggleOffRoundedIcon from "@mui/icons-material/ToggleOffRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";

const getAssignedCourseBranches = (assignments = []) => [
  ...new Map(
    assignments.map((assignment) => {
      const courseName =
        typeof assignment.courseId === "object" ? assignment.courseId?.name || "Course" : "Course";
      const key = `${courseName}::${assignment.branch}`;
      return [key, { courseName, branch: assignment.branch }];
    })
  ).values(),
];

export default function ManageMentors() {
  const [activeSection, setActiveSection] = useState("table");
  const [mentors, setMentors] = useState([]);
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);

  const handleAddMentor = () => {
    setActiveSection("addMentor");
  };

  const handleMentorAdded = (mentor) => {
    const formatted = {
      _id: mentor._id,
      mentorId: mentor.mentorId,
      name: `${mentor.firstName} ${mentor.lastName}`,
      specialization: mentor.specialization,
      experience: mentor.experience + " years",
      active: mentor.active || true,
      password: mentor.password,
      assignedClasses: mentor.assignedClasses || [],
      subjectAssignments: mentor.subjectAssignments || [],
    };
    setMentors((prev) => [...prev, formatted]);
    setActiveSection("table");
  };

  const handleDeleteMentor = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/mentors/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMentors((prev) => prev.filter((m) => m._id !== id));
      } else {
        const data = await res.json();
        alert(data.message || "Error deleting mentor");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/mentors/${id}/toggle`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (res.ok) {
        setMentors((prev) =>
          prev.map((m) => (m._id === id ? { ...m, active: !currentStatus } : m))
        );
      } else {
        alert(data.message || "Error updating status");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBranchAssignmentsSaved = (result) => {
    setMentors((previous) =>
      previous.map((mentor) =>
        mentor._id === result.mentor._id
          ? { ...mentor, subjectAssignments: result.mentor.subjectAssignments }
          : mentor
      )
    );
    alert(
      `${result.matchedStudentCount} matching student(s) found; ${result.assignedStudentCount} assignment(s) updated.`
    );
  };

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/mentors");
        const data = await res.json();
        const formattedData = data.map((mentor) => ({
          _id: mentor._id,
          mentorId: mentor.mentorId,
          name: `${mentor.firstName} ${mentor.lastName}`,
          specialization: mentor.specialization,
          experience: mentor.experience + " years",
          active: mentor.active,
          password: mentor.password,
          plainPassword: mentor.plainPassword,
          assignedClasses: mentor.assignedClasses || [],
          subjectAssignments: mentor.subjectAssignments || [],
        }));
        setMentors(formattedData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMentors();
  }, []);

  return (
    <Fade in timeout={450}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Mentor Management
        </Typography>

        {/* Action Cards */}
        <Grid container spacing={3} className="mb-6">
          <Grid item xs={12} sm={6}>
            <Grow in timeout={400}>
              <Card
                elevation={0}
                onClick={handleAddMentor}
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
                      Add Mentor
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add a new mentor to the system.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Grow in timeout={500}>
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
                    <ManageAccountsRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Manage Mentors
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View, edit, or delete mentor details.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        </Grid>

        {activeSection === "addMentor" && (
          <Fade in timeout={400}>
            <Box>
              <AddMentorForm onMentorAdded={handleMentorAdded} />
            </Box>
          </Fade>
        )}

        {/* Mentor Table */}
        {activeSection === "table" && (
          <Fade in timeout={400}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                All Mentors
              </Typography>

              {mentors.length === 0 ? (
                <Grow in timeout={400}>
                  <Card
                    elevation={0}
                    sx={{ border: "1px solid #e2e8f0" }}
                    className="flex flex-col items-center justify-center py-16"
                  >
                    <InboxRoundedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1.5 }} />
                    <Typography color="text.secondary">No mentors added yet.</Typography>
                  </Card>
                </Grow>
              ) : (
                <Grow in timeout={500}>
                  <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
                    <TableContainer sx={{ maxHeight: 450, overflowY: "auto" }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>
                              Mentor ID
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>
                              Name
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>
                              Specialization
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>
                              Experience
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>
                              Password
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>
                              Assigned Classes
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>
                              Assigned Subjects
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>
                              Status
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }} align="right">
                              Action
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {mentors.map((mentor) => (
                            <TableRow
                              key={mentor._id}
                              hover
                              sx={{ "&:hover": { bgcolor: "rgba(37, 99, 235, 0.04)" } }}
                            >
                              <TableCell>{mentor.mentorId}</TableCell>
                              <TableCell>{mentor.name}</TableCell>
                              <TableCell>{mentor.specialization}</TableCell>
                              <TableCell>{mentor.experience}</TableCell>
                              <TableCell>{mentor.plainPassword}</TableCell>
                              <TableCell>
                                <Box className="flex flex-wrap gap-1" sx={{ maxWidth: 220 }}>
                                  {getAssignedCourseBranches(mentor.subjectAssignments).length > 0 ? (
                                    getAssignedCourseBranches(mentor.subjectAssignments).map(
                                      ({ courseName, branch }) => (
                                        <Chip
                                          key={`${courseName}-${branch}`}
                                          label={`${courseName} - ${branch}`}
                                          size="small"
                                        />
                                      )
                                    )
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      Not assigned
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box className="flex flex-wrap gap-1" sx={{ maxWidth: 320 }}>
                                  {mentor.subjectAssignments?.length > 0 ? (
                                    mentor.subjectAssignments.map((assignment, index) => {
                                      const course =
                                        typeof assignment.courseId === "object"
                                          ? assignment.courseId
                                          : null;
                                      const courseName = course?.name || "Course";
                                      const periodName = assignment.period
                                        ? `${course?.studyMode === "semester" ? "Semester" : "Year"} ${assignment.period}`
                                        : "";
                                      return (
                                        <Chip
                                          key={`${courseName}-${assignment.branch}-${index}`}
                                          label={`${courseName} - ${assignment.branch}${periodName ? ` - ${periodName}` : ""}${assignment.subjects?.length ? `: ${assignment.subjects.join(", ")}` : ""}`}
                                          size="small"
                                        />
                                      );
                                    })
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      Not assigned
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={mentor.active ? "Active" : "Inactive"}
                                  color={mentor.active ? "success" : "default"}
                                  size="small"
                                  sx={{ fontWeight: 700 }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Box className="flex gap-1 justify-end">
                                  <Tooltip title="Edit assigned branches">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => {
                                        setSelectedMentor(mentor);
                                        setBranchDialogOpen(true);
                                      }}
                                    >
                                      <EditRoundedIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleDeleteMentor(mentor._id)}
                                    >
                                      <DeleteRoundedIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={mentor.active ? "Deactivate" : "Activate"}>
                                    <IconButton
                                      size="small"
                                      color={mentor.active ? "success" : "default"}
                                      onClick={() =>
                                        handleToggleStatus(mentor._id, mentor.active)
                                      }
                                    >
                                      {mentor.active ? (
                                        <ToggleOnRoundedIcon />
                                      ) : (
                                        <ToggleOffRoundedIcon />
                                      )}
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>
                </Grow>
              )}
            </Box>
          </Fade>
        )}

        <EditMentorBranchesDialog
          open={branchDialogOpen}
          onClose={() => setBranchDialogOpen(false)}
          mentor={selectedMentor}
          onSaved={handleBranchAssignmentsSaved}
        />
      </Box>
    </Fade>
  );
}
